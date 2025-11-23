import { FarmerMoveValidator } from '../../../../domain/rules/validators/FarmerMoveValidator';
import { PieceType, TeamType } from '../../../../domain/core/types';
import {
  createMove,
  createGameState,
  createGameStateWithPenalty,
  createGamePiece,
  pos
} from '../../../../__tests__/helpers/factories';

describe('FarmerMoveValidator', () => {
  let validator: FarmerMoveValidator;

  beforeEach(() => {
    validator = new FarmerMoveValidator();
  });

  describe('canValidate()', () => {
    it('returns true for FARMER piece type', () => {
      expect(validator.canValidate(PieceType.FARMER)).toBe(true);
    });

    it('returns false for non-FARMER piece types', () => {
      expect(validator.canValidate(PieceType.KNIGHT)).toBe(false);
      expect(validator.canValidate(PieceType.KING)).toBe(false);
      expect(validator.canValidate(PieceType.RAM)).toBe(false);
    });
  });

  describe('forward movement without penalty', () => {
    it('allows 1 square forward for OUR team', () => {
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('allows 1 square forward for OPPONENT team', () => {
      const move = createMove(pos(4, 10), pos(4, 9), PieceType.FARMER, TeamType.OPPONENT);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('allows 2 squares forward from starting row (OUR team)', () => {
      const move = createMove(pos(4, 2), pos(4, 4), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('allows 2 squares forward from starting row (OPPONENT team)', () => {
      const move = createMove(pos(4, 13), pos(4, 11), PieceType.FARMER, TeamType.OPPONENT);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('rejects backward movement', () => {
      const move = createMove(pos(4, 5), pos(4, 4), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Invalid FARMER move');
    });

    it('rejects sideways movement', () => {
      const move = createMove(pos(4, 4), pos(5, 4), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
    });

    it('rejects 2 square move from non-starting row', () => {
      const move = createMove(pos(4, 5), pos(4, 7), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Invalid FARMER move');
    });

    it('rejects 3+ square movement', () => {
      const move = createMove(pos(4, 4), pos(4, 7), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
    });
  });

  describe('forward movement with KING death penalty', () => {
    it('reduces 2-square initial move to 1 square when penalty active', () => {
      const move = createMove(pos(4, 2), pos(4, 4), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameStateWithPenalty(TeamType.OUR);

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('KING death penalty');
      expect(result.reason).toContain('cannot move 2 squares');
    });

    it('still allows 1-square move when penalty active', () => {
      const move = createMove(pos(4, 2), pos(4, 3), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameStateWithPenalty(TeamType.OUR);

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('does not affect opponent team when only OUR team has penalty', () => {
      const move = createMove(pos(4, 13), pos(4, 11), PieceType.FARMER, TeamType.OPPONENT);
      const gameState = createGameStateWithPenalty(TeamType.OUR);

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true); // Opponent can still move 2 squares
    });
  });

  describe('path blocking', () => {
    it('rejects move when piece blocks 1-square path', () => {
      const blockingPiece = createGamePiece(pos(4, 5), PieceType.RAM, TeamType.OPPONENT);
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState({ pieces: [blockingPiece] });

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Destination occupied');
    });

    it('rejects 2-square move when piece blocks middle square', () => {
      const blockingPiece = createGamePiece(pos(4, 3), PieceType.RAM, TeamType.OPPONENT);
      const move = createMove(pos(4, 2), pos(4, 4), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState({ pieces: [blockingPiece] });

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Path blocked');
    });

    it('rejects 2-square move when piece blocks destination', () => {
      const blockingPiece = createGamePiece(pos(4, 4), PieceType.RAM, TeamType.OPPONENT);
      const move = createMove(pos(4, 2), pos(4, 4), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState({ pieces: [blockingPiece] });

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Destination occupied');
    });

    it('rejects move when friendly piece blocks path', () => {
      const friendlyPiece = createGamePiece(pos(4, 5), PieceType.FARMER, TeamType.OUR);
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState({ pieces: [friendlyPiece] });

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('occupied');
    });
  });

  describe('diagonal capture', () => {
    it('allows diagonal capture of opponent piece (right)', () => {
      const opponentPiece = createGamePiece(pos(5, 5), PieceType.FARMER, TeamType.OPPONENT);
      const move = createMove(pos(4, 4), pos(5, 5), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState({ pieces: [opponentPiece] });

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('allows diagonal capture of opponent piece (left)', () => {
      const opponentPiece = createGamePiece(pos(3, 5), PieceType.FARMER, TeamType.OPPONENT);
      const move = createMove(pos(4, 4), pos(3, 5), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState({ pieces: [opponentPiece] });

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('rejects diagonal move to empty tile', () => {
      const move = createMove(pos(4, 4), pos(5, 5), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('No opponent piece');
    });

    it('rejects diagonal capture of friendly piece', () => {
      const friendlyPiece = createGamePiece(pos(5, 5), PieceType.FARMER, TeamType.OUR);
      const move = createMove(pos(4, 4), pos(5, 5), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState({ pieces: [friendlyPiece] });

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('No opponent piece');
    });

    it('rejects 2-square diagonal move', () => {
      const opponentPiece = createGamePiece(pos(6, 6), PieceType.FARMER, TeamType.OPPONENT);
      const move = createMove(pos(4, 4), pos(6, 6), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState({ pieces: [opponentPiece] });

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
    });

    it('allows diagonal capture with KING death penalty', () => {
      const opponentPiece = createGamePiece(pos(5, 5), PieceType.FARMER, TeamType.OPPONENT);
      const move = createMove(pos(4, 4), pos(5, 5), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameStateWithPenalty(TeamType.OUR, [opponentPiece]);

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true); // Diagonal capture still works with penalty
    });
  });

  describe('TRAP mutual destruction', () => {
    it('allows capture of TRAP (validation only, destruction handled elsewhere)', () => {
      const trapPiece = createGamePiece(pos(5, 5), PieceType.TRAP, TeamType.OPPONENT);
      const move = createMove(pos(4, 4), pos(5, 5), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState({ pieces: [trapPiece] });

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
      // Note: Mutual destruction logic is in GameState.executeMove()
    });
  });

  describe('edge cases', () => {
    it('rejects move to same position', () => {
      const move = createMove(pos(4, 4), pos(4, 4), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
    });

    it('handles move at board edge correctly', () => {
      const move = createMove(pos(0, 4), pos(0, 5), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('handles diagonal capture at board edge', () => {
      const opponentPiece = createGamePiece(pos(1, 5), PieceType.FARMER, TeamType.OPPONENT);
      const move = createMove(pos(0, 4), pos(1, 5), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState({ pieces: [opponentPiece] });

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });
  });
});
