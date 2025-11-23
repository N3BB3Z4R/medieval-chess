import { Position } from './Position';
import { PieceType, TeamType } from './types';

/**
 * Immutable value object representing a chess move.
 * 
 * Encapsulates all information about a single move including:
 * - Source and destination positions
 * - Piece type and team
 * - Captured piece information (if any)
 * - Special move flags (en passant, special abilities)
 * 
 * @example
 * ```typescript
 * const move = new Move({
 *   from: new Position(4, 4),
 *   to: new Position(4, 5),
 *   pieceType: PieceType.FARMER,
 *   team: TeamType.OUR
 * });
 * ```
 */
export class Move {
  public readonly from: Position;
  public readonly to: Position;
  public readonly pieceType: PieceType;
  public readonly team: TeamType;
  public readonly capturedPiece?: {
    type: PieceType;
    position: Position;
  };
  public readonly isEnPassant: boolean;
  public readonly isSpecialAbility: boolean;
  public readonly boardSnapshot?: ReadonlyArray<{
    readonly type: PieceType;
    readonly team: TeamType;
    readonly position: Position;
  }>; // Board state BEFORE this move (for time travel)

  constructor(params: {
    from: Position;
    to: Position;
    pieceType: PieceType;
    team: TeamType;
    capturedPiece?: {
      type: PieceType;
      position: Position;
    };
    isEnPassant?: boolean;
    isSpecialAbility?: boolean;
    boardSnapshot?: ReadonlyArray<{
      readonly type: PieceType;
      readonly team: TeamType;
      readonly position: Position;
    }>;
  }) {
    this.from = params.from;
    this.to = params.to;
    this.pieceType = params.pieceType;
    this.team = params.team;
    this.capturedPiece = params.capturedPiece;
    this.isEnPassant = params.isEnPassant ?? false;
    this.isSpecialAbility = params.isSpecialAbility ?? false;
    this.boardSnapshot = params.boardSnapshot;
  }

  /**
   * Calculates the delta between source and destination positions.
   * 
   * @returns Object with dx and dy representing horizontal and vertical movement
   */
  public getDelta(): { dx: number; dy: number } {
    const delta = Position.delta(this.from, this.to);
    return { dx: delta.x, dy: delta.y };
  }

  /**
   * Calculates the Manhattan distance of this move.
   * 
   * @returns Sum of absolute horizontal and vertical distances
   */
  public getDistance(): number {
    return Position.manhattanDistance(this.from, this.to);
  }

  /**
   * Checks if this is a diagonal move.
   * 
   * @returns true if both dx and dy are non-zero and equal in absolute value
   */
  public isDiagonal(): boolean {
    const { dx, dy } = this.getDelta();
    return Math.abs(dx) === Math.abs(dy) && dx !== 0 && dy !== 0;
  }

  /**
   * Checks if this is an orthogonal (horizontal or vertical) move.
   * 
   * @returns true if move is purely horizontal or vertical
   */
  public isOrthogonal(): boolean {
    const { dx, dy } = this.getDelta();
    return (dx === 0 && dy !== 0) || (dx !== 0 && dy === 0);
  }

  /**
   * Checks if this is a capturing move (destination has opponent piece).
   * 
   * @returns true if capturedPiece is defined
   */
  public isCapture(): boolean {
    return this.capturedPiece !== undefined;
  }

  /**
   * Checks if two moves are equal (same source, destination, and piece).
   * 
   * @param other - Move to compare with
   * @returns true if moves are identical
   */
  public equals(other: Move): boolean {
    return (
      Position.equals(this.from, other.from) &&
      Position.equals(this.to, other.to) &&
      this.pieceType === other.pieceType &&
      this.team === other.team
    );
  }

  /**
   * Creates a string representation for debugging.
   * 
   * @returns Human-readable move notation (e.g., "FARMER: (4,4) → (4,5)")
   */
  public toString(): string {
    const capture = this.isCapture() ? ' [CAPTURE]' : '';
    const special = this.isEnPassant ? ' [EN PASSANT]' : this.isSpecialAbility ? ' [SPECIAL]' : '';
    return `${this.pieceType}: (${this.from.x},${this.from.y}) → (${this.to.x},${this.to.y})${capture}${special}`;
  }

  /**
   * Creates algebraic notation for this move (chess standard).
   * 
   * @returns String like "e2e4" or "Nf3xd5"
   */
  public toAlgebraicNotation(): string {
    const files = 'abcdefghijklmnop'; // 16x16 board
    const fromFile = files[this.from.x];
    const toFile = files[this.to.x];
    const fromRank = this.from.y + 1;
    const toRank = this.to.y + 1;

    const pieceSymbol = this.getPieceSymbol();
    const capture = this.isCapture() ? 'x' : '';

    return `${pieceSymbol}${fromFile}${fromRank}${capture}${toFile}${toRank}`;
  }

  /**
   * Gets the standard chess symbol for this piece type.
   * 
   * @returns Single character representing piece (K, Q, N, etc.)
   */
  private getPieceSymbol(): string {
    switch (this.pieceType) {
      case PieceType.KING:
        return 'K';
      case PieceType.KNIGHT:
        return 'N';
      case PieceType.TEMPLAR:
        return 'T';
      case PieceType.SCOUT:
        return 'S';
      case PieceType.RAM:
        return 'R';
      case PieceType.TREBUCHET:
        return 'C';
      case PieceType.TRAP:
        return 'Tr';
      case PieceType.TREASURE:
        return 'Ts';
      case PieceType.FARMER:
        return ''; // Pawns have no symbol in algebraic notation
      default:
        return '';
    }
  }
}
