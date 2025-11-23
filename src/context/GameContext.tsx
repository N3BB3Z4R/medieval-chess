import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState } from '../domain/game/GameState';
import { TurnManager } from '../domain/game/TurnManager';
import { WinConditionChecker } from '../domain/game/WinConditionChecker';
import { Move } from '../domain/core/Move';
import { Position } from '../domain/core/Position';
import { GameStatus } from '../domain/core/types';

/**
 * Game Context for managing global game state.
 * 
 * Provides:
 * - Immutable GameState entity
 * - TurnManager for turn validation
 * - WinConditionChecker for game-ending detection
 * - Dispatch function for state updates
 * 
 * @architecture Clean Architecture - Presentation Layer
 * @solid Dependency Inversion: React depends on domain abstractions
 */

// Domain service instances (singleton pattern)
const turnManager = new TurnManager();
const winConditionChecker = new WinConditionChecker();

/**
 * Context state shape.
 */
interface GameContextState {
  gameState: GameState;
  turnManager: TurnManager;
  winConditionChecker: WinConditionChecker;
}

/**
 * Action types for reducer.
 */
type GameAction =
  | { type: 'MAKE_MOVE'; payload: { move: Move } }
  | { type: 'RESET_GAME' }
  | { type: 'SET_STATUS'; payload: { status: GameStatus } };

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
      
      // Check win condition
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
      return {
        ...state,
        gameState: GameState.createEmpty(), // TODO: Use createInitialState() when implemented
      };
    }
    
    case 'SET_STATUS': {
      const newGameState = state.gameState.setStatus(action.payload.status) as GameState;
      return {
        ...state,
        gameState: newGameState,
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
  const [state, dispatch] = useReducer(gameReducer, {
    gameState: GameState.createEmpty(), // TODO: Initialize with starting pieces
    turnManager,
    winConditionChecker,
  });
  
  const value: GameContextValue = {
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
