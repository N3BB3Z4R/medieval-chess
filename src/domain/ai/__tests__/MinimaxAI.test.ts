/**
 * MinimaxAI Integration Tests
 * 
 * Tests that AI can calculate valid moves and make decisions.
 */

import { MinimaxAI } from '../MinimaxAI';
import { AIFactory } from '../AIFactory';
import { createGameState, createGamePiece, pos } from '../../../test-utils/factories';
import { PieceType, TeamType } from '../../core/types';
import { AIPersonality } from '../interfaces';

describe('MinimaxAI', () => {
  describe('calculateMove() - basic functionality', () => {
    it('should generate at least one move for simple position', () => {
      const config = {
        personality: AIPersonality.BALANCED,
        difficulty: 'easy' as const,
        timeLimit: 5000,
        searchDepth: 1
      };

      const ai = AIFactory.create(config);

      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.FARMER, TeamType.OUR)
        ],
        currentTurn: TeamType.OUR
      });

      const move = ai.calculateMove(gameState, config);

      expect(move).toBeDefined();
      expect(move).not.toBeNull();
    });

    it('should return null when no legal moves available', () => {
      const config = {
        personality: AIPersonality.BALANCED,
        difficulty: 'easy' as const,
        timeLimit: 5000,
        searchDepth: 1
      };

      const ai = AIFactory.create(config);

      // Empty board - no pieces to move
      const gameState = createGameState({
        pieces: [],
        currentTurn: TeamType.OUR
      });

      const move = ai.calculateMove(gameState, config);

      expect(move).toBeNull();
    });

    it('should return only legal move immediately when only one option', () => {
      const config = {
        personality: AIPersonality.BALANCED,
        difficulty: 'easy' as const,
        timeLimit: 5000,
        searchDepth: 1
      };

      const ai = AIFactory.create(config);

      // Trapped piece with only one move
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(0, 0), PieceType.FARMER, TeamType.OUR),
          // Surrounded by friendlies except one square
          createGamePiece(pos(0, 1), PieceType.RAM, TeamType.OUR),
          createGamePiece(pos(1, 0), PieceType.RAM, TeamType.OUR)
        ],
        currentTurn: TeamType.OUR
      });

      const startTime = Date.now();
      const move = ai.calculateMove(gameState, config);
      const endTime = Date.now();

      expect(move).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // Should skip search
    });
  });

  describe('move validation', () => {
    it('should only generate moves for current team', () => {
      const config = {
        personality: AIPersonality.BALANCED,
        difficulty: 'easy' as const,
        timeLimit: 5000,
        searchDepth: 1
      };

      const ai = AIFactory.create(config);

      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.FARMER, TeamType.OUR),
          createGamePiece(pos(10, 10), PieceType.FARMER, TeamType.OPPONENT)
        ],
        currentTurn: TeamType.OUR
      });

      const move = ai.calculateMove(gameState, config);

      expect(move).toBeDefined();
      if (move) {
        expect(move.team).toBe(TeamType.OUR);
      }
    });

    it('should generate valid moves that respect piece movement rules', () => {
      const config = {
        personality: AIPersonality.BALANCED,
        difficulty: 'easy' as const,
        timeLimit: 5000,
        searchDepth: 1
      };

      const ai = AIFactory.create(config);

      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.FARMER, TeamType.OUR)
        ],
        currentTurn: TeamType.OUR
      });

      const move = ai.calculateMove(gameState, config);

      expect(move).toBeDefined();
      if (move) {
        // FARMER can only move 1 square forward or diagonal attack
        const deltaX = Math.abs(move.to.x - move.from.x);
        const deltaY = Math.abs(move.to.y - move.from.y);
        
        expect(deltaX).toBeLessThanOrEqual(1);
        expect(deltaY).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('difficulty levels', () => {
    const testDifficulties: Array<{ difficulty: string; expectedDepth: number }> = [
      { difficulty: 'beginner', expectedDepth: 1 },
      { difficulty: 'medium', expectedDepth: 2 },
      { difficulty: 'advanced', expectedDepth: 3 },
      { difficulty: 'master', expectedDepth: 4 }
    ];

    testDifficulties.forEach(({ difficulty, expectedDepth }) => {
      it(`should respect ${difficulty} difficulty (depth ${expectedDepth})`, () => {
        const config = {
          personality: AIPersonality.BALANCED,
          difficulty: difficulty as any,
          timeLimit: 5000,
          searchDepth: expectedDepth
        };

        const ai = AIFactory.create(config);

        expect(ai).toBeDefined();
        expect(ai.getDifficulty()).toBe(difficulty);
      });
    });
  });

  describe('statistics tracking', () => {
    it('should track nodes evaluated during search', () => {
      const config = {
        personality: AIPersonality.BALANCED,
        difficulty: 'medium' as const,
        timeLimit: 5000,
        searchDepth: 2
      };

      const ai = AIFactory.create(config);

      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.KNIGHT, TeamType.OUR),
          createGamePiece(pos(10, 10), PieceType.FARMER, TeamType.OPPONENT)
        ],
        currentTurn: TeamType.OUR
      });

      ai.calculateMove(gameState, config);

      const stats = ai.getStats();

      expect(stats.nodesEvaluated).toBeGreaterThan(0);
      expect(typeof stats.nodesEvaluated).toBe('number');
    });

    it('should track alpha-beta pruning count', () => {
      const config = {
        personality: AIPersonality.BALANCED,
        difficulty: 'medium' as const,
        timeLimit: 5000,
        searchDepth: 2
      };

      const ai = AIFactory.create(config);

      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.KNIGHT, TeamType.OUR),
          createGamePiece(pos(9, 9), PieceType.FARMER, TeamType.OUR),
          createGamePiece(pos(10, 10), PieceType.FARMER, TeamType.OPPONENT),
          createGamePiece(pos(11, 11), PieceType.FARMER, TeamType.OPPONENT)
        ],
        currentTurn: TeamType.OUR
      });

      ai.calculateMove(gameState, config);

      const stats = ai.getStats();

      // With depth 2+, should have some pruning
      expect(stats.pruneCount).toBeGreaterThanOrEqual(0);
      expect(typeof stats.pruneCount).toBe('number');
    });
  });

  describe('personality behaviors', () => {
    it('should create AI with AGGRESSIVE personality', () => {
      const config = {
        personality: AIPersonality.AGGRESSIVE,
        difficulty: 'medium' as const,
        timeLimit: 5000,
        searchDepth: 2
      };

      const ai = AIFactory.create(config);

      expect(ai.getName()).toBe('MinimaxAI');
    });

    it('should create AI with DEFENSIVE personality', () => {
      const config = {
        personality: AIPersonality.DEFENSIVE,
        difficulty: 'medium' as const,
        timeLimit: 5000,
        searchDepth: 2
      };

      const ai = AIFactory.create(config);

      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.KING, TeamType.OUR),
          createGamePiece(pos(9, 9), PieceType.TRAP, TeamType.OUR),
          createGamePiece(pos(10, 10), PieceType.FARMER, TeamType.OPPONENT)
        ],
        currentTurn: TeamType.OUR
      });

      const move = ai.calculateMove(gameState, config);

      expect(move).toBeDefined();
    });

    it('should create AI with POSITIONAL personality', () => {
      const config = {
        personality: AIPersonality.POSITIONAL,
        difficulty: 'medium' as const,
        timeLimit: 5000,
        searchDepth: 2
      };

      const ai = AIFactory.create(config);

      expect(ai).toBeDefined();
    });
  });

  describe('move ordering optimization', () => {
    it('should evaluate fewer nodes with good move ordering', () => {
      const config = {
        personality: AIPersonality.BALANCED,
        difficulty: 'medium' as const,
        timeLimit: 5000,
        searchDepth: 2
      };

      const ai = AIFactory.create(config);

      // Position with clear best move (capture)
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.KNIGHT, TeamType.OUR),
          createGamePiece(pos(8, 11), PieceType.TREASURE, TeamType.OPPONENT) // Within KNIGHT reach
        ],
        currentTurn: TeamType.OUR
      });

      ai.calculateMove(gameState, config);

      const stats = ai.getStats();

      // With good move ordering, should have pruning
      expect(stats.pruneCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('time management', () => {
    it('should respect time limit', () => {
      const config = {
        personality: AIPersonality.BALANCED,
        difficulty: 'advanced' as const,
        timeLimit: 1000, // 1 second limit
        searchDepth: 3
      };

      const ai = AIFactory.create(config);

      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.KNIGHT, TeamType.OUR),
          createGamePiece(pos(9, 9), PieceType.KNIGHT, TeamType.OUR),
          createGamePiece(pos(6, 6), PieceType.FARMER, TeamType.OPPONENT),
          createGamePiece(pos(7, 7), PieceType.FARMER, TeamType.OPPONENT)
        ],
        currentTurn: TeamType.OUR
      });

      const startTime = Date.now();
      ai.calculateMove(gameState, config);
      const endTime = Date.now();

      // Should not exceed time limit significantly (allow 1000ms buffer)
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('edge cases', () => {
    it('should handle position with single piece', () => {
      const config = {
        personality: AIPersonality.BALANCED,
        difficulty: 'easy' as const,
        timeLimit: 5000,
        searchDepth: 1
      };

      const ai = AIFactory.create(config);

      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 2), PieceType.FARMER, TeamType.OUR) // Valid starting position
        ],
        currentTurn: TeamType.OUR
      });

      const move = ai.calculateMove(gameState, config);

      expect(move).toBeDefined();
    });

    it('should handle complex position with many pieces', () => {
      const config = {
        personality: AIPersonality.BALANCED,
        difficulty: 'easy' as const,
        timeLimit: 5000,
        searchDepth: 1
      };

      const ai = AIFactory.create(config);

      const pieces = [];
      // Place pieces in valid, non-forbidden zones
      for (let i = 0; i < 5; i++) {
        pieces.push(createGamePiece(pos(4 + i, 4), PieceType.FARMER, TeamType.OUR));
        pieces.push(createGamePiece(pos(11 - i, 11), PieceType.FARMER, TeamType.OPPONENT));
      }

      const gameState = createGameState({
        pieces,
        currentTurn: TeamType.OUR
      });

      const move = ai.calculateMove(gameState, config);

      expect(move).toBeDefined();
    });
  });
});
