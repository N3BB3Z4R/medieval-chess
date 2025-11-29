import React, { useState } from 'react';
import './GameSetupModal.css';
import { GameConfig, create2PlayerGame, create4PlayerGame } from '../../domain/game/GameConfig';
import { AIDifficulty, AIPersonality } from '../../domain/ai/interfaces';

// Re-export AI types from domain for convenience
export type { AIConfig } from '../../domain/ai/interfaces';

export interface GameSetupConfig extends GameConfig {
  mode?: 'pvp' | 'ai';
  aiConfig?: {
    difficulty: AIDifficulty;
    personality: AIPersonality;
  };
}

interface GameSetupModalProps {
  onStartGame: (config: GameSetupConfig) => void;
  onClose: () => void;
}

/**
 * Time presets similar to Chess.com
 */
interface TimePreset {
  name: string;
  minutes: number;
  incrementSeconds: number;
  description: string;
}

const TIME_PRESETS: TimePreset[] = [
  { name: 'Bullet', minutes: 1, incrementSeconds: 0, description: '1 min' },
  { name: 'Bullet', minutes: 1, incrementSeconds: 1, description: '1 | 1' },
  { name: 'Bullet', minutes: 2, incrementSeconds: 1, description: '2 | 1' },
  { name: 'Blitz', minutes: 3, incrementSeconds: 0, description: '3 min' },
  { name: 'Blitz', minutes: 3, incrementSeconds: 2, description: '3 | 2' },
  { name: 'Blitz', minutes: 5, incrementSeconds: 0, description: '5 min' },
  { name: 'Rapid', minutes: 10, incrementSeconds: 0, description: '10 min' },
  { name: 'Rapid', minutes: 15, incrementSeconds: 10, description: '15 | 10' },
  { name: 'Rapid', minutes: 30, incrementSeconds: 0, description: '30 min' },
];

/**
 * Modal for configuring a new game.
 * 
 * Features:
 * - Select 2, 3, or 4 players
 * - Time control presets (Bullet, Blitz, Rapid)
 * - Custom time configuration
 * - Enable/disable timer
 */
