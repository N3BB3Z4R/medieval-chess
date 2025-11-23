/**
 * Validator Exports
 * 
 * Central export point for all piece validators.
 * Import validators from here to maintain clean dependencies.
 */

export type { MoveValidator } from './MoveValidator';
export { BaseMoveValidator, ValidationResult } from './MoveValidator';
export { RuleEngine } from './RuleEngine';

// Piece-specific validators
export { FarmerMoveValidator } from './validators/FarmerMoveValidator';
export { RamMoveValidator } from './validators/RamMoveValidator';
export { TrapMoveValidator } from './validators/TrapMoveValidator';
export { KnightMoveValidator } from './validators/KnightMoveValidator';
export { TemplarMoveValidator } from './validators/TemplarMoveValidator';
export { ScoutMoveValidator } from './validators/ScoutMoveValidator';
export { TrebuchetMoveValidator } from './validators/TrebuchetMoveValidator';
export { TreasureMoveValidator } from './validators/TreasureMoveValidator';
export { KingMoveValidator } from './validators/KingMoveValidator';
