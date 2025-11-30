import { PieceType, TeamType } from "../Constants";
import { Move } from "../domain/core/Move";
import { Position as DomainPosition } from "../domain/core/Position";
import { GameState } from "../domain/game/GameState";
import { 
  RuleEngine,
  FarmerMoveValidator,
  RamMoveValidator,
  TrapMoveValidator,
  KnightMoveValidator,
  TemplarMoveValidator,
  ScoutMoveValidator,
  TrebuchetMoveValidator,
  TreasureMoveValidator,
  KingMoveValidator
} from "../domain/rules";

/**
 * Referee - Game rule validator and move orchestrator.
 * 
 * This class uses the new RuleEngine system for move validation.
 * All piece-specific rules are handled by dedicated validator classes.
 */
export default class Referee {
  private readonly ruleEngine: RuleEngine;

  constructor() {
    // Initialize RuleEngine with all validators
    this.ruleEngine = new RuleEngine();
    
    // Register all piece validators
    this.ruleEngine.registerValidator(new FarmerMoveValidator());
    this.ruleEngine.registerValidator(new RamMoveValidator());
    this.ruleEngine.registerValidator(new TrapMoveValidator());
    this.ruleEngine.registerValidator(new KnightMoveValidator());
    this.ruleEngine.registerValidator(new TemplarMoveValidator());
    this.ruleEngine.registerValidator(new ScoutMoveValidator());
    this.ruleEngine.registerValidator(new TrebuchetMoveValidator());
    this.ruleEngine.registerValidator(new TreasureMoveValidator());
    this.ruleEngine.registerValidator(new KingMoveValidator());
  }

  /**
   * Validates a move using the RuleEngine and current GameState.
   * 
   * This is the primary validation method for the application.
   * 
   * @param move - The move to validate
   * @param gameState - Current game state
   * @returns Validation result with detailed feedback
   */
  public validateMove(move: Move, gameState: GameState): { 
    isValid: boolean; 
    reason?: string;
  } {
    try {
      const result = this.ruleEngine.validate(move, gameState);
      return result;
    } catch (error) {
      console.error('Validation error:', error);
      return {
        isValid: false,
        reason: error instanceof Error ? error.message : 'Unknown validation error'
      };
    }
  }

  /**
   * Checks if a move is a valid En Passant capture.
   * 
   * @param move - The move to check
   * @param gameState - Current game state
   * @returns true if it is a valid En Passant move
   */
  public checkEnPassant(move: Move, gameState: GameState): boolean {
    const { from, to, pieceType, team } = move;
    
    // Only Farmers (and Kings in this variant) can En Passant
    if (pieceType !== PieceType.FARMER && pieceType !== PieceType.KING) {
      return false;
    }

    const direction = team === TeamType.OUR ? 1 : -1;
    const deltaX = Math.abs(to.x - from.x);
    const deltaY = to.y - from.y;

    // Must be diagonal move (1 square)
    if (deltaX !== 1 || deltaY !== direction) {
      return false;
    }

    // Destination must be empty (En Passant captures empty square)
    if (gameState.getPieceAt(to)) {
      return false;
    }

    // The piece being captured is "behind" the destination
    const capturedPos = new DomainPosition(to.x, to.y - direction);
    const capturedPiece = gameState.getPieceAt(capturedPos);

    // Check if there is a piece to capture and it has enPassant flag
    return !!capturedPiece && 
           capturedPiece.team !== team && 
           !!capturedPiece.enPassant;
  }
}