/**
 * ScoutMoveValidator - Validates SCOUT piece movements
 * 
 * Rule specification (from Rules.txt):
 * "Mueve 2 o 3 casillas, desactivan las trampas."
 * 
 * Movement rules:
 * - Orthogonal only (2-3 squares)
 * - Cannot pass through pieces (path must be clear)
 * - Can only move to empty tiles (scouts don't capture by moving)
 * - Trap deactivation handled in GameState.executeMove()
 * 
 * Special considerations:
 * - KING death penalty: Reduces 3 to 2, 2 to 1 (minimum 1)
 * - Scout disables TRAPs when moving onto or adjacent to them
 */

import { PieceType } from '../../core/types';
import { BaseMoveValidator, ValidationResult } from '../MoveValidator';
import type { Move } from '../../core/Move';
import type { GameState } from '../../game/GameState';

export class ScoutMoveValidator extends BaseMoveValidator {
  canValidate(pieceType: PieceType): boolean {
    return pieceType === PieceType.SCOUT;
  }

  validate(move: Move, gameState: GameState): ValidationResult {
    const { from, to, team } = move;

    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Must move orthogonally
    const isOrthogonal = (dx === 0 && dy !== 0) || (dy === 0 && dx !== 0);
    
    if (!isOrthogonal) {
      return ValidationResult.invalid('SCOUT can only move in straight lines');
    }

    const distance = Math.max(Math.abs(dx), Math.abs(dy));

    // Apply KING death penalty
    const maxDistance = this.applyKingDeathPenalty(3, team, PieceType.SCOUT, gameState);
    const minDistance = Math.max(1, 2 - (3 - maxDistance)); // If max=2, min=1; if max=3, min=2

    if (distance < minDistance || distance > maxDistance) {
      const penaltyNote = gameState.hasKingDeathPenalty(team as any) 
        ? ` (KING death penalty: ${minDistance}-${maxDistance} squares)`
        : '';
      return ValidationResult.invalid(
        `SCOUT must move ${minDistance}-${maxDistance} squares${penaltyNote}`
      );
    }

    // Check path is clear (cannot jump over pieces)
    if (!this.isPathClear(from.x, from.y, to.x, to.y, gameState, true)) {
      return ValidationResult.invalid(
        'Path blocked: SCOUT cannot jump over pieces'
      );
    }

    // Destination must be empty (scouts don't capture by moving)
    if (this.tileIsOccupied(to.x, to.y, gameState)) {
      return ValidationResult.invalid(
        'Destination occupied: SCOUT can only move to empty tiles',
        { x: to.x, y: to.y }
      );
    }

    return ValidationResult.valid();
  }
}
