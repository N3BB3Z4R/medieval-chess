import { BaseMoveValidator, ValidationResult } from '../../../domain/rules/MoveValidator';
import { PieceType, TeamType } from '../../../domain/core/types';
import { createGameState, createGameStateWithPenalty } from '../../../test-utils/factories';

/**
 * Test implementation of BaseMoveValidator for testing protected methods.
 */
class TestMoveValidator extends BaseMoveValidator {
  canValidate(pieceType: PieceType): boolean {
    return true; // Accept all piece types for testing
  }

  validate(): ValidationResult {
    return ValidationResult.valid();
  }

  // Expose protected methods for testing
  public testApplyKingDeathPenalty(
    baseDistance: number,
    team: string,
    pieceType: PieceType,
    gameState: any
  ): number {
    return this.applyKingDeathPenalty(baseDistance, team, pieceType, gameState);
  }
}

describe('BaseMoveValidator', () => {
  let validator: TestMoveValidator;

  beforeEach(() => {
    validator = new TestMoveValidator();
  });

  describe('applyKingDeathPenalty()', () => {
    describe('without KING death penalty', () => {
      it('returns base distance for FARMER when no penalty', () => {
        const gameState = createGameState();
        const result = validator.testApplyKingDeathPenalty(2, TeamType.OUR, PieceType.FARMER, gameState);
        expect(result).toBe(2);
      });

      it('returns base distance for RAM when no penalty', () => {
        const gameState = createGameState();
        const result = validator.testApplyKingDeathPenalty(2, TeamType.OUR, PieceType.RAM, gameState);
        expect(result).toBe(2);
      });

      it('returns base distance for KNIGHT when no penalty', () => {
        const gameState = createGameState();
        const result = validator.testApplyKingDeathPenalty(3, TeamType.OUR, PieceType.KNIGHT, gameState);
        expect(result).toBe(3);
      });

      it('returns base distance for SCOUT when no penalty', () => {
        const gameState = createGameState();
        const result = validator.testApplyKingDeathPenalty(3, TeamType.OUR, PieceType.SCOUT, gameState);
        expect(result).toBe(3);
      });

      it('returns base distance for KING when no penalty', () => {
        const gameState = createGameState();
        const result = validator.testApplyKingDeathPenalty(3, TeamType.OUR, PieceType.KING, gameState);
        expect(result).toBe(3);
      });
    });

    describe('with KING death penalty active', () => {
      it('reduces FARMER distance from 2 to 1', () => {
        const gameState = createGameStateWithPenalty(TeamType.OUR);
        const result = validator.testApplyKingDeathPenalty(2, TeamType.OUR, PieceType.FARMER, gameState);
        expect(result).toBe(1);
      });

      it('reduces RAM distance from 2 to 1', () => {
        const gameState = createGameStateWithPenalty(TeamType.OUR);
        const result = validator.testApplyKingDeathPenalty(2, TeamType.OUR, PieceType.RAM, gameState);
        expect(result).toBe(1);
      });

      it('reduces TRAP distance from 2 to 1', () => {
        const gameState = createGameStateWithPenalty(TeamType.OUR);
        const result = validator.testApplyKingDeathPenalty(2, TeamType.OUR, PieceType.TRAP, gameState);
        expect(result).toBe(1);
      });

      it('reduces KNIGHT distance from 3 to 2', () => {
        const gameState = createGameStateWithPenalty(TeamType.OUR);
        const result = validator.testApplyKingDeathPenalty(3, TeamType.OUR, PieceType.KNIGHT, gameState);
        expect(result).toBe(2);
      });

      it('reduces KNIGHT diagonal distance from 2 to 1', () => {
        const gameState = createGameStateWithPenalty(TeamType.OUR);
        const result = validator.testApplyKingDeathPenalty(2, TeamType.OUR, PieceType.KNIGHT, gameState);
        expect(result).toBe(1);
      });

      it('reduces TEMPLAR distance from 2 to 1', () => {
        const gameState = createGameStateWithPenalty(TeamType.OUR);
        const result = validator.testApplyKingDeathPenalty(2, TeamType.OUR, PieceType.TEMPLAR, gameState);
        expect(result).toBe(1);
      });

      it('reduces SCOUT distance from 3 to 2', () => {
        const gameState = createGameStateWithPenalty(TeamType.OUR);
        const result = validator.testApplyKingDeathPenalty(3, TeamType.OUR, PieceType.SCOUT, gameState);
        expect(result).toBe(2);
      });

      it('reduces SCOUT distance from 2 to 1', () => {
        const gameState = createGameStateWithPenalty(TeamType.OUR);
        const result = validator.testApplyKingDeathPenalty(2, TeamType.OUR, PieceType.SCOUT, gameState);
        expect(result).toBe(1);
      });

      it('reduces TREBUCHET distance from 2 to 1', () => {
        const gameState = createGameStateWithPenalty(TeamType.OUR);
        const result = validator.testApplyKingDeathPenalty(2, TeamType.OUR, PieceType.TREBUCHET, gameState);
        expect(result).toBe(1);
      });

      it('reduces KING distance from 3 to 2', () => {
        const gameState = createGameStateWithPenalty(TeamType.OUR);
        const result = validator.testApplyKingDeathPenalty(3, TeamType.OUR, PieceType.KING, gameState);
        expect(result).toBe(2);
      });

      it('reduces KING distance from 2 to 1', () => {
        const gameState = createGameStateWithPenalty(TeamType.OUR);
        const result = validator.testApplyKingDeathPenalty(2, TeamType.OUR, PieceType.KING, gameState);
        expect(result).toBe(1);
      });
    });

    describe('TREASURE immunity', () => {
      it('TREASURE is immune to penalty - distance remains 1', () => {
        const gameState = createGameStateWithPenalty(TeamType.OUR);
        const result = validator.testApplyKingDeathPenalty(1, TeamType.OUR, PieceType.TREASURE, gameState);
        expect(result).toBe(1);
      });

      it('TREASURE maintains distance even with no penalty', () => {
        const gameState = createGameState();
        const result = validator.testApplyKingDeathPenalty(1, TeamType.OUR, PieceType.TREASURE, gameState);
        expect(result).toBe(1);
      });
    });

    describe('minimum distance enforcement', () => {
      it('enforces minimum distance of 1 when reduced', () => {
        const gameState = createGameStateWithPenalty(TeamType.OUR);
        // Even if base distance is 1, penalty should not reduce it below 1
        const result = validator.testApplyKingDeathPenalty(1, TeamType.OUR, PieceType.RAM, gameState);
        expect(result).toBe(1); // Math.max(1, 1-1) = 1
      });

      it('handles edge case of 0 base distance gracefully', () => {
        const gameState = createGameStateWithPenalty(TeamType.OUR);
        const result = validator.testApplyKingDeathPenalty(0, TeamType.OUR, PieceType.RAM, gameState);
        expect(result).toBe(1); // Math.max(1, 0-1) = 1
      });
    });

    describe('team-specific penalties', () => {
      it('does not affect opponent team when OUR team has penalty', () => {
        const gameState = createGameStateWithPenalty(TeamType.OUR);
        const result = validator.testApplyKingDeathPenalty(2, TeamType.OPPONENT, PieceType.FARMER, gameState);
        expect(result).toBe(2); // Opponent team not affected
      });

      it('does not affect OUR team when opponent team has penalty', () => {
        const gameState = createGameStateWithPenalty(TeamType.OPPONENT);
        const result = validator.testApplyKingDeathPenalty(2, TeamType.OUR, PieceType.FARMER, gameState);
        expect(result).toBe(2); // Our team not affected
      });

      it('affects both teams when both have penalties', () => {
        const kingDeathPenalty = new Map<TeamType, boolean>();
        kingDeathPenalty.set(TeamType.OUR, true);
        kingDeathPenalty.set(TeamType.OPPONENT, true);
        const gameState = createGameState({ kingDeathPenalty });

        const ourResult = validator.testApplyKingDeathPenalty(2, TeamType.OUR, PieceType.FARMER, gameState);
        const opponentResult = validator.testApplyKingDeathPenalty(2, TeamType.OPPONENT, PieceType.FARMER, gameState);

        expect(ourResult).toBe(1);
        expect(opponentResult).toBe(1);
      });
    });

    describe('ValidationResult factory methods', () => {
      it('creates valid result', () => {
        const result = ValidationResult.valid();
        expect(result.isValid).toBe(true);
        expect(result.reason).toBeUndefined();
      });

      it('creates invalid result with reason', () => {
        const reason = 'Invalid move: piece blocked';
        const result = ValidationResult.invalid(reason);
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe(reason);
      });
    });
  });
});
