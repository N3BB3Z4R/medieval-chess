/**
 * MaterialEvaluator Tests
 * 
 * Tests material calculation accuracy for all scenarios.
 */

import { MaterialEvaluator } from '../MaterialEvaluator';
import { createGameState, createGamePiece, pos } from '../../../../test-utils/factories';
import { PieceType, TeamType } from '../../../core/types';
import { getPieceValue } from '../../PieceValues';

describe('MaterialEvaluator', () => {
  let evaluator: MaterialEvaluator;

  beforeEach(() => {
    evaluator = new MaterialEvaluator();
  });

  describe('evaluate() - basic material balance', () => {
    it('should return 0 for equal material', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(0, 0), PieceType.FARMER, TeamType.OUR),
          createGamePiece(pos(15, 15), PieceType.FARMER, TeamType.OPPONENT)
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      expect(score).toBe(0);
    });

    it('should return positive score when we have material advantage', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(0, 0), PieceType.KNIGHT, TeamType.OUR), // 45
          createGamePiece(pos(15, 15), PieceType.FARMER, TeamType.OPPONENT) // 10
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      expect(score).toBe(getPieceValue(PieceType.KNIGHT) - getPieceValue(PieceType.FARMER));
      expect(score).toBeGreaterThan(0);
    });

    it('should return negative score when opponent has material advantage', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(0, 0), PieceType.FARMER, TeamType.OUR), // 10
          createGamePiece(pos(15, 15), PieceType.TEMPLAR, TeamType.OPPONENT) // 55
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      expect(score).toBe(getPieceValue(PieceType.FARMER) - getPieceValue(PieceType.TEMPLAR));
      expect(score).toBeLessThan(0);
    });

    it('should correctly sum multiple pieces', () => {
      const gameState = createGameState({
        pieces: [
          // OUR team: KNIGHT + FARMER = 45 + 10 = 55
          createGamePiece(pos(0, 0), PieceType.KNIGHT, TeamType.OUR),
          createGamePiece(pos(0, 1), PieceType.FARMER, TeamType.OUR),
          
          // OPPONENT team: TEMPLAR + RAM = 55 + 35 = 90
          createGamePiece(pos(15, 15), PieceType.TEMPLAR, TeamType.OPPONENT),
          createGamePiece(pos(15, 14), PieceType.RAM, TeamType.OPPONENT)
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      expect(score).toBe(55 - 90); // -35
      expect(score).toBeLessThan(0);
    });
  });

  describe('evaluate() - piece values', () => {
    const testCases: Array<{ piece: PieceType; expectedValue: number }> = [
      { piece: PieceType.FARMER, expectedValue: 10 },
      { piece: PieceType.RAM, expectedValue: 35 },
      { piece: PieceType.TRAP, expectedValue: 40 },
      { piece: PieceType.KNIGHT, expectedValue: 45 },
      { piece: PieceType.TEMPLAR, expectedValue: 55 },
      { piece: PieceType.SCOUT, expectedValue: 50 },
      { piece: PieceType.TREBUCHET, expectedValue: 70 },
      { piece: PieceType.TREASURE, expectedValue: 20 },
      { piece: PieceType.KING, expectedValue: 1000 }
    ];

    testCases.forEach(({ piece, expectedValue }) => {
      it(`should correctly value ${piece} at ${expectedValue}`, () => {
        const gameState = createGameState({
          pieces: [
            createGamePiece(pos(8, 8), piece, TeamType.OUR)
          ]
        });

        const score = evaluator.evaluate(gameState, TeamType.OUR);

        expect(score).toBe(expectedValue);
      });
    });
  });

  describe('hasMaterialAdvantage()', () => {
    it('should return true when we have advantage', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(0, 0), PieceType.KNIGHT, TeamType.OUR),
          createGamePiece(pos(15, 15), PieceType.FARMER, TeamType.OPPONENT)
        ]
      });

      expect(evaluator.hasMaterialAdvantage(gameState, TeamType.OUR)).toBe(true);
    });

    it('should return false when opponent has advantage', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(0, 0), PieceType.FARMER, TeamType.OUR),
          createGamePiece(pos(15, 15), PieceType.KNIGHT, TeamType.OPPONENT)
        ]
      });

      expect(evaluator.hasMaterialAdvantage(gameState, TeamType.OUR)).toBe(false);
    });

    it('should return false when material is equal', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(0, 0), PieceType.FARMER, TeamType.OUR),
          createGamePiece(pos(15, 15), PieceType.FARMER, TeamType.OPPONENT)
        ]
      });

      expect(evaluator.hasMaterialAdvantage(gameState, TeamType.OUR)).toBe(false);
    });
  });

  describe('getMaterialRatio()', () => {
    it('should return 1.0 for equal material', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(0, 0), PieceType.KNIGHT, TeamType.OUR),
          createGamePiece(pos(15, 15), PieceType.KNIGHT, TeamType.OPPONENT)
        ]
      });

      const ratio = evaluator.getMaterialRatio(gameState, TeamType.OUR);

      expect(ratio).toBe(1.0);
    });

    it('should return >1.0 when we have advantage', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(0, 0), PieceType.KNIGHT, TeamType.OUR), // 45
          createGamePiece(pos(15, 15), PieceType.FARMER, TeamType.OPPONENT) // 10
        ]
      });

      const ratio = evaluator.getMaterialRatio(gameState, TeamType.OUR);

      expect(ratio).toBe(4.5); // 45 / 10
      expect(ratio).toBeGreaterThan(1);
    });

    it('should return <1.0 when opponent has advantage', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(0, 0), PieceType.FARMER, TeamType.OUR), // 10
          createGamePiece(pos(15, 15), PieceType.KNIGHT, TeamType.OPPONENT) // 45
        ]
      });

      const ratio = evaluator.getMaterialRatio(gameState, TeamType.OUR);

      expect(ratio).toBeCloseTo(0.222, 2); // 10 / 45
      expect(ratio).toBeLessThan(1);
    });

    it('should return Infinity when opponent has no material', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(0, 0), PieceType.KNIGHT, TeamType.OUR)
        ]
      });

      const ratio = evaluator.getMaterialRatio(gameState, TeamType.OUR);

      expect(ratio).toBe(Infinity);
    });

    it('should return 1 when both teams have no material', () => {
      const gameState = createGameState({
        pieces: []
      });

      const ratio = evaluator.getMaterialRatio(gameState, TeamType.OUR);

      expect(ratio).toBe(1);
    });
  });

  describe('king value priority', () => {
    it('should heavily weight KING presence', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(0, 0), PieceType.KING, TeamType.OUR),
          createGamePiece(pos(15, 15), PieceType.KNIGHT, TeamType.OPPONENT),
          createGamePiece(pos(15, 14), PieceType.KNIGHT, TeamType.OPPONENT),
          createGamePiece(pos(15, 13), PieceType.KNIGHT, TeamType.OPPONENT)
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      // KING (1000) vs 3 KNIGHTS (135) = +865
      expect(score).toBeGreaterThan(800);
    });

    it('should show losing position when KING is captured', () => {
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(15, 15), PieceType.KING, TeamType.OPPONENT)
        ]
      });

      const score = evaluator.evaluate(gameState, TeamType.OUR);

      expect(score).toBe(-1000);
    });
  });
});
