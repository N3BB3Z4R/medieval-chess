/**
 * ThreatDetector - Multi-move threat analysis using BFS pathfinding
 * 
 * Detects threats N moves ahead, calculates severity, and identifies
 * blocking positions. Critical for King safety evaluation.
 * 
 * Algorithm: Breadth-First Search (BFS)
 * - Explores all possible paths from attacker to target
 * - Considers piece-specific movement patterns
 * - Handles blocked paths and forbidden zones
 * - Complexity: O(N * M^D) where N=pieces, M=avg moves, D=depth
 * 
 * Example: Detect TREBUCHET at (0,0) threatening KING at (15,15)
 * - BFS explores attack paths
 * - Calculates: ~8 moves to reach (depends on path)
 * - Severity: HIGH (target=KING, ranged attacker)
 */

import { GameState, GamePiece } from '../game/GameState';
import { Position } from '../core/Position';
import { TeamType } from '../core/types';
import { Move } from '../core/Move';
import {
  IThreatDetector,
  ThreatAnalysis,
  ThreatPathResult,
  PathNode,
  IMoveGenerator
} from './interfaces';
import { REFINED_PIECE_VALUES } from './PieceValues';

/**
 * Detects multi-move threats using BFS pathfinding.
 * 
 * Usage:
 * ```typescript
 * const detector = new ThreatDetector(moveGenerator);
 * const threats = detector.detectThreats(king, gameState, 3);
 * 
 * for (const threat of threats) {
 *   console.log(`${threat.attacker.type} can reach in ${threat.movesToReach} moves`);
 *   console.log(`Severity: ${threat.severity}, Blockers: ${threat.blockers.length}`);
 * }
 * ```
 */
export class ThreatDetector implements IThreatDetector {
  constructor(private readonly moveGenerator: IMoveGenerator) {}

  /**
   * Detect all threats against a target piece.
   */
  detectThreats(target: GamePiece, gameState: GameState, depth: number): ThreatAnalysis[] {
    const threats: ThreatAnalysis[] = [];
    const enemyTeam = this.getOpposingTeam(target.team, gameState);
    
    // Get all enemy pieces
    for (const opponent of enemyTeam) {
      const enemyPieces = gameState.getPiecesForTeam(opponent as any);

      for (const enemyPiece of enemyPieces) {
        const threat = this.analyzeThreatPath(
          enemyPiece,
          target.position,
          gameState,
          depth
        );

        if (threat.canReach) {
          threats.push({
            attacker: enemyPiece,
            target: target,
            movesToReach: threat.distance,
            severity: this.calculateThreatSeverity(enemyPiece, target, threat.distance),
            path: threat.path,
            blockers: threat.blockers
          });
        }
      }
    }

    // Sort by severity (most dangerous first)
    return threats.sort((a, b) => b.severity - a.severity);
  }

  /**
   * Analyze if an attacker can reach a target position.
   * Uses BFS to explore all possible paths.
   * 
   * @param attacker - Attacking piece
   * @param targetPos - Target position
   * @param gameState - Current game state
   * @param maxDepth - Maximum search depth
   * @returns Path analysis with distance and blockers
   */
  analyzeThreatPath(
    attacker: GamePiece,
    targetPos: Position,
    gameState: GameState,
    maxDepth: number
  ): ThreatPathResult {
    // BFS queue
    const queue: PathNode[] = [{
      position: attacker.position,
      depth: 0,
      path: [attacker.position],
      stateSnapshot: gameState
    }];

    // Visited positions (to avoid cycles)
    const visited = new Set<string>();
    visited.add(this.positionKey(attacker.position));

    while (queue.length > 0) {
      const current = queue.shift()!;

      // Check if reached target
      if (Position.equals(current.position, targetPos)) {
        return {
          canReach: true,
          distance: current.depth,
          path: current.path,
          blockers: this.findBlockingPositions(current.path, gameState)
        };
      }

      // Depth limit reached
      if (current.depth >= maxDepth) {
        continue;
      }

      // Generate possible moves from current position
      const virtualPiece: GamePiece = {
        ...attacker,
        position: current.position
      };

      const moves = this.moveGenerator.generateMovesForPiece(virtualPiece, current.stateSnapshot);

      for (const move of moves) {
        const posKey = this.positionKey(move.to as any);
        
        if (visited.has(posKey)) {
          continue; // Already explored
        }

        visited.add(posKey);

        // Simulate move for next iteration
        const newState = this.simulateMove(current.stateSnapshot, move);

        queue.push({
          position: move.to as any,
          depth: current.depth + 1,
          path: [...current.path, move.to as any],
          stateSnapshot: newState
        });
      }
    }

    // Target unreachable
    return {
      canReach: false,
      distance: Infinity,
      path: [],
      blockers: []
    };
  }

