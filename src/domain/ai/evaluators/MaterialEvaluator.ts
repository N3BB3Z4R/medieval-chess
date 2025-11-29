/**
 * MaterialEvaluator - Calculates material advantage
 * 
 * Evaluates the difference in piece values between teams.
 * Core principle: More valuable pieces = better position.
 * 
 * Considerations:
 * - Piece values from REFINED_PIECE_VALUES
 * - Captured pieces (permanent loss)
 * - King value (game-ending)
 * - Treasure value (win condition)
 * 
 * Formula: Sum(MY_PIECES) - Sum(OPPONENT_PIECES)
 * 
 * Example:
 * - Our team: 2 KNIGHTS (90), 1 TEMPLAR (55), 1 KING (1000) = 1145
 * - Opponent: 1 KNIGHT (45), 2 FARMERS (20), 1 KING (1000) = 1065
 * - Material advantage: 1145 - 1065 = +80 (in our favor)
 */

import { GameState } from '../../game/GameState';
import { TeamType, PieceType } from '../../../Constants';
import { IPositionEvaluator } from '../interfaces';
import { REFINED_PIECE_VALUES, getPieceValue } from '../PieceValues';

/**
 * Evaluates material balance between teams.
 * 
 * Returns positive score if player has material advantage,
 * negative if opponent has advantage.
 * 
 * Usage:
 * ```typescript
 * const evaluator = new MaterialEvaluator();
 * const score = evaluator.evaluate(gameState, TeamType.OUR);
 * // score > 0: We have more material
 * // score < 0: Opponent has more material
 * ```
 */
export class MaterialEvaluator implements IPositionEvaluator {
  /**
   * Evaluate material advantage for a team.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns Material score (positive = advantage, negative = disadvantage)
   */
  evaluate(gameState: GameState, forTeam: TeamType): number {
    const allPieces = gameState.getAllPieces();
    
    let myMaterial = 0;
    let opponentMaterial = 0;

    for (const piece of allPieces) {
      const value = getPieceValue(piece.type as any);
      
      if ((piece.team as any) === forTeam) {
        myMaterial += value;
      } else {
        opponentMaterial += value;
      }
    }

    // Material advantage = our material - opponent material
    return myMaterial - opponentMaterial;
  }

  /**
   * Calculate material lost (captured pieces).
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns Total value of captured pieces
   */
  calculateMaterialLost(gameState: GameState, forTeam: TeamType): number {
    const capturedPieces = gameState.getCapturedPieces();
    
    let totalLost = 0;
    for (const piece of capturedPieces) {
      if ((piece.team as any) === forTeam) {
        totalLost += getPieceValue(piece.type as any);
      }
    }
    
    return totalLost;
  }

  /**
   * Calculate material gained (opponent's captured pieces).
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns Total value of opponent pieces captured
   */
  calculateMaterialGained(gameState: GameState, forTeam: TeamType): number {
    const capturedPieces = gameState.getCapturedPieces();
    
    let totalGained = 0;
    for (const piece of capturedPieces) {
      if ((piece.team as any) !== forTeam) {
        totalGained += getPieceValue(piece.type as any);
      }
    }
    
    return totalGained;
  }

  /**
   * Evaluate material advantage with trade analysis.
   * 
   * Considers:
   * - Current material on board
   * - Material gained from captures
   * - Material lost from captures
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns Comprehensive material score
   */
  evaluateWithTrades(gameState: GameState, forTeam: TeamType): number {
    const currentMaterial = this.evaluate(gameState, forTeam);
    const materialGained = this.calculateMaterialGained(gameState, forTeam);
    const materialLost = this.calculateMaterialLost(gameState, forTeam);
    
    // Net material advantage considering trades
    return currentMaterial + materialGained - materialLost;
  }

  /**
   * Check if a team has material advantage.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns True if team has positive material advantage
   */
  hasMaterialAdvantage(gameState: GameState, forTeam: TeamType): boolean {
    return this.evaluate(gameState, forTeam) > 0;
  }

  /**
   * Get material advantage percentage.
   * 
   * Useful for UI display or thresholds.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns Percentage advantage (e.g., 1.25 = 25% advantage)
   */
  getMaterialRatio(gameState: GameState, forTeam: TeamType): number {
    const allPieces = gameState.getAllPieces();
    
    let myMaterial = 0;
    let opponentMaterial = 0;

    for (const piece of allPieces) {
      const value = getPieceValue(piece.type as any);
      
      if ((piece.team as any) === forTeam) {
        myMaterial += value;
      } else {
        opponentMaterial += value;
      }
    }

    // Avoid division by zero
    if (opponentMaterial === 0) {
      return myMaterial > 0 ? Infinity : 1;
    }

    return myMaterial / opponentMaterial;
  }
}
