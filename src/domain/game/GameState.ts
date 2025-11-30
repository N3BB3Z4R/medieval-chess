/**
 * GameState - Immutable entity representing complete game state.
 * 
 * This is the core entity of the domain layer. All game state changes
 * return NEW instances rather than modifying existing state (immutability).
 * 
 * Implements both GameStateReader and GameStateWriter interfaces for
 * complete state management.
 */

import { Move } from '../core/Move';
import { Position } from '../core/Position';
import { 
  PieceType, 
  TeamType, 
  GameStatus,
  GameStateReader,
  GameStateWriter 
} from '../core/types';
import { isInForbiddenZone, isValidPosition } from '../core/boardConfig';

/**
 * Represents a piece on the board.
 * Simplified version - will be replaced with proper Piece class later.
 */
export interface GamePiece {
  readonly type: PieceType;
  readonly team: TeamType;
  readonly position: Position;
  readonly enPassant?: boolean;
  readonly hasMoved?: boolean;
}

/**
 * Statistics for pieces captured by a team.
 */
export interface CaptureStats {
  readonly capturedPieces: ReadonlyArray<{
    readonly type: PieceType;
    readonly team: TeamType; // Team of the captured piece
  }>;
  readonly totalValue: number; // Sum of piece values
  readonly count: number; // Total pieces captured
}

/**
 * Reason for player elimination.
 */
export enum EliminationReason {
  KING_CAPTURED = 'KING_CAPTURED',
  SURRENDER = 'SURRENDER',
  TIMEOUT = 'TIMEOUT',
}

/**
 * Data stored when a player is eliminated.
 * Used for leaderboard and final statistics.
 */
export interface EliminatedPlayerData {
  readonly team: TeamType;
  readonly reason: EliminationReason;
  readonly eliminationTurn: number; // Turn number when eliminated
  readonly finalScore: number; // Material captured
  readonly capturedPieces: ReadonlyArray<GamePiece>;
  readonly piecesRemaining: number; // Pieces they had when eliminated
}

/**
 * Immutable game state entity.
 * 
 * Central source of truth for all game information. Every state change
 * creates a new GameState instance.
 * 
 * @example
 * ```typescript
 * const initialState = GameState.createInitialState();
 * const move = new Move({...});
 * const newState = initialState.executeMove(move);
 * ```
 */
export class GameState implements GameStateReader, GameStateWriter {
  private readonly _pieces: ReadonlyArray<GamePiece>;
  private readonly _currentTurn: TeamType;
  private readonly _moveHistory: ReadonlyArray<Move>;
  private readonly _status: GameStatus;
  private readonly _capturedPieces: ReadonlyArray<GamePiece>;
  private readonly _trebuchetReadyPositions: ReadonlySet<string>; // Set of "x,y" positions
  private readonly _kingDeathPenalty: ReadonlyMap<TeamType, boolean>; // team -> has penalty
  private readonly _captureStats: ReadonlyMap<TeamType, CaptureStats>; // team -> capture statistics
  private readonly _eliminatedPlayers: ReadonlyMap<TeamType, EliminatedPlayerData>; // team -> elimination data

  constructor(params: {
    pieces: ReadonlyArray<GamePiece>;
    currentTurn: TeamType;
    moveHistory?: ReadonlyArray<Move>;
    status?: GameStatus;
    capturedPieces?: ReadonlyArray<GamePiece>;
    trebuchetReadyPositions?: ReadonlySet<string>;
    kingDeathPenalty?: ReadonlyMap<TeamType, boolean>;
    captureStats?: ReadonlyMap<TeamType, CaptureStats>;
    eliminatedPlayers?: ReadonlyMap<TeamType, EliminatedPlayerData>;
  }) {
    this._pieces = params.pieces;
    this._currentTurn = params.currentTurn;
    this._moveHistory = params.moveHistory ?? [];
    this._status = params.status ?? GameStatus.IN_PROGRESS;
    this._capturedPieces = params.capturedPieces ?? [];
    this._trebuchetReadyPositions = params.trebuchetReadyPositions ?? new Set();
    this._kingDeathPenalty = params.kingDeathPenalty ?? new Map();
    this._captureStats = params.captureStats ?? new Map();
    this._eliminatedPlayers = params.eliminatedPlayers ?? new Map();
  }

  // ==================== GameStateReader Implementation ====================

  /**
   * Gets piece at specified position.
   */
  public getPieceAt(position: Position): GamePiece | undefined {
    return this._pieces.find(piece => 
      Position.equals(piece.position, position)
    );
  }

