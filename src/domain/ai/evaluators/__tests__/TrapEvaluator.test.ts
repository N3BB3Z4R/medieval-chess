/**
 * TrapEvaluator Tests
 * 
 * Tests trap placement strategy and effectiveness scoring.
 */

import { TrapEvaluator } from '../TrapEvaluator';
import { createGameState, createGamePiece, pos } from '../../../../test-utils/factories';
import { PieceType, TeamType } from '../../../core/types';

describe('TrapEvaluator', () => {
  let evaluator: TrapEvaluator;

  beforeEach(() => {
    evaluator = new TrapEvaluator();
  });

  describe('evaluate() - basic trap scoring', () => {
    it('should return 0 when no traps exist', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(0, 0), PieceType.FARMER, TeamType.OUR),
          createGamePiece(pos(15, 15), PieceType.FARMER, TeamType.OPPONENT)
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      expect(score).toBe(0);
    });

    it('should score positive when we have traps and opponent doesnt', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.TRAP, TeamType.OUR)
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      expect(score).toBeGreaterThan(0);
    });

    it('should score negative when opponent has more traps', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.TRAP, TeamType.OPPONENT),
          createGamePiece(pos(9, 9), PieceType.TRAP, TeamType.OPPONENT)
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      expect(score).toBeLessThan(0);
    });
  });

  describe('king protection bonus', () => {
    it('should give bonus for trap near king (within radius 3)', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.KING, TeamType.OUR),
          createGamePiece(pos(8, 10), PieceType.TRAP, TeamType.OUR) // Distance 2
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      // Should have king protection bonus (+20)
      expect(score).toBeGreaterThanOrEqual(20);
    });

    it('should not give bonus for trap far from king (beyond radius)', () => {
      const gameStateNear = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.KING, TeamType.OUR),
          createGamePiece(pos(8, 10), PieceType.TRAP, TeamType.OUR) // Distance 2 - near
        ]
      });

      const gameStateFar = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.KING, TeamType.OUR),
          createGamePiece(pos(8, 15), PieceType.TRAP, TeamType.OUR) // Distance 7 - far
        ]
      });

      const scoreNear = evaluator.evaluate(gameStateNear, TeamType.OUR);
      const scoreFar = evaluator.evaluate(gameStateFar, TeamType.OUR);

      expect(scoreNear).toBeGreaterThan(scoreFar);
    });
  });

  describe('treasure protection bonus', () => {
    it('should give bonus for trap near treasure', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.TREASURE, TeamType.OUR),
          createGamePiece(pos(8, 10), PieceType.TRAP, TeamType.OUR) // Distance 2
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      // Should have treasure protection bonus (+25)
      expect(score).toBeGreaterThanOrEqual(25);
    });
  });

  describe('center placement bonus', () => {
    it('should give bonus for trap in center zone (6-10)', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.TRAP, TeamType.OUR) // Center
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      // Should have center bonus (+15)
      expect(score).toBeGreaterThanOrEqual(15);
    });

    it('should score center trap higher than edge trap', () => {
      const gameStateCenter = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.TRAP, TeamType.OUR)
        ]
      });

      const gameStateEdge = createGameState({
        pieces: [
          createGamePiece(pos(0, 0), PieceType.TRAP, TeamType.OUR)
        ]
      });

      const scoreCenter = evaluator.evaluate(gameStateCenter, TeamType.OUR);
      const scoreEdge = evaluator.evaluate(gameStateEdge, TeamType.OUR);

      expect(scoreCenter).toBeGreaterThan(scoreEdge);
    });
  });

  describe('opponent proximity bonus', () => {
    it('should give bonus for trap near opponent pieces', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.TRAP, TeamType.OUR),
          createGamePiece(pos(8, 11), PieceType.FARMER, TeamType.OPPONENT) // Distance 3
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      // Should have opponent proximity bonus (+10)
      expect(score).toBeGreaterThanOrEqual(10);
    });

    it('should not give bonus for trap far from opponents', () => {
      const gameStateNear = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.TRAP, TeamType.OUR),
          createGamePiece(pos(8, 11), PieceType.FARMER, TeamType.OPPONENT) // Distance 3 - near
        ]
      });

      const gameStateFar = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.TRAP, TeamType.OUR),
          createGamePiece(pos(0, 0), PieceType.FARMER, TeamType.OPPONENT) // Distance 16 - far
        ]
      });

      const scoreNear = evaluator.evaluate(gameStateNear, TeamType.OUR);
      const scoreFar = evaluator.evaluate(gameStateFar, TeamType.OUR);

      expect(scoreNear).toBeGreaterThan(scoreFar);
    });
  });

  describe('trap clustering bonus', () => {
    it('should give bonus for clustered traps (mine field)', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.TRAP, TeamType.OUR),
          createGamePiece(pos(9, 9), PieceType.TRAP, TeamType.OUR) // Distance √2 ≈ 1.4
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      // Should have clustering bonus (+5 per pair)
      expect(score).toBeGreaterThanOrEqual(5);
    });

    it('should score clustered traps higher than isolated traps', () => {
      const gameStateClustered = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.TRAP, TeamType.OUR),
          createGamePiece(pos(9, 9), PieceType.TRAP, TeamType.OUR),
          createGamePiece(pos(10, 10), PieceType.TRAP, TeamType.OUR) // 3 traps close together
        ]
      });

      const gameStateIsolated = createGameState({
        pieces: [
          createGamePiece(pos(0, 0), PieceType.TRAP, TeamType.OUR),
          createGamePiece(pos(8, 8), PieceType.TRAP, TeamType.OUR),
          createGamePiece(pos(15, 15), PieceType.TRAP, TeamType.OUR) // 3 traps far apart
        ]
      });

      const scoreClustered = evaluator.evaluate(gameStateClustered, TeamType.OUR);
      const scoreIsolated = evaluator.evaluate(gameStateIsolated, TeamType.OUR);

      expect(scoreClustered).toBeGreaterThan(scoreIsolated);
    });
  });

  describe('combined bonuses', () => {
    it('should accumulate multiple bonuses correctly', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.KING, TeamType.OUR),
          createGamePiece(pos(9, 9), PieceType.TREASURE, TeamType.OUR),
          createGamePiece(pos(8, 9), PieceType.TRAP, TeamType.OUR), // Near king + treasure + center
          createGamePiece(pos(9, 8), PieceType.TRAP, TeamType.OUR), // Near king + treasure + center + clustering
          createGamePiece(pos(12, 12), PieceType.FARMER, TeamType.OPPONENT)
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      // Should have multiple bonuses:
      // - King protection (x2 traps near king)
      // - Treasure protection (x2 traps near treasure)
      // - Center placement (x2 traps in center)
      // - Clustering (2 traps close together)
      expect(score).toBeGreaterThan(50);
    });
  });

  describe('team comparison', () => {
    it('should compare trap effectiveness between teams', () => {
      const gameState = createGameState({
        pieces: [
          // Our trap: Well positioned (center + near king)
          createGamePiece(pos(8, 8), PieceType.KING, TeamType.OUR),
          createGamePiece(pos(8, 9), PieceType.TRAP, TeamType.OUR),
          
          // Opponent trap: Poorly positioned (edge)
          createGamePiece(pos(15, 15), PieceType.KING, TeamType.OPPONENT),
          createGamePiece(pos(0, 0), PieceType.TRAP, TeamType.OPPONENT)
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      expect(score).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle game state with only traps', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.TRAP, TeamType.OUR),
          createGamePiece(pos(15, 15), PieceType.TRAP, TeamType.OPPONENT)
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      expect(score).toBeDefined();
      expect(typeof score).toBe('number');
    });

    it('should handle multiple traps of same team', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.TRAP, TeamType.OUR),
          createGamePiece(pos(9, 9), PieceType.TRAP, TeamType.OUR),
          createGamePiece(pos(10, 10), PieceType.TRAP, TeamType.OUR),
          createGamePiece(pos(11, 11), PieceType.TRAP, TeamType.OUR)
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      expect(score).toBeGreaterThan(0);
    });
  });
});
