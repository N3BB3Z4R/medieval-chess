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
 * Supports 2-player mode with plans for 4-player expansion.
 */
export class TurnManager implements ITurnManager {
  /**
   * Gets the team that should move next.
   * 
   * For 2-player: Alternates between OUR and OPPONENT
   * For 4-player: Cycles through all 4 teams (future implementation)
   */
  public getNextTeam(currentState: GameStateReader): TeamType {
    const currentTurn = currentState.getCurrentTurn();

    // 2-player logic (current implementation)
    switch (currentTurn) {
      case TeamType.OUR:
        return TeamType.OPPONENT;
      case TeamType.OPPONENT:
        return TeamType.OUR;
      default:
        // Default to OUR if unknown state
        return TeamType.OUR;
    }

    // TODO: 4-player logic (Phase 7)
    // Will cycle: OUR → OPPONENT → OPPONENT_2 → OPPONENT_3 → OUR
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
   * Gets all active teams in the game.
   * 
   * For 2-player: [OUR, OPPONENT]
   * For 4-player: [OUR, OPPONENT, OPPONENT_2, OPPONENT_3]
   */
  public getActiveTeams(): TeamType[] {
    // Currently only 2-player mode
    return [TeamType.OUR, TeamType.OPPONENT];

    // TODO: 4-player mode (Phase 7)
    // return [TeamType.OUR, TeamType.OPPONENT, TeamType.OPPONENT_2, TeamType.OPPONENT_3];
  }

  /**
   * Checks if a team is still active (has pieces on board).
   * 
   * Used for elimination mode in 4-player games.
   */
  public isTeamActive(team: TeamType, currentState: GameStateReader): boolean {
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
