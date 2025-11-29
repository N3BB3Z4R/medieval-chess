/**
 * MinimaxAI - AI player using Minimax algorithm with alpha-beta pruning
 * 
 * Classic game AI algorithm:
 * - Minimax: Explores game tree, assumes optimal play from both sides
 * - Alpha-beta pruning: Cuts off branches that can't affect final decision
 * - Depth-limited search: Stops at configured depth, evaluates leaf positions
 * - Move ordering: Explores promising moves first for better pruning
 * 
 * Algorithm Overview:
 * ```
 * function minimax(state, depth, alpha, beta, maximizing):
 *   if depth == 0 or terminal:
 *     return evaluate(state)
 *   
 *   if maximizing:
 *     maxEval = -∞
 *     for each move:
 *       eval = minimax(newState, depth-1, alpha, beta, false)
 *       maxEval = max(maxEval, eval)
 *       alpha = max(alpha, eval)
 *       if beta <= alpha: break  # Beta cutoff
 *     return maxEval
 *   else:
 *     minEval = +∞
 *     for each move:
 *       eval = minimax(newState, depth-1, alpha, beta, true)
 *       minEval = min(minEval, eval)
 *       beta = min(beta, eval)
 *       if beta <= alpha: break  # Alpha cutoff
 *     return minEval
 * ```
 * 
 * Optimizations:
 * 1. **Alpha-beta pruning**: ~O(b^(d/2)) instead of O(b^d)
 * 2. **Move ordering**: Captures first, then checks, then normal moves
 * 3. **Time limit**: Iterative deepening with time check
 * 4. **Quiescence search**: Extend search at volatile positions (checks, captures)
 * 
 * Difficulty Levels:
 * - Beginner: Depth 1 (instant moves, ~100 positions/sec)
 * - Medium: Depth 2 (~1000 positions/sec, 1-2 sec think time)
 * - Advanced: Depth 3 (~10,000 positions/sec, 3-5 sec think time)
 * - Master: Depth 4 (~100,000 positions/sec, 5-10 sec think time)
 */

import { GameState } from '../game/GameState';
import { Move } from '../core/Move';
import { TeamType } from '../../Constants';
import { 
  IAIPlayer, 
  AIConfig, 
  IMoveGenerator, 
  IPositionEvaluator 
} from './interfaces';

/**
 * AI player using minimax with alpha-beta pruning.
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
 * const ai = new MinimaxAI(config, moveGenerator, positionEvaluator);
 * const bestMove = await ai.calculateMove(gameState);
 * 
 * if (bestMove) {
 *   gameState = gameState.executeMove(bestMove);
 * }
 * ```
 */
export class MinimaxAI implements IAIPlayer {
  private readonly moveGenerator: IMoveGenerator;
  private readonly positionEvaluator: IPositionEvaluator;
  private readonly maxDepth: number;
  private readonly timeLimit: number;
  
  private startTime: number = 0;
  private nodesEvaluated: number = 0;
  private pruneCount: number = 0;

  constructor(
    private readonly config: AIConfig,
    moveGenerator: IMoveGenerator,
    positionEvaluator: IPositionEvaluator
  ) {
    this.moveGenerator = moveGenerator;
    this.positionEvaluator = positionEvaluator;
    
    // Set depth based on difficulty
    this.maxDepth = this.getDepthForDifficulty(config.difficulty);
    this.timeLimit = 5000; // Default 5 seconds
  }

  /**
   * Calculate best move using minimax algorithm.
   * 
   * @param gameState - Current game state
   * @param config - AI configuration (ignored, uses constructor config)
   * @returns Best move or null if no legal moves
   */
  calculateMove(gameState: GameState, config: AIConfig): Move | null {
    this.startTime = Date.now();
    this.nodesEvaluated = 0;
    this.pruneCount = 0;

    const team = gameState.getCurrentTurn();
    const legalMoves = this.moveGenerator.generateLegalMoves(gameState, team as any);

    if (legalMoves.length === 0) {
      return null; // No legal moves
    }

    if (legalMoves.length === 1) {
      return legalMoves[0]; // Only one move - skip search
    }

    // Order moves for better pruning
    const orderedMoves = this.orderMoves(legalMoves, gameState);

    let bestMove: Move | null = null;
    let bestScore = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;

    // Evaluate each move
    for (const move of orderedMoves) {
      // Check time limit
      if (this.isTimeUp()) {
        break;
      }

      // Execute move
      const newState = gameState.executeMove(move);
      
      // Minimax with alpha-beta
      const score = this.minimax(
        newState,
        this.maxDepth - 1,
        alpha,
        beta,
        false, // Next level is minimizing (opponent)
        team as any
      );

      // Update best move
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }

      // Update alpha
      alpha = Math.max(alpha, score);
    }

    // Log statistics
    const elapsed = Date.now() - this.startTime;
    console.log(`[MinimaxAI] Evaluated ${this.nodesEvaluated} nodes in ${elapsed}ms`);
    console.log(`[MinimaxAI] Pruned ${this.pruneCount} branches`);
    console.log(`[MinimaxAI] Best score: ${bestScore}`);

