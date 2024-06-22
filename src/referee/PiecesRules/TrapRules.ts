import { Piece, Position, TeamType, PieceType } from "../../Constants";

export function isValidTrapMove(
  initialPosition: Position,
  desiredPosition: Position,
  type: PieceType,
  team: TeamType,
  boardState: Piece[]
): boolean {
  if (type !== PieceType.TRAP) {
    return false;
  }

  const dx = Math.abs(desiredPosition.x - initialPosition.x);
  const dy = Math.abs(desiredPosition.y - initialPosition.y);

  const validDeltas = [
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 1 },
    { dx: -1, dy: -1 },
    { dx: 2, dy: 2 },
    { dx: 2, dy: -2 },
    { dx: -2, dy: 2 },
    { dx: -2, dy: -2 },
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
