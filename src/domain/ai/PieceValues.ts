/**
 * Refined Piece Values and Personality Weights for Medieval Chess AI
 * 
 * Values based on strategic analysis considering:
 * - Mobility on 16x16 board
 * - Unique tactical abilities
 * - Synergy with other pieces
 * - Game phase importance
 */

import { PieceType } from '../../Constants';
import { AIPersonality, EvaluationWeights } from './interfaces';

// ============================================================================
// Piece Values (Refined Analysis)
// ============================================================================

/**
 * Refined piece values based on strategic analysis.
 * 
 * Key changes from initial values:
 * - TRAP: 25→40 (information asymmetry is powerful)
 * - KNIGHT: 35→45 (mobility critical on large board)
 * - SCOUT: 40→50 (only counter to traps)
 * - TEMPLAR: 50→55 (defensive value unique)
 * - TREBUCHET: 60→70 (ranged attack paradigm-breaking)
 * - TREASURE: 15→20 (tactical objective)
 * - RAM: 30→35 (destructive power)
 * 
 * @see doc/AI_STRATEGIC_ANALYSIS.md for detailed justification
 */
export const REFINED_PIECE_VALUES: Record<PieceType, number> = {
  [PieceType.FARMER]: 10,      // Base unit, similar to chess pawn
  [PieceType.RAM]: 35,          // Destroys multiple pieces in path
  [PieceType.TRAP]: 40,         // Invisible, information advantage
  [PieceType.KNIGHT]: 45,       // High mobility (3 straight or 2 diagonal)
  [PieceType.SCOUT]: 50,        // Counter-trap utility, 2-3 movement
  [PieceType.TEMPLAR]: 55,      // Counterattack (mutual destruction)
  [PieceType.TREBUCHET]: 70,    // Ranged attack (1-2 distance)
  [PieceType.TREASURE]: 20,     // Tactical objective, must protect
  [PieceType.KING]: 1000        // Game-ending piece (symbolic infinity)
};

/**
 * Position bonuses for board control.
 */
export const POSITION_BONUS = {
  CENTER: 20,                    // Center squares (7-9, 7-9)
  NEAR_CENTER: 10,               // Adjacent to center (6-10, 6-10)
  EDGE: -5,                      // Edge squares (0, 15)
  FORBIDDEN_ZONE_ADJACENT: 15    // Controlling access to forbidden zones
} as const;

/**
 * Center position for calculations (8,8 on 16x16 board).
 */
export const BOARD_CENTER = { x: 8, y: 8 } as const;

/**
 * Board size constant.
 */
export const BOARD_SIZE = 16 as const;

// ============================================================================
// AI Personality Weights (7 Distinct Styles)
// ============================================================================

/**
 * Evaluation weights for each AI personality.
 * 
 * Each personality prioritizes different aspects of the game:
 * - AGGRESSIVE: Maximum pressure, ignores own safety
 * - DEFENSIVE: Fortress mentality, king safety paramount
 * - POSITIONAL: Chess-like, control key squares
 * - TACTICAL: Master of traps and special abilities
 * - OPPORTUNIST: Material-hungry, capture everything
 * - CAUTIOUS: Risk-averse, maintains maximum options
 * - CHAOTIC: Unpredictable, uses all mechanics
 */
