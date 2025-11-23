/**
 * TemplarMoveValidator - Validates TEMPLAR piece movements
 * 
 * Rule specification (from Rules.txt):
 * "Mueve 1 o 2 casillas, si es atacado puede atacar primero y mueren ambas fichas."
 * 
 * Movement rules:
 * - Orthogonal only (1-2 squares)
 * - Cannot pass through pieces
 * - Can only move to empty tiles (templars don't capture by moving)
 * - Counter-attack mechanic (mutual destruction) handled in GameState.executeMove()
 * 
 * Special considerations:
 * - KING death penalty: Reduces max movement from 2 to 1 square
 * - Counter-attack triggers when opponent attacks TEMPLAR (not when TEMPLAR moves)
 */

import { PieceType } from '../../core/types';
import { BaseMoveValidator, ValidationResult } from '../MoveValidator';
import type { Move } from '../../core/Move';
import type { GameState } from '../../game/GameState';

export class TemplarMoveValidator extends BaseMoveValidator {
  canValidate(pieceType: PieceType): boolean {
    return pieceType === PieceType.TEMPLAR;
  }

  validate(move: Move, gameState: GameState): ValidationResult {
    const { from, to, team } = move;

    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Must move orthogonally
    const isOrthogonal = (dx === 0 && dy !== 0) || (dy === 0 && dx !== 0);
    
    if (!isOrthogonal) {
      return ValidationResult.invalid('TEMPLAR can only move in straight lines');
    }

    const distance = Math.max(Math.abs(dx), Math.abs(dy));

    // Apply KING death penalty
    const maxDistance = this.applyKingDeathPenalty(2, team, PieceType.TEMPLAR, gameState);

    if (distance > maxDistance) {
      const penaltyNote = gameState.hasKingDeathPenalty(team as any) 
        ? ' (KING death penalty active)'
        : '';
      return ValidationResult.invalid(
        `TEMPLAR can only move ${maxDistance} square(s)${penaltyNote}`
      );
    }

    // Check path is clear (for 2-square moves)
    if (!this.isPathClear(from.x, from.y, to.x, to.y, gameState, true)) {
      return ValidationResult.invalid(
        'Path blocked: TEMPLAR cannot jump over pieces'
      );
    }

    // Destination must be empty (templars don't capture by moving)
    if (this.tileIsOccupied(to.x, to.y, gameState)) {
      return ValidationResult.invalid(
        'Destination occupied: TEMPLAR can only move to empty tiles',
        { x: to.x, y: to.y }
      );
    }

    return ValidationResult.valid();
  }
}
