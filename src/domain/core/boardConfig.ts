/**
 * Core board configuration constants
 * All spatial measurements and board dimensions
 */
export const BoardConfig = {
  GRID_SIZE: 50,           // Tile size in pixels
  BOARD_SIZE: 16,          // 16x16 grid
  TILE_COUNT: 256,         // Total tiles (16 * 16)
  BOARD_WIDTH_PX: 800,     // GRID_SIZE * BOARD_SIZE
  BOARD_HEIGHT_PX: 800,    // GRID_SIZE * BOARD_SIZE
  PIECE_SIZE_PX: 42        // Piece image size
} as const;

/**
 * Coordinate calculation offsets and buffers
 */
export const CoordinateOffsets = {
  DRAG_MIN_BUFFER: 5,      // Minimum drag distance before piece activates
  PIECE_OFFSET: 25,        // Center piece on tile
  MAX_DRAG_BUFFER: 45      // Maximum drag boundary
} as const;

/**
 * Forbidden corner zones on the board (4x4 corners for 4-player layout)
 */
export const ForbiddenZones = [
  { xMin: 0, xMax: 3, yMin: 12, yMax: 15 },   // Top-left corner
  { xMin: 12, xMax: 15, yMin: 12, yMax: 15 }, // Top-right corner
  { xMin: 0, xMax: 3, yMin: 0, yMax: 3 },     // Bottom-left corner
  { xMin: 12, xMax: 15, yMin: 0, yMax: 3 }    // Bottom-right corner
] as const;

/**
 * Check if a position is within board bounds
 */
export function isValidPosition(x: number, y: number): boolean {
  return x >= 0 && x < BoardConfig.BOARD_SIZE && y >= 0 && y < BoardConfig.BOARD_SIZE;
}

/**
 * Check if position is in a forbidden zone
 */
export function isInForbiddenZone(x: number, y: number): boolean {
  return ForbiddenZones.some(zone =>
    x >= zone.xMin && x <= zone.xMax && y >= zone.yMin && y <= zone.yMax
  );
}

/**
 * Calculate board coordinates from screen coordinates
 * Uses relative positioning instead of hardcoded 800px offset
 */
export function screenToBoard(
  clientX: number,
  clientY: number,
  boardRect: DOMRect
): { x: number; y: number } | null {
  const relativeX = clientX - boardRect.left;
  const relativeY = clientY - boardRect.top;
  
  // Check if within board bounds
  if (relativeX < 0 || relativeX > boardRect.width || 
      relativeY < 0 || relativeY > boardRect.height) {
    return null;
  }
  
  // Convert to grid coordinates (y-axis inverted for chess board convention)
  const x = Math.floor(relativeX / BoardConfig.GRID_SIZE);
  const y = Math.floor((boardRect.height - relativeY) / BoardConfig.GRID_SIZE);
  
  return isValidPosition(x, y) ? { x, y } : null;
}
