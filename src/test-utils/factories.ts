import { Piece, PieceType as LegacyPieceType, TeamType as LegacyTeamType, Position } from "../Constants";
import { Move } from "../domain/core/Move";
import { Position as DomainPosition } from "../domain/core/Position";
import { GameState, GamePiece } from "../domain/game/GameState";
import { PieceType, TeamType } from "../domain/core/types";

/**
 * Test Factories - Helper functions for creating test data.
 * 
 * These factories provide consistent test data creation across all test files.
 */

export function createPiece(
  position: Position,
  pieceType: LegacyPieceType,
  team: LegacyTeamType,
  image?: string
): Piece {
  // Get the piece type name as a string
  const pieceTypeName = LegacyPieceType[pieceType].toLowerCase();
  return {
    position,
    type: pieceType,
    team,
    image: image || `${pieceTypeName}_${team === LegacyTeamType.OUR ? 'w' : 'b'}.svg`
  };
}

export function createGamePiece(
  position: Position,
  pieceType: PieceType,
  team: TeamType
): GamePiece {
  return {
    position: new DomainPosition(position.x, position.y),
    type: pieceType,
    team
  };
}

export function createMove(
  from: Position,
  to: Position,
  pieceType: PieceType,
  team: TeamType
): Move {
  return new Move({
    from: new DomainPosition(from.x, from.y),
    to: new DomainPosition(to.x, to.y),
    pieceType,
    team
  });
}

export function createGameState(overrides?: Partial<{
  pieces: GamePiece[];
  currentTurn: TeamType;
  kingDeathPenalty: ReadonlyMap<TeamType, boolean>;
}>): GameState {
  const defaults = {
    pieces: [],
    currentTurn: TeamType.OUR,
    kingDeathPenalty: new Map<TeamType, boolean>()
  };
  
  const config = { ...defaults, ...overrides };
  
  return new GameState({
    pieces: config.pieces,
    currentTurn: config.currentTurn,
    kingDeathPenalty: config.kingDeathPenalty
  });
}

/**
 * Create a GameState with KING death penalty active for a specific team.
 */
export function createGameStateWithPenalty(team: TeamType, pieces: GamePiece[] = []): GameState {
  const kingDeathPenalty = new Map<TeamType, boolean>();
  kingDeathPenalty.set(team, true);
  
  return createGameState({
    pieces,
    currentTurn: team,
    kingDeathPenalty
  });
}

/**
 * Create a standard 1x1 empty board position.
 */
export function pos(x: number, y: number): Position {
  return { x, y };
}

/**
 * Create an array of pieces for path blocking tests.
 */
export function createBlockingPieces(positions: Position[], team: TeamType = TeamType.OPPONENT): GamePiece[] {
  return positions.map(pos => createGamePiece(pos, PieceType.FARMER, team));
}

/**
 * Calculate Manhattan distance between two positions.
 */
export function manhattanDistance(from: Position, to: Position): number {
  return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
}

/**
 * Check if move is orthogonal (straight line).
 */
export function isOrthogonal(from: Position, to: Position): boolean {
  return from.x === to.x || from.y === to.y;
}

/**
 * Check if move is diagonal.
 */
export function isDiagonal(from: Position, to: Position): boolean {
  return Math.abs(to.x - from.x) === Math.abs(to.y - from.y);
}
