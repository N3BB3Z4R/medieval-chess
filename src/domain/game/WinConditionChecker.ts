import { GameStateReader } from '../core/types';
import { GameStatus, TeamType } from '../core/types';
import { WinConditionChecker as IWinConditionChecker } from '../core/interfaces';

/**
 * Checks win/lose/draw conditions in medieval chess.
 * 
 * Handles:
 * - King capture (immediate win)
 * - Multiple king captures (last team standing wins)
 * - Checkmate (king in check with no legal moves)
 * - Stalemate (no legal moves but not in check)
 * 
 * @architecture Clean Architecture - Domain Layer
 * @solid Single Responsibility: Only evaluates game-ending conditions
 */
export class WinConditionChecker implements IWinConditionChecker {
  
  /**
   * Checks if game has ended.
   * 
   * Returns specific GameStatus if game over, null if still in progress.
   * 
   * Priority order:
   * 1. Check for king captures (TREASURE_CAPTURED_*)
   * 2. Check for checkmate (CHECKMATE_*)
   * 3. Check for stalemate (STALEMATE)
   * 
   * @param state - Current game state
   * @returns GameStatus if game ended, null otherwise
   */
  public checkWinCondition(state: GameStateReader): GameStatus | null {
    // Check king captures first (highest priority)
    const kingStatus = this.checkKingCaptures(state);
    if (kingStatus !== null) {
      return kingStatus;
    }
    
    // Check for checkmate
    const checkmateStatus = this.checkForCheckmate(state);
    if (checkmateStatus !== null) {
      return checkmateStatus;
    }
    
    // Check for stalemate
    if (this.isStalemate(state)) {
      return GameStatus.STALEMATE;
    }
    
    // Game still in progress
    return null;
  }
  
  /**
   * Checks if a specific team's king is in check.
   * 
   * A king is in check if an opponent piece can capture it on next move.
   * 
   * @param state - Current game state
   * @param team - Team to check
   * @returns true if team's king is under attack
   */
  public isInCheck(state: GameStateReader, team: TeamType): boolean {
    const kingPosition = this.getKingPosition(state, team);
    if (!kingPosition) {
      return false; // No king = can't be in check
    }
    
    return state.isPositionUnderAttack(kingPosition, team);
  }
  
  /**
   * Checks if a specific team is in checkmate.
   * 
   * Checkmate occurs when:
   * 1. King is in check
   * 2. No legal move can remove the check
   * 
   * @param state - Current game state
   * @param team - Team to check
   * @returns true if team is checkmated
   */
  public isCheckmate(state: GameStateReader, team: TeamType): boolean {
    // Must be in check
    if (!this.isInCheck(state, team)) {
      return false;
    }
    
    // Check if any move can escape check
    return !this.hasLegalMoves(state, team);
  }
  
  /**
   * Checks if game is in stalemate.
   * 
   * Stalemate occurs when:
   * 1. Current player has NO legal moves
   * 2. Current player is NOT in check
   * 
   * @param state - Current game state
   * @returns true if current player is stalemated
   */
  public isStalemate(state: GameStateReader): boolean {
    const currentTeam = state.getCurrentTurn();
    
    // Must NOT be in check
    if (this.isInCheck(state, currentTeam)) {
      return false;
    }
    
    // Must have no legal moves
    return !this.hasLegalMoves(state, currentTeam);
  }
  
  /**
   * Checks for king captures and determines winner.
   * 
   * In medieval chess:
   * - Capturing opponent's king = immediate win
   * - If multiple kings captured, last team with king wins
   * 
   * @param state - Current game state
   * @returns GameStatus if a team won by king capture, null otherwise
   */
  private checkKingCaptures(state: GameStateReader): GameStatus | null {
    const ourKingExists = state.hasKing(TeamType.OUR);
    const opponentKingExists = state.hasKing(TeamType.OPPONENT);
    
    // Both kings alive = game continues
    if (ourKingExists && opponentKingExists) {
      return null;
    }
    
    // Our king captured = opponent wins
    if (!ourKingExists && opponentKingExists) {
      return GameStatus.WINNER_OPPONENT;
    }
    
    // Opponent king captured = we win
    if (ourKingExists && !opponentKingExists) {
      return GameStatus.WINNER_OUR;
    }
    
    // Both kings captured = draw (edge case, should not happen normally)
    return GameStatus.STALEMATE;
  }
  
  /**
   * Checks for checkmate conditions.
   * 
   * @param state - Current game state
   * @returns GameStatus if checkmate detected, null otherwise
   */
  private checkForCheckmate(state: GameStateReader): GameStatus | null {
    const ourInCheckmate = this.isCheckmate(state, TeamType.OUR);
    const opponentInCheckmate = this.isCheckmate(state, TeamType.OPPONENT);
    
    if (ourInCheckmate) {
      return GameStatus.CHECKMATE; // Opponent wins
    }
    
    if (opponentInCheckmate) {
      return GameStatus.CHECKMATE; // We win
    }
    
    return null;
  }
  
  /**
   * Checks if team has any legal moves.
   * 
   * Iterates through all team pieces and checks for valid moves.
   * 
   * @param state - Current game state
   * @param team - Team to check
   * @returns true if team has at least one legal move
   */
  private hasLegalMoves(state: GameStateReader, team: TeamType): boolean {
    const pieces = state.getPiecesForTeam(team);
    
    for (const piece of pieces) {
      const validMoves = state.getValidMovesFrom((piece as any).position);
      if (validMoves.length > 0) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Gets position of team's king.
   * 
   * @param state - Current game state
   * @param team - Team whose king to find
   * @returns King position or null if no king
   */
  private getKingPosition(state: GameStateReader, team: TeamType): any | null {
    const king = state.getKing(team);
    return king ? (king as any).position : null;
  }
}
