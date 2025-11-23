/**
 * RuleEngine - Orchestrator for Move Validation
 * 
 * Implements plugin system for registering piece-specific validators.
 * 
 * Following SOLID principles:
 * - Single Responsibility: Only coordinates validators
 * - Open/Closed: Add new validators via registration, no modification needed
 * - Dependency Inversion: Depends on MoveValidator interface, not concrete classes
 */

import type { Move } from '../core/Move';
import type { GameState } from '../game/GameState';
import type { MoveValidator, ValidationResult } from './MoveValidator';
import { PieceType } from '../core/types';

/**
 * Central rule engine that delegates validation to appropriate validators.
 * 
 * Usage:
 * ```typescript
 * const ruleEngine = new RuleEngine();
 * ruleEngine.registerValidator(new FarmerMoveValidator());
 * ruleEngine.registerValidator(new KnightMoveValidator());
 * 
 * const result = ruleEngine.validate(move, gameState);
 * if (result.isValid) {
 *   // Execute move
 * }
 * ```
 */
export class RuleEngine {
  private validators: Map<PieceType, MoveValidator> = new Map();

  /**
   * Register a validator for one or more piece types.
   * 
   * Validators are discovered by calling canValidate() for each PieceType.
   * 
   * @param validator - The validator to register
   * @throws Error if validator doesn't handle any piece types
   * 
   * @example
   * ```typescript
   * const engine = new RuleEngine();
   * engine.registerValidator(new FarmerMoveValidator());
   * ```
   */
  registerValidator(validator: MoveValidator): void {
    let registered = false;

    // Check which piece types this validator handles
    for (const pieceType of Object.values(PieceType)) {
      if (validator.canValidate(pieceType)) {
        this.validators.set(pieceType, validator);
        registered = true;
      }
    }

    if (!registered) {
      throw new Error(
        `Validator ${validator.constructor.name} does not handle any piece types`
      );
    }
  }

  /**
   * Validate a move using the appropriate piece-specific validator.
   * 
   * @param move - The move to validate
   * @param gameState - Current game state
   * @returns Validation result with isValid flag and optional reason
   * @throws Error if no validator registered for the piece type
   * 
   * @example
   * ```typescript
   * const result = ruleEngine.validate(move, gameState);
   * if (!result.isValid) {
   *   console.error('Invalid move:', result.reason);
   * }
   * ```
   */
  validate(move: Move, gameState: GameState): ValidationResult {
    const validator = this.validators.get(move.pieceType as PieceType);

    if (!validator) {
      throw new Error(
        `No validator registered for piece type: ${move.pieceType}`
      );
    }

    return validator.validate(move, gameState);
  }

  /**
   * Check if a validator is registered for a piece type.
   * 
   * @param pieceType - The piece type to check
   * @returns true if a validator is registered
   */
  hasValidator(pieceType: PieceType): boolean {
    return this.validators.has(pieceType);
  }

  /**
   * Get the validator for a specific piece type.
   * 
   * @param pieceType - The piece type
   * @returns The validator, or undefined if not registered
   */
  getValidator(pieceType: PieceType): MoveValidator | undefined {
    return this.validators.get(pieceType);
  }

  /**
   * Get all registered piece types.
   * 
   * @returns Array of piece types with registered validators
   */
  getRegisteredPieceTypes(): PieceType[] {
    return Array.from(this.validators.keys());
  }

  /**
   * Clear all registered validators.
   * 
   * Useful for testing or resetting the engine.
   */
  clear(): void {
    this.validators.clear();
  }
}
