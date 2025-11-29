/**
 * Game helper utilities
 * 
 * Functions for:
 * - Score calculation
 * - Last move extraction
 * - Check detection
 * - Material advantage
 * - Piece counting
 */

import { GameState, GamePiece } from '../domain/game/GameState';
import { TeamType, PieceType } from '../Constants';
import { Position } from '../domain/core/Position';
import { REFINED_PIECE_VALUES } from '../domain/ai/PieceValues';

/**
 * Calculate total score for a team based on captured opponent pieces.
 * 
 * @param team - Team to calculate score for
 * @param capturedPieces - All captured pieces
 * @returns Total score
 */
export function calculateScore(team: TeamType, capturedPieces: readonly GamePiece[]): number {
  return capturedPieces
    .filter(p => (p.team as any) !== team)
    .reduce((sum, p) => {
      const value = (REFINED_PIECE_VALUES as any)[p.type] || 0;
      return sum + value;
    }, 0);
}

/**
 * Calculate material advantage for a team.
 * 
 * @param team - Team to calculate for
 * @param capturedPieces - All captured pieces
 * @returns Positive if advantage, negative if disadvantage
 */
export function calculateMaterialAdvantage(
  team: TeamType, 
  capturedPieces: readonly GamePiece[]
): number {
  const ourCaptures = capturedPieces.filter(p => (p.team as any) !== team);
  const theirCaptures = capturedPieces.filter(p => (p.team as any) === team);
  
  const ourScore = ourCaptures.reduce((sum, p) => {
    const value = (REFINED_PIECE_VALUES as any)[p.type] || 0;
    return sum + value;
  }, 0);
  
  const theirScore = theirCaptures.reduce((sum, p) => {
    const value = (REFINED_PIECE_VALUES as any)[p.type] || 0;
    return sum + value;
  }, 0);
  
  return ourScore - theirScore;
}

/**
 * Get last move for a specific team.
 * 
 * @param team - Team to get last move for
 * @param gameState - Current game state
 * @returns Last move info or null
 */
export function getLastMoveForTeam(
  team: TeamType,
  gameState: GameState
): { piece: PieceType; notation: string } | null {
  const moveHistory = gameState.getMoveHistory();
  const teamMoves = moveHistory.filter(m => (m.team as any) === team);
  
  if (teamMoves.length === 0) {
    return null;
  }
  
  const lastMove = teamMoves[teamMoves.length - 1];
  
  return {
    piece: lastMove.pieceType as any,
    notation: formatMoveNotation(lastMove.from as any, lastMove.to as any)
  };
}

/**
 * Format move notation (e.g., "e2 → e4").
 * 
 * @param from - Starting position
 * @param to - Ending position
 * @returns Formatted notation
 */
export function formatMoveNotation(from: Position, to: Position): string {
  const fromStr = `${String.fromCharCode(97 + from.x)}${from.y + 1}`;
  const toStr = `${String.fromCharCode(97 + to.x)}${to.y + 1}`;
  return `${fromStr} → ${toStr}`;
}

/**
 * Check if a team's king is in check.
 * 
 * Simple implementation: checks if any opponent piece can capture king.
 * 
 * @param team - Team to check
 * @param gameState - Current game state
 * @returns True if king is in check
 */
export function isInCheck(team: TeamType, gameState: GameState): boolean {
  const allPieces = gameState.getAllPieces();
  
  // Find king
  const king = allPieces.find(
    p => (p.type as any) === PieceType.KING && (p.team as any) === team
  );
  
  if (!king) {
    return false; // No king = can't be in check
  }
  
  // Check if any opponent piece threatens king
  const opponentPieces = allPieces.filter(p => (p.team as any) !== team);
  
  // Simple check: see if opponent has piece that could move to king's position
  // TODO: Use proper move validation when integrated
  return false; // Placeholder - requires full move validation
}

/**
 * Count remaining pieces for a team.
 * 
 * @param team - Team to count for
 * @param gameState - Current game state
 * @returns Number of pieces
 */
export function countRemainingPieces(team: TeamType, gameState: GameState): number {
  return gameState.getAllPieces().filter(p => (p.team as any) === team).length;
}

/**
 * Get image path for a piece.
 * 
 * @param piece - Piece to get image for
 * @returns Image path
 */
export function getPieceImagePath(piece: GamePiece): string {
  const typeMap: Record<string, string> = {
    'FARMER': 'farmer',
    'RAM': 'ram',
    'TRAP': 'trap',
    'KNIGHT': 'knight',
    'TEMPLAR': 'templar',
    'SCOUT': 'scout',
    'TREBUCHET': 'trebuchet',
    'TREASURE': 'treasure',
    'KING': 'king'
  };
  
  const pieceName = typeMap[piece.type as any] || 'farmer';
  const color = (piece.team as any) === TeamType.OUR ? 'w' : 'b';
  
  return `assets/images/${pieceName}_${color}.svg`;
}

/**
 * Map pieces to captured pieces format for UI.
 * 
 * @param pieces - Pieces to map
 * @returns Array of { type, image }
 */
export function mapToCapturedPiecesFormat(pieces: readonly GamePiece[]): Array<{ type: PieceType; image: string }> {
  return pieces.map(p => ({
    type: p.type as any,
    image: getPieceImagePath(p)
  }));
}
