/**
 * MoveValidator - Strategy Pattern Interface
 * 
 * Defines the contract for piece-specific movement validation.
 * Each piece type has its own validator implementation.
 * 
 * Following Open/Closed Principle:
 * - Open for extension: Create new validators for new piece types
 * - Closed for modification: Interface never changes
 */

import { PieceType } from '../core/types';
import type { Move } from '../core/Move';
import type { GameState } from '../game/GameState';
import { Position } from '../core/Position';

/**
 * Validation result with detailed feedback.
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly reason?: string;
  readonly blockedBy?: { x: number; y: number };
}

/**
 * Factory methods for ValidationResult.
 * Using namespace to avoid conflict with interface of same name.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ValidationResult = {
  valid(): ValidationResult {
    return { isValid: true };
  },

  invalid(reason: string, blockedBy?: { x: number; y: number }): ValidationResult {
    return { isValid: false, reason, blockedBy };
  },
};

/**
 * Core validator interface that all piece validators must implement.
 * 
 * Design principles:
 * - Single Responsibility: Only validates moves, doesn't execute them
 * - Dependency Inversion: Depends on GameState abstraction, not concrete implementation
 * - Interface Segregation: Thin interface with only essential methods
 */
export interface MoveValidator {
  /**
   * Returns true if this validator can validate the given piece type.
   * 
   * @param pieceType - The type of piece to check
   * @returns true if this validator handles this piece type
   * 
   * @example
   * ```typescript
   * const farmerValidator = new FarmerMoveValidator();
   * farmerValidator.canValidate(PieceType.FARMER); // true
   * farmerValidator.canValidate(PieceType.KNIGHT); // false
   * ```
   */
  canValidate(pieceType: PieceType): boolean;

  /**
   * Validates a move according to piece-specific rules.
   * 
   * This method receives the FULL GameState (not just Piece[] array),
   * enabling validators to check:
   * - King death penalties (hasKingDeathPenalty)
   * - Trebuchet ready state (isTrebuchetReady)
   * - Any future game-wide conditions
   * 
   * @param move - The move to validate (from, to, piece info)
   * @param gameState - Complete game state (immutable)
   * @returns Validation result with isValid flag and optional reason
   * 
   * @example
   * ```typescript
   * const result = validator.validate(move, gameState);
   * if (!result.isValid) {
   *   console.error('Invalid move:', result.reason);
   *   if (result.blockedBy) {
   *     console.error('Blocked by piece at:', result.blockedBy);
   *   }
   * }
   * ```
   */
  validate(move: Move, gameState: GameState): ValidationResult;
}

/**
 * Abstract base class providing common validation utilities.
 * 
 * Piece-specific validators can extend this to reuse common logic.
 */
export abstract class BaseMoveValidator implements MoveValidator {
  abstract canValidate(pieceType: PieceType): boolean;
  abstract validate(move: Move, gameState: GameState): ValidationResult;

  /**
   * Check if a specific tile is occupied by any piece.
   */
  protected tileIsOccupied(x: number, y: number, gameState: GameState): boolean {
    return gameState.getPieceAt(new Position(x, y)) !== undefined;
  }

  /**
   * Check if a tile is occupied by an opponent piece.
   */
  protected tileIsOccupiedByOpponent(
    x: number,
    y: number,
    team: string,
    gameState: GameState
  ): boolean {
    const piece = gameState.getPieceAt(new Position(x, y));
    return piece !== undefined && piece.team !== team;
  }

  /**
   * Check if a tile is occupied by a friendly piece.
   */
  protected tileIsOccupiedByAlly(
    x: number,
    y: number,
    team: string,
    gameState: GameState
  ): boolean {
    const piece = gameState.getPieceAt(new Position(x, y));
    return piece !== undefined && piece.team === team;
  }

  /**
   * Check if a path is clear between two positions (for multi-square moves).
   * 
   * @param fromX - Starting X coordinate
   * @param fromY - Starting Y coordinate
   * @param toX - Destination X coordinate
   * @param toY - Destination Y coordinate
   * @param gameState - Current game state
   * @param includeDestination - Whether to check destination tile for blocking
   * @returns true if path is clear, false if blocked
   */
  protected isPathClear(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    gameState: GameState,
    includeDestination: boolean = false
  ): boolean {
    const dx = Math.sign(toX - fromX);
    const dy = Math.sign(toY - fromY);
    
    let x = fromX + dx;
    let y = fromY + dy;
    
    const maxSteps = Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY));
    
    for (let step = 1; step < maxSteps; step++) {
      if (this.tileIsOccupied(x, y, gameState)) {
        return false; // Path blocked
      }
      x += dx;
      y += dy;
    }
    
    // Check destination tile if requested
    if (includeDestination && this.tileIsOccupied(toX, toY, gameState)) {
      return false;
    }
    
    return true;
  }

  /**
   * Apply KING death penalty to movement range.
   * 
   * If the team's king has been captured, all pieces except TREASURE
   * have their movement reduced by 1 square.
   * 
   * @param baseDistance - Normal maximum movement distance
   * @param team - Team to check for penalty
   * @param pieceType - Type of piece (TREASURE is immune)
   * @param gameState - Current game state
   * @returns Adjusted maximum distance
   */
  protected applyKingDeathPenalty(
    baseDistance: number,
    team: string,
    pieceType: PieceType,
    gameState: GameState
  ): number {
    // TREASURE is immune to king death penalty per rules
    if (pieceType === PieceType.TREASURE) {
      return baseDistance;
    }

    // Check if team has king death penalty
    if (gameState.hasKingDeathPenalty(team as any)) {
      return Math.max(1, baseDistance - 1); // Reduce by 1, minimum 1
    }

    return baseDistance;
  }
}
