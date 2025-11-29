import { PieceType, TeamType, Piece, Position } from "../Constants";
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
   * NEW: Validates move using RuleEngine with full GameState.
   * 
   * This method should be used for all new code. It provides:
   * - Access to KING death penalty state
   * - Access to TREBUCHET ready state
   * - Better error messages
   * - Consistent validation across all pieces
   * 
   * @param move - The move to validate
   * @param gameState - Current game state
   * @returns Validation result with detailed feedback
   */
  public isValidMoveWithGameState(move: Move, gameState: GameState): { 
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
   * NEW: Creates a Move object from legacy parameters.
   * 
   * Helper method to convert from old Position/PieceType/TeamType parameters
   * to new Move object.
   */
  private createMoveFromLegacyParams(
    from: Position,
    to: Position,
    pieceType: PieceType,
    team: TeamType
  ): Move {
    return new Move({
      from: new DomainPosition(from.x, from.y),
      to: new DomainPosition(to.x, to.y),
      pieceType: pieceType, // No conversion needed - both use string enums
      team: team // No conversion needed - both use string enums
    });
  }

  /**
   * NEW: Converts legacy Piece[] array to GameState.
   * 
   * Now that types are unified (both use string enums), this is just a structural conversion.
   */
  private convertLegacyBoardToGameState(
    boardState: Piece[],
    currentTurn: TeamType
  ): GameState {
    const gamePieces = boardState.map(piece => ({
      type: piece.type, // No conversion needed - both use string enums
      team: piece.team, // No conversion needed - both use string enums
      position: new DomainPosition(piece.position.x, piece.position.y),
      enPassant: piece.enPassant
      // Note: hasMoved not tracked in legacy Piece type
    }));

    return new GameState({
      pieces: gamePieces,
      currentTurn: currentTurn // No conversion needed - both use string enums
    });
  }
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

  /**
   * LEGACY: Validates move using old function-based system.
   * 
   * This method maintains backwards compatibility with existing code.
   * Internally, it now uses the new RuleEngine for validation.
   * 
   * @deprecated Use isValidMoveWithGameState() for new code
   */
  isValidMove(
    initialPosition: Position,
    desiredPosition: Position,
    type: PieceType,
    team: TeamType,
    boardState: Piece[]
  ): boolean {
    // NEW: Use RuleEngine internally for consistent validation
    try {
      const move = this.createMoveFromLegacyParams(
        initialPosition,
        desiredPosition,
        type,
        team
      );
      
      const gameState = this.convertLegacyBoardToGameState(boardState, team);
      
      const result = this.ruleEngine.validate(move, gameState);
      
      if (result.isValid) {
        console.log("Valid Move!");
      } else if (result.reason) {
        console.log(`Invalid move: ${result.reason}`);
      }
      
      return result.isValid;
    } catch (error) {
      console.error('Move validation error:', error);
      return false;
    }
  }
}
