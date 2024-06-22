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

  const dx = Math.abs(desiredPosition.x - initialPosition.x);
  const dy = Math.abs(desiredPosition.y - initialPosition.y);

  const validDeltas = [
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 2 },
    { dx: 0, dy: -2 },
    { dx: 2, dy: 0 },
    { dx: -2, dy: 0 },
    { dx: 0, dy: 3 },
    { dx: 0, dy: -3 },
    { dx: 3, dy: 0 },
    { dx: -3, dy: 0 },
  ];

  for (const delta of validDeltas) {
    if (dx === delta.dx && dy === delta.dy) {
      return checkMove(desiredPosition, boardState);
    }
  }

  return false;
}

function checkMove(desiredPosition: Position, boardState: Piece[]): boolean {
  if (!tileIsOccupied(desiredPosition, boardState)) {
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
