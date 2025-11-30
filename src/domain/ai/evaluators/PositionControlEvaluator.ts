/**
 * PositionControlEvaluator - Evaluates board control and positioning
 * 
 * Strategy game principle: Control of central squares and key positions
 * provides tactical advantages (mobility, defense, attack options).
 * 
 * Key Concepts:
 * - Center control (8,8 on 16x16 board)
 * - Distance from center (closer = better)
 * - Piece clustering (balanced spread vs concentration)
 * - Forward advancement (territorial gain)
 * 
 * Board Layout (16x16):
 *   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15
 * 0 [Edge squares - lower value]
 * ...
 * 7 [Mid-board - medium value]
 * 8 [CENTER - maximum value] ← Target
 * 9 [Mid-board - medium value]
 * ...
 * 15[Edge squares - lower value]
 * 
 * Scoring:
 * - Center squares (7-9, 7-9): +10 per piece
 * - Mid squares (4-11, 4-11): +5 per piece
 * - Edge squares (0-3, 12-15): +1 per piece
 * 
 * Example:
 * - KNIGHT at (8,8): +10 (center)
 * - FARMER at (7,7): +10 (center ring)
 * - TEMPLAR at (2,2): +1 (edge)
 */

import { GameState } from '../../game/GameState';
import { Position } from '../../core/Position';
import { TeamType, PieceType } from '../../core/types';
import { IPositionEvaluator } from '../interfaces';

/**
 * Evaluates positional control of the board.
 * 
 * Rewards:
 * - Central piece placement
 * - Forward piece advancement
 * - Key square control
 * 
 * Usage:
 * ```typescript
 * const evaluator = new PositionControlEvaluator();
 * const score = evaluator.evaluate(gameState, TeamType.OUR);
 * // score > 0: Better positioning
 * // score < 0: Worse positioning
 * ```
 */
export class PositionControlEvaluator implements IPositionEvaluator {
  // Board constants for 16x16 grid
  private static readonly BOARD_SIZE = 16;
  private static readonly CENTER_X = 8;
  private static readonly CENTER_Y = 8;
  
  // Zone definitions
  private static readonly CENTER_ZONE_MIN = 7;
  private static readonly CENTER_ZONE_MAX = 9;
  private static readonly MID_ZONE_MIN = 4;
  private static readonly MID_ZONE_MAX = 11;

  // Piece-square table bonuses (applied based on piece type)
  private static readonly PIECE_CENTRALIZATION_BONUS: Record<PieceType, number> = {
    [PieceType.FARMER]: 5,      // Farmers benefit moderately from center
    [PieceType.KNIGHT]: 15,     // Knights excel in center (mobility)
    [PieceType.TEMPLAR]: 12,    // Templars strong in center (counter-attacks)
    [PieceType.SCOUT]: 10,      // Scouts good in center (trap detection)
    [PieceType.RAM]: 8,         // Rams decent in center
    [PieceType.TRAP]: 3,        // Traps better near edges/chokepoints
    [PieceType.TREBUCHET]: 7,   // Trebuchets need range, not centralization
    [PieceType.TREASURE]: 0,    // Treasure should stay safe (back)
    [PieceType.KING]: -5        // King should stay protected (not center)
  };

  /**
   * Evaluate positional control for a team.
   * 
   * Combines multiple positional factors:
   * - Center control (40%)
   * - Piece-specific positioning (30%)
   * - Forward advancement (20%)
   * - Clustering/spread (10%)
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @param weights - Evaluation weights (not used internally)
   * @returns Position control score
   */
  evaluate(gameState: GameState, forTeam: TeamType, weights?: any): number {
    const centerScore = this.evaluateCenterControl(gameState, forTeam);
    const distanceScore = this.evaluateWithDistanceWeighting(gameState, forTeam);
    const advancementScore = this.evaluateAdvancement(gameState, forTeam);
    const clusteringScore = this.evaluateClustering(gameState, forTeam);
    
    // Weighted combination
    const totalScore = (
      centerScore * 0.4 +
      distanceScore * 0.3 +
      advancementScore * 0.2 +
      clusteringScore * 0.1
    );
    
    return totalScore;
  }

  /**
   * Evaluate center control with piece-specific bonuses.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns Center control score
   */
  private evaluateCenterControl(gameState: GameState, forTeam: TeamType): number {
    const allPieces = gameState.getAllPieces();
    
    let myPositionScore = 0;
    let opponentPositionScore = 0;

    for (const piece of allPieces) {
      const baseValue = this.evaluatePiecePosition(piece.position);
      const pieceBonus = PositionControlEvaluator.PIECE_CENTRALIZATION_BONUS[piece.type as PieceType] || 0;
      const totalValue = baseValue + (this.isInCenterZone(piece.position.x, piece.position.y) ? pieceBonus : 0);
      
      if (piece.team === (forTeam as any)) {
        myPositionScore += totalValue;
      } else {
        opponentPositionScore += totalValue;
      }
    }

    return myPositionScore - opponentPositionScore;
  }

