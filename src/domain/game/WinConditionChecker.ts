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
   * For multi-player games:
   * - When a king is captured, that player is eliminated but game continues
   * - Game ends when only 1 team with a king remains
   * 
   * Priority order:
   * 1. Check for king captures and player elimination
   * 2. Check if only 1 team remains (winner)
   * 3. Check for checkmate (DISABLED - requires working move validator)
   * 4. Check for stalemate (DISABLED - requires working move validator)
   * 
   * @param state - Current game state
   * @returns GameStatus if game ended, null otherwise
   */
  public checkWinCondition(state: GameStateReader): GameStatus | null {
    // Check king captures and eliminate players
    const eliminationStatus = this.checkKingCapturesAndEliminations(state);
    if (eliminationStatus !== null) {
      return eliminationStatus;
    }
    
    // TODO Phase 3: Enable checkmate/stalemate detection once getValidMovesFrom() is implemented
    // Currently getValidMovesFrom() is a placeholder that returns [], causing false stalemate detection
    
    // Check for checkmate (DISABLED - requires working move validator)
    // const checkmateStatus = this.checkForCheckmate(state);
    // if (checkmateStatus !== null) {
    //   return checkmateStatus;
    // }
    
    // Check for stalemate (DISABLED - requires working move validator)
    // if (this.isStalemate(state)) {
    //   return GameStatus.STALEMATE;
    // }
    
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
   * Checks for king captures and handles player elimination.
   * 
   * Multi-player logic:
   * - Count teams with kings (excluding already eliminated)
   * - If only 1 team has king → that team wins
   * - If 2+ teams have kings → game continues (but we might eliminate someone this turn)
   * 
   * @param state - Current game state
   * @returns GameStatus if game should end, null if continues
   */
  private checkKingCapturesAndEliminations(state: GameStateReader): GameStatus | null {
    // Get all possible teams
    const allTeams = [TeamType.OUR, TeamType.OPPONENT, TeamType.OPPONENT_2, TeamType.OPPONENT_3];
    
    // Find teams with kings that are NOT already eliminated
    const teamsWithKings = allTeams.filter(team => 
      !state.isTeamEliminated(team) && state.hasKing(team)
    );
    
    // If only 1 team has a king, they win
    if (teamsWithKings.length === 1) {
      const winner = teamsWithKings[0];
      
      // Determine appropriate GameStatus based on winner
      switch (winner) {
        case TeamType.OUR:
          return GameStatus.WINNER_OUR;
        case TeamType.OPPONENT:
        case TeamType.OPPONENT_2:
        case TeamType.OPPONENT_3:
          return GameStatus.WINNER_OPPONENT;
        default:
          return GameStatus.WINNER_OUR; // Fallback
      }
    }
    
    // If 0 teams have kings (shouldn't happen but handle gracefully)
    if (teamsWithKings.length === 0) {
      return GameStatus.DRAW;
    }
    
    // 2+ teams still have kings, game continues
    return null;
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
