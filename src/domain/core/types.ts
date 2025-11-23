/**
 * Core domain types for Medieval Chess.
 * 
 * This file contains fundamental enums and types that define the game's
 * entities and rules. These types are independent of any framework or
 * infrastructure concerns.
 */

/**
 * Represents the type of chess piece in medieval variant.
 * 
 * Medieval chess includes 9 unique piece types:
 * - FARMER: Moves 1 square forward, attacks diagonally
 * - RAM: Moves 1-2 squares, destroys enemies in path
 * - TRAP: Moves 1-2 diagonal, invisible to opponent
 * - KNIGHT: Moves 3 straight or 2 diagonal, jumps over pieces
 * - TEMPLAR: Moves 1-2 squares, counter-attacks when attacked
 * - SCOUT: Moves 2-3 squares, disables traps
 * - TREBUCHET: Moves 1-2 squares, ranged attack capability
 * - TREASURE: Moves 1 square, special win condition
 * - KING: Moves 2-3 squares, affects all pieces if killed
 */
export enum PieceType {
  FARMER = 'FARMER',
  RAM = 'RAM',
  TRAP = 'TRAP',
  KNIGHT = 'KNIGHT',
  TEMPLAR = 'TEMPLAR',
  SCOUT = 'SCOUT',
  TREBUCHET = 'TREBUCHET',
  TREASURE = 'TREASURE',
  KING = 'KING',
}

/**
 * Represents the team/color of pieces.
 * 
 * Current implementation supports 2 teams:
 * - OUR: Player's team (moves upward, y+)
 * - OPPONENT: Opponent's team (moves downward, y-)
 * 
 * Future expansion for 4-player mode will add:
 * - OPPONENT_2: Moves rightward (x+)
 * - OPPONENT_3: Moves leftward (x-)
 */
export enum TeamType {
  OUR = 'OUR',
  OPPONENT = 'OPPONENT',
  // OPPONENT_2 = 'OPPONENT_2', // Reserved for 4-player mode
  // OPPONENT_3 = 'OPPONENT_3', // Reserved for 4-player mode
}

/**
 * Result of a move validation.
 * 
 * Used by validators to communicate whether a move is legal
 * and provide detailed feedback for debugging/UI.
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly reason?: string;
  readonly blockedBy?: { x: number; y: number };
}

/**
 * Factory methods for ValidationResult.
 */
export const ValidationResult = {
  valid(): ValidationResult {
    return { isValid: true };
  },

  invalid(reason: string, blockedBy?: { x: number; y: number }): ValidationResult {
    return { isValid: false, reason, blockedBy };
  },
};

/**
 * Result of attempting to execute a move.
 * 
 * Includes the new game state after the move, or error details
 * if the move could not be completed.
 */
export interface MoveResult {
  readonly success: boolean;
  readonly newState?: unknown; // Will be GameState once defined
  readonly error?: string;
  readonly capturedPieces?: ReadonlyArray<{
    type: PieceType;
    position: { x: number; y: number };
  }>;
}

/**
 * Current status of the game.
 * 
 * Tracks game flow state for UI rendering and logic flow.
 */
export enum GameStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  CHECK = 'CHECK',
  CHECKMATE = 'CHECKMATE',
  STALEMATE = 'STALEMATE',
  DRAW = 'DRAW',
  WINNER_OUR = 'WINNER_OUR',
  WINNER_OPPONENT = 'WINNER_OPPONENT',
}

/**
 * Interface for reading game state.
 * 
 * UI components should depend on this interface instead of full GameState class.
 * This follows Interface Segregation Principle - read-only consumers don't
 * need write access.
 */
export interface GameStateReader {
  getPieceAt(position: unknown): unknown | undefined;
  getPiecesForTeam(team: TeamType): ReadonlyArray<unknown>;
  getCurrentTurn(): TeamType;
  getMoveHistory(): ReadonlyArray<unknown>;
  getStatus(): GameStatus;
  isPositionUnderAttack(position: unknown, team: TeamType): boolean;
  getValidMovesFrom(position: unknown): ReadonlyArray<unknown>;
}

/**
 * Interface for modifying game state.
 * 
 * Only game logic classes should depend on this interface.
 * This follows Interface Segregation Principle - separates read from write.
 */
export interface GameStateWriter {
  executeMove(move: unknown): unknown;
  setCurrentTurn(team: TeamType): unknown;
  setStatus(status: GameStatus): unknown;
  removePiece(position: unknown): unknown;
  addPiece(position: unknown, pieceType: PieceType, team: TeamType): unknown;
}

/**
 * Represents the result of checking special ability conditions.
 * 
 * Used for TRAP invisibility, TEMPLAR counter-attack, etc.
 */
export interface AbilityResult {
  readonly triggered: boolean;
  readonly effect?: string;
  readonly modifiedPositions?: ReadonlyArray<{ x: number; y: number }>;
}

/**
 * Factory methods for AbilityResult.
 */
export const AbilityResult = {
  noEffect(): AbilityResult {
    return { triggered: false };
  },

  triggered(effect: string, modifiedPositions?: ReadonlyArray<{ x: number; y: number }>): AbilityResult {
    return { triggered: true, effect, modifiedPositions };
  },
};

/**
 * Configuration for a player in the game.
 * 
 * Used for 2-4 player setup and AI configuration.
 */
export interface PlayerConfig {
  readonly team: TeamType;
  readonly name: string;
  readonly isAI: boolean;
  readonly aiDifficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Direction vector for piece movement.
 * 
 * Used to calculate movement direction for each team:
 * - OUR: { x: 0, y: 1 } (upward)
 * - OPPONENT: { x: 0, y: -1 } (downward)
 * - OPPONENT_2: { x: 1, y: 0 } (rightward)
 * - OPPONENT_3: { x: -1, y: 0 } (leftward)
 */
export interface DirectionVector {
  readonly x: -1 | 0 | 1;
  readonly y: -1 | 0 | 1;
}

/**
 * Helper to get direction vector for a team.
 * 
 * @param team - Team to get direction for
 * @returns Direction vector for piece movement
 */
export function getDirectionForTeam(team: TeamType): DirectionVector {
  switch (team) {
    case TeamType.OUR:
      return { x: 0, y: 1 }; // Moves UP
    case TeamType.OPPONENT:
      return { x: 0, y: -1 }; // Moves DOWN
    // Future 4-player support:
    // case TeamType.OPPONENT_2:
    //   return { x: 1, y: 0 }; // Moves RIGHT
    // case TeamType.OPPONENT_3:
    //   return { x: -1, y: 0 }; // Moves LEFT
    default:
      throw new Error(`Unknown team type: ${team}`);
  }
}

/**
 * Checks if a move is in the forward direction for a team.
 * 
 * @param delta - Movement delta { dx, dy }
 * @param team - Team to check for
 * @returns true if move is forward for the team
 */
export function isForwardMove(delta: { dx: number; dy: number }, team: TeamType): boolean {
  const direction = getDirectionForTeam(team);
  
  // Check if delta matches direction (ignoring magnitude)
  if (direction.x !== 0) {
    return Math.sign(delta.dx) === direction.x;
  } else {
    return Math.sign(delta.dy) === direction.y;
  }
}
