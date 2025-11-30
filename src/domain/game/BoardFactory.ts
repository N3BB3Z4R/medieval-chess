import { PieceType, TeamType } from '../core/types';
import { Position } from '../core/Position';
import { GamePiece } from './GameState';
import { GameConfig, PlayerConfig } from './GameConfig';

/**
 * Factory for creating board states based on game configuration.
 */
export class BoardFactory {
  /**
   * Creates the initial board state for a given game configuration.
   */
  public static createBoard(config: GameConfig): GamePiece[] {
    const pieces: GamePiece[] = [];
    
    for (const player of config.players) {
      if (player.isActive) {
        pieces.push(...this.createPiecesForPlayer(player));
      }
    }

    return pieces;
  }

  private static createPiecesForPlayer(player: PlayerConfig): GamePiece[] {
    const team = player.team;
    
    // Define piece layout relative to the player's starting edge
    // We'll use a standard layout and rotate/translate it based on the team
    
    // Standard layout (based on bottom player - OUR team)
    // Row 0: Special pieces
    // Row 1: Special pieces + Pawns
    // Row 2: Pawns (Farmers)
    
    // Wait, looking at initialBoardState in Constants.ts:
    // White (OUR): Rows 0, 1, 2
    // Row 0: Scout, Scout, King, Treasure, Scout, Scout, Trebuchet, Trebuchet (Wait, let's check exact coords)
    
    // Let's reverse engineer the exact layout from Constants.ts for "OUR" (White)
    // y=0: Trebuchet(4,0), Scout(5,0), Scout(6,0), Templar(7,0)?? No wait.
    
    /*
    From Constants.ts:
    OUR (White) - Bottom
    y=0: Trebuchet(4), Scout(5), Scout(6), King(7), Treasure(8), Scout(9), Scout(10), Trebuchet(11)
    y=1: Ram(4), Trap(5), Knight(6), Templar(7), Templar(8), Knight(9), Trap(10), Ram(11)
    y=2: Farmer(4..11)
    
    OPPONENT (Black) - Top (y=13, 14, 15)
    y=15: Trebuchet(4), Scout(5), Scout(6), King(7), Treasure(8), Scout(9), Scout(10), Trebuchet(11)
    y=14: Ram(4), Trap(5), Knight(6), Templar(7), Templar(8), Knight(9), Trap(10), Ram(11)
    y=13: Farmer(4..11)
    */

    // We can define a template for the pieces relative to a 16x16 grid where (0,0) is bottom-left.
    // But since we need to rotate for 4 players, it's better to define relative coords (row, col) 
    // from the player's "back rank" and "left side" of their zone.
    
    // The zone is 8 tiles wide (indices 4 to 11).
    // Depth is 3 rows.
    
    const template = [
      // Row 0 (Back rank)
      { type: PieceType.TREBUCHET, x: 0, y: 0 },
      { type: PieceType.SCOUT, x: 1, y: 0 },
      { type: PieceType.SCOUT, x: 2, y: 0 },
      { type: PieceType.KING, x: 3, y: 0 },
      { type: PieceType.TREASURE, x: 4, y: 0 },
      { type: PieceType.SCOUT, x: 5, y: 0 },
      { type: PieceType.SCOUT, x: 6, y: 0 },
      { type: PieceType.TREBUCHET, x: 7, y: 0 },
      
      // Row 1 (Middle rank)
      { type: PieceType.RAM, x: 0, y: 1 },
      { type: PieceType.TRAP, x: 1, y: 1 },
      { type: PieceType.KNIGHT, x: 2, y: 1 },
      { type: PieceType.TEMPLAR, x: 3, y: 1 },
      { type: PieceType.TEMPLAR, x: 4, y: 1 },
      { type: PieceType.KNIGHT, x: 5, y: 1 },
      { type: PieceType.TRAP, x: 6, y: 1 },
      { type: PieceType.RAM, x: 7, y: 1 },
      
      // Row 2 (Front rank)
      { type: PieceType.FARMER, x: 0, y: 2 },
      { type: PieceType.FARMER, x: 1, y: 2 },
      { type: PieceType.FARMER, x: 2, y: 2 },
      { type: PieceType.FARMER, x: 3, y: 2 },
      { type: PieceType.FARMER, x: 4, y: 2 },
      { type: PieceType.FARMER, x: 5, y: 2 },
      { type: PieceType.FARMER, x: 6, y: 2 },
      { type: PieceType.FARMER, x: 7, y: 2 },
    ];

    return template.map(p => {
      const position = this.transformPosition(p.x, p.y, team);
      const piece: GamePiece = {
        type: p.type,
        team: team,
        position: position,
        enPassant: false,
        hasMoved: false
      };
      return piece;
    });
  }

  private static transformPosition(relX: number, relY: number, team: TeamType): Position {
    // Base offset for the 8-wide formation in a 16-wide board
    // The formation is centered: (16 - 8) / 2 = 4. So x starts at 4.
    const centerOffset = 4;

    switch (team) {
      case TeamType.OUR: // Bottom
        return new Position(
          centerOffset + relX,
          relY
        );
      
      case TeamType.OPPONENT: // Top
        return new Position(
          centerOffset + relX,
          15 - relY
        );
      
      case TeamType.OPPONENT_2: // Right
        // Rotated -90 degrees (or 270)
        // "Back rank" is x=15
        // "Left" of formation is y=4 (bottom-up)
        return new Position(
          15 - relY,
          centerOffset + relX // Check: if relX=0 (left), y=4. if relX=7 (right), y=11. Correct.
        );
        
      case TeamType.OPPONENT_3: // Left
        // Rotated 90 degrees
        // "Back rank" is x=0
        // "Left" of formation is y=11 (top-down) -> Wait, let's align with others.
        // If we look from the left side, "Left" is y=11, "Right" is y=4.
        // Let's keep it consistent: "Left" of the formation (Trebuchet) is usually at lower coordinate index?
        // For Bottom: Left is x=4.
        // For Top: Left is x=4 (from viewer perspective) -> actually x=11 if we rotate board?
        // Let's stick to the visual symmetry.
        
        // Left Player:
        // Back rank at x=0.
        // Formation runs y=4 to y=11.
        return new Position(
          relY,
          11 - relX // if relX=0, y=11. if relX=7, y=4.
        );
        
      default:
        throw new Error(`Unknown team: ${team}`);
    }
  }
}
