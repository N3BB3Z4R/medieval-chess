/**
 * KingSafetyEvaluator - Evaluates king safety and threat level
 * 
 * Core principle: "Protecting the king is paramount. A king in danger
 * severely reduces position value regardless of material advantage."
 * 
 * Key Concepts:
 * - King threats (immediate and potential)
 * - Defender proximity (pieces near king)
 * - Escape squares (king mobility)
 * - Attack severity (based on attacker types)
 * 
 * Safety Factors:
 * 1. Threat Proximity: Closer threats = more dangerous
 * 2. Threat Count: Multiple attackers = critical danger
 * 3. Defender Count: More defenders = safer king
 * 4. Escape Routes: More escape squares = better safety
 * 5. King Position: Center vs corner vs edge
 * 
 * Scoring:
 * - No threats: +100 (safe)
 * - 1 threat (3+ moves away): +50 (minor concern)
 * - 1 threat (2 moves away): 0 (moderate danger)
 * - 1 threat (1 move away): -50 (critical danger)
 * - Multiple threats: -100 per additional threat
 * 
 * Example:
 * - King at (8,8) with 3 defenders nearby: +80
 * - King at (8,8) with TREBUCHET 2 moves away: -30
 * - King at (0,0) cornered with 2 threats: -150
 */

import { GameState } from '../../game/GameState';
import { Position } from '../../core/Position';
import { TeamType, PieceType } from '../../../Constants';
import { IPositionEvaluator, IThreatDetector, IMoveGenerator } from '../interfaces';
import { GamePiece } from '../../game/GameState';

/**
 * Evaluates king safety using threat detection.
 * 
 * Lower score = more danger.
 * Higher score = safer king.
 * 
 * Usage:
 * ```typescript
 * const evaluator = new KingSafetyEvaluator(threatDetector, moveGenerator);
 * const score = evaluator.evaluate(gameState, TeamType.OUR);
 * // score > 50: King is safe
 * // score < 0: King in danger
 * ```
 */
export class KingSafetyEvaluator implements IPositionEvaluator {
  // Safety constants
  private static readonly BASE_SAFETY_SCORE = 100;
  private static readonly IMMEDIATE_THREAT_PENALTY = -50;
  private static readonly NEAR_THREAT_PENALTY = -30;
  private static readonly DISTANT_THREAT_PENALTY = -10;
  private static readonly MULTIPLE_THREAT_MULTIPLIER = 2;
  private static readonly DEFENDER_BONUS = 10;
  private static readonly ESCAPE_SQUARE_BONUS = 5;

  // Proximity thresholds
  private static readonly DEFENDER_RADIUS = 2;

  constructor(
    private readonly threatDetector: IThreatDetector,
    private readonly moveGenerator: IMoveGenerator
  ) {}

  /**
   * Evaluate king safety advantage.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns Safety score (positive = safer, negative = in danger)
   */
  evaluate(gameState: GameState, forTeam: TeamType): number {
    const myKingSafety = this.evaluateKingSafety(gameState, forTeam);
    const opponentKingSafety = this.evaluateKingSafety(
      gameState, 
      this.getOpponentTeam(forTeam)
    );
    
    return myKingSafety - opponentKingSafety;
  }

  /**
   * Evaluate safety for a specific team's king.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team whose king to evaluate
   * @returns King safety score
   */
  private evaluateKingSafety(gameState: GameState, forTeam: TeamType): number {
    const king = this.findKing(gameState, forTeam);
    
    if (!king) {
      // King is dead or missing - catastrophic
      return -1000;
    }

    let safetyScore = KingSafetyEvaluator.BASE_SAFETY_SCORE;

    // 1. Evaluate threats
    const threatPenalty = this.evaluateThreats(king, gameState);
    safetyScore += threatPenalty;

    // 2. Evaluate defenders
    const defenderBonus = this.evaluateDefenders(king, gameState, forTeam);
    safetyScore += defenderBonus;

    // 3. Evaluate escape squares
    const escapeBonus = this.evaluateEscapeSquares(king, gameState);
    safetyScore += escapeBonus;

    // 4. Evaluate king position (center vs edge)
    const positionPenalty = this.evaluateKingPosition(king.position as any);
    safetyScore += positionPenalty;

    return safetyScore;
  }