export const PERSONALITY_WEIGHTS: Record<AIPersonality, EvaluationWeights> = {
  /**
   * AGGRESSIVE: "Attack is the best defense"
   * - High material weight (captures)
   * - High position weight (pressure on opponent)
   * - High mobility (attacking options)
   * - LOW king safety (ignores danger)
   * - Uses RAM and TREBUCHET aggressively
   */
  [AIPersonality.AGGRESSIVE]: {
    material: 150,        // ⬆️ Prioritize captures
    position: 30,         // ⬆️ Push forward
    mobility: 40,         // ⬆️ Maintain attacking options
    kingSafety: 20,       // ⬇️ Ignore own king safety
    trapControl: 10,      // ⬇️ No time for defensive traps
    specialAbilities: 50, // ⬆️ Use RAM/TREBUCHET offensively
    randomness: 5         // Slight unpredictability
  },

  /**
   * DEFENSIVE: "Safety first, then opportunity"
   * - LOW material weight (won't trade)
   * - LOW position weight (doesn't advance)
   * - MAXIMUM king safety
   * - High trap control (defensive traps)
   * - Uses TEMPLAR to protect king
   */
  [AIPersonality.DEFENSIVE]: {
    material: 80,         // ⬇️ Avoid trades
    position: 10,         // ⬇️ Stay back
    mobility: 20,         // Moderate options
    kingSafety: 100,      // ⬆️⬆️ MAXIMUM protection
    trapControl: 60,      // ⬆️ Defensive trap placement
    specialAbilities: 30, // Use TEMPLAR for protection
    randomness: 0         // Predictable, safe
  },

  /**
   * POSITIONAL: "Control the center, control the game"
   * - Balanced material
   * - MAXIMUM position weight (center control)
   * - High mobility (maintain flexibility)
   * - Moderate king safety
   * - Chess-like strategic play
   */
  [AIPersonality.POSITIONAL]: {
    material: 100,        // Balanced
    position: 80,         // ⬆️⬆️ Control center
    mobility: 60,         // ⬆️ Keep options open
    kingSafety: 50,       // Moderate protection
    trapControl: 40,      // Control key routes
    specialAbilities: 30, // Standard usage
    randomness: 0         // Strategic consistency
  },

  /**
   * TACTICAL: "The trap is not for you, it's for your pieces"
   * - Moderate material (trades for position)
   * - MAXIMUM trap control
   * - High special abilities (combos)
   * - Master of TRAP + SCOUT combinations
   */
  [AIPersonality.TACTICAL]: {
    material: 90,         // Moderate
    position: 30,         // Some control
    mobility: 40,         // Moderate options
    kingSafety: 40,       // Moderate safety
    trapControl: 100,     // ⬆️⬆️ TRAP master
    specialAbilities: 80, // ⬆️ TRAP+SCOUT combos
    randomness: 10        // Surprise tactics
  },

  /**
   * OPPORTUNIST: "Never leave a piece on the table"
   * - MAXIMUM material weight
   * - LOW everything else
   * - Capture-focused, greedy
   * - Will sacrifice position for material
   */
  [AIPersonality.OPPORTUNIST]: {
    material: 200,        // ⬆️⬆️ ONLY captures matter
    position: 10,         // ⬇️ Ignore position
    mobility: 30,         // Some options
    kingSafety: 30,       // ⬇️ Risk king for captures
    trapControl: 20,      // ⬇️ No patience for traps
    specialAbilities: 40, // Standard
    randomness: 5         // Slight variation
  },

  /**
   * CAUTIOUS: "Better to retreat than lose a piece"
   * - Moderate material (won't trade)
   * - MAXIMUM mobility (many escape routes)
   * - High king safety
   * - Avoids risks, maintains options
   */
  [AIPersonality.CAUTIOUS]: {
    material: 70,         // ⬇️ Avoid risky trades
    position: 40,         // Some advancement
    mobility: 80,         // ⬆️⬆️ MAXIMUM options
    kingSafety: 90,       // ⬆️ High safety
    trapControl: 50,      // Moderate traps
    specialAbilities: 20, // ⬇️ Avoid complex moves
    randomness: 0         // Predictable safety
  },

  /**
   * CHAOTIC: "You can't predict what I'll do if I don't know either"
   * - Balanced all weights
   * - MAXIMUM special abilities (uses everything)
   * - HIGH randomness (30% random moves)
   * - Unpredictable, creative
   */
  [AIPersonality.CHAOTIC]: {
    material: 100,        // Balanced
    position: 50,         // Balanced
    mobility: 70,         // High options
    kingSafety: 40,       // Moderate safety
    trapControl: 60,      // Uses traps
    specialAbilities: 100, // ⬆️⬆️ Uses ALL abilities
    randomness: 30        // ⬆️⬆️ 30% random moves
  }
};

/**
 * Default evaluation weights (balanced).
 * Used as fallback if personality not specified.
 */
export const DEFAULT_WEIGHTS: EvaluationWeights = {
  material: 100,
  position: 20,
  mobility: 10,
  kingSafety: 50,
  trapControl: 15,
  specialAbilities: 25,
  randomness: 0
};

/**
 * Get evaluation weights for a personality.
 * Returns default weights if personality not found.
 */
export function getWeightsForPersonality(personality: AIPersonality): EvaluationWeights {
  return PERSONALITY_WEIGHTS[personality] || DEFAULT_WEIGHTS;
}

/**
 * Get piece value, with fallback to 10 if not found.
 */
export function getPieceValue(pieceType: PieceType): number {
  return REFINED_PIECE_VALUES[pieceType] || 10;
}
