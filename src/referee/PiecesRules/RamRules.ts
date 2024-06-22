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
    return false; // El Ariete no puede quedarse en su posición actual.
  }

  if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
    // Movimiento en diagonal o adyacente
    if (!tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) {
      console.log("Valid Move!");
      return true;
    } else if (
      tileIsOccupiedByOpponent(
        desiredPosition.x,
        desiredPosition.y,
        boardState,
        team
      )
    ) {
      console.log("Valid Move!");
      return true;
    }
  } else if (
    (Math.abs(dx) === 2 && dy === 0) ||
    (dx === 0 && Math.abs(dy) === 2)
  ) {
    // Mueve 2 casillas en horizontal o vertical
    const middleX = (initialPosition.x + desiredPosition.x) / 2;
    const middleY = (initialPosition.y + desiredPosition.y) / 2;

    if (tileIsOccupiedByOpponent(middleX, middleY, boardState, team)) {
      return true;
    } else if (
      !tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)
    ) {
      console.log("Valid Move!");
      return true;
    }
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
