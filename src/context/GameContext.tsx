import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, EliminationReason } from '../domain/game/GameState';
import { TurnManager } from '../domain/game/TurnManager';
import { WinConditionChecker } from '../domain/game/WinConditionChecker';
import { GameConfig, create2PlayerGame } from '../domain/game/GameConfig';
import { BoardFactory } from '../domain/game/BoardFactory';
import { Move } from '../domain/core/Move';
import { Position } from '../domain/core/Position';
import { GameStatus, TeamType as DomainTeamType, PieceType } from '../domain/core/types';

/**
 * Game Context for managing global game state.
 * 
 * Provides:
 * - Immutable GameState entity
 * - TurnManager for turn validation
 * - WinConditionChecker for game-ending detection
 * - Dispatch function for state updates
 * - Time Travel: Review mode for analyzing previous moves
 * 
 * @architecture Clean Architecture - Presentation Layer
 * @solid Dependency Inversion: React depends on domain abstractions
 */

// Domain service instances (singleton pattern)
// const turnManager = new TurnManager(); // Moved to state
const winConditionChecker = new WinConditionChecker();

/**
 * Snapshot of a piece for time travel.
 */
export interface GamePieceSnapshot {
  readonly position: Position;
  readonly type: PieceType;
  readonly team: DomainTeamType;
}

/**
 * Context state shape.
 */
interface GameContextState {
  gameState: GameState;
  gameConfig: GameConfig;
  turnManager: TurnManager;
  winConditionChecker: WinConditionChecker;
  // Time Travel state
  reviewMode: boolean;
  reviewMoveIndex: number | null;
  reviewSnapshot: ReadonlyArray<GamePieceSnapshot> | null;
}

/**
 * Action types for reducer.
 */
type GameAction =
  | { type: 'MAKE_MOVE'; payload: { move: Move } }
  | { type: 'RESET_GAME' }
  | { type: 'SET_STATUS'; payload: { status: GameStatus } }
  | { type: 'SET_CONFIG'; payload: GameConfig }
  | { type: 'SURRENDER'; payload: { team: DomainTeamType } }
  | { type: 'REVIEW_MOVE'; payload: { index: number | null } };

/**
 * Context value with state + dispatch.
 */
interface GameContextValue extends GameContextState {
  dispatch: React.Dispatch<GameAction>;
}

// Create context
const GameContext = createContext<GameContextValue | undefined>(undefined);

/**
 * Reducer for game state updates.
 * 
 * All state changes go through this reducer for predictable updates.
 */
