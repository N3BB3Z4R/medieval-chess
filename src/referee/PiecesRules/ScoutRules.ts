import { Piece, Position, TeamType, PieceType } from "../../Constants";

export function isValidScoutMove(
  initialPosition: Position,
  desiredPosition: Position,
  type: PieceType,
  team: TeamType,
  boardState: Piece[]
): boolean {
  if (type !== PieceType.SCOUT) {
    return false;
  }

  const dx = desiredPosition.x - initialPosition.x;
  const dy = desiredPosition.y - initialPosition.y;

  // SCOUT moves 2-3 squares orthogonally
  // FIXED: Added path blocking - cannot jump over pieces
  const isOrthogonal = (dx === 0 && dy !== 0) || (dy === 0 && dx !== 0);
  
  if (!isOrthogonal) {
    return false;
  }

  const distance = Math.abs(dx + dy);
  
  if (distance < 2 || distance > 3) {
    return false; // Must move exactly 2 or 3 squares
  }

  // Check path blocking
  const dirX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
  const dirY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);

  // Check all intermediate tiles
  for (let i = 1; i < distance; i++) {
    const checkX = initialPosition.x + (dirX * i);
    const checkY = initialPosition.y + (dirY * i);
    
    if (tileIsOccupied({ x: checkX, y: checkY }, boardState)) {
      return false; // Path blocked
    }
  }

  // Destination must be empty (scouts don't capture by moving)
  return !tileIsOccupied(desiredPosition, boardState);
}

function tileIsOccupied(position: Position, boardState: Piece[]): boolean {
  return !!boardState.find(
    (p) => p.position.x === position.x && p.position.y === position.y
  );
}