  /**
   * Evaluate threats against the king.
   * 
   * @param king - King piece
   * @param gameState - Current game state
   * @returns Threat penalty (negative value)
   */
  private evaluateThreats(king: GamePiece, gameState: GameState): number {
    const threats = this.threatDetector.detectThreats(king, gameState, 3);
    
    if (threats.length === 0) {
      return 0; // No threats
    }

    let totalPenalty = 0;

    for (const threat of threats) {
      // Penalty based on distance
      if (threat.movesToReach === 1) {
        totalPenalty += KingSafetyEvaluator.IMMEDIATE_THREAT_PENALTY;
      } else if (threat.movesToReach === 2) {
        totalPenalty += KingSafetyEvaluator.NEAR_THREAT_PENALTY;
      } else {
        totalPenalty += KingSafetyEvaluator.DISTANT_THREAT_PENALTY;
      }

      // Extra penalty for high-severity threats
      if (threat.severity > 50) {
        totalPenalty -= 20;
      }
    }

    // Multiple threats are exponentially dangerous
    if (threats.length > 1) {
      totalPenalty *= KingSafetyEvaluator.MULTIPLE_THREAT_MULTIPLIER;
    }

    return totalPenalty;
  }

  /**
   * Evaluate defender count near king.
   * 
   * @param king - King piece
   * @param gameState - Current game state
   * @param forTeam - King's team
   * @returns Defender bonus (positive value)
   */
  private evaluateDefenders(king: GamePiece, gameState: GameState, forTeam: TeamType): number {
    const allPieces = gameState.getAllPieces();
    const kingPos = king.position;
    
    let defenderCount = 0;

    for (const piece of allPieces) {
      // Same team, not the king itself
      if (piece.team === (forTeam as any) && piece.type !== (PieceType.KING as any)) {
        const distance = this.manhattanDistance(piece.position, kingPos);
        
        if (distance <= KingSafetyEvaluator.DEFENDER_RADIUS) {
          defenderCount++;
          
          // Bonus for TEMPLAR (counter-attack) and TRAP (concealed)
          if (piece.type === (PieceType.TEMPLAR as any) || piece.type === (PieceType.TRAP as any)) {
            defenderCount += 0.5;
          }
        }
      }
    }

    return Math.floor(defenderCount * KingSafetyEvaluator.DEFENDER_BONUS);
  }

  /**
   * Evaluate escape squares (king mobility).
   * 
   * @param king - King piece
   * @param gameState - Current game state
   * @returns Escape square bonus (positive value)
   */
  private evaluateEscapeSquares(king: GamePiece, gameState: GameState): number {
    const moves = this.moveGenerator.generateMovesForPiece(king, gameState);
    
    return moves.length * KingSafetyEvaluator.ESCAPE_SQUARE_BONUS;
  }

  /**
   * Evaluate king position on board.
   * 
   * Center positions are more dangerous (more attack vectors).
   * Corner positions are safer but limit mobility.
   * 
   * @param kingPos - King position
   * @returns Position penalty/bonus
   */
  private evaluateKingPosition(kingPos: Position): number {
    const centerX = 8;
    const centerY = 8;
    
    const distanceFromCenter = 
      Math.abs(kingPos.x - centerX) + 
      Math.abs(kingPos.y - centerY);

    // Closer to center = slight penalty (more exposed)
    // Further from center = slight bonus (safer)
    if (distanceFromCenter <= 4) {
      return -5; // Too exposed
    } else if (distanceFromCenter >= 12) {
      return -10; // Too cornered (limited mobility)
    } else {
      return 5; // Good balance
    }
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
      p => p.type === (PieceType.KING as any) && p.team === (forTeam as any)
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
   * Calculate Manhattan distance between two positions.
   * 
   * @param pos1 - First position
   * @param pos2 - Second position
   * @returns Manhattan distance
   */
  private manhattanDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  /**
   * Check if king is in immediate danger.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to check
   * @returns True if king has threat 1 move away
   */
  isKingInDanger(gameState: GameState, forTeam: TeamType): boolean {
    const king = this.findKing(gameState, forTeam);
    
    if (!king) {
      return true; // No king = definitely in danger
    }

    const threats = this.threatDetector.detectThreats(king, gameState, 1);
    
    return threats.length > 0;
  }
}
