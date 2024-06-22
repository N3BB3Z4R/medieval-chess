import { PieceType, TeamType, Piece, Position } from "../Constants";
import { isValidFarmerMove } from "./PiecesRules/FarmerRules";
import { isValidKingMove } from "./PiecesRules/KingRules";
import { isValidKnightMove } from "./PiecesRules/KnightRules";
import { isValidRamMove } from "./PiecesRules/RamRules";
import { isValidScoutMove } from "./PiecesRules/ScoutRules";
import { isValidTemplarMove } from "./PiecesRules/TemplarRules";
import { isValidTrapMove } from "./PiecesRules/TrapRules";
import { isValidTreasureMove } from "./PiecesRules/TreasureRules";
import { isValidTrebuchetMove } from "./PiecesRules/TrebuchetRules";

export default class Referee {
  // funcion de chequear si tile esta ocupada, y ponernos si la pieza que hay es un enemigo
  tileIsOccupied(x: number, y: number, boardState: Piece[]): boolean {
    const piece = boardState.find(
      (p) => p.position.x === x && p.position.y === y
    );

    return !!piece;
  }

  // Funcion de chequeo de tiles para atacar, para la catapulta
  // SI ATACAMOS A UNA TRAMPA MORIMOS TAMBIEN
  tileIsOccupiedByOpponent(
    x: number,
    y: number,
    boardState: Piece[],
    team: TeamType
  ): boolean {
    const piece = boardState.find(
      (p) => p.position.x === x && p.position.y === y && p.team !== team
    );

    if (piece?.type === PieceType.TRAP) {
      console.log("el atacante está muerto");
      return true;
    }

    return !!piece;
  }

  isEnPassantMove(
    initialPosition: Position,
    desiredPosition: Position,
    type: PieceType,
    team: TeamType,
    boardState: Piece[]
  ) {
    const farmerDirection = team === TeamType.OUR ? 1 : -1;
    const deltaX = Math.abs(desiredPosition.x - initialPosition.x);
    const deltaY = desiredPosition.y - initialPosition.y;

    if (
      (type === PieceType.FARMER || type === PieceType.KING) &&
      deltaX === 1 &&
      deltaY === farmerDirection
    ) {
      return boardState.some(
        (p) =>
          p.position.x === desiredPosition.x &&
          p.position.y === desiredPosition.y - farmerDirection &&
          p.enPassant
      );
    }

    return false;
  }

  isValidMove(
    initialPosition: Position,
    desiredPosition: Position,
    type: PieceType,
    team: TeamType,
    boardState: Piece[]
  ) {
    // reglas de movimiento para Campesino / Samurai
    if (
      isValidFarmerMove(
        initialPosition,
        desiredPosition,
        type,
        team,
        boardState
      )
    ) {
      console.log("Valid Move!");
      return true;
    }

    // reglas de movimiento para Templario
    if (
      isValidTemplarMove(initialPosition, desiredPosition, type, boardState)
    ) {
      console.log("Valid Move!");
      return true;
    }

    // reglas de movimiento para Ariete / RAM
    if (
      isValidRamMove(initialPosition, desiredPosition, type, team, boardState)
    ) {
      console.log("Valid Move!");
      return true;
    }

    // Refactor Reglas Caballeros
    if (
      isValidKnightMove(
        initialPosition,
        desiredPosition,
        type,
        team,
        boardState
      )
    ) {
      console.log("Valid Move!");
      return true;
    }

    // reglas de movimiento para Trampa
    if (
      isValidTrapMove(initialPosition, desiredPosition, type, team, boardState)
    ) {
      console.log("Valid Move!");
      return true;
    }

    // reglas de movimiento para Explorador / Cazador / Nobles?
    if (
      isValidScoutMove(initialPosition, desiredPosition, type, team, boardState)
    ) {
      console.log("Valid Move!");
      return true;
    }

    // reglas de movimiento para Catapulta
    if (
      isValidTrebuchetMove(
        initialPosition,
        desiredPosition,
        type,
        team,
        boardState
      )
    ) {
      console.log("Valid Move!");
      return true;
    }

    // reglas de movimiento para Tesoro
    if (type === PieceType.TREASURE) {
      if (
        isValidTreasureMove(
          initialPosition,
          desiredPosition,
          type,
          team,
          boardState
        )
      ) {
        console.log("Valid Move!");
        return true;
      }
    }

    // reglas de movimiento para Rey
    if (type === PieceType.KING) {
      if (
        isValidKingMove(
          initialPosition,
          desiredPosition,
          type,
          team,
          boardState
        )
      ) {
        console.log("Valid Move!");
        return true;
      }
    }

    return false;
  }
}
