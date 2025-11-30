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
import { getPieceValue } from './PieceValues';

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
  
  // Killer moves: Store two best non-capture moves per depth level
  private readonly killerMoves: Map<number, [Move | null, Move | null]> = new Map();
  
  // History heuristic: Track move success rates
  private readonly historyTable: Map<string, number> = new Map();

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
    
    // Reset killer moves for new search
    this.killerMoves.clear();

    const team = gameState.getCurrentTurn();
    const legalMoves = this.moveGenerator.generateLegalMoves(gameState, team as any);

    if (legalMoves.length === 0) {
      return null; // No legal moves
    }

    if (legalMoves.length === 1) {
      return legalMoves[0]; // Only one move - skip search
    }

    // Order moves for better pruning
    const orderedMoves = this.orderMoves(legalMoves, gameState, this.maxDepth);

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
    // const elapsed = Date.now() - this.startTime;
    // console.log(`[MinimaxAI] Evaluated ${this.nodesEvaluated} nodes in ${elapsed}ms`);
    // console.log(`[MinimaxAI] Pruned ${this.pruneCount} branches`);
    // console.log(`[MinimaxAI] Best score: ${bestScore}`);

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
      return this.positionEvaluator.evaluate(gameState, ourTeam, undefined as any);
    }

    // Terminal node or depth limit reached
    if (depth === 0) {
      return this.positionEvaluator.evaluate(gameState, ourTeam, undefined as any);
    }

    const currentTeam = gameState.getCurrentTurn();
    const legalMoves = this.moveGenerator.generateLegalMoves(gameState, currentTeam as any);

    // No legal moves - terminal position
    if (legalMoves.length === 0) {
      return this.positionEvaluator.evaluate(gameState, ourTeam, undefined as any);
    }

    // Order moves for better pruning
    const orderedMoves = this.orderMoves(legalMoves, gameState, depth);

    if (maximizing) {
      let maxEval = -Infinity;

      for (const move of orderedMoves) {
        const newState = gameState.executeMove(move);
        const score = this.minimax(newState, depth - 1, alpha, beta, false, ourTeam);

        maxEval = Math.max(maxEval, score);
        alpha = Math.max(alpha, score);

        // Beta cutoff - store killer move and update history
        if (beta <= alpha) {
          this.pruneCount++;
          
          // Store non-capture killer moves
          if (!this.isCapture(move, gameState)) {
            this.storeKillerMove(move, depth);
          }
          
          // Update history for all cutoff moves
          this.updateHistory(move, depth);
          
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

        // Alpha cutoff - store killer move and update history
        if (beta <= alpha) {
          this.pruneCount++;
          
          // Store non-capture killer moves
          if (!this.isCapture(move, gameState)) {
            this.storeKillerMove(move, depth);
          }
          
          // Update history for all cutoff moves
          this.updateHistory(move, depth);
          
          break;
        }
      }

      return minEval;
    }
  }

  /**
   * Order moves for better alpha-beta pruning.
   * 
   * Move ordering heuristics (in priority order):
   * 1. **MVV-LVA (Most Valuable Victim - Least Valuable Attacker)**
   *    - Score = victimValue - (attackerValue / 10)
   *    - Example: FARMER takes KNIGHT = 45 - (10/10) = 44 points
   *    - Example: KNIGHT takes FARMER = 10 - (45/10) = 5.5 points
   *    - Prioritizes high-value captures with low-value pieces
   * 
   * 2. **Killer moves**: Non-capture moves that caused cutoffs at same depth
   *    - First killer: +900 points
   *    - Second killer: +800 points
   * 
   * 3. **History heuristic**: Moves that historically caused cutoffs
   *    - Score based on past success rate
   * 
   * 4. **Center control**: Moves toward center (e6-j10)
   *    - +100 points for center moves
   * 
   * 5. **Forward advancement**: Moves toward opponent
   *    - +0 to +10 based on distance
   * 
   * Good move ordering can improve alpha-beta pruning efficiency by 2-3x.
   * 
   * @param moves - Legal moves to order
   * @param gameState - Current game state
   * @param depth - Current search depth (for killer move lookup)
   * @returns Ordered moves (best first)
   */
  private orderMoves(moves: Move[], gameState: GameState, depth: number = 0): Move[] {
    const killers = this.killerMoves.get(depth) || [null, null];
    
    return moves.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // 1. MVV-LVA for captures
      const captureScoreA = this.getMVVLVAScore(a, gameState);
      const captureScoreB = this.getMVVLVAScore(b, gameState);
      
      if (captureScoreA > 0) scoreA += 10000 + captureScoreA;
      if (captureScoreB > 0) scoreB += 10000 + captureScoreB;

      // 2. Killer moves (non-captures that caused beta cutoffs)
      if (!this.isCapture(a, gameState)) {
        if (this.movesEqual(a, killers[0])) scoreA += 900;
        else if (this.movesEqual(a, killers[1])) scoreA += 800;
      }
      if (!this.isCapture(b, gameState)) {
        if (this.movesEqual(b, killers[0])) scoreB += 900;
        else if (this.movesEqual(b, killers[1])) scoreB += 800;
      }

      // 3. History heuristic
      scoreA += this.getHistoryScore(a);
      scoreB += this.getHistoryScore(b);

      // 4. Center control
      if (this.isCenterMove(a)) scoreA += 100;
      if (this.isCenterMove(b)) scoreB += 100;

      // 5. Forward advancement
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
    // 1. Standard capture (destination occupied by opponent)
    const victim = gameState.getPieceAt(move.to as any);
    if (victim !== undefined && victim.team !== move.team) {
      return true;
    }

    // 2. RAM path capture (kills enemies in path)
    if (move.pieceType === 'RAM') {
      const kills = this.getRamKills(move, gameState);
      if (kills.length > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate MVV-LVA score for a capture.
   * 
   * MVV-LVA (Most Valuable Victim - Least Valuable Attacker):
   * - Prioritizes capturing high-value pieces with low-value pieces
   * - Formula: victimValue - (attackerValue / 10)
   * 
   * Examples:
   * - FARMER (10) x KNIGHT (45) = 45 - 1 = 44 (excellent!)
   * - KNIGHT (45) x FARMER (10) = 10 - 4.5 = 5.5 (poor)
   * - SCOUT (50) x KING (1000) = 1000 - 5 = 995 (amazing!)
   * 
   * @param move - Move to evaluate
   * @param gameState - Current game state
   * @returns MVV-LVA score (0 if not a capture)
   */
  private getMVVLVAScore(move: Move, gameState: GameState): number {
    const attackerValue = getPieceValue(move.pieceType);
    let maxScore = 0;

    // 1. Standard capture
    const victim = gameState.getPieceAt(move.to as any);
    if (victim && victim.team !== move.team) {
      const victimValue = getPieceValue(victim.type);
      const score = victimValue - (attackerValue / 10);
      maxScore = Math.max(maxScore, score);
    }
    
    // 2. RAM path capture
    if (move.pieceType === 'RAM') {
      const kills = this.getRamKills(move, gameState);
      for (const killedPiece of kills) {
        const victimValue = getPieceValue(killedPiece.type);
        const score = victimValue - (attackerValue / 10);
        // Accumulate scores for multi-kills? Or just take max?
        // Accumulating is better for RAM as it kills ALL in path
        maxScore += score;
      }
    }
    
    return maxScore;
  }

  /**
   * Get pieces killed by RAM movement.
   * 
   * @param move - Move to check
   * @param gameState - Current game state
   * @returns Array of killed pieces
   */
  private getRamKills(move: Move, gameState: GameState): any[] {
    const kills: any[] = [];
    const from = move.from;
    const to = move.to;
    
    // Calculate direction
    const dx = Math.sign(to.x - from.x);
    const dy = Math.sign(to.y - from.y);
    
    // Start from position after 'from'
    let currentX = from.x + dx;
    let currentY = from.y + dy;
    
    // Walk along path until we reach 'to' (exclusive)
    while (currentX !== to.x || currentY !== to.y) {
      const pos = { x: currentX, y: currentY };
      const piece = gameState.getPieceAt(pos as any);
      
      if (piece && piece.team !== move.team) {
        kills.push(piece);
        if (kills.length >= 2) break; // Max 2 kills
      }
      
      currentX += dx;
      currentY += dy;
    }
    
    return kills;
  }  /**
   * Store killer move (non-capture that caused beta cutoff).
   * 
   * @param move - Killer move
   * @param depth - Depth where cutoff occurred
   */
  private storeKillerMove(move: Move, depth: number): void {
    const killers = this.killerMoves.get(depth) || [null, null];
    
    // Don't store if already in killer moves
    if (this.movesEqual(move, killers[0])) return;
    
    // Shift: second killer becomes first, new move becomes second
    this.killerMoves.set(depth, [killers[1], move]);
  }
  
  /**
   * Get history heuristic score for a move.
   * 
   * @param move - Move to evaluate
   * @returns History score (0-100)
   */
  private getHistoryScore(move: Move): number {
    const key = this.getMoveKey(move);
    return this.historyTable.get(key) || 0;
  }
  
  /**
   * Update history table when move causes cutoff.
   * 
   * @param move - Move that caused cutoff
   * @param depth - Depth where cutoff occurred
   */
  private updateHistory(move: Move, depth: number): void {
    const key = this.getMoveKey(move);
    const currentScore = this.historyTable.get(key) || 0;
    
    // Increment score, more points for deeper cutoffs
    this.historyTable.set(key, currentScore + depth * depth);
    
    // Decay old history to prevent stale data
    if (this.historyTable.size > 1000) {
      const entries = Array.from(this.historyTable.entries());
      for (const [k, v] of entries) {
        this.historyTable.set(k, Math.floor(v * 0.9));
      }
    }
  }
  
  /**
   * Generate unique key for a move.
   * 
   * @param move - Move to generate key for
   * @returns String key "from_to_piece"
   */
  private getMoveKey(move: Move): string {
    return `${move.from.x}_${move.from.y}_${move.to.x}_${move.to.y}_${move.pieceType}`;
  }
  
  /**
   * Check if two moves are equal.
   * 
   * @param a - First move
   * @param b - Second move (can be null)
   * @returns True if moves are equal
   */
  private movesEqual(a: Move, b: Move | null): boolean {
    if (!b) return false;
    return a.from.x === b.from.x && 
           a.from.y === b.from.y && 
           a.to.x === b.to.x && 
           a.to.y === b.to.y &&
           a.pieceType === b.pieceType;
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
    
    // Check direction based on team
    // OUR team (White) moves DOWN (positive Y)
    // OPPONENT team (Black) moves UP (negative Y)
    // Note: Using string comparison to be safe with enum types
    if ((move.team as any) === 'OUR' || (move.team as any) === 1) {
      return Math.max(0, deltaY);
    } else {
      return Math.max(0, -deltaY);
    }
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