  /**
   * Gets all pieces for a specific team.
   */
  public getPiecesForTeam(team: TeamType): ReadonlyArray<GamePiece> {
    return this._pieces.filter(piece => piece.team === team);
  }

  /**
   * Gets current turn (which team can move).
   */
  public getCurrentTurn(): TeamType {
    return this._currentTurn;
  }

  /**
   * Gets complete move history.
   */
  public getMoveHistory(): ReadonlyArray<Move> {
    return this._moveHistory;
  }

  /**
   * Gets current game status.
   */
  public getStatus(): GameStatus {
    return this._status;
  }

  /**
   * Checks if a position is under attack by opponent.
   * 
   * TODO: This requires move validation logic - will be implemented
   * when RuleEngine is refactored in Phase 3.
   */
  public isPositionUnderAttack(position: Position, team: TeamType): boolean {
    // Placeholder implementation
    // Will be completed in Phase 3 when MoveValidator system is ready
    return false;
  }

  /**
   * Gets all valid moves for a piece at a position.
   * 
   * TODO: Requires MoveValidator system from Phase 3.
   */
  public getValidMovesFrom(position: Position): ReadonlyArray<Position> {
    // Placeholder implementation
    // Will be completed in Phase 3 when MoveValidator system is ready
    return [];
  }

  /**
   * Checks if TREBUCHET at position is ready for ranged attack.
   * TREBUCHET becomes ready after skipping a turn.
   */
  public isTrebuchetReady(position: Position): boolean {
    const posKey = `${position.x},${position.y}`;
    return this._trebuchetReadyPositions.has(posKey);
  }

  /**
   * Checks if team has KING death penalty (movement -1).
   */
  public hasKingDeathPenalty(team: TeamType): boolean {
    return this._kingDeathPenalty.get(team) === true;
  }

  /**
   * Gets capture statistics for a specific team.
   */
  public getCaptureStatsForTeam(team: TeamType): CaptureStats {
    return this._captureStats.get(team) ?? {
      capturedPieces: [],
      totalValue: 0,
      count: 0
    };
  }

  /**
   * Gets all capture statistics for all teams.
   */
  public getAllCaptureStats(): ReadonlyMap<TeamType, CaptureStats> {
    return this._captureStats;
  }

  /**
   * Gets eliminated players data.
   */
  public getEliminatedPlayers(): ReadonlyMap<TeamType, EliminatedPlayerData> {
    return this._eliminatedPlayers;
  }

  /**
   * Checks if a team has been eliminated.
   */
  public isTeamEliminated(team: TeamType): boolean {
    return this._eliminatedPlayers.has(team);
  }

  /**
   * Gets count of active (non-eliminated) teams.
   */
  public getActiveTeamsCount(): number {
    const allTeams = [TeamType.OUR, TeamType.OPPONENT, TeamType.OPPONENT_2, TeamType.OPPONENT_3];
    return allTeams.filter(team => 
      !this.isTeamEliminated(team) && this.getPiecesForTeam(team).length > 0
    ).length;
  }

  /**
   * Gets KING for specified team.
   */
  public getKing(team: TeamType): GamePiece | undefined {
    return this._pieces.find(p => p.type === PieceType.KING && p.team === team);
  }

  /**
   * Checks if team still has their KING alive.
   */
  public hasKing(team: TeamType): boolean {
    return this.getKing(team) !== undefined;
  }

  // ==================== GameStateWriter Implementation ====================

