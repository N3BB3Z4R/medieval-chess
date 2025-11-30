/**
 * useGameLoop Hook - Automatic turn management with AI support
 * 
 * Handles:
 * - AI turn detection
 * - Automatic move execution
 * - Turn switching
 * - Processing state management
 * 
 * Usage:
 * ```typescript
 * const { isProcessingAI } = useGameLoop({
 *   gameState,
 *   gameConfig,
 *   onMoveExecuted: (move) => executeMove(move)
 * });
 * ```
 */

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { GameState } from '../domain/game/GameState';
import { Move } from '../domain/core/Move';
import { AIConfig } from '../domain/ai/interfaces';
import { GameConfig } from '../domain/game/GameConfig';
import { useAI } from './useAI';

interface UseGameLoopOptions {
  gameState: GameState;
  gameConfig: GameConfig; // Need this to know which player is AI
  onMoveExecuted: (move: Move) => void;
  onAIThinking?: (isThinking: boolean) => void;
  // Deprecated options kept for compatibility but ignored
  gameMode?: 'pvp' | 'ai';
  aiConfig?: AIConfig | null;
}

interface UseGameLoopReturn {
  isProcessingAI: boolean;
  aiStats: ReturnType<typeof useAI>['aiStats'];
}

/**
 * Hook for managing game loop with AI support.
 * 
 * @param options - Game loop configuration
 * @returns Processing state and AI stats
 */
export function useGameLoop(options: UseGameLoopOptions): UseGameLoopReturn {
  const {
    gameState,
    gameConfig,
    onMoveExecuted,
    onAIThinking
  } = options;

  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const processingRef = useRef(false); // Prevent multiple simultaneous AI calculations
  
  // Determine current AI config based on whose turn it is
  const currentTurn = gameState.getCurrentTurn();
  const currentPlayer = gameConfig.players.find(p => p.team === currentTurn);
  
  const currentAIConfig = useMemo(() => {
    if (currentPlayer?.isAI && currentPlayer.aiConfig) {
      return currentPlayer.aiConfig;
    }
    return null;
  }, [currentPlayer]);

  // Initialize AI with current player's config (if they are AI)
  const { calculateMove, isThinking, aiStats } = useAI(currentAIConfig);

  // Notify parent of AI thinking state
  useEffect(() => {
    if (onAIThinking) {
      onAIThinking(isThinking);
    }
  }, [isThinking, onAIThinking]);

  /**
   * Execute AI move if it's AI's turn.
   */
  const processAITurn = useCallback(async () => {
    // Prevent multiple simultaneous calculations
    if (processingRef.current) {
      console.log('[useGameLoop] Already processing, skipping...');
      return;
    }

    const currentTurn = gameState.getCurrentTurn();
    const currentPlayer = gameConfig.players.find(p => p.team === currentTurn);
    const isAITurn = currentPlayer?.isAI === true;

    console.log('[useGameLoop] Turn check:', {
      currentTurn,
      currentPlayer,
      isAI: currentPlayer?.isAI,
      isAITurn,
      isProcessingAI,
      processingRef: processingRef.current
    });

    // Skip if not AI's turn or already processing
    if (!isAITurn || isProcessingAI) {
      return;
    }

    // Skip if game is over
    const status = gameState.getStatus();
    if (status !== 'IN_PROGRESS') {
      return;
    }

    console.log('[useGameLoop] AI turn detected, calculating move...');
    processingRef.current = true;
    setIsProcessingAI(true);

    try {
      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));

      // Calculate AI move
      const aiMove = await calculateMove(gameState);

      if (aiMove) {
        console.log('[useGameLoop] AI move calculated:', aiMove);
        // Execute move
        onMoveExecuted(aiMove);
      } else {
        console.warn('[useGameLoop] AI returned no move - no valid moves available');
      }
    } catch (error) {
      console.error('[useGameLoop] Error processing AI turn:', error);
    } finally {
      processingRef.current = false;
      setIsProcessingAI(false);
    }
  }, [gameState, gameConfig, isProcessingAI, calculateMove, onMoveExecuted]);

  // Trigger AI move when turn changes
  useEffect(() => {
    const currentTurn = gameState.getCurrentTurn();
    const currentPlayer = gameConfig.players.find(p => p.team === currentTurn);
    const isAITurn = currentPlayer?.isAI === true;
    
    // Only process if it's AI's turn and not already processing
    if (isAITurn && !isProcessingAI && !processingRef.current) {
      processAITurn();
    }
  }, [currentTurn, gameConfig.players, isProcessingAI, processAITurn, gameState]); // Only trigger on turn or mode change

  return {
    isProcessingAI: isProcessingAI || isThinking,
    aiStats
  };
}