  /**
   * Evaluate a single piece's position value.
   * 
   * @param position - Piece position
   * @returns Position value (higher = better placement)
   */
  private evaluatePiecePosition(position: Position): number {
    const x = position.x;
    const y = position.y;

    // Center zone (highest value)
    if (this.isInCenterZone(x, y)) {
      return 10;
    }

    // Mid zone (medium value)
    if (this.isInMidZone(x, y)) {
      return 5;
    }

    // Edge zone (lowest value)
    return 1;
  }

  /**
   * Check if position is in center zone (7-9, 7-9).
   */
  private isInCenterZone(x: number, y: number): boolean {
    return (
      x >= PositionControlEvaluator.CENTER_ZONE_MIN &&
      x <= PositionControlEvaluator.CENTER_ZONE_MAX &&
      y >= PositionControlEvaluator.CENTER_ZONE_MIN &&
      y <= PositionControlEvaluator.CENTER_ZONE_MAX
    );
  }

  /**
   * Check if position is in mid zone (4-11, 4-11).
   */
  private isInMidZone(x: number, y: number): boolean {
    return (
      x >= PositionControlEvaluator.MID_ZONE_MIN &&
      x <= PositionControlEvaluator.MID_ZONE_MAX &&
      y >= PositionControlEvaluator.MID_ZONE_MIN &&
      y <= PositionControlEvaluator.MID_ZONE_MAX
    );
  }

  /**
   * Calculate distance from center (8,8).
   * 
   * Uses Manhattan distance (|x1-x2| + |y1-y2|).
   * 
   * @param position - Position to evaluate
   * @returns Manhattan distance from center
   */
  distanceFromCenter(position: Position): number {
    return (
      Math.abs(position.x - PositionControlEvaluator.CENTER_X) +
      Math.abs(position.y - PositionControlEvaluator.CENTER_Y)
    );
  }

  /**
   * Evaluate with distance weighting.
   * 
   * Closer to center = higher score.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns Distance-weighted position score
   */
  private evaluateWithDistanceWeighting(gameState: GameState, forTeam: TeamType): number {
    const allPieces = gameState.getAllPieces();
    
    let myScore = 0;
    let opponentScore = 0;

    for (const piece of allPieces) {
      const distance = this.distanceFromCenter(piece.position);
      // Invert: closer = higher score
      const score = Math.max(0, 20 - distance);
      
      if (piece.team === (forTeam as any)) {
        myScore += score;
      } else {
        opponentScore += score;
      }
    }

    return myScore - opponentScore;
  }

  /**
   * Evaluate forward advancement for a team.
   * 
   * Rewards pieces that are advanced toward opponent territory.
   * 
   * Team directions:
   * - OUR: Higher Y values = forward
   * - OPPONENT: Lower Y values = forward
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns Advancement score
   */
  private evaluateAdvancement(gameState: GameState, forTeam: TeamType): number {
    const allPieces = gameState.getAllPieces();
    const teamPieces = allPieces.filter(p => p.team === (forTeam as any));
    
    let advancementScore = 0;

    for (const piece of teamPieces) {
      // OUR team advances upward (higher Y), OPPONENT advances downward (lower Y)
      if (forTeam === TeamType.OUR) {
        advancementScore += piece.position.y;
      } else {
        advancementScore += (PositionControlEvaluator.BOARD_SIZE - 1 - piece.position.y);
      }
    }

    return advancementScore;
  }

  /**
   * Evaluate piece clustering.
   * 
   * Measures how close pieces are to each other.
   * 
   * Returns:
   * - High value = pieces clustered together (defensive)
   * - Low value = pieces spread out (offensive)
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns Clustering score
   */
  private evaluateClustering(gameState: GameState, forTeam: TeamType): number {
    const allPieces = gameState.getAllPieces();
    const teamPieces = allPieces.filter(p => p.team === (forTeam as any));
    
    if (teamPieces.length <= 1) {
      return 0;
    }

    let totalDistance = 0;
    let pairCount = 0;

    // Calculate average pairwise distance
    for (let i = 0; i < teamPieces.length; i++) {
      for (let j = i + 1; j < teamPieces.length; j++) {
        const pos1 = teamPieces[i].position;
        const pos2 = teamPieces[j].position;
        
        const distance = Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
        totalDistance += distance;
        pairCount++;
      }
    }

    const averageDistance = totalDistance / pairCount;
    
    // Invert: lower average distance = more clustered = higher score
    return Math.max(0, 30 - averageDistance);
  }
}