function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'MAKE_MOVE': {
      const { move } = action.payload;
      
      // Validate turn
      if (!state.turnManager.isValidTurn(move, state.gameState)) {
        console.warn('Invalid turn - not current player');
        return state;
      }
      
      // Execute move (returns new GameState)
      let newGameState = state.gameState.executeMove(move) as GameState;
      
      // Check if any player lost their king this turn and eliminate them
      const allTeams = [DomainTeamType.OUR, DomainTeamType.OPPONENT, DomainTeamType.OPPONENT_2, DomainTeamType.OPPONENT_3];
      for (const team of allTeams) {
        // If team lost their king and isn't already eliminated
        if (!newGameState.hasKing(team) && !newGameState.isTeamEliminated(team)) {
          console.log(`[GameContext] Team ${team} lost their king - eliminating player`);
          newGameState = newGameState.eliminatePlayer(team, EliminationReason.KING_CAPTURED) as GameState;
        }
      }
      
      // Check win condition (after eliminations)
      const winStatus = state.winConditionChecker.checkWinCondition(newGameState);
      if (winStatus !== null) {
        newGameState = newGameState.setStatus(winStatus) as GameState;
      } else {
        // Advance turn
        newGameState = state.turnManager.advanceTurn(newGameState) as GameState;
      }
      
      return {
        ...state,
        gameState: newGameState,
      };
    }
    
    case 'RESET_GAME': {
      // Reload pieces using BoardFactory with current config
      const pieces = BoardFactory.createBoard(state.gameConfig);
      const freshGameState = GameState.fromLegacyPieces(
        pieces,
        DomainTeamType.OUR
      );
      
      // Reset TurnManager based on config
      const newTurnManager = new TurnManager(state.gameConfig.playerCount);

      return {
        ...state,
        gameState: freshGameState,
        turnManager: newTurnManager,
      };
    }
    
    case 'SET_STATUS': {
      const newGameState = state.gameState.setStatus(action.payload.status) as GameState;
      return {
        ...state,
        gameState: newGameState,
      };
    }
    
    case 'SURRENDER': {
      const { team } = action.payload;
      
      // Mark player as eliminated due to surrender
      let newGameState = state.gameState.eliminatePlayer(team, EliminationReason.SURRENDER) as GameState;
      
      // Check if game should end (only 1 team left)
      const winStatus = state.winConditionChecker.checkWinCondition(newGameState);
      if (winStatus !== null) {
        newGameState = newGameState.setStatus(winStatus) as GameState;
      } else {
        // Game continues, advance turn if it was the surrendering player's turn
        if (state.gameState.getCurrentTurn() === team) {
          newGameState = state.turnManager.advanceTurn(newGameState) as GameState;
        }
      }
      
      return {
        ...state,
        gameState: newGameState,
      };
    }
    
    case 'SET_CONFIG': {
      const newConfig = action.payload;
      
      // Create new board based on new config
      const pieces = BoardFactory.createBoard(newConfig);
      const freshGameState = GameState.fromLegacyPieces(
        pieces,
        DomainTeamType.OUR
      );
      
      // Create new TurnManager for the new player count
      const newTurnManager = new TurnManager(newConfig.playerCount);

      return {
        ...state,
        gameConfig: newConfig,
        gameState: freshGameState,
        turnManager: newTurnManager,
      };
    }
    
    case 'REVIEW_MOVE': {
      const { index } = action.payload;
      
      // Exit review mode (back to current game)
      if (index === null) {
        return {
          ...state,
          reviewMode: false,
          reviewMoveIndex: null,
          reviewSnapshot: null,
        };
      }
      
      // Enter review mode
      const move = state.gameState.getMoveHistory()[index];
      if (!move || !move.boardSnapshot) {
        console.warn('Cannot review move: no snapshot available');
        return state;
      }
      
      return {
        ...state,
        reviewMode: true,
        reviewMoveIndex: index,
        reviewSnapshot: move.boardSnapshot,
      };
    }
    
    default:
      return state;
  }
}

/**
 * Provider component.
 * 
 * Wrap your app with this to provide game state to all components.
 */
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with default 2-player game
  const defaultConfig = create2PlayerGame();
  
  // Initialize GameState with pieces from BoardFactory
  const initialPieces = BoardFactory.createBoard(defaultConfig);
  const initialGameState = GameState.fromLegacyPieces(
    initialPieces,
    DomainTeamType.OUR
  );

  const [state, dispatch] = useReducer(gameReducer, {
    gameState: initialGameState,
    gameConfig: defaultConfig,
    turnManager: new TurnManager(defaultConfig.playerCount),
    winConditionChecker,
    // Time Travel initial state
    reviewMode: false,
    reviewMoveIndex: null,
    reviewSnapshot: null,
  });  const value: GameContextValue = {
    ...state,
    dispatch,
  };
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

/**
 * Hook to access game context.
 * 
 * @throws Error if used outside GameProvider
 */
export const useGame = (): GameContextValue => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

/**
 * Helper hook for making moves.
 * 
 * Convenience wrapper around dispatch.
 */
export const useMakeMove = () => {
  const { dispatch } = useGame();
  return (from: Position, to: Position, pieceType: any, team: any) => {
    const move = new Move({
      from,
      to,
      pieceType,
      team,
    });
    dispatch({ type: 'MAKE_MOVE', payload: { move } });
  };
};

/**
 * Helper hook for resetting game.
 */
export const useResetGame = () => {
  const { dispatch } = useGame();
  return () => dispatch({ type: 'RESET_GAME' });
};