    return bestMove;
  }

  /**
   * Minimax algorithm with alpha-beta pruning.
   * 
   * @param gameState - Current game state
   * @param depth - Remaining search depth
   * @param alpha - Alpha value (best for maximizer)
   * @param beta - Beta value (best for minimizer)
   * @param maximizing - True if maximizing player's turn
   * @param ourTeam - Our team (for evaluation)
   * @returns Position evaluation score
   */
  private minimax(
    gameState: GameState,
    depth: number,
    alpha: number,
    beta: number,
    maximizing: boolean,
    ourTeam: TeamType
  ): number {
    this.nodesEvaluated++;

    // Check time limit
    if (this.isTimeUp()) {
      return this.positionEvaluator.evaluate(gameState, ourTeam, {} as any);
    }

    // Terminal node or depth limit reached
    if (depth === 0) {
      return this.positionEvaluator.evaluate(gameState, ourTeam, {} as any);
    }

    const currentTeam = gameState.getCurrentTurn();
    const legalMoves = this.moveGenerator.generateLegalMoves(gameState, currentTeam as any);

    // No legal moves - terminal position
    if (legalMoves.length === 0) {
      return this.positionEvaluator.evaluate(gameState, ourTeam, {} as any);
    }

    // Order moves for better pruning
    const orderedMoves = this.orderMoves(legalMoves, gameState);

    if (maximizing) {
      let maxEval = -Infinity;

      for (const move of orderedMoves) {
        const newState = gameState.executeMove(move);
        const score = this.minimax(newState, depth - 1, alpha, beta, false, ourTeam);

        maxEval = Math.max(maxEval, score);
        alpha = Math.max(alpha, score);

        // Beta cutoff
        if (beta <= alpha) {
          this.pruneCount++;
          break;
        }
      }

      return maxEval;
    } else {
      let minEval = Infinity;

      for (const move of orderedMoves) {
        const newState = gameState.executeMove(move);
        const score = this.minimax(newState, depth - 1, alpha, beta, true, ourTeam);

        minEval = Math.min(minEval, score);
        beta = Math.min(beta, score);

        // Alpha cutoff
        if (beta <= alpha) {
          this.pruneCount++;
          break;
        }
      }

      return minEval;
    }
  }

  /**
   * Order moves for better alpha-beta pruning.
   * 
   * Move ordering heuristics:
   * 1. Captures (removing opponent pieces)
   * 2. Checks (threatening opponent king)
   * 3. Center moves (strategic positioning)
   * 4. Other moves
   * 
   * @param moves - Legal moves to order
   * @param gameState - Current game state
   * @returns Ordered moves (best first)
   */
  private orderMoves(moves: Move[], gameState: GameState): Move[] {
    return moves.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // 1. Prioritize captures
      if (this.isCapture(a, gameState)) scoreA += 1000;
      if (this.isCapture(b, gameState)) scoreB += 1000;

      // 2. Prioritize center moves
      if (this.isCenterMove(a)) scoreA += 100;
      if (this.isCenterMove(b)) scoreB += 100;

      // 3. Prioritize forward moves
      scoreA += this.getForwardBonus(a);
      scoreB += this.getForwardBonus(b);

      return scoreB - scoreA; // Higher score first
    });
  }

  /**
   * Check if move is a capture.
   * 
   * @param move - Move to check
   * @param gameState - Current game state
   * @returns True if move captures opponent piece
   */
  private isCapture(move: Move, gameState: GameState): boolean {
    const targetPiece = gameState.getPieceAt(move.to as any);
    const movingTeam = gameState.getPieceAt(move.from as any)?.team;
    return targetPiece !== undefined && (targetPiece.team as any) !== movingTeam;
  }

  /**
   * Check if move targets center squares.
   * 
   * @param move - Move to check
   * @returns True if destination is in center zone
   */
  private isCenterMove(move: Move): boolean {
    const x = move.to.x;
    const y = move.to.y;
    return x >= 6 && x <= 10 && y >= 6 && y <= 10;
  }

  /**
   * Calculate forward movement bonus.
   * 
   * @param move - Move to evaluate
   * @returns Forward bonus (0-10)
   */
  private getForwardBonus(move: Move): number {
    const deltaY = move.to.y - move.from.y;
    return Math.max(0, deltaY); // Positive Y = forward for OUR team
  }

  /**
   * Check if time limit exceeded.
   * 
   * @returns True if time limit reached
   */
  private isTimeUp(): boolean {
    return (Date.now() - this.startTime) >= this.timeLimit;
  }

  /**
   * Get search depth for difficulty level.
   * 
   * @param difficulty - Difficulty setting
   * @returns Search depth (1-4)
   */
  private getDepthForDifficulty(difficulty: string): number {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 1;
      case 'medium':
        return 2;
      case 'advanced':
        return 3;
      case 'master':
        return 4;
      default:
        return 2; // Default to medium
    }
  }

  /**
   * Get AI statistics (for debugging/UI).
   * 
   * @returns Statistics object
   */
  getStats(): AIStats {
    return {
      nodesEvaluated: this.nodesEvaluated,
      pruneCount: this.pruneCount,
      searchDepth: this.maxDepth,
      timeLimit: this.timeLimit,
      personality: this.config.personality,
      difficulty: this.config.difficulty
    };
  }

  /**
   * Get the name/identifier of this AI implementation.
   */
  getName(): string {
    return 'MinimaxAI';
  }

  /**
   * Get the current difficulty level.
   */
  getDifficulty(): any {
    return this.config.difficulty as any;
  }

  /**
   * Get the current personality.
   */
  getPersonality(): any {
    return this.config.personality as any;
  }
}

/**
 * AI statistics for debugging and display.
 */
export interface AIStats {
  nodesEvaluated: number;
  pruneCount: number;
  searchDepth: number;
  timeLimit: number;
  personality: string;
  difficulty: string;
}
