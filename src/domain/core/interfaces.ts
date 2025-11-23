/**
 * Core interfaces for Medieval Chess domain layer.
 * 
 * These interfaces define contracts between different layers of the application
 * following SOLID principles (especially Interface Segregation and Dependency Inversion).
 * 
 * All interfaces are purposefully thin and focused on specific responsibilities.
 */

import { Move } from './Move';
import { Position } from './Position';
import { PieceType, TeamType, ValidationResult, AbilityResult, GameStatus } from './types';

/**
 * Interface for validating piece movements.
 * 
 * Each piece type should have its own implementation of this interface.
 * This follows the Open/Closed Principle - new pieces can be added
 * without modifying existing code.
 * 
 * @example
 * ```typescript
 * class FarmerMoveValidator implements MoveValidator {
 *   canValidate(pieceType: PieceType): boolean {
 *     return pieceType === PieceType.FARMER;
 *   }
 *   
 *   validate(move: Move, boardState: ReadonlyArray<Piece>): ValidationResult {
 *     // Implement farmer movement rules
 *   }
 * }
 * ```
 */
export interface MoveValidator {
  /**
   * Checks if this validator can handle the given piece type.
   * 
   * @param pieceType - Type of piece to validate
   * @returns true if this validator handles this piece type
   */
  canValidate(pieceType: PieceType): boolean;

  /**
   * Validates a move according to piece-specific rules.
   * 
   * Should NOT modify the board state - validation is read-only.
   * 
   * @param move - Move to validate
   * @param boardState - Current board state (readonly)
   * @returns Validation result with isValid flag and optional reason
   */
  validate(move: Move, boardState: ReadonlyArray<unknown>): ValidationResult;
}

/**
 * Interface for reading game state.
 * 
 * UI components should depend on this interface instead of full GameState class.
 * This follows Interface Segregation Principle - read-only consumers don't
 * need write access.
 */
export interface GameStateReader {
  /**
   * Gets piece at specified position.
   * 
   * @param position - Position to check
   * @returns Piece at position or undefined if empty
   */
  getPieceAt(position: Position): unknown | undefined;

  /**
   * Gets all pieces for a specific team.
   * 
   * @param team - Team to get pieces for
   * @returns Readonly array of team's pieces
   */
  getPiecesForTeam(team: TeamType): ReadonlyArray<unknown>;

  /**
   * Gets current turn (which team can move).
   * 
   * @returns Team whose turn it is
   */
  getCurrentTurn(): TeamType;

  /**
   * Gets complete move history.
   * 
   * @returns Readonly array of all moves made in order
   */
  getMoveHistory(): ReadonlyArray<Move>;

  /**
   * Gets current game status.
   * 
   * @returns Current status (in progress, check, checkmate, etc.)
   */
  getStatus(): GameStatus;

  /**
   * Checks if a position is under attack by opponent.
   * 
   * @param position - Position to check
   * @param team - Team to check attacks against
   * @returns true if position is threatened by opponent
   */
  isPositionUnderAttack(position: Position, team: TeamType): boolean;

  /**
   * Gets all valid moves for a piece at a position.
   * 
   * @param position - Position of piece
   * @returns Array of valid destination positions
   */
  getValidMovesFrom(position: Position): ReadonlyArray<Position>;
}

/**
 * Interface for modifying game state.
 * 
 * Only game logic classes should depend on this interface.
 * This follows Interface Segregation Principle - separates read from write.
 */
export interface GameStateWriter {
  /**
   * Executes a move and returns new game state.
   * 
   * Should return a NEW immutable state, not modify existing one.
   * 
   * @param move - Move to execute
   * @returns New game state after move
   */
  executeMove(move: Move): unknown; // Will be GameState once defined

  /**
   * Sets which team's turn it is.
   * 
   * @param team - Team to give turn to
   * @returns New game state with updated turn
   */
  setCurrentTurn(team: TeamType): unknown;

  /**
   * Updates game status.
   * 
   * @param status - New game status
   * @returns New game state with updated status
   */
  setStatus(status: GameStatus): unknown;

  /**
   * Removes a piece from the board.
   * 
   * Used for captures, trap destruction, etc.
   * 
   * @param position - Position of piece to remove
   * @returns New game state without piece
   */
  removePiece(position: Position): unknown;

  /**
   * Adds a piece to the board.
   * 
   * Used for special abilities or game setup.
   * 
   * @param position - Position to add piece
   * @param pieceType - Type of piece
   * @param team - Team piece belongs to
   * @returns New game state with new piece
   */
  addPiece(position: Position, pieceType: PieceType, team: TeamType): unknown;
}

