/**
 * MoveGenerator - Generates all legal moves for AI decision-making
 * 
 * Reuses the existing RuleEngine to validate moves, ensuring consistency
 * with game rules. Uses candidate generation for each piece type.
 * 
 * Strategy:
 * 1. For each piece, generate candidate destinations
 * 2. Validate each candidate using RuleEngine
 * 3. Return only valid moves
 */

import { GameState, GamePiece } from '../game/GameState';
import { Move } from '../core/Move';
import { Position } from '../core/Position';
import { TeamType } from '../core/types';
import { RuleEngine } from '../rules/RuleEngine';
import { IMoveGenerator } from './interfaces';

/**
 * Direction vectors for movement calculations.
 */
const DIRECTIONS = {
  FORWARD: { x: 0, y: 1 },
  BACKWARD: { x: 0, y: -1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
  UP_LEFT: { x: -1, y: 1 },
  UP_RIGHT: { x: 1, y: 1 },
  DOWN_LEFT: { x: -1, y: -1 },
  DOWN_RIGHT: { x: 1, y: -1 }
} as const;

/**
 * Generates all legal moves for a team using game rules.
 * 
 * This class is used by the AI to explore possible moves during search.
 * It reuses the existing RuleEngine to ensure move validity.
 */
export class MoveGenerator implements IMoveGenerator {
  constructor(private readonly ruleEngine: RuleEngine) {}

  /**
   * Generate all legal moves for a team.
   */
  generateLegalMoves(gameState: GameState, forTeam: TeamType): Move[] {
    const pieces = gameState.getPiecesForTeam(forTeam as any);
    
    console.log('[MoveGenerator] Generating moves for team:', forTeam);
    console.log('[MoveGenerator] Pieces found:', pieces.length, pieces);
    
    const allMoves: Move[] = [];
    let debuggedFirst = false;

    for (const piece of pieces) {
      const pieceMoves = this.generateMovesForPiece(piece as any, gameState, !debuggedFirst);
      if (!debuggedFirst && piece.type === 'FARMER') {
        debuggedFirst = true;
      }
      console.log(`[MoveGenerator] Piece ${piece.type} at (${piece.position.x},${piece.position.y}): ${pieceMoves.length} moves`);
      allMoves.push(...pieceMoves);
    }

    console.log('[MoveGenerator] Total legal moves:', allMoves.length);
    return allMoves;
  }

  /**
   * Generate legal moves for a specific piece.
   */
  generateMovesForPiece(piece: GamePiece, gameState: GameState, debug: boolean = false): Move[] {
    const moves: Move[] = [];
    const from = piece.position;

    // Generate candidate destinations based on piece type
    const candidates = this.generateCandidateDestinations(piece, gameState);
    
    // Debug first FARMER
    if (debug) {
      console.log(`[MoveGenerator] DEBUG ${piece.type} at (${from.x},${from.y}), team: ${piece.team}`);
      console.log(`[MoveGenerator] Candidates (${candidates.length}):`, candidates);
    }

    // Validate each candidate using RuleEngine
    for (const to of candidates) {
      const move: any = { 
        from: from,
        to: to as any,
        pieceType: piece.type,  // ✅ CRITICAL: Include pieceType for validator
        team: piece.team
      };
      const validation = this.ruleEngine.validate(move, gameState);

      // Debug first FARMER
      if (debug) {
        console.log(`[MoveGenerator]   -> (${to.x},${to.y}): ${validation.isValid ? 'VALID ✓' : 'INVALID ✗'} ${validation.isValid ? '' : '- ' + validation.reason}`);
      }

      if (validation.isValid) {
        moves.push(move);
      }
    }

    return moves;
  }

  /**
   * Generate candidate destinations for a piece.
   * These are positions the piece MIGHT be able to move to,
   * subject to validation by RuleEngine.
   */
  private generateCandidateDestinations(piece: GamePiece, gameState: GameState): Position[] {
    const { position, type, team } = piece;
    const candidates: Position[] = [];

    // Now using string enum comparisons
    switch (type) {
      case 'FARMER':
        candidates.push(...this.generateFarmerCandidates(position, team));
        break;
      case 'RAM':
        candidates.push(...this.generateRamCandidates(position));
        break;
      case 'TRAP':
        candidates.push(...this.generateTrapCandidates(position));
        break;
      case 'KNIGHT':
        candidates.push(...this.generateKnightCandidates(position));
        break;
      case 'TEMPLAR':
        candidates.push(...this.generateTemplarCandidates(position));
        break;
      case 'SCOUT':
        candidates.push(...this.generateScoutCandidates(position));
        break;
      case 'TREBUCHET':
        candidates.push(...this.generateTrebuchetCandidates(position));
        break;
      case 'TREASURE':
        candidates.push(...this.generateTreasureCandidates(position));
        break;
      case 'KING':
        candidates.push(...this.generateKingCandidates(position));
        break;
    }

    // Filter out positions outside board bounds
    return candidates.filter(pos => Position.isValid(pos.x, pos.y));
  }

  /**
   * FARMER: 1 square forward, diagonal for captures
   */
  private generateFarmerCandidates(pos: { x: number; y: number }, team: TeamType): Position[] {
    const direction = this.getForwardDirection(team);
    const candidates: Position[] = [];
    
    console.log('[generateFarmerCandidates] Input:', { pos, team, direction });
    
    // Try to create positions, catching errors for invalid coordinates
    const potentialMoves = [
      { x: pos.x, y: pos.y + direction },
      { x: pos.x + 1, y: pos.y + direction },
      { x: pos.x - 1, y: pos.y + direction }
    ];
    
    console.log('[generateFarmerCandidates] Potential moves:', potentialMoves);
    
    for (const move of potentialMoves) {
      console.log('[generateFarmerCandidates] Checking:', move, 'isValid:', Position.isValid(move.x, move.y));
      if (Position.isValid(move.x, move.y)) {
        candidates.push(new Position(move.x, move.y));
      }
    }
    
    console.log('[generateFarmerCandidates] Final candidates:', candidates);
    
    return candidates;
  }

  /**
   * RAM: 1-2 squares in any direction
   */
  private generateRamCandidates(pos: { x: number; y: number }): Position[] {
    const candidates: Position[] = [];
    const allDirections = Object.values(DIRECTIONS);

    for (const dir of allDirections) {
      candidates.push(
        new Position(pos.x + dir.x, pos.y + dir.y),
        new Position(pos.x + dir.x * 2, pos.y + dir.y * 2)
      );
    }

    return candidates;
  }

  /**
   * TRAP: 1-2 squares diagonally
   */
  private generateTrapCandidates(pos: { x: number; y: number }): Position[] {
    const candidates: Position[] = [];
    const diagonals = [DIRECTIONS.UP_LEFT, DIRECTIONS.UP_RIGHT, DIRECTIONS.DOWN_LEFT, DIRECTIONS.DOWN_RIGHT];

    for (const dir of diagonals) {
      candidates.push(
        new Position(pos.x + dir.x, pos.y + dir.y),
        new Position(pos.x + dir.x * 2, pos.y + dir.y * 2)
      );
    }
    return candidates;
  }

  /**
   * KNIGHT: 3 straight OR 2 diagonal
   */
  private generateKnightCandidates(pos: { x: number; y: number }): Position[] {
    const candidates: Position[] = [];
    const straights = [DIRECTIONS.FORWARD, DIRECTIONS.BACKWARD, DIRECTIONS.LEFT, DIRECTIONS.RIGHT];
    const diagonals = [DIRECTIONS.UP_LEFT, DIRECTIONS.UP_RIGHT, DIRECTIONS.DOWN_LEFT, DIRECTIONS.DOWN_RIGHT];

    for (const dir of straights) {
      candidates.push(new Position(pos.x + dir.x * 3, pos.y + dir.y * 3));
    }
    for (const dir of diagonals) {
      candidates.push(new Position(pos.x + dir.x * 2, pos.y + dir.y * 2));
    }
    return candidates;
  }

  /**
   * TEMPLAR: 1-2 squares in any direction
   */
  private generateTemplarCandidates(pos: { x: number; y: number }): Position[] {
    return this.generateRamCandidates(pos); // Same movement as RAM
  }

  /**
   * SCOUT: 2-3 squares in any direction
   */
  private generateScoutCandidates(pos: { x: number; y: number }): Position[] {
    const candidates: Position[] = [];
    const allDirections = Object.values(DIRECTIONS);

    for (const dir of allDirections) {
      candidates.push(
        new Position(pos.x + dir.x * 2, pos.y + dir.y * 2),
        new Position(pos.x + dir.x * 3, pos.y + dir.y * 3)
      );
    }
    return candidates;
  }

  /**
   * TREBUCHET: 1-2 squares movement
   */
  private generateTrebuchetCandidates(pos: { x: number; y: number }): Position[] {
    return this.generateRamCandidates(pos); // Same movement as RAM
  }

  /**
   * TREASURE: 1 square in any direction
   */
  private generateTreasureCandidates(pos: { x: number; y: number }): Position[] {
    const candidates: Position[] = [];
    const allDirections = Object.values(DIRECTIONS);

    for (const dir of allDirections) {
      candidates.push(new Position(pos.x + dir.x, pos.y + dir.y));
    }
    return candidates;
  }

  /**
   * KING: 2-3 squares in any direction
   */
  private generateKingCandidates(pos: { x: number; y: number }): Position[] {
    return this.generateScoutCandidates(pos); // Same movement as SCOUT
  }

  /**
   * Get forward direction for a team.
   */
  private getForwardDirection(team: TeamType): number {
    // OUR team moves up (y increases), OPPONENT moves down
    console.log('[getForwardDirection] team:', team, 'TeamType.OUR:', TeamType.OUR, 'equals:', team === TeamType.OUR);
    return team === TeamType.OUR ? 1 : -1;
  }

  /**
   * Count total number of legal moves (for mobility evaluation).
   */
  countLegalMoves(gameState: GameState, forTeam: TeamType): number {
    return this.generateLegalMoves(gameState, forTeam).length;
  }
}
