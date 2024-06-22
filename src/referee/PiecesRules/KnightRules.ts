import { Piece, Position, TeamType, PieceType } from "../../Constants";

export function isValidKnightMove(
  initialPosition: Position,
  desiredPosition: Position,
  type: PieceType,
  team: TeamType,
  boardState: Piece[]
): boolean {
  if (type !== PieceType.KNIGHT) {
    return false;
  }

  const dx = Math.abs(desiredPosition.x - initialPosition.x);
  const dy = Math.abs(desiredPosition.y - initialPosition.y);

  if (dx === 2 && dy === 1) {
    return checkMove(desiredPosition, boardState, team);
  } else if (dx === 1 && dy === 2) {
    return checkMove(desiredPosition, boardState, team);
  }

  return false;
}

function checkMove(
  desiredPosition: Position,
  boardState: Piece[],
  team: TeamType
): boolean {
  if (tileIsOccupiedByOpponent(desiredPosition, boardState, team)) {
    console.log("Valid Move!");
    return true;
  } else if (!tileIsOccupied(desiredPosition, boardState)) {
    console.log("Valid Move!");
    return true;
  }

  return false;
}

function tileIsOccupied(position: Position, boardState: Piece[]): boolean {
  return !!boardState.find(
    (p) => p.position.x === position.x && p.position.y === position.y
  );
}

function tileIsOccupiedByOpponent(
  position: Position,
  boardState: Piece[],
  team: TeamType
): boolean {
  const piece = boardState.find(
    (p) => p.position.x === position.x && p.position.y === position.y
  );
  return !!piece && piece.team !== team;
}
