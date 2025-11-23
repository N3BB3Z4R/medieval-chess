import { Piece, Position, TeamType, PieceType } from "../../Constants";

export function isValidTrebuchetMove(
  initialPosition: Position,
  desiredPosition: Position,
  type: PieceType,
  team: TeamType,
  boardState: Piece[]
): boolean {
  if (type !== PieceType.TREBUCHET) {
    return false;
  }

  const dx = desiredPosition.x - initialPosition.x;
  const dy = desiredPosition.y - initialPosition.y;

  // TREBUCHET moves 1-2 squares orthogonally
  // FIXED: Added path blocking - cannot jump over pieces
  const isOrthogonal = (dx === 0 && dy !== 0) || (dy === 0 && dx !== 0);
  
  if (!isOrthogonal) {
    return false;
  }

  const distance = Math.abs(dx + dy);
  
  if (distance < 1 || distance > 2) {
    return false; // Must move exactly 1 or 2 squares
  }

  // Check path blocking for 2-square moves
  if (distance === 2) {
    const dirX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
    const dirY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
    const middleX = initialPosition.x + dirX;
    const middleY = initialPosition.y + dirY;
    
    if (tileIsOccupied({ x: middleX, y: middleY }, boardState)) {
      return false; // Path blocked
    }
  }

  // Destination must be empty
  return !tileIsOccupied(desiredPosition, boardState);
}

function tileIsOccupied(position: Position, boardState: Piece[]): boolean {
  return !!boardState.find(
    (p) => p.position.x === position.x && p.position.y === position.y
  );
}
