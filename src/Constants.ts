// Tablero 16x16 para 4 jugadores
export const VERTICAL_AXIS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];
export const HORIZONTAL_AXIS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p"];

export const GRID_SIZE = 50;

export function samePosition(p1: Position, p2: Position) {
  return p1.x === p2.x && p1.y === p2.y;
}

export interface Position {
  x: number;
  y: number;
}

// definimos el tipo de piezas que hay en el juego
export enum PieceType {
  FARMER,
  RAM,
  TRAP,
  KNIGHT,
  TEMPLAR,
  SCOUT,
  TREBUCHET,
  TREASURE,
  KING,
}

// definimos los equipos
export enum TeamType {
  OPPONENT,
  OUR,
  // OPPONENT 2
  // OPPONENT 3
}

// Definimos las props de elementos Piece
export interface Piece {
  image: string;
  position: Position;
  type: PieceType;
  team: TeamType;
  enPassant?: boolean;
  // samePosition: Position;
}

// Definimos las piezas iniciales en el tablero
export const initialBoardState: Piece[] = [
  { image: `assets/images/farmer_b.svg`, position: { x: 4, y: 13 }, type: PieceType.FARMER, team: TeamType.OPPONENT },
  { image: `assets/images/farmer_b.svg`, position: { x: 5, y: 13 }, type: PieceType.FARMER, team: TeamType.OPPONENT },
  { image: `assets/images/farmer_b.svg`, position: { x: 6, y: 13 }, type: PieceType.FARMER, team: TeamType.OPPONENT },
  { image: `assets/images/farmer_b.svg`, position: { x: 7, y: 13 }, type: PieceType.FARMER, team: TeamType.OPPONENT },
  { image: `assets/images/farmer_b.svg`, position: { x: 8, y: 13 }, type: PieceType.FARMER, team: TeamType.OPPONENT },
  { image: `assets/images/farmer_b.svg`, position: { x: 9, y: 13 }, type: PieceType.FARMER, team: TeamType.OPPONENT },
  { image: `assets/images/farmer_b.svg`, position: { x: 10, y: 13 }, type: PieceType.FARMER, team: TeamType.OPPONENT },
  { image: `assets/images/farmer_b.svg`, position: { x: 11, y: 13 }, type: PieceType.FARMER, team: TeamType.OPPONENT },
  { image: `assets/images/ram_b.svg`, position: { x: 4, y: 14 }, type: PieceType.RAM, team: TeamType.OPPONENT },
  { image: `assets/images/ram_b.svg`, position: { x: 11, y: 14 }, type: PieceType.RAM, team: TeamType.OPPONENT },
  { image: `assets/images/trap_b.svg`, position: { x: 5, y: 14 }, type: PieceType.TRAP, team: TeamType.OPPONENT },
  { image: `assets/images/trap_b.svg`, position: { x: 10, y: 14 }, type: PieceType.TRAP, team: TeamType.OPPONENT },
  { image: `assets/images/knight_b.svg`, position: { x: 6, y: 14 }, type: PieceType.KNIGHT, team: TeamType.OPPONENT },
  { image: `assets/images/knight_b.svg`, position: { x: 9, y: 14 }, type: PieceType.KNIGHT, team: TeamType.OPPONENT },
  { image: `assets/images/templar_b.svg`, position: { x: 7, y: 14 }, type: PieceType.TEMPLAR, team: TeamType.OPPONENT },
  { image: `assets/images/templar_b.svg`, position: { x: 8, y: 14 }, type: PieceType.TEMPLAR, team: TeamType.OPPONENT },
  { image: `assets/images/hunter_b.svg`, position: { x: 5, y: 15 }, type: PieceType.SCOUT, team: TeamType.OPPONENT },
  { image: `assets/images/hunter_b.svg`, position: { x: 6, y: 15 }, type: PieceType.SCOUT, team: TeamType.OPPONENT },
  { image: `assets/images/hunter_b.svg`, position: { x: 9, y: 15 }, type: PieceType.SCOUT, team: TeamType.OPPONENT },
  { image: `assets/images/hunter_b.svg`, position: { x: 10, y: 15 }, type: PieceType.SCOUT, team: TeamType.OPPONENT },
  { image: `assets/images/catapult_b.svg`, position: { x: 4, y: 15 }, type: PieceType.TREBUCHET, team: TeamType.OPPONENT },
  { image: `assets/images/catapult_b.svg`, position: { x: 11, y: 15 }, type: PieceType.TREBUCHET, team: TeamType.OPPONENT },
  { image: `assets/images/treasure_b.svg`, position: { x: 8, y: 15 }, type: PieceType.TREASURE, team: TeamType.OPPONENT },
  { image: `assets/images/king_b.svg`, position: { x: 7, y: 15 }, type: PieceType.KING, team: TeamType.OPPONENT },

  { image: `assets/images/farmer_w.svg`, position: { x: 4, y: 2 }, type: PieceType.FARMER, team: TeamType.OUR },
  { image: `assets/images/farmer_w.svg`, position: { x: 5, y: 2 }, type: PieceType.FARMER, team: TeamType.OUR },
  { image: `assets/images/farmer_w.svg`, position: { x: 6, y: 2 }, type: PieceType.FARMER, team: TeamType.OUR },
  { image: `assets/images/farmer_w.svg`, position: { x: 7, y: 2 }, type: PieceType.FARMER, team: TeamType.OUR },
  { image: `assets/images/farmer_w.svg`, position: { x: 8, y: 2 }, type: PieceType.FARMER, team: TeamType.OUR },
  { image: `assets/images/farmer_w.svg`, position: { x: 9, y: 2 }, type: PieceType.FARMER, team: TeamType.OUR },
  { image: `assets/images/farmer_w.svg`, position: { x: 10, y: 2 }, type: PieceType.FARMER, team: TeamType.OUR },
  { image: `assets/images/farmer_w.svg`, position: { x: 11, y: 2 }, type: PieceType.FARMER, team: TeamType.OUR },
  { image: `assets/images/ram_w.svg`, position: { x: 4, y: 1 }, type: PieceType.RAM, team: TeamType.OUR },
  { image: `assets/images/ram_w.svg`, position: { x: 11, y: 1 }, type: PieceType.RAM, team: TeamType.OUR },
  { image: `assets/images/trap_w.svg`, position: { x: 5, y: 1 }, type: PieceType.TRAP, team: TeamType.OUR },
  { image: `assets/images/trap_w.svg`, position: { x: 10, y: 1 }, type: PieceType.TRAP, team: TeamType.OUR },
  { image: `assets/images/knight_w.svg`, position: { x: 6, y: 1 }, type: PieceType.KNIGHT, team: TeamType.OUR },
  { image: `assets/images/knight_w.svg`, position: { x: 9, y: 1 }, type: PieceType.KNIGHT, team: TeamType.OUR },
  { image: `assets/images/templar_w.svg`, position: { x: 7, y: 1 }, type: PieceType.TEMPLAR, team: TeamType.OUR },
  { image: `assets/images/templar_w.svg`, position: { x: 8, y: 1 }, type: PieceType.TEMPLAR, team: TeamType.OUR },
  { image: `assets/images/hunter_w.svg`, position: { x: 5, y: 0 }, type: PieceType.SCOUT, team: TeamType.OUR },
  { image: `assets/images/hunter_w.svg`, position: { x: 6, y: 0 }, type: PieceType.SCOUT, team: TeamType.OUR },
  { image: `assets/images/hunter_w.svg`, position: { x: 9, y: 0 }, type: PieceType.SCOUT, team: TeamType.OUR },
  { image: `assets/images/hunter_w.svg`, position: { x: 10, y: 0 }, type: PieceType.SCOUT, team: TeamType.OUR },
  { image: `assets/images/catapult_w.svg`, position: { x: 4, y: 0 }, type: PieceType.TREBUCHET, team: TeamType.OUR },
  { image: `assets/images/catapult_w.svg`, position: { x: 11, y: 0 }, type: PieceType.TREBUCHET, team: TeamType.OUR },
  { image: `assets/images/treasure_w.svg`, position: { x: 8, y: 0 }, type: PieceType.TREASURE, team: TeamType.OUR },
  { image: `assets/images/king_w.svg`, position: { x: 7, y: 0 }, type: PieceType.KING, team: TeamType.OUR },
];