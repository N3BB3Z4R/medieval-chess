import { TreasureMoveValidator } from '../../../../domain/rules/validators/TreasureMoveValidator';
import { PieceType, TeamType } from '../../../../domain/core/types';
import {
  createMove,
  createGameState,
  createGameStateWithPenalty,
  createGamePiece,
  pos
} from '../../../../test-utils/factories';

describe('TreasureMoveValidator', () => {
  let validator: TreasureMoveValidator;

  beforeEach(() => {
    validator = new TreasureMoveValidator();
  });

  describe('canValidate()', () => {
    it('returns true for TREASURE piece type', () => {
      expect(validator.canValidate(PieceType.TREASURE)).toBe(true);
    });

    it('returns false for non-TREASURE piece types', () => {
      expect(validator.canValidate(PieceType.FARMER)).toBe(false);
      expect(validator.canValidate(PieceType.KING)).toBe(false);
    });
  });

  describe('basic movement', () => {
    it('allows 1 square forward (vertical)', () => {
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('allows 1 square backward (vertical)', () => {
      const move = createMove(pos(4, 4), pos(4, 3), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('allows 1 square left (horizontal)', () => {
      const move = createMove(pos(4, 4), pos(3, 4), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('allows 1 square right (horizontal)', () => {
      const move = createMove(pos(4, 4), pos(5, 4), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('rejects diagonal movement', () => {
      const move = createMove(pos(4, 4), pos(5, 5), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('orthogonal');
    });

    it('rejects 2-square movement', () => {
      const move = createMove(pos(4, 4), pos(4, 6), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('1 square');
    });

    it('rejects 3+ square movement', () => {
      const move = createMove(pos(4, 4), pos(4, 7), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
    });

    it('rejects move to same position', () => {
      const move = createMove(pos(4, 4), pos(4, 4), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
    });
  });

  describe('KING death penalty immunity', () => {
    it('TREASURE is IMMUNE - still moves 1 square with penalty', () => {
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameStateWithPenalty(TeamType.OUR);

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
      // TREASURE should not be affected by penalty
    });

    it('TREASURE maintains full movement in all directions with penalty', () => {
      const gameState = createGameStateWithPenalty(TeamType.OUR);

      const moves = [
        createMove(pos(4, 4), pos(4, 5), PieceType.TREASURE, TeamType.OUR), // Up
        createMove(pos(4, 4), pos(4, 3), PieceType.TREASURE, TeamType.OUR), // Down
        createMove(pos(4, 4), pos(3, 4), PieceType.TREASURE, TeamType.OUR), // Left
        createMove(pos(4, 4), pos(5, 4), PieceType.TREASURE, TeamType.OUR)  // Right
      ];

      moves.forEach(move => {
        const result = validator.validate(move, gameState);
        expect(result.isValid).toBe(true);
      });
    });

    it('TREASURE still cannot move 2 squares even with penalty (rules unchanged)', () => {
      const move = createMove(pos(4, 4), pos(4, 6), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameStateWithPenalty(TeamType.OUR);

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      // TREASURE can only move 1 square regardless
    });

    it('TREASURE immunity works for OPPONENT team', () => {
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.TREASURE, TeamType.OPPONENT);
      const gameState = createGameStateWithPenalty(TeamType.OPPONENT);

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('TREASURE immunity works when both teams have penalty', () => {
      const kingDeathPenalty = new Map<TeamType, boolean>();
      kingDeathPenalty.set(TeamType.OUR, true);
      kingDeathPenalty.set(TeamType.OPPONENT, true);
      const gameState = createGameState({ kingDeathPenalty });

      const ourMove = createMove(pos(4, 4), pos(4, 5), PieceType.TREASURE, TeamType.OUR);
      const opponentMove = createMove(pos(8, 8), pos(8, 9), PieceType.TREASURE, TeamType.OPPONENT);

      const ourResult = validator.validate(ourMove, gameState);
      const opponentResult = validator.validate(opponentMove, gameState);

      expect(ourResult.isValid).toBe(true);
      expect(opponentResult.isValid).toBe(true);
    });
  });

  describe('tile occupation rules', () => {
    it('rejects move to tile occupied by opponent', () => {
      const opponentPiece = createGamePiece(pos(4, 5), PieceType.FARMER, TeamType.OPPONENT);
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState({ pieces: [opponentPiece] });

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('only move to empty tiles');
    });

    it('rejects move to tile occupied by friendly piece', () => {
      const friendlyPiece = createGamePiece(pos(4, 5), PieceType.FARMER, TeamType.OUR);
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState({ pieces: [friendlyPiece] });

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('only move to empty tiles');
    });

    it('rejects move to tile occupied by TRAP', () => {
      const trapPiece = createGamePiece(pos(4, 5), PieceType.TRAP, TeamType.OPPONENT);
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState({ pieces: [trapPiece] });

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('only move to empty tiles');
    });

    it('allows move to empty tile', () => {
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });
  });

  describe('board boundary handling', () => {
    it('allows movement at left edge (x=0)', () => {
      const move = createMove(pos(0, 4), pos(0, 5), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('allows movement at right edge (x=15)', () => {
      const move = createMove(pos(15, 4), pos(15, 5), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('allows movement at bottom edge (y=0)', () => {
      const move = createMove(pos(4, 0), pos(5, 0), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('allows movement at top edge (y=15)', () => {
      const move = createMove(pos(4, 15), pos(5, 15), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('allows movement at corner (0,0)', () => {
      const move = createMove(pos(0, 0), pos(1, 0), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });
  });

  describe('comparison with other pieces', () => {
    it('TREASURE moves differently than FARMER (no forward-only restriction)', () => {
      // TREASURE can move backward, FARMER cannot (for OUR team)
      const backwardMove = createMove(pos(4, 5), pos(4, 4), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = validator.validate(backwardMove, gameState);

      expect(result.isValid).toBe(true);
      // FARMER would reject this move
    });

    it('TREASURE moves differently than RAM (cannot capture)', () => {
      const opponentPiece = createGamePiece(pos(4, 5), PieceType.FARMER, TeamType.OPPONENT);
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState({ pieces: [opponentPiece] });

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(false);
      // RAM could capture and destroy this piece
    });

    it('TREASURE has unique penalty immunity unlike all other pieces', () => {
      // This is the key differentiator - covered in penalty immunity tests above
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameStateWithPenalty(TeamType.OUR);

      const result = validator.validate(move, gameState);

      expect(result.isValid).toBe(true);
      // All other pieces except TREASURE would be affected by penalty
    });
  });
});
