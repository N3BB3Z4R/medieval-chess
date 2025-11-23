/**
 * Position value object representing a coordinate on the 16x16 board.
 * Immutable with static helper methods for position calculations.
 */
export class Position {
  constructor(
    public readonly x: number,
    public readonly y: number
  ) {
    if (!Position.isValid(x, y)) {
      throw new Error(`Invalid position: (${x}, ${y}). Must be within 0-15 range.`);
    }
  }

  /**
   * Check if two positions are equal
   */
  static equals(a: Position | { x: number; y: number }, b: Position | { x: number; y: number }): boolean {
    return a.x === b.x && a.y === b.y;
  }

  /**
   * Calculate delta (difference) between two positions
   */
  static delta(from: Position | { x: number; y: number }, to: Position | { x: number; y: number }): { x: number; y: number } {
    return {
      x: to.x - from.x,
      y: to.y - from.y
    };
  }

  /**
   * Calculate Euclidean distance between two positions
   */
  static distance(a: Position | { x: number; y: number }, b: Position | { x: number; y: number }): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate Manhattan distance (sum of absolute differences)
   */
  static manhattanDistance(a: Position | { x: number; y: number }, b: Position | { x: number; y: number }): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  /**
   * Check if a position is within board bounds (0-15)
   */
  static isValid(x: number, y: number): boolean {
    return x >= 0 && x < 16 && y >= 0 && y < 16;
  }

  /**
   * Check if position is in one of the forbidden corner zones
   */
  static isInForbiddenZone(pos: Position | { x: number; y: number }): boolean {
    const { x, y } = pos;
    
    // Four corner forbidden zones (4x4 each)
    const forbiddenZones = [
      { xMin: 0, xMax: 3, yMin: 12, yMax: 15 },   // Top-left
      { xMin: 12, xMax: 15, yMin: 12, yMax: 15 }, // Top-right
      { xMin: 0, xMax: 3, yMin: 0, yMax: 3 },     // Bottom-left
      { xMin: 12, xMax: 15, yMin: 0, yMax: 3 }    // Bottom-right
    ];
    
    return forbiddenZones.some(zone =>
      x >= zone.xMin && x <= zone.xMax && y >= zone.yMin && y <= zone.yMax
    );
  }

  /**
   * Create a new Position with validated coordinates
   */
  static create(x: number, y: number): Position | null {
    if (!Position.isValid(x, y)) {
      return null;
    }
    return new Position(x, y);
  }

  /**
   * String representation for debugging
   */
  toString(): string {
    return `(${this.x}, ${this.y})`;
  }

  /**
   * Clone this position
   */
  clone(): Position {
    return new Position(this.x, this.y);
  }
}
