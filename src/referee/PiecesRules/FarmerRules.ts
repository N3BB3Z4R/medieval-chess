import { Piece, Position, TeamType, PieceType } from "../../Constants";

export function isValidFarmerMove(
  initialPosition: Position,
  desiredPosition: Position,
  type: PieceType,
  team: TeamType,
  boardState: Piece[]
): boolean {
  const specialRow = team === TeamType.OUR ? 2 : 13;
  const farmerDirection = team === TeamType.OUR ? 1 : -1;

  if (
    // Si mueve 2 en vertical en dirección de ataque, desde la specialRow...
    initialPosition.x === desiredPosition.x &&
    initialPosition.y === specialRow &&
    desiredPosition.y - initialPosition.y === 2 * farmerDirection &&
    // Comprobamos si no están ocupadas las celdas
    !tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState) &&
    !tileIsOccupied(
      desiredPosition.x,
      desiredPosition.y - farmerDirection,
      boardState
    )
  ) {
    return true;
  } else if (
    // Si no mueve dos, mueve una casilla en cualquier dirección
    (desiredPosition.x === initialPosition.x &&
      desiredPosition.y - initialPosition.y === 1) || // derecha
    (desiredPosition.x === initialPosition.x &&
      desiredPosition.y - initialPosition.y === -1) || // izquierda
    (desiredPosition.y === initialPosition.y &&
      desiredPosition.x - initialPosition.x === 1) || // abajo
    (desiredPosition.y === initialPosition.y &&
      desiredPosition.x - initialPosition.x === -1) // arriba
  ) {
    if (!tileIsOccupied(desiredPosition.x, desiredPosition.y, boardState)) {
      return true;
    }
  } else if (
    // Attack diagonal logic pawn into farmer
    (desiredPosition.x - initialPosition.x === -1 &&
      desiredPosition.y - initialPosition.y === 1) ||
    (desiredPosition.x - initialPosition.x === -1 &&
      desiredPosition.y - initialPosition.y === -1) ||
    (desiredPosition.x - initialPosition.x === 1 &&
      desiredPosition.y - initialPosition.y === 1) ||
    (desiredPosition.x - initialPosition.x === 1 &&
      desiredPosition.y - initialPosition.y === -1)
  ) {
    // Attack diagonal in the upper or bottom left & right corner
    if (
      tileIsOccupiedByOpponent(
        desiredPosition.x,
        desiredPosition.y,
        boardState,
        team
      )
    ) {
      return true;
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

function tileIsOccupiedByOpponent(
  x: number,
  y: number,
  boardState: Piece[],
  team: TeamType
): boolean {
  const piece = boardState.find(
    (p) => p.position.x === x && p.position.y === y && p.team !== team
  );

  // Si atacamos a una trampa, morimos también
  if (piece?.type === PieceType.TRAP) {
    console.log("El atacante está muerto"); // Cambiar por código para eliminar al atacante.
    return true;
  }

  return !!piece;
}
