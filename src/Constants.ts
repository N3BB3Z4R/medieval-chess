// ============================================================================
// TYPE SYSTEM MIGRATION (Phase 3)
// ============================================================================
// Re-export domain types for backward compatibility.
// This allows gradual migration of components from numeric enums to string enums.
// 
// MIGRATION STRATEGY:
// 1. Components import from Constants.ts (this file) ✅
// 2. Constants.ts re-exports domain types ✅
// 3. Components gradually update to import from domain/core/types
// 4. Once all components migrated, remove these re-exports
// 5. Delete legacy numeric enums below
// ============================================================================

import { 
  PieceType as DomainPieceType, 
  TeamType as DomainTeamType 
} from './domain/core/types';

// Re-export domain types as main exports
export { PieceType, TeamType } from './domain/core/types';

// ============================================================================
// BOARD CONFIGURATION
// ============================================================================

// Tablero 16x16 para 4 jugadores
export const VERTICAL_AXIS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
];
export const HORIZONTAL_AXIS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
];

export const GRID_SIZE = 50;

export function samePosition(p1: Position, p2: Position) {
  return p1.x === p2.x && p1.y === p2.y;
}

export interface Position {
  x: number;
  y: number;
}

// DEPRECATED: Legacy numeric enums (will be removed after migration)
// These are kept temporarily for components that haven't migrated yet
/** @deprecated Use domain string enum PieceType instead */
export enum LegacyPieceType {
  FARMER = 0,
  RAM = 1,
  TRAP = 2,
  KNIGHT = 3,
  TEMPLAR = 4,
  SCOUT = 5,
  TREBUCHET = 6,
  TREASURE = 7,
  KING = 8,
}

/** @deprecated Use domain string enum TeamType instead */
export enum LegacyTeamType {
  OPPONENT = 0,
  OUR = 1,
  // OPPONENT 2
  // OPPONENT 3
}

// ============================================================================
// PIECE INTERFACE
// ============================================================================
// Now uses domain string enums (PieceType, TeamType)
export interface Piece {
  image: string;
  position: Position;
  type: DomainPieceType; // String enum from domain
  team: DomainTeamType; // String enum from domain
  enPassant?: boolean;
}

// ============================================================================
// INITIAL BOARD STATE
// ============================================================================
// Now uses domain string enums (PieceType.FARMER = 'FARMER', TeamType.OPPONENT = 'OPPONENT')
export const initialBoardState: Piece[] = [
  {
    image: `assets/images/farmer_b.svg`,
    position: { x: 4, y: 13 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/farmer_b.svg`,
    position: { x: 5, y: 13 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/farmer_b.svg`,
    position: { x: 6, y: 13 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/farmer_b.svg`,
    position: { x: 7, y: 13 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/farmer_b.svg`,
    position: { x: 8, y: 13 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/farmer_b.svg`,
    position: { x: 9, y: 13 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/farmer_b.svg`,
    position: { x: 10, y: 13 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/farmer_b.svg`,
    position: { x: 11, y: 13 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/ram_b.svg`,
    position: { x: 4, y: 14 },
    type: DomainPieceType.RAM,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/ram_b.svg`,
    position: { x: 11, y: 14 },
    type: DomainPieceType.RAM,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/trap_b.svg`,
    position: { x: 5, y: 14 },
    type: DomainPieceType.TRAP,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/trap_b.svg`,
    position: { x: 10, y: 14 },
    type: DomainPieceType.TRAP,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/knight_b.svg`,
    position: { x: 6, y: 14 },
    type: DomainPieceType.KNIGHT,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/knight_b.svg`,
    position: { x: 9, y: 14 },
    type: DomainPieceType.KNIGHT,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/templar_b.svg`,
    position: { x: 7, y: 14 },
    type: DomainPieceType.TEMPLAR,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/templar_b.svg`,
    position: { x: 8, y: 14 },
    type: DomainPieceType.TEMPLAR,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/hunter_b.svg`,
    position: { x: 5, y: 15 },
    type: DomainPieceType.SCOUT,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/hunter_b.svg`,
    position: { x: 6, y: 15 },
    type: DomainPieceType.SCOUT,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/hunter_b.svg`,
    position: { x: 9, y: 15 },
    type: DomainPieceType.SCOUT,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/hunter_b.svg`,
    position: { x: 10, y: 15 },
    type: DomainPieceType.SCOUT,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/catapult_b.svg`,
    position: { x: 4, y: 15 },
    type: DomainPieceType.TREBUCHET,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/catapult_b.svg`,
    position: { x: 11, y: 15 },
    type: DomainPieceType.TREBUCHET,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/treasure_b.svg`,
    position: { x: 8, y: 15 },
    type: DomainPieceType.TREASURE,
    team: DomainTeamType.OPPONENT,
  },
  {
    image: `assets/images/king_b.svg`,
    position: { x: 7, y: 15 },
    type: DomainPieceType.KING,
    team: DomainTeamType.OPPONENT,
  },

  {
    image: `assets/images/farmer_w.svg`,
    position: { x: 4, y: 2 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/farmer_w.svg`,
    position: { x: 5, y: 2 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/farmer_w.svg`,
    position: { x: 6, y: 2 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/farmer_w.svg`,
    position: { x: 7, y: 2 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/farmer_w.svg`,
    position: { x: 8, y: 2 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/farmer_w.svg`,
    position: { x: 9, y: 2 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/farmer_w.svg`,
    position: { x: 10, y: 2 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/farmer_w.svg`,
    position: { x: 11, y: 2 },
    type: DomainPieceType.FARMER,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/ram_w.svg`,
    position: { x: 4, y: 1 },
    type: DomainPieceType.RAM,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/ram_w.svg`,
    position: { x: 11, y: 1 },
    type: DomainPieceType.RAM,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/trap_w.svg`,
    position: { x: 5, y: 1 },
    type: DomainPieceType.TRAP,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/trap_w.svg`,
    position: { x: 10, y: 1 },
    type: DomainPieceType.TRAP,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/knight_w.svg`,
    position: { x: 6, y: 1 },
    type: DomainPieceType.KNIGHT,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/knight_w.svg`,
    position: { x: 9, y: 1 },
    type: DomainPieceType.KNIGHT,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/templar_w.svg`,
    position: { x: 7, y: 1 },
    type: DomainPieceType.TEMPLAR,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/templar_w.svg`,
    position: { x: 8, y: 1 },
    type: DomainPieceType.TEMPLAR,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/hunter_w.svg`,
    position: { x: 5, y: 0 },
    type: DomainPieceType.SCOUT,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/hunter_w.svg`,
    position: { x: 6, y: 0 },
    type: DomainPieceType.SCOUT,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/hunter_w.svg`,
    position: { x: 9, y: 0 },
    type: DomainPieceType.SCOUT,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/hunter_w.svg`,
    position: { x: 10, y: 0 },
    type: DomainPieceType.SCOUT,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/catapult_w.svg`,
    position: { x: 4, y: 0 },
    type: DomainPieceType.TREBUCHET,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/catapult_w.svg`,
    position: { x: 11, y: 0 },
    type: DomainPieceType.TREBUCHET,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/treasure_w.svg`,
    position: { x: 8, y: 0 },
    type: DomainPieceType.TREASURE,
    team: DomainTeamType.OUR,
  },
  {
    image: `assets/images/king_w.svg`,
    position: { x: 7, y: 0 },
    type: DomainPieceType.KING,
    team: DomainTeamType.OUR,
  },
];
