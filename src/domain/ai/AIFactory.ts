/**
 * AIFactory - Factory pattern for creating AI players
 * 
 * Handles dependency injection and wiring of all AI components:
 * - MoveGenerator
 * - ThreatDetector
 * - 5 specialized evaluators
 * - Combined PositionEvaluator
 * - MinimaxAI engine
 * 
 * Usage:
 * ```typescript
 * const ai = AIFactory.create({
 *   personality: AIPersonality.AGGRESSIVE,
 *   difficulty: 'medium'
 * });
 * 
 * const bestMove = ai.calculateMove(gameState, config);
 * ```
 */

import { MinimaxAI } from './MinimaxAI';
import { MoveGenerator } from './MoveGenerator';
import { ThreatDetector } from './ThreatDetector';
import { PositionEvaluator } from './PositionEvaluator';
import { MaterialEvaluator } from './evaluators/MaterialEvaluator';
import { PositionControlEvaluator } from './evaluators/PositionControlEvaluator';
import { MobilityEvaluator } from './evaluators/MobilityEvaluator';
import { KingSafetyEvaluator } from './evaluators/KingSafetyEvaluator';
import { TrapEvaluator } from './evaluators/TrapEvaluator';
import { AIConfig, AIDifficulty, AIPersonality } from './interfaces';
import { RuleEngine } from '../rules/RuleEngine';

/**
 * Factory for creating fully configured AI players.
 * 
 * Singleton pattern: Reuses RuleEngine instance across AI creations.
 */
export class AIFactory {
  private static ruleEngine: RuleEngine | null = null;

  /**
   * Create a new AI player with all dependencies wired.
   * 
   * @param config - AI configuration (personality, difficulty)
   * @returns Fully configured MinimaxAI instance
   */
  static create(config: AIConfig): MinimaxAI {
    // Initialize RuleEngine (singleton)
    if (!AIFactory.ruleEngine) {
      AIFactory.ruleEngine = new RuleEngine();
    }

    // Create MoveGenerator
    const moveGenerator = new MoveGenerator(AIFactory.ruleEngine);

    // Create ThreatDetector (depends on MoveGenerator)
    const threatDetector = new ThreatDetector(moveGenerator);

    // Create 5 specialized evaluators
    const materialEvaluator = new MaterialEvaluator();
    const positionControlEvaluator = new PositionControlEvaluator();
    const mobilityEvaluator = new MobilityEvaluator(moveGenerator);
    const kingSafetyEvaluator = new KingSafetyEvaluator(threatDetector, moveGenerator);
    const trapEvaluator = new TrapEvaluator();

    // Create combined PositionEvaluator
    const positionEvaluator = new PositionEvaluator(
      config,
      materialEvaluator,
      positionControlEvaluator,
      mobilityEvaluator,
      kingSafetyEvaluator,
      trapEvaluator
    );

    // Create and return MinimaxAI
    return new MinimaxAI(config, moveGenerator, positionEvaluator);
  }

  /**
   * Create AI with default configuration (TACTICAL, medium difficulty).
   * 
   * @returns MinimaxAI with TACTICAL personality and medium difficulty
   */
  static createDefault(): MinimaxAI {
    return AIFactory.create({
      personality: AIPersonality.TACTICAL,
      difficulty: AIDifficulty.MEDIUM
    });
  }

  /**
   * Reset singleton instances (for testing).
   */
  static reset(): void {
    AIFactory.ruleEngine = null;
  }
}
