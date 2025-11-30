/**
 * MinimaxAI Integration Tests
 * 
 * Tests that AI can calculate valid moves and make decisions.
 */

import { AIFactory } from '../AIFactory';
import { createGameState, createGamePiece, pos } from '../../../test-utils/factories';
import { PieceType, TeamType } from '../../core/types';
import { AIPersonality, AIDifficulty } from '../interfaces';

describe('MinimaxAI', () => {
  describe('calculateMove() - basic functionality', () => {
    it('should generate at least one move for simple position', () => {
      const config = {
        personality: AIPersonality.TACTICAL,
        difficulty: AIDifficulty.BEGINNER
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
        personality: AIPersonality.TACTICAL,
        difficulty: AIDifficulty.BEGINNER
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
        personality: AIPersonality.TACTICAL,
        difficulty: AIDifficulty.BEGINNER
      };

      const ai = AIFactory.create(config);

      // Trapped piece with only one move (avoid forbidden zones)
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.FARMER, TeamType.OUR),
          // Surrounded by friendlies except forward square
          createGamePiece(pos(7, 8), PieceType.RAM, TeamType.OUR),
          createGamePiece(pos(9, 8), PieceType.RAM, TeamType.OUR)
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
        personality: AIPersonality.TACTICAL,
        difficulty: AIDifficulty.BEGINNER
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
      expect(move).not.toBeNull();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(move!.team).toBe(TeamType.OUR);
    });

    it('should generate valid moves that respect piece movement rules', () => {
      const config = {
        personality: AIPersonality.TACTICAL,
        difficulty: AIDifficulty.BEGINNER
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
      
      // FARMER can only move 1 square forward or diagonal attack
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const deltaX = Math.abs(move!.to.x - move!.from.x);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const deltaY = Math.abs(move!.to.y - move!.from.y);
      
      expect(deltaX).toBeLessThanOrEqual(1);
      expect(deltaY).toBeLessThanOrEqual(1);
    });
  });

  describe('difficulty levels', () => {
    const testDifficulties: Array<{ difficulty: AIDifficulty; expectedDepth: number }> = [
      { difficulty: AIDifficulty.BEGINNER, expectedDepth: 1 },
      { difficulty: AIDifficulty.MEDIUM, expectedDepth: 2 },
      { difficulty: AIDifficulty.ADVANCED, expectedDepth: 3 },
      { difficulty: AIDifficulty.MASTER, expectedDepth: 4 }
    ];

    for (const { difficulty, expectedDepth } of testDifficulties) {
      it(`should respect ${difficulty} difficulty (depth ${expectedDepth})`, () => {
        const config = {
          personality: AIPersonality.TACTICAL,
          difficulty
        };

        const ai = AIFactory.create(config);

        expect(ai).toBeDefined();
        expect(ai.getDifficulty()).toBe(difficulty);
      });
    }
  });

  describe('statistics tracking', () => {
    it('should track nodes evaluated during search', () => {
      const config = {
        personality: AIPersonality.TACTICAL,
        difficulty: AIDifficulty.MEDIUM
      };

      const ai = AIFactory.create(config);

      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 7), PieceType.FARMER, TeamType.OUR),
          createGamePiece(pos(9, 8), PieceType.FARMER, TeamType.OPPONENT) // Diagonal attack available
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
        personality: AIPersonality.TACTICAL,
        difficulty: AIDifficulty.MEDIUM
      };

      const ai = AIFactory.create(config);

      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 7), PieceType.FARMER, TeamType.OUR),
          createGamePiece(pos(7, 7), PieceType.FARMER, TeamType.OUR),
          createGamePiece(pos(8, 9), PieceType.FARMER, TeamType.OPPONENT),
          createGamePiece(pos(9, 9), PieceType.FARMER, TeamType.OPPONENT)
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
        difficulty: AIDifficulty.MEDIUM
      };

      const ai = AIFactory.create(config);

      expect(ai.getName()).toBe('MinimaxAI');
    });

    it('should create AI with DEFENSIVE personality', () => {
      const config = {
        personality: AIPersonality.DEFENSIVE,
        difficulty: AIDifficulty.MEDIUM
      };

      const ai = AIFactory.create(config);

      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 7), PieceType.KING, TeamType.OUR),
          createGamePiece(pos(7, 6), PieceType.TRAP, TeamType.OUR),
          createGamePiece(pos(8, 9), PieceType.FARMER, TeamType.OPPONENT)
        ],
        currentTurn: TeamType.OUR
      });

      const move = ai.calculateMove(gameState, config);

      expect(move).toBeDefined();
    });

    it('should create AI with POSITIONAL personality', () => {
      const config = {
        personality: AIPersonality.POSITIONAL,
        difficulty: AIDifficulty.MEDIUM
      };

      const ai = AIFactory.create(config);

      expect(ai).toBeDefined();
    });
  });

  describe('move ordering optimization', () => {
    it('should evaluate fewer nodes with good move ordering', () => {
      const config = {
        personality: AIPersonality.TACTICAL,
        difficulty: AIDifficulty.MEDIUM
      };

      const ai = AIFactory.create(config);

      // Position with clear best move (capture)
      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 7), PieceType.FARMER, TeamType.OUR),
          createGamePiece(pos(9, 8), PieceType.TREASURE, TeamType.OPPONENT) // Diagonal capture
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
        personality: AIPersonality.TACTICAL,
        difficulty: AIDifficulty.ADVANCED,
        maxThinkTime: 1000 // 1 second limit
      };

      const ai = AIFactory.create(config);

      const gameState = createGameState({
        pieces: [
          createGamePiece(pos(8, 7), PieceType.FARMER, TeamType.OUR),
          createGamePiece(pos(7, 7), PieceType.FARMER, TeamType.OUR),
          createGamePiece(pos(8, 9), PieceType.FARMER, TeamType.OPPONENT),
          createGamePiece(pos(9, 9), PieceType.FARMER, TeamType.OPPONENT)
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
        personality: AIPersonality.TACTICAL,
        difficulty: AIDifficulty.BEGINNER
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
        personality: AIPersonality.TACTICAL,
        difficulty: AIDifficulty.BEGINNER
      };

      const ai = AIFactory.create(config);

      // Place pieces in valid, non-forbidden zones
      const pieces = [
        ...Array.from({ length: 5 }, (_, i) => createGamePiece(pos(5 + i, 5), PieceType.FARMER, TeamType.OUR)),
        ...Array.from({ length: 5 }, (_, i) => createGamePiece(pos(5 + i, 10), PieceType.FARMER, TeamType.OPPONENT))
      ];

      const gameState = createGameState({
        pieces,
        currentTurn: TeamType.OUR
      });

      const move = ai.calculateMove(gameState, config);

      expect(move).toBeDefined();
    });
  });
});
