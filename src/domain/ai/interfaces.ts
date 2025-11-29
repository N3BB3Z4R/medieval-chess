/**
 * AI System Interfaces for Medieval Chess
 * 
 * Defines contracts for AI player, move generation, position evaluation,
 * and threat detection following SOLID principles (Dependency Inversion).
 */

import { GameState, GamePiece } from '../game/GameState';
import { Move } from '../core/Move';
import { Position } from '../core/Position';
import { TeamType } from '../core/types';

// ============================================================================
// AI Difficulty & Personality
// ============================================================================

/**
 * AI difficulty levels with different search depths and evaluation complexity.
 */
export enum AIDifficulty {
  BEGINNER = 'BEGINNER',     // Depth 1, immediate threats only
  MEDIUM = 'MEDIUM',         // Depth 2, 2-move lookahead
  ADVANCED = 'ADVANCED',     // Depth 3, 3-move lookahead
  MASTER = 'MASTER'          // Depth 4, 4-move lookahead (corner to corner)
}

/**
 * AI personality types that define playing style through evaluation weights.
 */
export enum AIPersonality {
  AGGRESSIVE = 'AGGRESSIVE',       // Constant attack, high material weight
  DEFENSIVE = 'DEFENSIVE',         // Maximum king safety, trap placement
  POSITIONAL = 'POSITIONAL',       // Control center, maintain options
  TACTICAL = 'TACTICAL',           // Master of traps and combos
  OPPORTUNIST = 'OPPORTUNIST',     // Capture-focused, material hungry
  CAUTIOUS = 'CAUTIOUS',           // Risk-averse, high mobility
  CHAOTIC = 'CHAOTIC'              // Unpredictable, uses all abilities
}

/**
 * Configuration for AI behavior.
 */
export interface AIConfig {
  difficulty: AIDifficulty;
  personality: AIPersonality;
  maxThinkTime?: number;     // Maximum time in ms (default: 10000 for MASTER)
  randomness?: number;       // 0-100, percentage of random moves (for humanization)
}

/**
 * Evaluation weights for position scoring.
 * Higher weight = more influence on final score.
 */
export interface EvaluationWeights {
  material: number;          // Value of pieces (default: 100)
  position: number;          // Control of center/key squares (default: 20)
  mobility: number;          // Number of legal moves (default: 10)
  kingSafety: number;        // Distance from threats (default: 50)
  trapControl: number;       // Value of active traps (default: 15)
  specialAbilities: number;  // Use of piece special abilities (default: 25)
  randomness?: number;       // Random factor 0-100 (default: 0)
}

// ============================================================================
// Core AI Interfaces
// ============================================================================

/**
 * Main AI player interface.
 * Implementations: MinimaxAI, RandomAI, etc.
 */
export interface IAIPlayer {
  /**
   * Calculate the best move for the current game state.
   * 
   * @param gameState - Current game state (immutable)
   * @param config - AI configuration (difficulty, personality)
   * @returns Best move or null if no legal moves
   */
  calculateMove(gameState: GameState, config: AIConfig): Move | null;

  /**
   * Get the name/identifier of this AI implementation.
   */
  getName(): string;

  /**
   * Get the current difficulty level.
   */
  getDifficulty(): AIDifficulty;

  /**
   * Get the current personality.
   */
  getPersonality(): AIPersonality;
}

/**
 * Move generator interface.
 * Generates all legal moves for a team using game rules.
 */
export interface IMoveGenerator {
  /**
   * Generate all legal moves for a team.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to generate moves for
   * @returns Array of legal moves
   */
  generateLegalMoves(gameState: GameState, forTeam: TeamType): Move[];

  /**
   * Generate legal moves for a specific piece.
   * 
   * @param piece - Piece to generate moves for
   * @param gameState - Current game state
   * @returns Array of legal moves for this piece
   */
  generateMovesForPiece(piece: GamePiece, gameState: GameState): Move[];
}

/**
 * Position evaluator interface.
 * Assigns a numeric score to a game position from a team's perspective.
 */
