import { Piece, Position, PieceType } from "../../Constants";

export function isValidTemplarMove(
  initialPosition: Position,
  desiredPosition: Position,
  type: PieceType,
  boardState: Piece[]
): boolean {
  if (type !== PieceType.TEMPLAR) {
    return false;
  }

  if (desiredPosition.y === initialPosition.y) {
    if (desiredPosition.x - initialPosition.x === -2) {
      if (
        !tileIsOccupied(desiredPosition.x + 1, desiredPosition.y, boardState) &&
        !tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)
      ) {
        return true;
      }
    } else if (desiredPosition.x - initialPosition.x === 2) {
      if (
        !tileIsOccupied(desiredPosition.x - 1, desiredPosition.y, boardState) &&
        !tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)
      ) {
        return true;
      }
    } else if (
      desiredPosition.x - initialPosition.x === -1 ||
      desiredPosition.x - initialPosition.x === 1
    ) {
      if (!tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) {
        return true;
      }
    }
  } else if (desiredPosition.x === initialPosition.x) {
    if (desiredPosition.y - initialPosition.y === -2) {
      if (
        !tileIsOccupied(desiredPosition.x, desiredPosition.y + 1, boardState) &&
        !tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)
      ) {
        return true;
      }
    } else if (desiredPosition.y - initialPosition.y === 2) {
      if (
        !tileIsOccupied(desiredPosition.x, desiredPosition.y - 1, boardState) &&
        !tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)
      ) {
        return true;
      }
    } else if (
      desiredPosition.y - initialPosition.y === -1 ||
      desiredPosition.y - initialPosition.y === 1
    ) {
      if (!tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) {
        return true;
      }
    }
  }

  return false;
}

function tileIsOccupied(x: number, y: number, boardState: Piece[]): boolean {
  const piece = boardState.find(
    (p) => p.position.x === x && p.position.y === y
  );
  return !!piece;
}
