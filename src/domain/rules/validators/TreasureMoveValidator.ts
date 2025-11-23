/**
 * TreasureMoveValidator - Validates TREASURE piece movements
 * 
 * Rule specification (from Rules.txt):
 * "Mueve 1 casilla."
 * 
 * Movement rules:
 * - Orthogonal only (1 square)
 * - Can only move to empty tiles (treasures don't capture)
 * - Simplest piece movement in the game
 * 
 * Special considerations:
 * - IMMUNE to KING death penalty (per rules)
 * - No special abilities
 * - Win condition piece (capturing opponent's treasure)
 */

import { PieceType } from '../../core/types';
import { BaseMoveValidator, ValidationResult } from '../MoveValidator';
import type { Move } from '../../core/Move';
import type { GameState } from '../../game/GameState';

export class TreasureMoveValidator extends BaseMoveValidator {
  canValidate(pieceType: PieceType): boolean {
    return pieceType === PieceType.TREASURE;
  }

  validate(move: Move, gameState: GameState): ValidationResult {
    const { from, to } = move;

    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    // Must move exactly 1 square orthogonally
    const isOneSquareOrthogonal = 
      (dx === 1 && dy === 0) || (dx === 0 && dy === 1);

    if (!isOneSquareOrthogonal) {
      return ValidationResult.invalid(
        'TREASURE can only move 1 square orthogonally (horizontal/vertical)'
      );
    }

    // Destination must be empty (treasures don't capture)
    if (this.tileIsOccupied(to.x, to.y, gameState)) {
      return ValidationResult.invalid(
        'Destination occupied: TREASURE can only move to empty tiles',
        { x: to.x, y: to.y }
      );
    }

    return ValidationResult.valid();
  }
}
