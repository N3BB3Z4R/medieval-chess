/**
 * TrapEvaluator - Evaluates trap placement and effectiveness
 * 
 * TRAP pieces are unique: invisible to opponents, destroyed by SCOUT/KING.
 * Strategic value comes from placement, not material value.
 * 
 * Key Concepts:
 * - Concealment: Traps in unexpected positions
 * - Coverage: Traps protecting key squares or pieces
 * - Proximity: Traps near enemy lines (ambush potential)
 * - Clustering: Multiple traps create "mine fields"
 * 
 * Optimal Trap Positions:
 * 1. Near King (defensive perimeter)
 * 2. On approach paths to Treasure
 * 3. In center squares (high traffic)
 * 4. Near opponent starting positions
 * 5. Along expected attack vectors
 * 
 * Scoring System:
 * - Trap near King: +20
 * - Trap near Treasure: +25
 * - Trap in center zone: +15
 * - Trap near opponent: +10
 * - Clustered traps (2+ within radius): +5 per pair
 * 
 * Example:
 * - Trap at (7,7) near our King at (8,8): +20
 * - Trap at (14,14) near opponent spawn: +10
 * - 3 traps in center zone (mine field): +45 + clustering bonus
 */

import { GameState, GamePiece } from '../../game/GameState';
import { Position } from '../../core/Position';
import { TeamType, PieceType } from '../../core/types';
import { IPositionEvaluator } from '../interfaces';

/**
 * Evaluates trap placement effectiveness.
 * 
 * Rewards:
 * - Strategic trap positions
 * - Defensive trap clusters
 * - Traps on key squares
 * 
 * Usage:
 * ```typescript
 * const evaluator = new TrapEvaluator();
 * const score = evaluator.evaluate(gameState, TeamType.OUR);
 * // score > 0: Better trap placement
 * // score < 0: Worse trap placement
 * ```
 */
export class TrapEvaluator implements IPositionEvaluator {
  // Scoring constants
  private static readonly KING_PROTECTION_BONUS = 20;
  private static readonly TREASURE_PROTECTION_BONUS = 25;
  private static readonly CENTER_PLACEMENT_BONUS = 15;
  private static readonly OPPONENT_PROXIMITY_BONUS = 10;
  private static readonly CLUSTERING_BONUS = 5;
  
  // Proximity thresholds
  private static readonly PROTECTION_RADIUS = 3;
  private static readonly CLUSTERING_RADIUS = 2;
  private static readonly OPPONENT_PROXIMITY_RADIUS = 4;

  // Board zones
  private static readonly CENTER_ZONE_MIN = 6;
  private static readonly CENTER_ZONE_MAX = 10;

  /**
   * Evaluate trap placement advantage.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @param weights - Evaluation weights (not used internally)
   * @returns Trap effectiveness score
   */
  evaluate(gameState: GameState, forTeam: TeamType, weights?: any): number {
    const myTrapScore = this.evaluateTeamTraps(gameState, forTeam);
    const opponentTrapScore = this.evaluateTeamTraps(
      gameState,
      this.getOpponentTeam(forTeam)
    );
    
    return myTrapScore - opponentTrapScore;
  }

  /**
   * Evaluate all traps for a team.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate
   * @returns Total trap effectiveness score
   */
  private evaluateTeamTraps(gameState: GameState, forTeam: TeamType): number {
    const allPieces = gameState.getAllPieces();
    const traps = allPieces.filter(
      p => p.type === PieceType.TRAP && p.team === forTeam
    );

    if (traps.length === 0) {
      return 0;
    }

    let totalScore = 0;

    for (const trap of traps) {
      totalScore += this.evaluateSingleTrap(trap, gameState, forTeam);
    }

    // Clustering bonus
    totalScore += this.evaluateTrapClustering(traps);

    return totalScore;
  }

  /**
   * Evaluate a single trap's position.
   * 
   * @param trap - Trap piece
   * @param gameState - Current game state
   * @param forTeam - Trap's team
   * @returns Trap position score
   */
  private evaluateSingleTrap(trap: GamePiece, gameState: GameState, forTeam: TeamType): number {
    const trapPos = trap.position;
    let score = 0;

    // 1. King protection bonus
    const king = this.findKing(gameState, forTeam);
    if (king) {
      const distanceToKing = this.manhattanDistance(trapPos, king.position);
      if (distanceToKing <= TrapEvaluator.PROTECTION_RADIUS) {
        score += TrapEvaluator.KING_PROTECTION_BONUS;
      }
    }

    // 2. Treasure protection bonus
    const treasure = this.findTreasure(gameState, forTeam);
    if (treasure) {
      const distanceToTreasure = this.manhattanDistance(trapPos, treasure.position);
      if (distanceToTreasure <= TrapEvaluator.PROTECTION_RADIUS) {
        score += TrapEvaluator.TREASURE_PROTECTION_BONUS;
      }
    }

    // 3. Center placement bonus
    if (this.isInCenterZone(trapPos)) {
      score += TrapEvaluator.CENTER_PLACEMENT_BONUS;
    }

    // 4. Opponent proximity bonus (ambush potential)
    const opponentTeam = this.getOpponentTeam(forTeam);
    const nearOpponent = this.isNearOpponentPieces(trapPos, gameState, opponentTeam);
    if (nearOpponent) {
      score += TrapEvaluator.OPPONENT_PROXIMITY_BONUS;
    }

    return score;
  }

