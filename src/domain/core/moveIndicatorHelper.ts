/**
 * Move Indicator Helper
 * Utility functions to calculate and apply CSS classes for valid move indicators
 */

import { Position } from '../../domain/core/Position';
import { Piece, TeamType } from '../../Constants';
import { GameState } from '../game/GameState';
import { Move } from '../core/Move';
import { Position as PositionClass } from '../core/Position';
import Referee from '../../referee/Referee';

export interface TileState {
  position: Position;
  isSelected: boolean;
  isValidMove: boolean;
  isCaptureMove: boolean;
  isUnderAttack: boolean;
  isSpecialAbility: boolean;
}

export interface MoveIndicatorConfig {
  selectedPosition: Position | null;
  validMoves: Position[];
  captureMoves: Position[];
  attackedPositions?: Position[];
  specialAbilityPositions?: Position[];
}

/**
 * Calculate CSS classes for a tile based on its state
 */
export function getTileClasses(
  position: { x: number; y: number },
  config: MoveIndicatorConfig
): string {
  const classes: string[] = ['tile'];
  
  // Base color class
  const isDark = (position.x + position.y) % 2 === 0;
  classes.push(isDark ? 'tile--dark' : 'tile--light');
  
  // Forbidden zone
  if (Position.isInForbiddenZone(position)) {
    classes.push('tile--forbidden');
    return classes.join(' ');
  }
  
  // Selected tile
  if (config.selectedPosition && Position.equals(position, config.selectedPosition)) {
    classes.push('tile--selected');
  }
  
  // Valid move
  const isValidMove = config.validMoves.some(p => Position.equals(p, position));
  if (isValidMove) {
    classes.push('tile--valid-move');
  }
  
  // Capture move
  const isCaptureMove = config.captureMoves.some(p => Position.equals(p, position));
  if (isCaptureMove) {
    classes.push('tile--capture-move');
  }
  
  // Under attack (for TEMPLAR counter-attack visualization)
  const isUnderAttack = config.attackedPositions?.some(p => Position.equals(p, position));
  if (isUnderAttack) {
    classes.push('tile--under-attack');
  }
  
  // Special ability (for TREBUCHET range, TRAP detection, etc.)
  const isSpecialAbility = config.specialAbilityPositions?.some(p => Position.equals(p, position));
  if (isSpecialAbility) {
    classes.push('tile--special-ability');
  }
  
  return classes.join(' ');
}

/**
 * Calculate all valid moves for a piece using the RuleEngine
 */
export function calculateValidMoves(
  piece: Piece,
  gameState: GameState,
  referee: Referee
): { validMoves: Position[]; captureMoves: Position[] } {
  const validMoves: Position[] = [];
  const captureMoves: Position[] = [];
  
  // Check all possible positions on the board
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      const targetPosition = { x, y };
      
      // Skip if position is forbidden
      if (Position.isInForbiddenZone(targetPosition)) {
        continue;
      }
      
      // Skip if same as current position
      if (Position.equals(piece.position, targetPosition)) {
        continue;
      }
      
      // Construct Move object
      const move = new Move({
        from: new PositionClass(piece.position.x, piece.position.y),
        to: new PositionClass(x, y),
        pieceType: piece.type,
        team: piece.team
      });

      // Check if move is valid using referee
      const validation = referee.validateMove(move, gameState);
      
      if (validation.isValid) {
        // Check if there's an opponent piece at target
        const targetPiece = gameState.getPieceAt(new PositionClass(x, y));
        
        if (targetPiece && targetPiece.team !== piece.team) {
          captureMoves.push(new Position(x, y));
        } else {
          validMoves.push(new Position(x, y));
        }
      }
    }
  }
  
  return { validMoves, captureMoves };
}

/**
 * Get piece at position helper
 */
export function getPieceAt(position: { x: number; y: number }, pieces: Piece[]): Piece | undefined {
  return pieces.find(p => Position.equals(p.position, position));
}

/**
 * Check if position has opponent piece
 */
export function hasOpponentAt(
  position: { x: number; y: number },
  pieces: Piece[],
  team: TeamType
): boolean {
  const piece = getPieceAt(position, pieces);
  return piece !== undefined && piece.team !== team;
}

/**
 * Apply invalid move feedback animation
 * Call this when a player tries to make an invalid move
 */
export function showInvalidMoveFeedback(tileElement: HTMLElement): void {
  tileElement.classList.add('tile--invalid');
  
  // Remove class after animation completes
  setTimeout(() => {
    tileElement.classList.remove('tile--invalid');
  }, 500);
}
