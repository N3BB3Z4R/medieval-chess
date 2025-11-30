/**
 * TurnManager - Manages turn-based game flow.
 * 
 * Handles turn rotation, validates turn ownership, and enforces
 * turn-based rules. Implements the TurnManager interface.
 */

import { TeamType, GameStateReader, GameStateWriter } from '../core/types';
import { TurnManager as ITurnManager } from '../core/interfaces';
import { Move } from '../core/Move';

/**
 * Concrete implementation of turn management.
 * 
 * Supports 2, 3, and 4-player modes with configurable player count.
 */
export class TurnManager implements ITurnManager {
  private readonly playerCount: 2 | 3 | 4;
  private readonly teams: TeamType[];

  constructor(playerCount: 2 | 3 | 4 = 2) {
    this.playerCount = playerCount;
    this.teams = this.initializeTeams(playerCount);
  }

  /**
   * Initialize teams based on player count.
   */
  private initializeTeams(count: number): TeamType[] {
    switch (count) {
      case 2:
        return [TeamType.OUR, TeamType.OPPONENT];
      case 3:
        return [TeamType.OUR, TeamType.OPPONENT, TeamType.OPPONENT_2];
      case 4:
        return [TeamType.OUR, TeamType.OPPONENT, TeamType.OPPONENT_2, TeamType.OPPONENT_3];
      default:
        return [TeamType.OUR, TeamType.OPPONENT];
    }
  }

  /**
   * Gets the team that should move next.
   * 
   * Cycles through teams in order: OUR → OPPONENT → OPPONENT_2 → OPPONENT_3 → OUR
   * Automatically skips eliminated teams (teams marked as eliminated or with no pieces).
   */
  public getNextTeam(currentState: GameStateReader): TeamType {
    const currentTurn = currentState.getCurrentTurn();
    const currentIndex = this.teams.indexOf(currentTurn);
    
    // If current team not found, default to first team
    if (currentIndex === -1) {
      return this.teams[0];
    }

    // Find next active team (not eliminated and with pieces remaining)
    let nextIndex = (currentIndex + 1) % this.teams.length;
    let attempts = 0;
    const maxAttempts = this.teams.length;

    while (attempts < maxAttempts) {
      const nextTeam = this.teams[nextIndex];
      
      // Check if team is still active (not eliminated and has pieces)
      if (this.isTeamActive(nextTeam, currentState)) {
        return nextTeam;
      }

      // Try next team
      nextIndex = (nextIndex + 1) % this.teams.length;
      attempts++;
    }

    // Fallback: return current team if no other team is active
    return currentTurn;
  }

  /**
   * Validates that a move belongs to the current turn.
   * 
   * Prevents players from moving opponent pieces.
   */
  public isValidTurn(move: Move, currentState: GameStateReader): boolean {
    const currentTurn = currentState.getCurrentTurn();
    return move.team === currentTurn;
  }

  /**
   * Advances to next turn.
   * 
   * Returns new game state with updated turn.
   * GameState implements both interfaces so this works correctly.
   */
  public advanceTurn(currentState: GameStateReader & GameStateWriter): unknown {
    const nextTeam = this.getNextTeam(currentState);
    return currentState.setCurrentTurn(nextTeam);
  }

  /**
   * Gets all teams in the game (based on player count).
   * 
   * For 2-player: [OUR, OPPONENT]
   * For 3-player: [OUR, OPPONENT, OPPONENT_2]
   * For 4-player: [OUR, OPPONENT, OPPONENT_2, OPPONENT_3]
   */
  public getActiveTeams(): TeamType[] {
    return this.teams;
  }

  /**
   * Gets opponents for a given team.
   * Used by AI to evaluate threats from all opponents.
   */
  public getOpponents(forTeam: TeamType): TeamType[] {
    return this.teams.filter(team => team !== forTeam);
  }

  /**
   * Gets the player count configuration.
   */
  public getPlayerCount(): 2 | 3 | 4 {
    return this.playerCount;
  }

  /**
   * Checks if a team is still active (has pieces on board and not eliminated).
   * 
   * Used for elimination mode in multi-player games.
   */
  public isTeamActive(team: TeamType, currentState: GameStateReader): boolean {
    // Check if team is eliminated
    if (currentState.isTeamEliminated(team)) {
      return false;
    }
    
    // Check if team has pieces
    const teamPieces = currentState.getPiecesForTeam(team);
    return teamPieces.length > 0;
  }

  /**
   * Gets count of remaining teams with pieces.
   */
  public getRemainingTeamsCount(currentState: GameStateReader): number {
    return this.getActiveTeams().filter(team => 
      this.isTeamActive(team, currentState)
    ).length;
  }
}