  /**
   * Evaluate trap clustering (mine field effect).
   * 
   * @param traps - Array of trap pieces
   * @returns Clustering bonus score
   */
  private evaluateTrapClustering(traps: GamePiece[]): number {
    if (traps.length < 2) {
      return 0;
    }

    let clusterScore = 0;

    // Check all pairs for proximity
    for (let i = 0; i < traps.length; i++) {
      for (let j = i + 1; j < traps.length; j++) {
        const pos1 = traps[i].position;
        const pos2 = traps[j].position;
        const distance = this.manhattanDistance(pos1, pos2);

        if (distance <= TrapEvaluator.CLUSTERING_RADIUS) {
          clusterScore += TrapEvaluator.CLUSTERING_BONUS;
        }
      }
    }

    return clusterScore;
  }

  /**
   * Check if position is in center zone.
   * 
   * @param position - Position to check
   * @returns True if in center zone
   */
  private isInCenterZone(position: Position): boolean {
    return (
      position.x >= TrapEvaluator.CENTER_ZONE_MIN &&
      position.x <= TrapEvaluator.CENTER_ZONE_MAX &&
      position.y >= TrapEvaluator.CENTER_ZONE_MIN &&
      position.y <= TrapEvaluator.CENTER_ZONE_MAX
    );
  }

  /**
   * Check if position is near opponent pieces.
   * 
   * @param position - Position to check
   * @param gameState - Current game state
   * @param opponentTeam - Opponent team
   * @returns True if near opponent pieces
   */
  private isNearOpponentPieces(
    position: Position,
    gameState: GameState,
    opponentTeam: TeamType
  ): boolean {
    const allPieces = gameState.getAllPieces();
    const opponentPieces = allPieces.filter(p => p.team === opponentTeam);

    for (const piece of opponentPieces) {
      const distance = this.manhattanDistance(position, piece.position);
      if (distance <= TrapEvaluator.OPPONENT_PROXIMITY_RADIUS) {
        return true;
      }
    }

    return false;
  }

  /**
   * Find king for a team.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team whose king to find
   * @returns King piece or undefined
   */
  private findKing(gameState: GameState, forTeam: TeamType): GamePiece | undefined {
    const allPieces = gameState.getAllPieces();
    
    return allPieces.find(
      p => p.type === PieceType.KING && p.team === forTeam
    );
  }

  /**
   * Find treasure for a team.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team whose treasure to find
   * @returns Treasure piece or undefined
   */
  private findTreasure(gameState: GameState, forTeam: TeamType): GamePiece | undefined {
    const allPieces = gameState.getAllPieces();
    
    return allPieces.find(
      p => p.type === PieceType.TREASURE && p.team === forTeam
    );
  }

  /**
   * Get opponent team.
   * 
   * @param team - Our team
   * @returns Opponent team
   */
  private getOpponentTeam(team: TeamType): TeamType {
    return team === TeamType.OUR ? TeamType.OPPONENT : TeamType.OUR;
  }

  /**
   * Calculate Manhattan distance.
   * 
   * @param pos1 - First position
   * @param pos2 - Second position
   * @returns Manhattan distance
   */
  private manhattanDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  /**
   * Count traps for a team.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to count traps for
   * @returns Number of traps
   */
  countTraps(gameState: GameState, forTeam: TeamType): number {
    const allPieces = gameState.getAllPieces();
    
    return allPieces.filter(
      p => p.type === PieceType.TRAP && p.team === forTeam
    ).length;
  }

  /**
   * Get trap positions for a team.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to get traps for
   * @returns Array of trap positions
   */
  getTrapPositions(gameState: GameState, forTeam: TeamType): Position[] {
    const allPieces = gameState.getAllPieces();
    const traps = allPieces.filter(
      p => p.type === PieceType.TRAP && p.team === forTeam
    );
    
    return traps.map(t => t.position);
  }
}
