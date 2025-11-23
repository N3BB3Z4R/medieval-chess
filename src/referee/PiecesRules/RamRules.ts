import { Piece, Position, TeamType, PieceType } from "../../Constants";

export function isValidRamMove(
  initialPosition: Position,
  desiredPosition: Position,
  type: PieceType,
  team: TeamType,
  boardState: Piece[]
): boolean {
  if (
    type !== PieceType.RAM ||
    (team !== TeamType.OUR && team !== TeamType.OPPONENT)
  ) {
    return false;
  }

  const dx = desiredPosition.x - initialPosition.x;
  const dy = desiredPosition.y - initialPosition.y;

  if (dx === 0 && dy === 0) {
    return false; // RAM cannot stay in current position
  }

  // FIXED: RAM can ONLY move orthogonally (not diagonally)
  // Rule: "Mueve 1 o 2 casillas, si en su camino hay uno o dos enemigos los eliminara"
  const isOrthogonal = (dx === 0 && dy !== 0) || (dy === 0 && dx !== 0);
  
  if (!isOrthogonal) {
    return false; // Must move in straight line (horizontal/vertical only)
  }

  if (Math.abs(dx) === 1 || Math.abs(dy) === 1) {
    // Move 1 square orthogonally
    if (!tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) {
      return true;
    } else if (
      tileIsOccupiedByOpponent(
        desiredPosition.x,
        desiredPosition.y,
        boardState,
        team
      )
    ) {
      return true; // Can capture
    }
  } else if (Math.abs(dx) === 2 || Math.abs(dy) === 2) {
    // Move 2 squares orthogonally - eliminates enemies in path AND destination
    const middleX = (initialPosition.x + desiredPosition.x) / 2;
    const middleY = (initialPosition.y + desiredPosition.y) / 2;

    // Can move if: middle tile has enemy OR is empty, AND destination allows move/capture
    const middleHasEnemy = tileIsOccupiedByOpponent(middleX, middleY, boardState, team);
    const middleIsEmpty = !tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState);
    const destIsEmpty = !tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState);
    const destHasEnemy = tileIsOccupiedByOpponent(desiredPosition.x, desiredPosition.y, boardState, team);
    
    // RAM eliminates ALL enemies in its path (middle + destination)
    return (middleHasEnemy || middleIsEmpty) && (destIsEmpty || destHasEnemy);
  }

  return false;
}

function tileIsOccupied(x: number, y: number, boardState: Piece[]): boolean {
  return !!boardState.find((p) => p.position.x === x && p.position.y === y);
}

function tileIsOccupiedByOpponent(
  x: number,
  y: number,
  boardState: Piece[],
  team: TeamType
): boolean {
  const piece = boardState.find(
    (p) => p.position.x === x && p.position.y === y
  );
  return !!piece && piece.team !== team;
}