  /**
   * Executes a move and returns new game state.
   * 
   * This is the primary way to modify game state. Returns a completely
   * new GameState instance with the move applied.
   */
  public executeMove(move: Move): GameState {
    const movingPiece = this.getPieceAt(move.from);
    
    if (!movingPiece) {
      throw new Error(`No piece found at position ${move.from.toString()}`);
    }
    
    // CRITICAL: Validate forbidden zones (4x4 corners)
    if (isInForbiddenZone(move.to.x, move.to.y)) {
      throw new Error(`Cannot move to forbidden zone at ${move.to.toString()}`);
    }
    
    // Validate board bounds
    if (!isValidPosition(move.to.x, move.to.y)) {
      throw new Error(`Position out of bounds: ${move.to.toString()}`);
    }

    // Capture board snapshot BEFORE executing the move (for time travel)
    const boardSnapshot = this._pieces.map(piece => ({
      position: piece.position,
      type: piece.type,
      team: piece.team
    }));

    // TEMPLAR COUNTER-ATTACK CHECK
    // Rule: "si es atacado puede atacar primero y mueren ambas fichas"
    // Check if destination has enemy TEMPLAR - triggers mutual destruction
    const targetPiece = this.getPieceAt(move.to);
    let templarCounterAttack = false;
    
    if (targetPiece && 
        targetPiece.type === PieceType.TEMPLAR && 
        targetPiece.team !== movingPiece.team) {
      templarCounterAttack = true;
    }

    // Create move with snapshot
    const moveWithSnapshot = new Move({
      from: move.from,
      to: move.to,
      pieceType: move.pieceType,
      team: move.team,
      capturedPiece: move.capturedPiece,
      isEnPassant: move.isEnPassant,
      isSpecialAbility: move.isSpecialAbility,
      boardSnapshot: boardSnapshot
    });

    // RAM MULTI-KILL LOGIC
    // Rule: "si en su camino hay uno o dos enemigos los eliminara"
    // RAM kills ALL enemy pieces in path (max 2)
    let ramKilledPieces: GamePiece[] = [];
    if (movingPiece.type === PieceType.RAM) {
      const path = this.calculatePathPositions(move.from, move.to);
      
      // Check each position in path for enemy pieces
      for (const pathPos of path) {
        const pieceAtPath = this.getPieceAt(pathPos);
        if (pieceAtPath && pieceAtPath.team !== movingPiece.team) {
          ramKilledPieces.push(pieceAtPath);
          if (ramKilledPieces.length >= 2) break; // Max 2 kills
        }
      }
    }

    // Create new pieces array with move applied
    let newPieces: GamePiece[];
    
    // TEMPLAR COUNTER-ATTACK: Mutual destruction
    if (templarCounterAttack) {
      // Both pieces die - remove attacker and TEMPLAR, don't move attacker
      newPieces = this._pieces.filter(piece => {
        // Remove TEMPLAR at destination
        if (Position.equals(piece.position, move.to)) {
          return false;
        }
        // Remove attacking piece (stays at origin, but dies)
        if (Position.equals(piece.position, move.from)) {
          return false;
        }
        return true;
      });
      // Don't add moving piece back - it died in counter-attack
    } else {
      // Normal move logic (no counter-attack)
      newPieces = this._pieces
        .filter(piece => {
          // Remove RAM-killed pieces (in path)
          if (ramKilledPieces.some(killed => Position.equals(piece.position, killed.position))) {
            return false;
          }
          // Remove piece at destination (capture) - either explicit or by position
          if (move.capturedPiece && Position.equals(piece.position, move.capturedPiece.position)) {
            return false; // Explicit capture (en passant, special abilities)
          }
          if (Position.equals(piece.position, move.to) && piece.team !== movingPiece.team) {
            return false; // Normal capture - enemy at destination
          }
          // Remove moving piece from old position
          if (Position.equals(piece.position, move.from)) {
            return false;
          }
          return true;
        })
        .concat([{
          ...movingPiece,
          position: move.to,
          enPassant: move.isEnPassant,
          hasMoved: true
        }]);
    }

    // TRAP SPECIAL ABILITIES
    // Rule: "al usarse desaparece" (disappears after use)
    // Only apply if not in TEMPLAR counter-attack (piece already removed)
    if (!templarCounterAttack && movingPiece.type === PieceType.TRAP) {
      // Remove TRAP after it moves/captures
      newPieces = newPieces.filter(piece => 
        !Position.equals(piece.position, move.to) || piece.team !== movingPiece.team
      );
    }

    // SCOUT/KING TRAP DEACTIVATION
    // Rule: "los cazadores y el rey desactivan la trampa"
    // Only apply if not in TEMPLAR counter-attack
    if (!templarCounterAttack && 
        (movingPiece.type === PieceType.SCOUT || movingPiece.type === PieceType.KING)) {
      // Check all 8 adjacent tiles for enemy TRAPs
      const adjacentOffsets = [
        {dx: -1, dy: -1}, {dx: 0, dy: -1}, {dx: 1, dy: -1},
        {dx: -1, dy: 0},                   {dx: 1, dy: 0},
        {dx: -1, dy: 1},  {dx: 0, dy: 1},  {dx: 1, dy: 1}
      ];
      
      for (const offset of adjacentOffsets) {
        const checkX = move.to.x + offset.dx;
        const checkY = move.to.y + offset.dy;
        
        // Skip invalid positions (off-board)
        if (!Position.isValid(checkX, checkY)) {
          continue;
        }

        const checkPos = new Position(checkX, checkY);
        const adjacentPiece = newPieces.find(p => Position.equals(p.position, checkPos));
        
        // If adjacent piece is enemy TRAP, remove it (deactivate)
        if (adjacentPiece && 
            adjacentPiece.type === PieceType.TRAP && 
            adjacentPiece.team !== movingPiece.team) {
          newPieces = newPieces.filter(piece => 
            !Position.equals(piece.position, checkPos)
          );
        }
      }
    }

    // Get captured piece for history
    const allCapturedPieces: GamePiece[] = [];
    
    // Add RAM-killed pieces to captured list
    if (ramKilledPieces.length > 0) {
      allCapturedPieces.push(...ramKilledPieces);
    }
    
    if (move.capturedPiece) {
      const capturedPiece = this.getPieceAt(move.capturedPiece.position);
      if (capturedPiece) {
        allCapturedPieces.push(capturedPiece);
      }
    } else {
      // Check if there's an enemy at destination
      const pieceAtDestination = this.getPieceAt(move.to);
      if (pieceAtDestination && pieceAtDestination.team !== movingPiece.team) {
        // Only add if not already in RAM kills
        if (!ramKilledPieces.some(killed => Position.equals(killed.position, pieceAtDestination.position))) {
          allCapturedPieces.push(pieceAtDestination);
        }
      }
    }

    // Update captured pieces list
    const newCapturedPieces = allCapturedPieces.length > 0
      ? [...this._capturedPieces, ...allCapturedPieces]
      : this._capturedPieces;

    // UPDATE CAPTURE STATISTICS
    // Track which team captured which pieces for scoring
    const pieceValues: Record<PieceType, number> = {
      [PieceType.FARMER]: 1,
      [PieceType.RAM]: 3,
      [PieceType.TRAP]: 2,
      [PieceType.KNIGHT]: 4,
      [PieceType.TEMPLAR]: 5,
      [PieceType.SCOUT]: 3,
      [PieceType.TREBUCHET]: 4,
      [PieceType.TREASURE]: 0,
      [PieceType.KING]: 0,
    };

    const newCaptureStats = new Map(this._captureStats);
    
    if (allCapturedPieces.length > 0) {
      // Get current stats for the capturing team (the team that moved)
      const capturingTeam = movingPiece.team;
      const currentStats = newCaptureStats.get(capturingTeam) ?? {
        capturedPieces: [],
        totalValue: 0,
        count: 0
      };
      
      // Add newly captured pieces to stats
      const newCapturedForTeam = allCapturedPieces.map(piece => ({
        type: piece.type,
        team: piece.team
      }));
      
      const totalNewValue = allCapturedPieces.reduce(
        (sum, piece) => sum + pieceValues[piece.type], 
        0
      );
      
      newCaptureStats.set(capturingTeam, {
        capturedPieces: [...currentStats.capturedPieces, ...newCapturedForTeam],
        totalValue: currentStats.totalValue + totalNewValue,
        count: currentStats.count + allCapturedPieces.length
      });
    }

    // KING DEATH PENALTY
    // Rule: "Si le matan todas nuestras piezas pueden mover una casilla menos excepto el tesoro"
    // Check if a KING was captured - apply movement penalty to that team
    const newKingDeathPenalty = new Map(this._kingDeathPenalty);
    for (const capturedPiece of allCapturedPieces) {
      if (capturedPiece.type === PieceType.KING) {
        newKingDeathPenalty.set(capturedPiece.team, true);
      }
    }

    // Add move with snapshot to history
    const newMoveHistory = [...this._moveHistory, moveWithSnapshot];

    return new GameState({
      pieces: newPieces,
      currentTurn: this._currentTurn, // Will be changed by setCurrentTurn
      moveHistory: newMoveHistory,
      status: this._status,
      capturedPieces: newCapturedPieces,
      trebuchetReadyPositions: this._trebuchetReadyPositions,
      kingDeathPenalty: newKingDeathPenalty,
      captureStats: newCaptureStats,
      eliminatedPlayers: this._eliminatedPlayers
    });
  }