/**
 * Interface for managing turn-based game flow.
 * 
 * Orchestrates turn order, validates turn ownership, and progresses game state.
 */
export interface TurnManager {
  /**
   * Gets the team that can move next.
   * 
   * @param currentState - Current game state
   * @returns Team whose turn is next
   */
  getNextTeam(currentState: GameStateReader): TeamType;

  /**
   * Validates that a move belongs to the current turn.
   * 
   * @param move - Move to validate
   * @param currentState - Current game state
   * @returns true if move's team matches current turn
   */
  isValidTurn(move: Move, currentState: GameStateReader): boolean;

  /**
   * Advances to next turn.
   * 
   * @param currentState - Current game state
   * @returns New game state with next team's turn
   */
  advanceTurn(currentState: GameStateWriter): unknown;
}

/**
 * Interface for checking win/lose conditions.
 * 
 * Evaluates board state to determine if game should end.
 */
export interface WinConditionChecker {
  /**
   * Checks if game has ended.
   * 
   * @param state - Current game state
   * @returns GameStatus if game ended, null if still in progress
   */
  checkWinCondition(state: GameStateReader): GameStatus | null;

  /**
   * Checks if a specific team's king is in check.
   * 
   * @param state - Current game state
   * @param team - Team to check
   * @returns true if team's king is under attack
   */
  isInCheck(state: GameStateReader, team: TeamType): boolean;

  /**
   * Checks if a team is in checkmate.
   * 
   * @param state - Current game state
   * @param team - Team to check
   * @returns true if team has no legal moves and king is in check
   */
  isCheckmate(state: GameStateReader, team: TeamType): boolean;

  /**
   * Checks if game is in stalemate.
   * 
   * @param state - Current game state
   * @returns true if current player has no legal moves but king is not in check
   */
  isStalemate(state: GameStateReader): boolean;
}

/**
 * Interface for handling special piece abilities.
 * 
 * Each special ability (TRAP invisibility, TEMPLAR counter-attack, etc.)
 * should implement this interface.
 */
export interface SpecialAbility {
  /**
   * Checks if this ability applies to a move.
   * 
   * @param move - Move being attempted
   * @param state - Current game state
   * @returns true if ability should trigger
   */
  canApply(move: Move, state: GameStateReader): boolean;

  /**
   * Applies the special ability effect.
   * 
   * @param move - Move triggering the ability
   * @param state - Current game state
   * @returns Result describing what happened
   */
  apply(move: Move, state: GameStateWriter): AbilityResult;

  /**
   * Gets display name for UI.
   * 
   * @returns Human-readable ability name
   */
  getName(): string;
}

/**
 * Interface for AI player implementations.
 * 
 * Allows different AI strategies (minimax, neural network, etc.)
 * to be plugged in without modifying game logic.
 */
export interface AIPlayer {
  /**
   * Calculates best move for current game state.
   * 
   * @param state - Current game state
   * @param team - Team AI is playing as
   * @param timeLimit - Max time in milliseconds (optional)
   * @returns Best move found or null if no valid moves
   */
  calculateMove(
    state: GameStateReader,
    team: TeamType,
    timeLimit?: number
  ): Promise<Move | null>;

  /**
   * Gets AI difficulty level.
   * 
   * @returns Difficulty setting
   */
  getDifficulty(): 'easy' | 'medium' | 'hard';

  /**
   * Gets AI strategy name for debugging.
   * 
   * @returns Strategy name (e.g., "Minimax Depth 3")
   */
  getStrategyName(): string;
}

/**
 * Interface for logging/observing game events.
 * 
 * Used for debugging, analytics, and game replay features.
 * Follows Observer Pattern.
 */
export interface GameObserver {
  /**
   * Called when a move is executed.
   * 
   * @param move - Move that was executed
   * @param resultingState - Game state after move
   */
  onMoveExecuted(move: Move, resultingState: GameStateReader): void;

  /**
   * Called when game status changes.
   * 
   * @param oldStatus - Previous status
   * @param newStatus - New status
   * @param state - Current game state
   */
  onStatusChanged(oldStatus: GameStatus, newStatus: GameStatus, state: GameStateReader): void;

  /**
   * Called when a piece is captured.
   * 
   * @param pieceType - Type of captured piece
   * @param position - Position where capture occurred
   * @param capturingTeam - Team that captured the piece
   */
  onPieceCaptured(pieceType: PieceType, position: Position, capturingTeam: TeamType): void;
}
