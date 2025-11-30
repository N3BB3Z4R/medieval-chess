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
import { FarmerMoveValidator } from '../rules/validators/FarmerMoveValidator';
import { KnightMoveValidator } from '../rules/validators/KnightMoveValidator';
import { KingMoveValidator } from '../rules/validators/KingMoveValidator';
import { RamMoveValidator } from '../rules/validators/RamMoveValidator';
import { TrapMoveValidator } from '../rules/validators/TrapMoveValidator';
import { TemplarMoveValidator } from '../rules/validators/TemplarMoveValidator';
import { ScoutMoveValidator } from '../rules/validators/ScoutMoveValidator';
import { TrebuchetMoveValidator } from '../rules/validators/TrebuchetMoveValidator';
import { TreasureMoveValidator } from '../rules/validators/TreasureMoveValidator';

/**
 * Factory for creating fully configured AI players.
 * 
 * Singleton pattern: Reuses RuleEngine instance across AI creations.
 */
export class AIFactory {
  /**
   * Initialize RuleEngine with all validators registered.
   * 
   * @returns Configured RuleEngine instance
   */
  private static initializeRuleEngine(): RuleEngine {
    const ruleEngine = new RuleEngine();
    
    // Register all 9 piece validators
    ruleEngine.registerValidator(new FarmerMoveValidator());
    ruleEngine.registerValidator(new KnightMoveValidator());
    ruleEngine.registerValidator(new KingMoveValidator());
    ruleEngine.registerValidator(new RamMoveValidator());
    ruleEngine.registerValidator(new TrapMoveValidator());
    ruleEngine.registerValidator(new TemplarMoveValidator());
    ruleEngine.registerValidator(new ScoutMoveValidator());
    ruleEngine.registerValidator(new TrebuchetMoveValidator());
    ruleEngine.registerValidator(new TreasureMoveValidator());
    
    return ruleEngine;
  }

  /**
   * Create a new AI player with all dependencies wired.
   * 
   * @param config - AI configuration (personality, difficulty)
   * @returns Fully configured MinimaxAI instance
   */
  static create(config: AIConfig): MinimaxAI {
    // Always create a fresh RuleEngine to avoid state issues
    const ruleEngine = AIFactory.initializeRuleEngine();

    // Create MoveGenerator
    const moveGenerator = new MoveGenerator(ruleEngine);

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
}