  /**
   * Sets which team's turn it is.
   */
  public setCurrentTurn(team: TeamType): GameState {
    return new GameState({
      pieces: this._pieces,
      currentTurn: team,
      moveHistory: this._moveHistory,
      status: this._status,
      capturedPieces: this._capturedPieces,
      trebuchetReadyPositions: this._trebuchetReadyPositions,
      kingDeathPenalty: this._kingDeathPenalty,
      captureStats: this._captureStats,
      eliminatedPlayers: this._eliminatedPlayers
    });
  }

  /**
   * Updates game status.
   */
  public setStatus(status: GameStatus): GameState {
    return new GameState({
      pieces: this._pieces,
      currentTurn: this._currentTurn,
      moveHistory: this._moveHistory,
      status: status,
      capturedPieces: this._capturedPieces,
      trebuchetReadyPositions: this._trebuchetReadyPositions,
      kingDeathPenalty: this._kingDeathPenalty,
      captureStats: this._captureStats,
      eliminatedPlayers: this._eliminatedPlayers
    });
  }

  /**
   * Eliminates a player from the game.
   * Stores their final stats for leaderboard display.
   */
  public eliminatePlayer(team: TeamType, reason: EliminationReason): GameState {
    // Don't eliminate twice
    if (this.isTeamEliminated(team)) {
      return this;
    }

    // Calculate final stats
    const captureStats = this.getCaptureStatsForTeam(team);
    const piecesRemaining = this.getPiecesForTeam(team).length;
    const eliminationData: EliminatedPlayerData = {
      team,
      reason,
      eliminationTurn: this._moveHistory.length,
      finalScore: captureStats.totalValue,
      capturedPieces: captureStats.capturedPieces.map(cp => ({
        type: cp.type,
        team: cp.team,
        position: new Position(0, 0), // Position doesn't matter for captured pieces
      })),
      piecesRemaining,
    };

    const newEliminatedPlayers = new Map(this._eliminatedPlayers);
    newEliminatedPlayers.set(team, eliminationData);

    return new GameState({
      pieces: this._pieces,
      currentTurn: this._currentTurn,
      moveHistory: this._moveHistory,
      status: this._status,
      capturedPieces: this._capturedPieces,
      trebuchetReadyPositions: this._trebuchetReadyPositions,
      kingDeathPenalty: this._kingDeathPenalty,
      captureStats: this._captureStats,
      eliminatedPlayers: newEliminatedPlayers
    });
  }

