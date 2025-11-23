/**
 * TrebuchetMoveValidator - Validates TREBUCHET piece movements
 * 
 * Rule specification (from Rules.txt):
 * "Mueve 1 o 2 casillas, puede perder el turno y atacar en un rango de 1 o 2 casillas a su alrededor."
 * 
 * Movement rules:
 * - Orthogonal only (1-2 squares)
 * - Cannot pass through pieces
 * - Can only move to empty tiles
 * - Skip turn + ranged attack system (deferred to Phase 4 - Action System)
 * 
 * Special considerations:
 * - KING death penalty: Reduces max movement from 2 to 1 square
 * - Ranged attack requires action-based system (not position-based)
 * - Foundation implemented: isTrebuchetReady() in GameState
 */

import { PieceType } from '../../core/types';
import { BaseMoveValidator, ValidationResult } from '../MoveValidator';
import type { Move } from '../../core/Move';
import type { GameState } from '../../game/GameState';

export class TrebuchetMoveValidator extends BaseMoveValidator {
  canValidate(pieceType: PieceType): boolean {
    return pieceType === PieceType.TREBUCHET;
  }

  validate(move: Move, gameState: GameState): ValidationResult {
    const { from, to, team } = move;

    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Must move orthogonally
    const isOrthogonal = (dx === 0 && dy !== 0) || (dy === 0 && dx !== 0);
    
    if (!isOrthogonal) {
      return ValidationResult.invalid('TREBUCHET can only move in straight lines');
    }

    const distance = Math.max(Math.abs(dx), Math.abs(dy));

    // Apply KING death penalty
    const maxDistance = this.applyKingDeathPenalty(2, team, PieceType.TREBUCHET, gameState);

    if (distance < 1 || distance > maxDistance) {
      const penaltyNote = gameState.hasKingDeathPenalty(team as any) 
        ? ' (KING death penalty active)'
        : '';
      return ValidationResult.invalid(
        `TREBUCHET can only move 1-${maxDistance} square(s)${penaltyNote}`
      );
    }

    // Check path is clear (for 2-square moves)
    if (distance === 2) {
      if (!this.isPathClear(from.x, from.y, to.x, to.y, gameState, true)) {
        return ValidationResult.invalid(
          'Path blocked: TREBUCHET cannot jump over pieces'
        );
      }
    }

    // Destination must be empty
    if (this.tileIsOccupied(to.x, to.y, gameState)) {
      return ValidationResult.invalid(
        'Destination occupied: TREBUCHET can only move to empty tiles',
        { x: to.x, y: to.y }
      );
    }

    return ValidationResult.valid();
  }
}
