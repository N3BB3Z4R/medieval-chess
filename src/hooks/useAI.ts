/**
 * useAI Hook - React hook for AI player management
 * 
 * Provides:
 * - AI instance creation and caching
 * - Move calculation with loading state
 * - AI statistics access
 * - Configuration updates
 * 
 * Usage:
 * ```typescript
 * const { calculateMove, isThinking, aiStats } = useAI(aiConfig);
 * 
 * const move = await calculateMove(gameState);
 * console.log(aiStats); // { nodesEvaluated, pruneCount, ... }
 * ```
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { GameState } from '../domain/game/GameState';
import { Move } from '../domain/core/Move';
import { AIConfig } from '../domain/ai/interfaces';
import { MinimaxAI } from '../domain/ai/MinimaxAI';
import { AIFactory } from '../domain/ai/AIFactory';

interface UseAIReturn {
  calculateMove: (gameState: GameState) => Promise<Move | null>;
  isThinking: boolean;
  aiStats: {
    nodesEvaluated: number;
    pruneCount: number;
    searchDepth: number;
    personality: string;
    difficulty: string;
  } | null;
  resetAI: () => void;
}

/**
 * Hook for managing AI player instance and operations.
 * 
 * @param config - AI configuration
 * @returns AI operations and state
 */
export function useAI(config: AIConfig | null): UseAIReturn {
  const aiRef = useRef<MinimaxAI | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [aiStats, setAIStats] = useState<UseAIReturn['aiStats']>(null);

  // Initialize/update AI when config changes
  useEffect(() => {
    if (config) {
      aiRef.current = AIFactory.create(config);
      
      // Initialize stats
      if (aiRef.current) {
        const stats = aiRef.current.getStats();
        setAIStats(stats);
      }
    } else {
      aiRef.current = null;
      setAIStats(null);
    }
  }, [config]);

  /**
   * Calculate best move for current position.
   * 
   * @param gameState - Current game state
   * @returns Best move or null if no legal moves
   */
  const calculateMove = useCallback(
    async (gameState: GameState): Promise<Move | null> => {
      if (!aiRef.current || !config) {
        console.warn('[useAI] AI not initialized');
        return null;
      }

      console.log('[useAI] Starting move calculation...', {
        currentTurn: gameState.getCurrentTurn(),
        difficulty: config.difficulty,
        personality: config.personality
      });

      setIsThinking(true);

      try {
        // Add small delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 300));

        // Calculate move
        const move = aiRef.current.calculateMove(gameState, config);

        console.log('[useAI] Move calculation result:', move);

        // Update stats
        const stats = aiRef.current.getStats();
        setAIStats(stats);

        return move;
      } catch (error) {
        console.error('[useAI] Error calculating move:', error);
        return null;
      } finally {
        setIsThinking(false);
      }
    },
    [config]
  );

  /**
   * Reset AI instance (useful for new games).
   */
  const resetAI = useCallback(() => {
    if (config) {
      aiRef.current = AIFactory.create(config);
      setAIStats(null);
      setIsThinking(false);
    }
  }, [config]);

  return {
    calculateMove,
    isThinking,
    aiStats,
    resetAI
  };
}