const GameSetupModal: React.FC<GameSetupModalProps> = ({ onStartGame, onClose }) => {
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('pvp');
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [useTimer, setUseTimer] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [customIncrement, setCustomIncrement] = useState(0);
  const [showCustom, setShowCustom] = useState(false);
  
  // AI configuration
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>(AIDifficulty.MEDIUM);
  const [aiPersonality, setAIPersonality] = useState<AIPersonality>(AIPersonality.TACTICAL);

  const handleStart = () => {
    let baseConfig: GameConfig;
    
    if (playerCount === 2) {
      baseConfig = create2PlayerGame();
    } else {
      // 3-4 players not yet implemented
      baseConfig = create4PlayerGame(); // Falls back to 2-player
    }
    
    // If AI mode, mark opponent as AI player
    if (gameMode === 'ai') {
      baseConfig.players = baseConfig.players.map((player, index) => ({
        ...player,
        // First player (index 0) is human, second player (index 1) is AI
        isAI: index === 1,
        name: index === 1 ? `IA ${aiPersonality}` : player.name
      }));
    }
    
    // Apply time configuration
    if (useTimer) {
      if (selectedPreset !== null) {
        const preset = TIME_PRESETS[selectedPreset];
        baseConfig.timePerTurn = preset.minutes * 60; // Convert to seconds
        baseConfig.incrementPerTurn = preset.incrementSeconds;
      } else if (showCustom) {
        baseConfig.timePerTurn = customMinutes * 60; // Convert to seconds
        baseConfig.incrementPerTurn = customIncrement;
      }
    } else {
      baseConfig.timePerTurn = undefined;
      baseConfig.incrementPerTurn = undefined;
    }
    
    // Create setup config with AI settings
    const config: GameSetupConfig = {
      ...baseConfig,
      mode: gameMode,
      aiConfig: gameMode === 'ai' ? {
        difficulty: aiDifficulty,
        personality: aiPersonality
      } : undefined
    };
    
    onStartGame(config);
  };

  const handlePresetSelect = (index: number) => {
    setSelectedPreset(index);
    setShowCustom(false);
  };

  const handleCustomClick = () => {
    setSelectedPreset(null);
    setShowCustom(true);
  };

  return (
    <div className="game-setup-modal">
      <div className="game-setup-modal__backdrop" onClick={onClose} />
      <div className="game-setup-modal__content">
        <h2 className="game-setup-modal__title">🏰 Nueva Partida</h2>
        
        {/* Game Mode Selection */}
        <div className="game-setup-modal__section">
          <label className="game-setup-modal__label">Modo de Juego</label>
          <div className="game-setup-modal__buttons">
            <button
              className={`game-setup-modal__button ${gameMode === 'pvp' ? 'active' : ''}`}
              onClick={() => setGameMode('pvp')}
            >
              👥 Jugador vs Jugador
            </button>
            <button
              className={`game-setup-modal__button ${gameMode === 'ai' ? 'active' : ''}`}
              onClick={() => setGameMode('ai')}
            >
              🤖 Jugador vs IA
            </button>
          </div>
        </div>
        
        <div className="game-setup-modal__section">
          <label className="game-setup-modal__label">Número de Jugadores</label>
          <div className="game-setup-modal__buttons">
            <button
              className={`game-setup-modal__button ${playerCount === 2 ? 'active' : ''}`}
              onClick={() => setPlayerCount(2)}
            >
              2 Jugadores
            </button>
            <button
              className={`game-setup-modal__button ${playerCount === 3 ? 'active' : ''}`}
              onClick={() => setPlayerCount(3)}
              disabled={true}
              title="Próximamente - Phase 7"
            >
              3 Jugadores
              <span className="badge">Próximamente</span>
            </button>
            <button
              className={`game-setup-modal__button ${playerCount === 4 ? 'active' : ''}`}
              onClick={() => setPlayerCount(4)}
              disabled={true}
              title="Próximamente - Phase 7"
            >
              4 Jugadores
              <span className="badge">Próximamente</span>
            </button>
          </div>
        </div>

        <div className="game-setup-modal__section">
          <div className="game-setup-modal__timer-header">
            <label className="game-setup-modal__label">Control de Tiempo</label>
            <label className="game-setup-modal__checkbox">
              <input
                type="checkbox"
                checked={useTimer}
                onChange={(e) => setUseTimer(e.target.checked)}
              />
              <span>Activar Temporizador</span>
            </label>
          </div>
          
          {useTimer && (
            <>
              <div className="game-setup-modal__time-presets">
                {TIME_PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    className={`game-setup-modal__time-preset ${selectedPreset === index ? 'active' : ''}`}
                    onClick={() => handlePresetSelect(index)}
                  >
                    <span className="preset-category">{preset.name}</span>
                    <span className="preset-time">{preset.description}</span>
                  </button>
                ))}
                <button
                  className={`game-setup-modal__time-preset custom ${showCustom ? 'active' : ''}`}
                  onClick={handleCustomClick}
                >
                  <span className="preset-category">Custom</span>
                  <span className="preset-time">⚙️</span>
                </button>
              </div>

              {showCustom && (
                <div className="game-setup-modal__custom-time">
                  <div className="custom-time-control">
                    <label>Minutos por jugador</label>
                    <div className="input-group">
                      <button onClick={() => setCustomMinutes(Math.max(1, customMinutes - 1))}>-</button>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(Number(e.target.value))}
                      />
                      <button onClick={() => setCustomMinutes(Math.min(60, customMinutes + 1))}>+</button>
                    </div>
                  </div>
                  <div className="custom-time-control">
                    <label>Incremento (segundos)</label>
                    <div className="input-group">
                      <button onClick={() => setCustomIncrement(Math.max(0, customIncrement - 1))}>-</button>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={customIncrement}
                        onChange={(e) => setCustomIncrement(Number(e.target.value))}
                      />
                      <button onClick={() => setCustomIncrement(Math.min(60, customIncrement + 1))}>+</button>
                    </div>
                  </div>
                  <div className="custom-time-info">
                    ⏱️ Cada jugador tendrá {customMinutes} minutos{customIncrement > 0 ? ` + ${customIncrement}s por turno` : ''}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* AI Configuration (only if mode === 'ai') */}
        {gameMode === 'ai' && (
          <>
            <div className="game-setup-modal__section">
              <label className="game-setup-modal__label">Dificultad de IA</label>
              <select
                className="game-setup-modal__select"
                value={aiDifficulty}
                onChange={(e) => setAIDifficulty(e.target.value as AIDifficulty)}
              >
                <option value={AIDifficulty.BEGINNER}>🌱 Principiante (Profundidad 1)</option>
                <option value={AIDifficulty.MEDIUM}>⚔️ Medio (Profundidad 2)</option>
                <option value={AIDifficulty.ADVANCED}>🛡️ Avanzado (Profundidad 3)</option>
                <option value={AIDifficulty.MASTER}>👑 Maestro (Profundidad 4)</option>
              </select>
              <p className="game-setup-modal__hint">
                Mayor profundidad = IA más fuerte pero más lenta
              </p>
            </div>

            <div className="game-setup-modal__section">
              <label className="game-setup-modal__label">Personalidad de IA</label>
              <select
                className="game-setup-modal__select"
                value={aiPersonality}
                onChange={(e) => setAIPersonality(e.target.value as AIPersonality)}
              >
                <option value={AIPersonality.AGGRESSIVE}>⚔️ Agresivo - Prioriza ataques y capturas</option>
                <option value={AIPersonality.DEFENSIVE}>🛡️ Defensivo - Protege al rey y controla territorio</option>
                <option value={AIPersonality.POSITIONAL}>📐 Posicional - Controla el centro del tablero</option>
                <option value={AIPersonality.TACTICAL}>🎯 Táctico - Balanceado y calculador</option>
                <option value={AIPersonality.OPPORTUNIST}>💰 Oportunista - Busca ventajas materiales</option>
                <option value={AIPersonality.CAUTIOUS}>🐢 Cauteloso - Evita riesgos innecesarios</option>
                <option value={AIPersonality.CHAOTIC}>🎲 Caótico - Movimientos impredecibles</option>
              </select>
              <p className="game-setup-modal__hint">
                Cada personalidad tiene un estilo de juego único
              </p>
            </div>
          </>
        )}

        <div className="game-setup-modal__actions">
          <button
            className="game-setup-modal__cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="game-setup-modal__start"
            onClick={handleStart}
          >
            Iniciar Partida
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameSetupModal;