export interface IPositionEvaluator {
  /**
   * Evaluate the current position for a team.
   * Positive score = good for team, negative = bad.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team perspective
   * @param weights - Evaluation weights (personality)
   * @returns Numeric score (typically -10000 to +10000)
   */
  evaluate(gameState: GameState, forTeam: TeamType, weights: EvaluationWeights): number;
}

// ============================================================================
// Threat Detection
// ============================================================================

/**
 * Result of threat path analysis.
 */
export interface ThreatPathResult {
  canReach: boolean;       // Can attacker reach target?
  distance: number;        // Number of moves to reach (Infinity if unreachable)
  path: Position[];        // Path from attacker to target
  blockers: Position[];    // Positions where defenders can block
}

/**
 * Analysis of a single threat.
 */
export interface ThreatAnalysis {
  attacker: GamePiece;     // Enemy piece threatening
  target: GamePiece;       // Our piece being threatened
  movesToReach: number;    // 1 = immediate, 2+ = future threat
  severity: number;        // 0-1000+, higher = more dangerous
  path: Position[];        // Attack path
  blockers: Position[];    // Positions to block threat
}

/**
 * Threat detector interface.
 * Detects multi-move threats using BFS pathfinding.
 */
export interface IThreatDetector {
  /**
   * Detect all threats against a target piece.
   * 
   * @param target - Piece to protect
   * @param gameState - Current game state
   * @param depth - Search depth (1-4 moves ahead)
   * @returns Array of threats sorted by severity (most dangerous first)
   */
  detectThreats(target: GamePiece, gameState: GameState, depth: number): ThreatAnalysis[];

  /**
   * Analyze if an attacker can reach a target position.
   * 
   * @param attacker - Attacking piece
   * @param targetPos - Target position
   * @param gameState - Current game state
   * @param maxDepth - Maximum search depth
   * @returns Path analysis result
   */
  analyzeThreatPath(
    attacker: GamePiece,
    targetPos: Position,
    gameState: GameState,
    maxDepth: number
  ): ThreatPathResult;
}

// ============================================================================
// Specialized Evaluators
// ============================================================================

/**
 * Evaluates material advantage (piece values).
 */
export interface IMaterialEvaluator extends IPositionEvaluator {
  /**
   * Get total material value for a team.
   */
  getTotalMaterial(gameState: GameState, forTeam: TeamType): number;

  /**
   * Get material advantage over opponents.
   */
  getMaterialAdvantage(gameState: GameState, forTeam: TeamType): number;
}

/**
 * Evaluates positional control (center, key squares).
 */
export interface IPositionControlEvaluator extends IPositionEvaluator {
  /**
   * Calculate control score for the center of the board.
   */
  getCenterControlScore(gameState: GameState, forTeam: TeamType): number;
}

/**
 * Evaluates mobility (number of legal moves).
 */
export interface IMobilityEvaluator extends IPositionEvaluator {
  /**
   * Count legal moves for a team.
   */
  countLegalMoves(gameState: GameState, forTeam: TeamType): number;
}

/**
 * Evaluates king safety (threats to king).
 */
export interface IKingSafetyEvaluator extends IPositionEvaluator {
  /**
   * Calculate king safety score.
   * Uses ThreatDetector to find threats.
   */
  evaluateKingSafety(gameState: GameState, forTeam: TeamType, threatDepth: number): number;
}

/**
 * Evaluates trap control and placement.
 */
export interface ITrapEvaluator extends IPositionEvaluator {
  /**
   * Calculate value of active traps.
   */
  evaluateTrapPositions(gameState: GameState, forTeam: TeamType): number;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Node in BFS search for threat detection.
 */
export interface PathNode {
  position: Position;
  depth: number;
  path: Position[];
  stateSnapshot: GameState;
}

/**
 * Statistics about AI thinking process.
 */
export interface AIStats {
  nodesEvaluated: number;    // Total positions evaluated
  movesTried: number;        // Moves considered
  pruneCount: number;        // Alpha-beta prunes
  thinkTimeMs: number;       // Time taken
  maxDepthReached: number;   // Deepest search
  bestMoveScore: number;     // Score of chosen move
}
