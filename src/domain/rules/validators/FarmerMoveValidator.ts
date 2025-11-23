/**
 * FarmerMoveValidator - Validates FARMER piece movements
 * 
 * Rule specification (from Rules.txt):
 * "Mueve 1 casilla. Ataca en diagonal o hace EnPassant?"
 * 
 * Movement rules:
 * - Forward only (1 square in team direction)
 * - 2 squares forward on first move from starting row
 * - Diagonal attack (capture opponent pieces only)
 * - En passant capability (shared with KING)
 * 
 * Special considerations:
 * - KING death penalty: Reduces 2-square initial move to 1 square only
 * - Cannot move backward or sideways
 * - Destination must be empty for forward moves
 * - Destination must have opponent for diagonal attacks
 */

import { PieceType } from '../../core/types';
import { BaseMoveValidator, ValidationResult } from '../MoveValidator';
import type { Move } from '../../core/Move';
import type { GameState } from '../../game/GameState';

export class FarmerMoveValidator extends BaseMoveValidator {
  canValidate(pieceType: PieceType): boolean {
    return pieceType === PieceType.FARMER;
  }

  validate(move: Move, gameState: GameState): ValidationResult {
    const { from, to, team } = move;

    // Determine direction based on team
    const farmerDirection = team === 'OUR' ? 1 : -1;
    const specialRow = team === 'OUR' ? 2 : 13; // Starting row for 2-square move

    const deltaX = to.x - from.x;
    const deltaY = to.y - from.y;

    // CASE 1: Two squares forward from starting position (first move only)
    if (
      deltaX === 0 && // Same column
      from.y === specialRow && // Starting row
      deltaY === 2 * farmerDirection // Two squares in correct direction
    ) {
      // Check if KING death penalty is active
      if (gameState.hasKingDeathPenalty(team as any)) {
        return ValidationResult.invalid(
          'KING death penalty: FARMER cannot move 2 squares (reduced to 1)'
        );
      }

      // Check both intermediate and destination tiles are empty
      const intermediateTile = { x: from.x, y: from.y + farmerDirection };
      
      if (this.tileIsOccupied(intermediateTile.x, intermediateTile.y, gameState)) {
        return ValidationResult.invalid(
          'Path blocked: Cannot jump over pieces',
          intermediateTile
        );
      }

      if (this.tileIsOccupied(to.x, to.y, gameState)) {
        return ValidationResult.invalid(
          'Destination occupied: FARMER cannot capture moving forward',
          { x: to.x, y: to.y }
        );
      }

      return ValidationResult.valid();
    }

    // CASE 2: One square forward only
    if (
      deltaX === 0 && // Same column
      deltaY === farmerDirection // One square in correct direction
    ) {
      // Destination must be empty (can't capture moving forward)
      if (this.tileIsOccupied(to.x, to.y, gameState)) {
        return ValidationResult.invalid(
          'Destination occupied: FARMER cannot capture moving forward',
          { x: to.x, y: to.y }
        );
      }

      return ValidationResult.valid();
    }

    // CASE 3: Diagonal attack (capture)
    const isDiagonalMove = Math.abs(deltaX) === 1 && Math.abs(deltaY) === 1;
    
    if (isDiagonalMove) {
      // Must move diagonally forward (not backward)
      const isForwardDiagonal = deltaY === farmerDirection;
      
      if (!isForwardDiagonal) {
        return ValidationResult.invalid(
          'Invalid diagonal: FARMER can only attack diagonally forward'
        );
      }

      // Destination must have opponent piece
      if (!this.tileIsOccupiedByOpponent(to.x, to.y, team, gameState)) {
        return ValidationResult.invalid(
          'No opponent piece: FARMER can only move diagonally to capture'
        );
      }

      // Check if attacking a TRAP (special rule: mutual destruction)
      const targetPiece = gameState.getPieceAt(to);

      if (targetPiece?.type === PieceType.TRAP) {
        // Note: Mutual destruction is handled in GameState.executeMove()
        // Validator only checks if move is legal
        return ValidationResult.valid();
      }

      return ValidationResult.valid();
    }

    // CASE 4: Invalid move (backward, sideways, too far, etc.)
    return ValidationResult.invalid(
      `Invalid FARMER move: Can only move forward 1 square or attack diagonally. ` +
      `Attempted: dx=${deltaX}, dy=${deltaY}`
    );
  }
}
