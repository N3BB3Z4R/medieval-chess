/**
 * KingMoveValidator - Validates KING piece movements
 * 
 * Rule specification (from Rules.txt):
 * "Mueve 2 o 3 casillas. Hace EnPassant. Si le matan todas nuestras piezas pueden mover una casilla menos excepto el tesoro."
 * 
 * Movement rules:
 * - Orthogonal only (2-3 squares)
 * - Cannot pass through pieces
 * - Can capture opponent pieces
 * - En passant capability (shared with FARMER)
 * - Can deactivate TRAPs (like SCOUT)
 * 
 * Special considerations:
 * - KING death triggers global penalty for team (all pieces -1 movement except TREASURE)
 * - KING itself is NOT affected by its own death penalty (different team's king died)
 * - Most important piece for game-wide state
 */

import { PieceType } from '../../core/types';
import { BaseMoveValidator, ValidationResult } from '../MoveValidator';
import type { Move } from '../../core/Move';
import type { GameState } from '../../game/GameState';

export class KingMoveValidator extends BaseMoveValidator {
  canValidate(pieceType: PieceType): boolean {
    return pieceType === PieceType.KING;
  }

  validate(move: Move, gameState: GameState): ValidationResult {
    const { from, to, team } = move;

    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Must move orthogonally
    const isOrthogonal = (dx === 0 && dy !== 0) || (dy === 0 && dx !== 0);
    
    if (!isOrthogonal) {
      return ValidationResult.invalid('KING can only move in straight lines');
    }

    const distance = Math.max(Math.abs(dx), Math.abs(dy));

    // Apply KING death penalty (if OTHER team's king died)
    const maxDistance = this.applyKingDeathPenalty(3, team, PieceType.KING, gameState);
    const minDistance = Math.max(1, 2 - (3 - maxDistance)); // If max=2, min=1; if max=3, min=2

    if (distance < minDistance || distance > maxDistance) {
      const penaltyNote = gameState.hasKingDeathPenalty(team as any) 
        ? ` (KING death penalty: ${minDistance}-${maxDistance} squares)`
        : '';
      return ValidationResult.invalid(
        `KING must move ${minDistance}-${maxDistance} squares${penaltyNote}`
      );
    }

    // Check path is clear (cannot jump over pieces)
    if (!this.isPathClear(from.x, from.y, to.x, to.y, gameState, false)) {
      return ValidationResult.invalid(
        'Path blocked: KING cannot jump over pieces'
      );
    }

    // Destination can be empty OR have opponent piece (can capture)
    if (this.tileIsOccupiedByAlly(to.x, to.y, team, gameState)) {
      return ValidationResult.invalid(
        'Destination occupied by friendly piece',
        { x: to.x, y: to.y }
      );
    }

    return ValidationResult.valid();
  }
}
