/**
 * PositionEvaluator - Combined position evaluation with personality weighting
 * 
 * Aggregates 5 specialized evaluators and applies personality-specific weights
 * to produce a final position score.
 * 
 * Architecture:
 * ```
 * MaterialEvaluator ────┐
 * PositionControlEvaluator ─┤
 * MobilityEvaluator ────┤──→ [Personality Weights] ──→ Final Score
 * KingSafetyEvaluator ──┤
 * TrapEvaluator ────────┘
 * ```
 * 
 * Personality Weight Application:
 * - AGGRESSIVE: High material (1.5), low king safety (0.5)
 * - DEFENSIVE: High king safety (2.0), high trap control (1.8)
 * - POSITIONAL: High position control (2.0), high mobility (1.5)
 * - TACTICAL: Balanced weights with high special abilities
 * - OPPORTUNIST: High material (1.7), high trap control (1.5)
 * - CAUTIOUS: Very high king safety (2.5), low aggression
 * - CHAOTIC: Random evaluation with high variance
 * 
 * Example:
 * ```typescript
 * const evaluator = new PositionEvaluator(config);
 * const score = evaluator.evaluate(gameState, TeamType.OUR);
 * 
 * // For AGGRESSIVE personality:
 * // score = material*1.5 + position*0.8 + mobility*1.2 + kingSafety*0.5 + traps*0.7
 * ```
 */

import { GameState } from '../game/GameState';
import { TeamType } from '../../Constants';
import { 
  IPositionEvaluator, 
  AIConfig, 
  EvaluationWeights,
  AIPersonality 
} from './interfaces';
import { PERSONALITY_WEIGHTS } from './PieceValues';
import { MaterialEvaluator } from './evaluators/MaterialEvaluator';
import { PositionControlEvaluator } from './evaluators/PositionControlEvaluator';
import { MobilityEvaluator } from './evaluators/MobilityEvaluator';
import { KingSafetyEvaluator } from './evaluators/KingSafetyEvaluator';
import { TrapEvaluator } from './evaluators/TrapEvaluator';

/**
 * Combined position evaluator with personality-based weighting.
 * 
 * This is the main evaluation function used by the AI to assess positions.
 * All specialized evaluators are orchestrated here.
 * 
 * Usage:
 * ```typescript
 * const config: AIConfig = {
 *   personality: AIPersonality.AGGRESSIVE,
 *   difficulty: 'medium',
 *   timeLimit: 5000,
 *   searchDepth: 3
 * };
 * 
 * const evaluator = new PositionEvaluator(config);
 * const score = evaluator.evaluate(gameState, TeamType.OUR);
 * // Positive score = good for our team
 * // Negative score = bad for our team
 * ```
 */
export class PositionEvaluator implements IPositionEvaluator {
  private readonly materialEvaluator: MaterialEvaluator;
  private readonly positionControlEvaluator: PositionControlEvaluator;
  private readonly mobilityEvaluator: MobilityEvaluator;
  private readonly kingSafetyEvaluator: KingSafetyEvaluator;
  private readonly trapEvaluator: TrapEvaluator;
  
  private readonly weights: EvaluationWeights;
  private readonly personality: AIPersonality;

  constructor(
    config: AIConfig,
    materialEvaluator: MaterialEvaluator,
    positionControlEvaluator: PositionControlEvaluator,
    mobilityEvaluator: MobilityEvaluator,
    kingSafetyEvaluator: KingSafetyEvaluator,
    trapEvaluator: TrapEvaluator
  ) {
    this.materialEvaluator = materialEvaluator;
    this.positionControlEvaluator = positionControlEvaluator;
    this.mobilityEvaluator = mobilityEvaluator;
    this.kingSafetyEvaluator = kingSafetyEvaluator;
    this.trapEvaluator = trapEvaluator;
    
    this.personality = config.personality;
    this.weights = PERSONALITY_WEIGHTS[config.personality];
  }

