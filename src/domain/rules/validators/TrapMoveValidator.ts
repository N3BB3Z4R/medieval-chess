/**
 * TrapMoveValidator - Validates TRAP piece movements
 * 
 * Rule specification (from Rules.txt):
 * "Mueve 1 o 2 casillas en diagonal, es invisible para el oponente, 
 *  los cazadores y el rey desactivan la trampa, al usarse desaparece."
 * 
 * Movement rules:
 * - Diagonal only (1-2 squares)
 * - Can only move to empty tiles (traps don't capture by movement)
 * - Invisibility is rendering concern (Tile.tsx handles visibility)
 * - Self-destructs after triggering (GameState.executeMove handles destruction)
 * - SCOUT/KING deactivation (GameState.executeMove handles detection)
 * 
 * Special considerations:
 * - KING death penalty: Reduces max movement from 2 to 1 square
 * - TRAP attacks when opponent STEPS ON IT (not when trap moves)
 */

import { PieceType } from '../../core/types';
import { BaseMoveValidator, ValidationResult } from '../MoveValidator';
import type { Move } from '../../core/Move';
import type { GameState } from '../../game/GameState';

export class TrapMoveValidator extends BaseMoveValidator {
  canValidate(pieceType: PieceType): boolean {
    return pieceType === PieceType.TRAP;
  }

  validate(move: Move, gameState: GameState): ValidationResult {
    const { from, to, team } = move;

    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    // Must move diagonally
    if (dx !== dy || dx === 0) {
      return ValidationResult.invalid('TRAP can only move diagonally');
    }

    // Apply KING death penalty
    const maxDistance = this.applyKingDeathPenalty(2, team, PieceType.TRAP, gameState);

    if (dx > maxDistance) {
      const penaltyNote = gameState.hasKingDeathPenalty(team as any) 
        ? ' (KING death penalty active)'
        : '';
      return ValidationResult.invalid(
        `TRAP can only move ${maxDistance} square(s) diagonally${penaltyNote}`
      );
    }

    // Destination must be empty (traps don't capture by moving)
    if (this.tileIsOccupied(to.x, to.y, gameState)) {
      return ValidationResult.invalid(
        'TRAP can only move to empty tiles',
        { x: to.x, y: to.y }
      );
    }

    return ValidationResult.valid();
  }
}
