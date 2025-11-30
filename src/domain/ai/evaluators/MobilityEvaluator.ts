/**
 * MobilityEvaluator - Evaluates piece mobility and tactical options
 * 
 * Chess principle: "The player with more legal moves has more options
 * and therefore a stronger position."
 * 
 * Key Concepts:
 * - Mobility = number of legal moves available
 * - Higher mobility = more tactical options
 * - Restricted mobility = cramped position (bad)
 * - Piece-specific mobility value (KNIGHT mobility > FARMER mobility)
 * 
 * Mobility Weights (by piece type):
 * - KING: 1.5x (king mobility critical for safety)
 * - KNIGHT: 1.3x (knights need mobility for positioning)
 * - SCOUT: 1.2x (scouts excel with open board)
 * - TEMPLAR: 1.2x (templars need attack options)
 * - TREBUCHET: 1.1x (siege weapon needs positioning)
 * - TRAP: 0.5x (traps shouldn't move much)
 * - TREASURE: 0.3x (treasure movement is defensive)
 * - Others: 1.0x (standard)
 * 
 * Example:
 * - Position A: 15 legal moves
 * - Position B: 8 legal moves
 * - Position A is superior (+7 mobility advantage)
 */

import { GameState } from '../../game/GameState';
import { TeamType, PieceType } from '../../../Constants';
import { IPositionEvaluator, IMoveGenerator } from '../interfaces';
import { GamePiece } from '../../game/GameState';

/**
 * Evaluates mobility advantage.
 * 
 * Uses MoveGenerator to count legal moves for each team.
 * Higher mobility = better position.
 * 
 * Usage:
 * ```typescript
 * const evaluator = new MobilityEvaluator(moveGenerator);
 * const score = evaluator.evaluate(gameState, TeamType.OUR);
 * // score > 0: More mobility
 * // score < 0: Less mobility
 * ```
 */
export class MobilityEvaluator implements IPositionEvaluator {
  // Piece-specific mobility weights
  private static readonly MOBILITY_WEIGHTS: Record<string, number> = {
    [PieceType.KING]: 1.5,
    [PieceType.KNIGHT]: 1.3,
    [PieceType.SCOUT]: 1.2,
    [PieceType.TEMPLAR]: 1.2,
    [PieceType.TREBUCHET]: 1.1,
    [PieceType.RAM]: 1,
    [PieceType.FARMER]: 1,
    [PieceType.TRAP]: 0.5,
    [PieceType.TREASURE]: 0.3
  };

  constructor(private readonly moveGenerator: IMoveGenerator) {}

  /**
   * Evaluate mobility advantage for a team.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns Mobility score (positive = more mobility)
   */
  evaluate(gameState: GameState, forTeam: TeamType): number {
    const myMobility = this.calculateTeamMobility(gameState, forTeam);
    const opponentMobility = this.calculateOpponentMobility(gameState, forTeam);
    
    return myMobility - opponentMobility;
  }

  /**
   * Calculate total mobility for a team.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate
   * @returns Total weighted mobility score
   */
  private calculateTeamMobility(gameState: GameState, forTeam: TeamType): number {
    const allPieces = gameState.getAllPieces();
    const teamPieces = allPieces.filter(p => (p.team as any) === forTeam);
    
    let totalMobility = 0;

    for (const piece of teamPieces) {
      const moves = this.moveGenerator.generateMovesForPiece(piece as any, gameState);
      const weight = this.getMobilityWeight(piece.type as any);
      
      totalMobility += moves.length * weight;
    }

    return totalMobility;
  }

  /**
   * Calculate total mobility for opponents.
   * 
   * @param gameState - Current game state
   * @param forTeam - Our team (to determine opponents)
   * @returns Total opponent mobility
   */
  private calculateOpponentMobility(gameState: GameState, forTeam: TeamType): number {
    const allPieces = gameState.getAllPieces();
    const opponentPieces = allPieces.filter(p => (p.team as any) !== forTeam);
    
    let totalMobility = 0;

    for (const piece of opponentPieces) {
      const moves = this.moveGenerator.generateMovesForPiece(piece as any, gameState);
      const weight = this.getMobilityWeight(piece.type as any);
      
      totalMobility += moves.length * weight;
    }

    return totalMobility;
  }

  /**
   * Get mobility weight for a piece type.
   * 
   * @param pieceType - Type of piece
   * @returns Mobility weight multiplier
   */
  private getMobilityWeight(pieceType: PieceType): number {
    return MobilityEvaluator.MOBILITY_WEIGHTS[pieceType as any] || 1;
  }

  /**
   * Get raw move count (unweighted).
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns Raw number of legal moves
   */
  getRawMoveCount(gameState: GameState, forTeam: TeamType): number {
    const allPieces = gameState.getAllPieces();
    const teamPieces = allPieces.filter(p => (p.team as any) === forTeam);
    
    let totalMoves = 0;

    for (const piece of teamPieces) {
      const moves = this.moveGenerator.generateMovesForPiece(piece as any, gameState);
      totalMoves += moves.length;
    }

    return totalMoves;
  }

  /**
   * Calculate mobility advantage ratio.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns Mobility ratio (e.g., 1.5 = 50% more moves)
   */
  getMobilityRatio(gameState: GameState, forTeam: TeamType): number {
    const myMobility = this.calculateTeamMobility(gameState, forTeam);
    const opponentMobility = this.calculateOpponentMobility(gameState, forTeam);
    
    if (opponentMobility === 0) {
      return myMobility > 0 ? Infinity : 1;
    }

    return myMobility / opponentMobility;
  }

  /**
   * Evaluate piece-specific mobility.
   * 
   * Returns mobility score for a specific piece.
   * 
   * @param piece - Piece to evaluate
   * @param gameState - Current game state
   * @returns Weighted mobility score for piece
   */
  evaluatePieceMobility(piece: GamePiece, gameState: GameState): number {
    const moves = this.moveGenerator.generateMovesForPiece(piece, gameState);
    const weight = this.getMobilityWeight(piece.type as any);
    
    return moves.length * weight;
  }

  /**
   * Identify pieces with restricted mobility.
   * 
   * Returns pieces that have fewer than N legal moves.
   * Useful for identifying cramped or blocked pieces.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @param threshold - Mobility threshold (default: 2)
   * @returns Array of pieces with restricted mobility
   */
  getRestrictedPieces(
    gameState: GameState, 
    forTeam: TeamType, 
    threshold: number = 2
  ): GamePiece[] {
    const allPieces = gameState.getAllPieces();
    const teamPieces = allPieces.filter(p => p.team === (forTeam as any));
    
    const restrictedPieces: GamePiece[] = [];

    for (const piece of teamPieces) {
      const moves = this.moveGenerator.generateMovesForPiece(piece, gameState);
      
      if (moves.length < threshold) {
        restrictedPieces.push(piece);
      }
    }

    return restrictedPieces;
  }

  /**
   * Check if a team has mobility advantage.
   * 
   * @param gameState - Current game state
   * @param forTeam - Team to evaluate for
   * @returns True if team has positive mobility advantage
   */
  hasMobilityAdvantage(gameState: GameState, forTeam: TeamType): boolean {
    return this.evaluate(gameState, forTeam) > 0;
  }
}