  /**
   * Evaluate position with personality-weighted scoring.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @param weights - Optional evaluation weights (uses personality weights if not provided)
   * @returns Combined weighted score
   */
  evaluate(gameState: GameState, forTeam: TeamType, weights?: EvaluationWeights): number {
    // Use provided weights or fall back to personality weights
    const activeWeights = weights || this.weights;
    
    // Get individual evaluation scores
    const materialScore = this.materialEvaluator.evaluate(gameState, forTeam);
    const positionScore = this.positionControlEvaluator.evaluate(gameState, forTeam);
    const mobilityScore = this.mobilityEvaluator.evaluate(gameState, forTeam);
    const kingSafetyScore = this.kingSafetyEvaluator.evaluate(gameState, forTeam);
    const trapScore = this.trapEvaluator.evaluate(gameState, forTeam);

    // Apply personality weights
    const weightedScore = 
      (materialScore * activeWeights.material) +
      (positionScore * activeWeights.position) +
      (mobilityScore * activeWeights.mobility) +
      (kingSafetyScore * activeWeights.kingSafety) +
      (trapScore * activeWeights.trapControl);

    // Add randomness for CHAOTIC personality
    let finalScore = weightedScore;
    if (activeWeights.randomness && activeWeights.randomness > 0) {
      const randomFactor = (Math.random() - 0.5) * 2 * activeWeights.randomness;
      finalScore += (weightedScore * randomFactor);
    }

    return Math.round(finalScore);
  }

  /**
   * Get detailed evaluation breakdown (for debugging/UI).
   * 
   * Returns individual scores from each evaluator plus final combined score.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns Evaluation breakdown object
   */
  evaluateDetailed(gameState: GameState, forTeam: TeamType): EvaluationBreakdown {
    const materialScore = this.materialEvaluator.evaluate(gameState, forTeam);
    const positionScore = this.positionControlEvaluator.evaluate(gameState, forTeam);
    const mobilityScore = this.mobilityEvaluator.evaluate(gameState, forTeam);
    const kingSafetyScore = this.kingSafetyEvaluator.evaluate(gameState, forTeam);
    const trapScore = this.trapEvaluator.evaluate(gameState, forTeam);

    const weightedMaterial = materialScore * this.weights.material;
    const weightedPosition = positionScore * this.weights.position;
    const weightedMobility = mobilityScore * this.weights.mobility;
    const weightedKingSafety = kingSafetyScore * this.weights.kingSafety;
    const weightedTrap = trapScore * this.weights.trapControl;

    const totalScore = 
      weightedMaterial + 
      weightedPosition + 
      weightedMobility + 
      weightedKingSafety + 
      weightedTrap;

    return {
      material: { raw: materialScore, weighted: weightedMaterial },
      position: { raw: positionScore, weighted: weightedPosition },
      mobility: { raw: mobilityScore, weighted: weightedMobility },
      kingSafety: { raw: kingSafetyScore, weighted: weightedKingSafety },
      trap: { raw: trapScore, weighted: weightedTrap },
      total: Math.round(totalScore),
      personality: this.personality,
      weights: this.weights
    };
  }

  /**
   * Quick evaluation (for leaf nodes in search tree).
   * 
   * Simplified evaluation using only material and king safety.
   * Faster than full evaluation, used at search depth limits.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns Quick evaluation score
   */
  evaluateQuick(gameState: GameState, forTeam: TeamType): number {
    const materialScore = this.materialEvaluator.evaluate(gameState, forTeam);
    const kingSafetyScore = this.kingSafetyEvaluator.evaluate(gameState, forTeam);

    return Math.round(
      (materialScore * this.weights.material) + 
      (kingSafetyScore * this.weights.kingSafety)
    );
  }

  /**
   * Check if position is terminal (game over).
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to check
   * @returns True if game is over (king dead or treasure captured)
   */
  isTerminal(gameState: GameState, forTeam: TeamType): boolean {
    const allPieces = gameState.getAllPieces();
    
    // Check if our king is alive
    const hasKing = allPieces.some(
      p => (p.type as any) === 'king' && (p.team as any) === forTeam
    );

    if (!hasKing) {
      return true; // Game over - king dead
    }

    // Check game status
    const status = gameState.getStatus();
    return (status as any) !== 'ACTIVE';
  }

  /**
   * Get personality name for display.
   * 
   * @returns Personality as string
   */
  getPersonality(): AIPersonality {
    return this.personality;
  }

  /**
   * Get active weights for display.
   * 
   * @returns Current evaluation weights
   */
  getWeights(): EvaluationWeights {
    return { ...this.weights };
  }
}

/**
 * Detailed evaluation breakdown for debugging/UI.
 */
export interface EvaluationBreakdown {
  material: { raw: number; weighted: number };
  position: { raw: number; weighted: number };
  mobility: { raw: number; weighted: number };
  kingSafety: { raw: number; weighted: number };
  trap: { raw: number; weighted: number };
  total: number;
  personality: AIPersonality;
  weights: EvaluationWeights;
}
