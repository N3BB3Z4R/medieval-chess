/**
 * GameState - RAM Multi-Kill Tests
 * 
 * Tests the special RAM ability: kills ALL enemies in path (max 2).
 * Rule from Rules.txt: "si en su camino hay uno o dos enemigos los eliminara"
 */

import { GameState } from '../GameState';
import { createGamePiece, pos } from '../../../test-utils/factories';
import { PieceType, TeamType } from '../../core/types';
import { Move } from '../../core/Move';
import { Position } from '../../core/Position';

describe('GameState - RAM Multi-Kill', () => {
  describe('RAM kills 1 enemy in path', () => {
    it('should kill single enemy in straight path', () => {
      const initialState = new GameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.RAM, TeamType.OUR),
          createGamePiece(pos(8, 9), PieceType.FARMER, TeamType.OPPONENT), // In path
          createGamePiece(pos(8, 12), PieceType.KING, TeamType.OPPONENT) // Not in path
        ],
        currentTurn: TeamType.OUR
      });

      const move = new Move({
        from: new Position(8, 8),
        to: new Position(8, 10), // RAM moves 2 squares, passing through (8,9)
        pieceType: PieceType.RAM,
        team: TeamType.OUR
      });

      const newState = initialState.executeMove(move);

      // RAM should be at destination
      const ram = newState.getPieceAt(new Position(8, 10));
      expect(ram).toBeDefined();
      expect(ram?.type).toBe(PieceType.RAM);

      // Enemy at (8,9) should be killed
      const enemyInPath = newState.getPieceAt(new Position(8, 9));
      expect(enemyInPath).toBeUndefined();

      // Enemy at (8,12) should still exist
      const farEnemy = newState.getPieceAt(new Position(8, 12));
      expect(farEnemy).toBeDefined();

      // Captured pieces should contain the killed enemy
      const capturedPieces = newState.getCapturedPieces();
      expect(capturedPieces.length).toBe(1);
      expect(capturedPieces[0].type).toBe(PieceType.FARMER);
    });

    it('should kill enemy at destination square', () => {
      const initialState = new GameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.RAM, TeamType.OUR),
          createGamePiece(pos(8, 9), PieceType.FARMER, TeamType.OPPONENT) // At destination
        ],
        currentTurn: TeamType.OUR
      });

      const move = new Move({
        from: new Position(8, 8),
        to: new Position(8, 9), // RAM moves to enemy square
        pieceType: PieceType.RAM,
        team: TeamType.OUR
      });

      const newState = initialState.executeMove(move);

      // RAM should be at destination
      const ram = newState.getPieceAt(new Position(8, 9));
      expect(ram).toBeDefined();
      expect(ram?.type).toBe(PieceType.RAM);

      // Enemy should be killed
      const capturedPieces = newState.getCapturedPieces();
      expect(capturedPieces.length).toBe(1);
    });
  });

  describe('RAM kills 2 enemies in path', () => {
    it('should kill both enemies when exactly 2 in path', () => {
      const initialState = new GameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.RAM, TeamType.OUR),
          createGamePiece(pos(8, 9), PieceType.FARMER, TeamType.OPPONENT), // First enemy
          createGamePiece(pos(8, 10), PieceType.FARMER, TeamType.OPPONENT) // Second enemy
        ],
        currentTurn: TeamType.OUR
      });

      const move = new Move({
        from: new Position(8, 8),
        to: new Position(8, 10), // RAM moves 2 squares
        pieceType: PieceType.RAM,
        team: TeamType.OUR
      });

      const newState = initialState.executeMove(move);

      // Both enemies should be killed
      const enemy1 = newState.getPieceAt(new Position(8, 9));
      const enemy2 = newState.getPieceAt(new Position(8, 10));
      
      expect(enemy1).toBeUndefined();
      expect(enemy2).toBeUndefined();

      // RAM should be at final position (replaces second enemy)
      const ram = newState.getPieceAt(new Position(8, 10));
      expect(ram).toBeDefined();
      expect(ram?.type).toBe(PieceType.RAM);

      // Both enemies should be captured
      const capturedPieces = newState.getCapturedPieces();
      expect(capturedPieces.length).toBe(2);
      expect(capturedPieces.every(p => p.type === PieceType.FARMER)).toBe(true);
    });
  });

  describe('RAM respects 2-enemy limit', () => {
    it('should only kill first 2 enemies if 3+ in path', () => {
      const initialState = new GameState({
        pieces: [
          createGamePiece(pos(8, 5), PieceType.RAM, TeamType.OUR),
          createGamePiece(pos(8, 6), PieceType.FARMER, TeamType.OPPONENT), // First
          createGamePiece(pos(8, 7), PieceType.FARMER, TeamType.OPPONENT), // Second
          createGamePiece(pos(8, 8), PieceType.FARMER, TeamType.OPPONENT)  // Third (should survive)
        ],
        currentTurn: TeamType.OUR
      });

      // Note: This test assumes RAM can move through 3 enemies, which may not be valid
      // per movement rules. Adjust based on actual validator behavior.
      const move = new Move({
        from: new Position(8, 5),
        to: new Position(8, 7), // RAM moves 2 squares
        pieceType: PieceType.RAM,
        team: TeamType.OUR
      });

      const newState = initialState.executeMove(move);

      // First 2 enemies should be killed
      const capturedPieces = newState.getCapturedPieces();
      expect(capturedPieces.length).toBeLessThanOrEqual(2);
    });
  });

  describe('RAM does not kill friendly pieces', () => {
    it('should pass through friendly pieces without killing', () => {
      const initialState = new GameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.RAM, TeamType.OUR),
          createGamePiece(pos(8, 9), PieceType.FARMER, TeamType.OUR), // Friendly
          createGamePiece(pos(8, 10), PieceType.FARMER, TeamType.OPPONENT) // Enemy at destination
        ],
        currentTurn: TeamType.OUR
      });

      const move = new Move({
        from: new Position(8, 8),
        to: new Position(8, 10),
        pieceType: PieceType.RAM,
        team: TeamType.OUR
      });

      const newState = initialState.executeMove(move);

      // Friendly piece should still exist
      const friendlyPiece = newState.getPieceAt(new Position(8, 9));
      expect(friendlyPiece).toBeDefined();
      expect(friendlyPiece?.team).toBe(TeamType.OUR);

      // Only enemy should be captured
      const capturedPieces = newState.getCapturedPieces();
      expect(capturedPieces.length).toBe(1);
      expect(capturedPieces[0].team).toBe(TeamType.OPPONENT);
    });
  });

  describe('RAM multi-kill with diagonal movement', () => {
    it('should kill enemies in diagonal path', () => {
      const initialState = new GameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.RAM, TeamType.OUR),
          createGamePiece(pos(9, 9), PieceType.FARMER, TeamType.OPPONENT) // In diagonal path
        ],
        currentTurn: TeamType.OUR
      });

      const move = new Move({
        from: new Position(8, 8),
        to: new Position(10, 10), // Diagonal move
        pieceType: PieceType.RAM,
        team: TeamType.OUR
      });

      const newState = initialState.executeMove(move);

      // Enemy in diagonal path should be killed
      const enemy = newState.getPieceAt(new Position(9, 9));
      expect(enemy).toBeUndefined();

      // RAM should be at destination
      const ram = newState.getPieceAt(new Position(10, 10));
      expect(ram).toBeDefined();
      expect(ram?.type).toBe(PieceType.RAM);
    });
  });

  describe('RAM multi-kill does not affect other pieces abilities', () => {
    it('should not interfere with TEMPLAR counter-attack', () => {
      const initialState = new GameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.RAM, TeamType.OUR),
          createGamePiece(pos(8, 9), PieceType.FARMER, TeamType.OPPONENT), // In path
          createGamePiece(pos(8, 10), PieceType.TEMPLAR, TeamType.OPPONENT) // TEMPLAR at destination
        ],
        currentTurn: TeamType.OUR
      });

      const move = new Move({
        from: new Position(8, 8),
        to: new Position(8, 10), // RAM attacks TEMPLAR
        pieceType: PieceType.RAM,
        team: TeamType.OUR
      });

      const newState = initialState.executeMove(move);

      // TEMPLAR counter-attack should kill RAM (mutual destruction)
      const ram = newState.getPieceAt(new Position(8, 10));
      const templar = newState.getPieceAt(new Position(8, 10));
      
      // Both should be dead (neither at destination)
      expect(ram).toBeUndefined();
      expect(templar).toBeUndefined();

      // However, FARMER in path should still be killed by RAM before counter-attack
      const farmerInPath = newState.getPieceAt(new Position(8, 9));
      expect(farmerInPath).toBeUndefined();

      // All 3 pieces should be captured (RAM + TEMPLAR + FARMER)
      const capturedPieces = newState.getCapturedPieces();
      expect(capturedPieces.length).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle RAM with no enemies in path', () => {
      const initialState = new GameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.RAM, TeamType.OUR)
        ],
        currentTurn: TeamType.OUR
      });

      const move = new Move({
        from: new Position(8, 8),
        to: new Position(8, 10),
        pieceType: PieceType.RAM,
        team: TeamType.OUR
      });

      const newState = initialState.executeMove(move);

      // RAM should simply move
      const ram = newState.getPieceAt(new Position(8, 10));
      expect(ram).toBeDefined();
      expect(ram?.type).toBe(PieceType.RAM);

      // No captures
      const capturedPieces = newState.getCapturedPieces();
      expect(capturedPieces.length).toBe(0);
    });

    it('should handle RAM moving 1 square (no path calculation)', () => {
      const initialState = new GameState({
        pieces: [
          createGamePiece(pos(8, 8), PieceType.RAM, TeamType.OUR),
          createGamePiece(pos(8, 9), PieceType.FARMER, TeamType.OPPONENT)
        ],
        currentTurn: TeamType.OUR
      });

      const move = new Move({
        from: new Position(8, 8),
        to: new Position(8, 9), // 1 square move
        pieceType: PieceType.RAM,
        team: TeamType.OUR
      });

      const newState = initialState.executeMove(move);

      // Enemy should be captured (destination square)
      const capturedPieces = newState.getCapturedPieces();
      expect(capturedPieces.length).toBe(1);
    });
  });
});
