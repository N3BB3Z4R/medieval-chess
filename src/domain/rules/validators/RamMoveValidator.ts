/**
 * RamMoveValidator - Validates RAM piece movements
 * 
 * Rule specification (from Rules.txt):
 * "Mueve 1 o 2 casillas, si en su camino hay uno o dos enemigos los eliminara."
 * 
 * Movement rules:
 * - Orthogonal only (horizontal/vertical, NO diagonal)
 * - 1-2 squares in one direction
 * - Eliminates ALL enemies in path (middle + destination)
 * - Cannot pass through friendly pieces
 * 
 * Special considerations:
 * - KING death penalty: Reduces max movement from 2 to 1 square
 * - Destroys enemies but doesn't destroy self
 */

import { PieceType } from '../../core/types';
import { BaseMoveValidator, ValidationResult } from '../MoveValidator';
import type { Move } from '../../core/Move';
import type { GameState } from '../../game/GameState';

export class RamMoveValidator extends BaseMoveValidator {
  canValidate(pieceType: PieceType): boolean {
    return pieceType === PieceType.RAM;
  }

  validate(move: Move, gameState: GameState): ValidationResult {
    const { from, to, team } = move;

    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Cannot stay in place
    if (dx === 0 && dy === 0) {
      return ValidationResult.invalid('RAM must move at least 1 square');
    }

    // Must move orthogonally (not diagonally)
    const isOrthogonal = (dx === 0 && dy !== 0) || (dy === 0 && dx !== 0);
    
    if (!isOrthogonal) {
      return ValidationResult.invalid(
        'RAM can only move in straight lines (horizontal/vertical)'
      );
    }

    const distance = Math.max(Math.abs(dx), Math.abs(dy));

    // Apply KING death penalty
    const maxDistance = this.applyKingDeathPenalty(2, team, PieceType.RAM, gameState);

    if (distance > maxDistance) {
      const penaltyNote = gameState.hasKingDeathPenalty(team as any) 
        ? ' (KING death penalty active)'
        : '';
      return ValidationResult.invalid(
        `RAM can only move ${maxDistance} square(s)${penaltyNote}`
      );
    }

    // CASE 1: Move 1 square
    if (distance === 1) {
      // Can move to empty tile or capture opponent
      if (this.tileIsOccupiedByAlly(to.x, to.y, team, gameState)) {
        return ValidationResult.invalid(
          'Cannot move: Destination occupied by friendly piece',
          { x: to.x, y: to.y }
        );
      }

      return ValidationResult.valid();
    }

    // CASE 2: Move 2 squares
    if (distance === 2) {
      const middleX = (from.x + to.x) / 2;
      const middleY = (from.y + to.y) / 2;

      // Middle tile cannot have friendly piece
      if (this.tileIsOccupiedByAlly(middleX, middleY, team, gameState)) {
        return ValidationResult.invalid(
          'Path blocked by friendly piece',
          { x: middleX, y: middleY }
        );
      }

      // Destination cannot have friendly piece
      if (this.tileIsOccupiedByAlly(to.x, to.y, team, gameState)) {
        return ValidationResult.invalid(
          'Destination occupied by friendly piece',
          { x: to.x, y: to.y }
        );
      }

      // RAM eliminates ALL enemies in path (middle + destination)
      // Validation passes - elimination logic handled in GameState.executeMove()
      return ValidationResult.valid();
    }

    return ValidationResult.invalid(
      `Invalid RAM move: distance=${distance}, maxDistance=${maxDistance}`
    );
  }
}
