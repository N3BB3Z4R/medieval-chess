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
 *   gameMode: 'ai',
 *   aiConfig,
 *   onMoveExecuted: (move) => executeMove(move)
 * });
 * ```
 */

import { useEffect, useState, useCallback } from 'react';
import { GameState } from '../domain/game/GameState';
import { Move } from '../domain/core/Move';
import { AIConfig } from '../domain/ai/interfaces';
import { TeamType } from '../Constants';
import { useAI } from './useAI';

interface UseGameLoopOptions {
  gameState: GameState;
  gameMode: 'pvp' | 'ai';
  aiConfig: AIConfig | null;
  aiTeam?: TeamType; // Which team is AI (default: OPPONENT)
  onMoveExecuted: (move: Move) => void;
  onAIThinking?: (isThinking: boolean) => void;
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
    gameMode,
    aiConfig,
    aiTeam = TeamType.OPPONENT,
    onMoveExecuted,
    onAIThinking
  } = options;

  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const { calculateMove, isThinking, aiStats } = useAI(aiConfig);

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
    const currentTurn = gameState.getCurrentTurn();
    const isAITurn = gameMode === 'ai' && (currentTurn as any) === aiTeam;

    // Skip if not AI's turn or already processing
    if (!isAITurn || isProcessingAI) {
      return;
    }

    // Skip if game is over
    const status = gameState.getStatus();
    if ((status as any) !== 'ACTIVE') {
      return;
    }

    setIsProcessingAI(true);

    try {
      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));

      // Calculate AI move
      const aiMove = await calculateMove(gameState);

      if (aiMove) {
        // Execute move
        onMoveExecuted(aiMove);
      } else {
        console.warn('[useGameLoop] AI returned no move');
      }
    } catch (error) {
      console.error('[useGameLoop] Error processing AI turn:', error);
    } finally {
      setIsProcessingAI(false);
    }
  }, [gameState, gameMode, aiTeam, isProcessingAI, calculateMove, onMoveExecuted]);

  // Trigger AI move when turn changes
  useEffect(() => {
    processAITurn();
  }, [processAITurn]);

  return {
    isProcessingAI: isProcessingAI || isThinking,
    aiStats
  };
}