  /**
   * Removes a piece from the board.
   */
  public removePiece(position: Position): GameState {
    const pieceToRemove = this.getPieceAt(position);
    const newPieces = this._pieces.filter(piece => 
      !Position.equals(piece.position, position)
    );

    const newCapturedPieces = pieceToRemove
      ? [...this._capturedPieces, pieceToRemove]
      : this._capturedPieces;

    return new GameState({
      pieces: newPieces,
      currentTurn: this._currentTurn,
      moveHistory: this._moveHistory,
      status: this._status,
      capturedPieces: newCapturedPieces,
      trebuchetReadyPositions: this._trebuchetReadyPositions,
      kingDeathPenalty: this._kingDeathPenalty,
      captureStats: this._captureStats,
      eliminatedPlayers: this._eliminatedPlayers
    });
  }

  /**
   * Adds a piece to the board.
   */
  public addPiece(position: Position, pieceType: PieceType, team: TeamType): GameState {
    const newPiece: GamePiece = {
      type: pieceType,
      team: team,
      position: position,
      hasMoved: false
    };

    const newPieces = [...this._pieces, newPiece];

    return new GameState({
      pieces: newPieces,
      currentTurn: this._currentTurn,
      moveHistory: this._moveHistory,
      status: this._status,
      capturedPieces: this._capturedPieces,
      trebuchetReadyPositions: this._trebuchetReadyPositions,
      kingDeathPenalty: this._kingDeathPenalty,
      captureStats: this._captureStats,
      eliminatedPlayers: this._eliminatedPlayers
    });
  }

  // ==================== Utility Methods ====================

  /**
   * Gets all pieces currently on the board.
   */
  public getAllPieces(): ReadonlyArray<GamePiece> {
    return this._pieces;
  }

  /**
   * Gets all captured pieces.
   */
  public getCapturedPieces(): ReadonlyArray<GamePiece> {
    return this._capturedPieces;
  }

  /**
   * Gets the last move made.
   */
  public getLastMove(): Move | undefined {
    return this._moveHistory[this._moveHistory.length - 1];
  }

  /**
   * Checks if this is the first move of the game.
   */
  public isFirstMove(): boolean {
    return this._moveHistory.length === 0;
  }

  /**
   * Gets total number of moves made.
   */
  public getMoveCount(): number {
    return this._moveHistory.length;
  }

