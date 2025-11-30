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

import { PieceType, getDirectionForTeam } from '../../core/types';
import { BaseMoveValidator, ValidationResult } from '../MoveValidator';
import type { Move } from '../../core/Move';
import type { GameState } from '../../game/GameState';

export class FarmerMoveValidator extends BaseMoveValidator {
  canValidate(pieceType: PieceType): boolean {
    return pieceType === PieceType.FARMER;
  }

  validate(move: Move, gameState: GameState): ValidationResult {
    const { from, to, team } = move;

    // Get direction vector for team (supports 4 teams)
    const direction = getDirectionForTeam(team);

    const deltaX = to.x - from.x;
    const deltaY = to.y - from.y;

    // CASE 1: Two squares forward from starting position (first move only)
    const isTwoSquareMove = (
      deltaX === 2 * direction.x && deltaY === 2 * direction.y &&
      this.isOnStartingRow(from, team)
    );
    
    if (isTwoSquareMove) {
      // Check if KING death penalty is active
      if (gameState.hasKingDeathPenalty(team as any)) {
        return ValidationResult.invalid(
          'KING death penalty: FARMER cannot move 2 squares (reduced to 1)'
        );
      }

      // Check both intermediate and destination tiles are empty
      const intermediateTile = { 
        x: from.x + direction.x, 
        y: from.y + direction.y 
      };
      
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
    const isOneSquareForward = (
      deltaX === direction.x && deltaY === direction.y
    );
    
    if (isOneSquareForward) {
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
    // For vertical teams (OUR/OPPONENT): deltaY = direction.y, deltaX = ±1
    // For horizontal teams (OPPONENT_2/3): deltaX = direction.x, deltaY = ±1
    const isDiagonalMove = this.isDiagonalAttack(deltaX, deltaY, direction);
    
    if (isDiagonalMove) {
      // Diagonal is already validated by isDiagonalAttack

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

  /**
   * Check if position is on the starting row for the team
   */
  private isOnStartingRow(pos: { x: number; y: number }, team: string): boolean {
    switch (team) {
      case 'OUR':
        return pos.y === 2; // Bottom row
      case 'OPPONENT':
        return pos.y === 13; // Top row
      case 'OPPONENT_2':
        return pos.x === 13; // Right column (team on the right side)
      case 'OPPONENT_3':
        return pos.x === 2; // Left column (team on the left side)
      default:
        return false;
    }
  }

  /**
   * Get starting row for 2-square move
   */
  private getStartingRow(team: string): number {
    switch (team) {
      case 'OUR':
        return 2;
      case 'OPPONENT':
        return 13;
      case 'OPPONENT_2':
        return 13; // Right column
      case 'OPPONENT_3':
        return 2; // Left column
      default:
        return 2;
    }
  }

  /**
   * Check if move is a valid diagonal attack for the team's direction
   */
  private isDiagonalAttack(
    deltaX: number, 
    deltaY: number, 
    direction: { x: number; y: number }
  ): boolean {
    // For vertical teams (OUR/OPPONENT): move forward in Y, ±1 in X
    if (direction.y !== 0) {
      return deltaY === direction.y && Math.abs(deltaX) === 1;
    }
    // For horizontal teams (OPPONENT_2/3): move forward in X, ±1 in Y
    if (direction.x !== 0) {
      return deltaX === direction.x && Math.abs(deltaY) === 1;
    }
    return false;
  }
}
