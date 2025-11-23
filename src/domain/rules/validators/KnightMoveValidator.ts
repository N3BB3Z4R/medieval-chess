/**
 * KnightMoveValidator - Validates KNIGHT piece movements
 * 
 * Rule specification (from Rules.txt):
 * "Mueve 3 casillas recto o 2 en diagonal, las fichas no bloquean su movimiento."
 * 
 * Movement rules:
 * - 3 squares orthogonal (horizontal/vertical) OR
 * - 2 squares diagonal
 * - JUMPS over pieces (no path blocking)
 * - Can capture opponent pieces or move to empty tiles
 * 
 * Special considerations:
 * - KING death penalty: Reduces 3-square to 2-square, 2-diagonal to 1-diagonal
 * - This is the MEDIEVAL knight (NOT standard chess L-shape)
 */

import { PieceType } from '../../core/types';
import { BaseMoveValidator, ValidationResult } from '../MoveValidator';
import type { Move } from '../../core/Move';
import type { GameState } from '../../game/GameState';

export class KnightMoveValidator extends BaseMoveValidator {
  canValidate(pieceType: PieceType): boolean {
    return pieceType === PieceType.KNIGHT;
  }

  validate(move: Move, gameState: GameState): ValidationResult {
    const { from, to, team } = move;

    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    // Apply KING death penalty
    const maxOrthogonal = this.applyKingDeathPenalty(3, team, PieceType.KNIGHT, gameState);
    const maxDiagonal = this.applyKingDeathPenalty(2, team, PieceType.KNIGHT, gameState);

    // CASE 1: Orthogonal movement (3 straight or 2 with penalty)
    const isOrthogonal = (dx === 0 && dy > 0) || (dx > 0 && dy === 0);
    const orthogonalDistance = Math.max(dx, dy);

    if (isOrthogonal && orthogonalDistance === maxOrthogonal) {
      return this.checkDestination(to, team, gameState);
    }

    // CASE 2: Diagonal movement (2 diagonal or 1 with penalty)
    const isDiagonal = dx === dy && dx > 0;
    const diagonalDistance = dx;

    if (isDiagonal && diagonalDistance === maxDiagonal) {
      return this.checkDestination(to, team, gameState);
    }

    // Invalid move
    const penaltyNote = gameState.hasKingDeathPenalty(team as any) 
      ? ` (KING death penalty: ${maxOrthogonal} orthogonal / ${maxDiagonal} diagonal)`
      : '';

    return ValidationResult.invalid(
      `Invalid KNIGHT move: Must move ${maxOrthogonal} squares straight or ` +
      `${maxDiagonal} squares diagonal${penaltyNote}. Attempted: dx=${dx}, dy=${dy}`
    );
  }

  private checkDestination(
    to: { x: number; y: number },
    team: string,
    gameState: GameState
  ): ValidationResult {
    // Cannot move to tile occupied by friendly piece
    if (this.tileIsOccupiedByAlly(to.x, to.y, team, gameState)) {
      return ValidationResult.invalid(
        'Destination occupied by friendly piece',
        { x: to.x, y: to.y }
      );
    }

    // Can move to empty tile or capture opponent
    return ValidationResult.valid();
  }
}