  /**
   * Calculate threat severity
   */
  private calculateThreatSeverity(attacker: GamePiece, target: GamePiece, distance: number): number {
    const attackerValue = (REFINED_PIECE_VALUES as any)[attacker.type] || 10;
    const targetValue = (REFINED_PIECE_VALUES as any)[target.type] || 10;

    let severity = (targetValue / Math.max(distance, 1)) * (attackerValue / 100);

    // Special piece modifiers - now using string enum comparisons
    if (attacker.type === 'TREBUCHET') severity *= 1.5;
    if (attacker.type === 'RAM') severity *= 1.3;
    if (attacker.type === 'TRAP') severity *= 2;
    if (target.type === 'KING') severity *= 10;
    if (target.type === 'TREASURE') severity *= 2;

    // Distance modifiers
    if (distance === 1) severity *= 3;
    else if (distance === 2) severity *= 2;

    return Math.round(severity);
  }

  /**
   * Find positions where placing defenders can block the threat.
   * 
   * Returns all positions along the attack path (excluding start/end).
   */
  private findBlockingPositions(path: Position[], gameState: GameState): Position[] {
    const blockers: Position[] = [];
    const allPieces = gameState.getAllPieces();

    // All intermediate positions are potential blockers
    for (let i = 1; i < path.length - 1; i++) {
      const pos = path[i];
      const occupant = allPieces.find((p: any) => Position.equals(p.position, pos));

      // Empty square = valid blocking position
      if (!occupant) {
        blockers.push(pos);
      }
    }

    return blockers;
  }

  /**
   * Simulate a move by creating a new game state.
   * Used for BFS exploration without modifying original state.
   */
  private simulateMove(gameState: GameState, move: Move): GameState {
    const allPieces = gameState.getAllPieces();
    
    // Create new pieces array with move applied
    const newPieces = allPieces
      .map((p: any) => {
        // Move the piece
        if (Position.equals(p.position, move.from as any)) {
          return { ...p, position: move.to as any };
        }
        return p;
      })
      // Remove captured piece at destination
      .filter((p: any) => 
        !Position.equals(p.position, move.to as any) || 
        Position.equals(p.position, move.from as any)
      );

    // Create new game state (immutable)
    return new GameState({
      pieces: newPieces as any,
      currentTurn: gameState.getCurrentTurn(),
      moveHistory: gameState.getMoveHistory(),
      status: gameState.getStatus(),
      capturedPieces: gameState.getCapturedPieces()
    });
  }

  /**
   * Get opposing team(s) for multi-player support.
   */
  private getOpposingTeam(forTeam: TeamType, gameState: GameState): TeamType[] {
    const allTeams: TeamType[] = [TeamType.OUR, TeamType.OPPONENT];
    return allTeams.filter(team => team !== forTeam);
  }

  /**
   * Check if a trap is visible to a team.
   * TRAP pieces are invisible to opponents unless revealed.
   */
  private isVisibleToTeam(trap: GamePiece, team: TeamType): boolean {
    // Traps are invisible to opponents - using string enum comparison
    if (trap.type === 'TRAP' && trap.team !== team) {
      // TODO: Check if revealed by SCOUT or KING
      return false;
    }
    return true;
  }

  /**
   * Generate unique key for position (for visited set).
   */
  private positionKey(pos: Position): string {
    return `${pos.x},${pos.y}`;
  }
}
