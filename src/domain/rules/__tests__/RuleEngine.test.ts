import { RuleEngine } from '../../../domain/rules/RuleEngine';
import { MoveValidator, ValidationResult } from '../../../domain/rules/MoveValidator';
import { PieceType, TeamType } from '../../../domain/core/types';
import { Move } from '../../../domain/core/Move';
import { createMove, createGameState, pos } from '../../../test-utils/factories';
import {
  FarmerMoveValidator,
  RamMoveValidator,
  TrapMoveValidator,
  KnightMoveValidator,
  TemplarMoveValidator,
  ScoutMoveValidator,
  TrebuchetMoveValidator,
  TreasureMoveValidator,
  KingMoveValidator
} from '../../../domain/rules';

/**
 * Mock validator for testing RuleEngine registration.
 */
class MockValidator implements MoveValidator {
  public validateCallCount = 0;
  public lastMove: Move | null = null;

  constructor(private readonly supportedTypes: PieceType[]) {}

  canValidate(pieceType: PieceType): boolean {
    return this.supportedTypes.includes(pieceType);
  }

  validate(move: Move, gameState: any): ValidationResult {
    this.validateCallCount++;
    this.lastMove = move;
    return ValidationResult.valid();
  }
}

describe('RuleEngine', () => {
  let ruleEngine: RuleEngine;

  beforeEach(() => {
    ruleEngine = new RuleEngine();
  });

  describe('validator registration', () => {
    it('registers a single validator', () => {
      const validator = new MockValidator([PieceType.FARMER]);
      ruleEngine.registerValidator(validator);

      expect(ruleEngine.hasValidator(PieceType.FARMER)).toBe(true);
    });

    it('registers multiple validators for different piece types', () => {
      const farmerValidator = new MockValidator([PieceType.FARMER]);
      const knightValidator = new MockValidator([PieceType.KNIGHT]);

      ruleEngine.registerValidator(farmerValidator);
      ruleEngine.registerValidator(knightValidator);

      expect(ruleEngine.hasValidator(PieceType.FARMER)).toBe(true);
      expect(ruleEngine.hasValidator(PieceType.KNIGHT)).toBe(true);
    });

    it('registers validator that handles multiple piece types', () => {
      const multiValidator = new MockValidator([PieceType.FARMER, PieceType.RAM]);
      ruleEngine.registerValidator(multiValidator);

      expect(ruleEngine.hasValidator(PieceType.FARMER)).toBe(true);
      expect(ruleEngine.hasValidator(PieceType.RAM)).toBe(true);
    });

    it('overwrites previous validator for same piece type', () => {
      const validator1 = new MockValidator([PieceType.FARMER]);
      const validator2 = new MockValidator([PieceType.FARMER]);

      ruleEngine.registerValidator(validator1);
      ruleEngine.registerValidator(validator2);

      const retrievedValidator = ruleEngine.getValidator(PieceType.FARMER);
      expect(retrievedValidator).toBe(validator2);
      expect(retrievedValidator).not.toBe(validator1);
    });

    it('returns false for unregistered piece types', () => {
      expect(ruleEngine.hasValidator(PieceType.FARMER)).toBe(false);
      expect(ruleEngine.hasValidator(PieceType.KNIGHT)).toBe(false);
    });
  });

  describe('validator retrieval', () => {
    it('retrieves registered validator', () => {
      const validator = new MockValidator([PieceType.FARMER]);
      ruleEngine.registerValidator(validator);

      const retrieved = ruleEngine.getValidator(PieceType.FARMER);
      expect(retrieved).toBe(validator);
    });

    it('returns undefined for unregistered piece type', () => {
      const retrieved = ruleEngine.getValidator(PieceType.FARMER);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('move validation delegation', () => {
    it('delegates validation to correct validator', () => {
      const farmerValidator = new MockValidator([PieceType.FARMER]);
      const knightValidator = new MockValidator([PieceType.KNIGHT]);

      ruleEngine.registerValidator(farmerValidator);
      ruleEngine.registerValidator(knightValidator);

      const move = createMove(pos(4, 4), pos(4, 5), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState();

      ruleEngine.validate(move, gameState);

      expect(farmerValidator.validateCallCount).toBe(1);
      expect(knightValidator.validateCallCount).toBe(0);
      expect(farmerValidator.lastMove).toBe(move);
    });

    it('throws error for unregistered piece type', () => {
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState();

      expect(() => {
        ruleEngine.validate(move, gameState);
      }).toThrow('No validator registered');
    });

    it('passes GameState to validator', () => {
      const validator = new MockValidator([PieceType.FARMER]);
      ruleEngine.registerValidator(validator);

      const move = createMove(pos(4, 4), pos(4, 5), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState();

      ruleEngine.validate(move, gameState);

      expect(validator.validateCallCount).toBe(1);
    });
  });

  describe('real validator integration', () => {
    beforeEach(() => {
      // Register all real validators
      ruleEngine.registerValidator(new FarmerMoveValidator());
      ruleEngine.registerValidator(new RamMoveValidator());
      ruleEngine.registerValidator(new TrapMoveValidator());
      ruleEngine.registerValidator(new KnightMoveValidator());
      ruleEngine.registerValidator(new TemplarMoveValidator());
      ruleEngine.registerValidator(new ScoutMoveValidator());
      ruleEngine.registerValidator(new TrebuchetMoveValidator());
      ruleEngine.registerValidator(new TreasureMoveValidator());
      ruleEngine.registerValidator(new KingMoveValidator());
    });

    it('has all 9 piece type validators registered', () => {
      expect(ruleEngine.hasValidator(PieceType.FARMER)).toBe(true);
      expect(ruleEngine.hasValidator(PieceType.RAM)).toBe(true);
      expect(ruleEngine.hasValidator(PieceType.TRAP)).toBe(true);
      expect(ruleEngine.hasValidator(PieceType.KNIGHT)).toBe(true);
      expect(ruleEngine.hasValidator(PieceType.TEMPLAR)).toBe(true);
      expect(ruleEngine.hasValidator(PieceType.SCOUT)).toBe(true);
      expect(ruleEngine.hasValidator(PieceType.TREBUCHET)).toBe(true);
      expect(ruleEngine.hasValidator(PieceType.TREASURE)).toBe(true);
      expect(ruleEngine.hasValidator(PieceType.KING)).toBe(true);
    });

    it('validates FARMER forward move correctly', () => {
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState();

      const result = ruleEngine.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('validates KNIGHT jump correctly', () => {
      const move = createMove(pos(4, 4), pos(4, 7), PieceType.KNIGHT, TeamType.OUR);
      const gameState = createGameState();

      const result = ruleEngine.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('validates TREASURE movement correctly', () => {
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = ruleEngine.validate(move, gameState);

      expect(result.isValid).toBe(true);
    });

    it('rejects invalid FARMER backward move', () => {
      const move = createMove(pos(4, 5), pos(4, 4), PieceType.FARMER, TeamType.OUR);
      const gameState = createGameState();

      const result = ruleEngine.validate(move, gameState);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Invalid FARMER move');
    });

    it('rejects invalid TREASURE 2-square move', () => {
      const move = createMove(pos(4, 4), pos(4, 6), PieceType.TREASURE, TeamType.OUR);
      const gameState = createGameState();

      const result = ruleEngine.validate(move, gameState);

      expect(result.isValid).toBe(false);
    });
  });

  describe('error handling', () => {
    it('handles null move gracefully', () => {
      const validator = new MockValidator([PieceType.FARMER]);
      ruleEngine.registerValidator(validator);

      expect(() => {
        ruleEngine.validate(null as any, createGameState());
      }).toThrow(); // Should throw TypeError when accessing move.pieceType
    });

    it('returns error when no validator is registered', () => {
      // No validators registered
      const move = createMove(pos(4, 4), pos(4, 5), PieceType.FARMER, TeamType.OUR);
      
      expect(() => {
        ruleEngine.validate(move, createGameState());
      }).toThrow('No validator registered');
    });
  });
});