  /**
   * Creates a copy with cleared en passant flags.
   * 
   * En passant is only valid for one turn, so flags should be cleared
   * after each move.
   */
  public clearEnPassantFlags(): GameState {
    const newPieces = this._pieces.map(piece => ({
      ...piece,
      enPassant: false
    }));

    return new GameState({
      pieces: newPieces,
      currentTurn: this._currentTurn,
      moveHistory: this._moveHistory,
      status: this._status,
      capturedPieces: this._capturedPieces,
      trebuchetReadyPositions: this._trebuchetReadyPositions,
      kingDeathPenalty: this._kingDeathPenalty,
      captureStats: this._captureStats,
      eliminatedPlayers: this._eliminatedPlayers
    });
  }

  /**
   * Creates a string representation for debugging.
   */
  public toString(): string {
    return `GameState {
  status: ${this._status},
  currentTurn: ${this._currentTurn},
  pieces: ${this._pieces.length},
  moves: ${this._moveHistory.length},
  captured: ${this._capturedPieces.length}
}`;
  }

  /**
   * Calculate all positions in path between from and to (exclusive of endpoints).
   * Used for RAM multi-kill logic.
   * 
   * @param from - Starting position
   * @param to - Ending position
   * @returns Array of positions in path (not including from/to)
   */
  private calculatePathPositions(from: Position, to: Position): Position[] {
    const path: Position[] = [];
    
    // Calculate direction
    const dx = Math.sign(to.x - from.x); // -1, 0, or 1
    const dy = Math.sign(to.y - from.y); // -1, 0, or 1
    
    // Start from position after 'from'
    let currentX = from.x + dx;
    let currentY = from.y + dy;
    
    // Walk along path until we reach 'to' (exclusive)
    while (currentX !== to.x || currentY !== to.y) {
      path.push(new Position(currentX, currentY));
      currentX += dx;
      currentY += dy;
    }
    
    return path;
  }

  // ==================== Factory Methods ====================

  /**
   * Creates an empty game state (for testing).
   */
  public static createEmpty(): GameState {
    return new GameState({
      pieces: [],
      currentTurn: TeamType.OUR,
      status: GameStatus.NOT_STARTED
    });
  }

  /**
   * Creates initial game state with standard piece placement.
   * 
   * TODO: This will be implemented once we refactor initialBoardState
   * from Constants.ts in a future phase.
   */
  public static createInitialState(): GameState {
    // Placeholder - will be implemented when migrating from Constants.ts
    return GameState.createEmpty();
  }

  /**
   * Creates game state from existing pieces (for migration from legacy code).
   * 
   * NOTE: After Phase 3 migration, Constants.ts now exports string enums.
   * This method handles BOTH numeric enums (old) and string enums (new).
   */
  public static fromLegacyPieces(pieces: any[], currentTurn: TeamType = TeamType.OUR): GameState {
    // Helper to convert PieceType (numeric OR string) to domain string enum
    const convertPieceType = (type: any): PieceType => {
      // If already a string enum, return as-is
      if (typeof type === 'string') {
        return type as PieceType;
      }
      
      // If numeric enum, convert to string
      const mapping: Record<number, PieceType> = {
        0: PieceType.FARMER,
        1: PieceType.RAM,
        2: PieceType.TRAP,
        3: PieceType.KNIGHT,
        4: PieceType.TEMPLAR,
        5: PieceType.SCOUT,
        6: PieceType.TREBUCHET,
        7: PieceType.TREASURE,
        8: PieceType.KING,
      };
      return mapping[type] || PieceType.FARMER;
    };

    // Helper to convert TeamType (numeric OR string) to domain string enum
    const convertTeamType = (team: any): TeamType => {
      // If already a string enum, return as-is
      if (typeof team === 'string') {
        return team as TeamType;
      }
      
      // If numeric enum, convert to string
      return team === 1 ? TeamType.OUR : TeamType.OPPONENT;
    };

    // Convert legacy pieces to GamePiece format
    const gamePieces: GamePiece[] = pieces.map(piece => ({
      type: convertPieceType(piece.type),
      team: convertTeamType(piece.team),
      position: new Position(piece.position.x, piece.position.y),
      enPassant: piece.enPassant,
      hasMoved: piece.hasMoved
    }));

    return new GameState({
      pieces: gamePieces,
      currentTurn: currentTurn,
      status: GameStatus.IN_PROGRESS
    });
  }
}
