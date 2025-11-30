import React, { useState, useEffect } from 'react';
import './GameSetupModal.css';
import { GameConfig, PlayerConfig, create2PlayerGame, create3PlayerGame, create4PlayerGame } from '../../domain/game/GameConfig';
import { AIDifficulty, AIPersonality } from '../../domain/ai/interfaces';

// Re-export AI types from domain for convenience
export type { AIConfig } from '../../domain/ai/interfaces';

export interface GameSetupConfig extends GameConfig {
  // mode removed, now handled per player
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
 * Component for configuring a single player
 */
const PlayerSetupRow: React.FC<{
  player: PlayerConfig;
  index: number;
  onChange: (updatedPlayer: PlayerConfig) => void;
}> = ({ player, index, onChange }) => {
  const handleTypeChange = (isAI: boolean) => {
    onChange({
      ...player,
      isAI,
      // Set default AI config if switching to AI
      aiConfig: isAI ? {
        difficulty: AIDifficulty.MEDIUM,
        personality: AIPersonality.TACTICAL
      } : undefined
    });
  };

  const handleNameChange = (name: string) => {
    onChange({ ...player, name });
  };

  const handleAIDifficultyChange = (difficulty: AIDifficulty) => {
    if (player.aiConfig) {
      onChange({
        ...player,
        aiConfig: { ...player.aiConfig, difficulty }
      });
    }
  };

  const handleAIPersonalityChange = (personality: AIPersonality) => {
    if (player.aiConfig) {
      onChange({
        ...player,
        aiConfig: { ...player.aiConfig, personality }
      });
    }
  };

  return (
    <div className="player-setup-row">
      <div className="player-setup-header">
        <span className="player-label">Jugador {index + 1} ({player.position})</span>
        <div className="player-type-toggle">
          <button 
            className={`type-btn ${!player.isAI ? 'active' : ''}`}
            onClick={() => handleTypeChange(false)}
          >
            👤 Humano
          </button>
          <button 
            className={`type-btn ${player.isAI ? 'active' : ''}`}
            onClick={() => handleTypeChange(true)}
          >
            🤖 IA
          </button>
        </div>
      </div>

      <div className="player-setup-details">
        <div className="input-group">
          <label>Nombre</label>
          <input 
            type="text" 
            value={player.name} 
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={`Jugador ${index + 1}`}
          />
        </div>

        {player.isAI && player.aiConfig && (
          <>
            <div className="input-group">
              <label>Dificultad</label>
              <select 
                value={player.aiConfig.difficulty}
                onChange={(e) => handleAIDifficultyChange(e.target.value as AIDifficulty)}
              >
                <option value={AIDifficulty.BEGINNER}>🌱 Principiante</option>
                <option value={AIDifficulty.MEDIUM}>⚔️ Medio</option>
                <option value={AIDifficulty.ADVANCED}>🛡️ Avanzado</option>
                <option value={AIDifficulty.MASTER}>👑 Maestro</option>
              </select>
            </div>
            <div className="input-group">
              <label>Personalidad</label>
              <select 
                value={player.aiConfig.personality}
                onChange={(e) => handleAIPersonalityChange(e.target.value as AIPersonality)}
              >
                <option value={AIPersonality.AGGRESSIVE}>⚔️ Agresivo</option>
                <option value={AIPersonality.DEFENSIVE}>🛡️ Defensivo</option>
                <option value={AIPersonality.POSITIONAL}>📐 Posicional</option>
                <option value={AIPersonality.TACTICAL}>🎯 Táctico</option>
                <option value={AIPersonality.OPPORTUNIST}>💰 Oportunista</option>
                <option value={AIPersonality.CAUTIOUS}>🐢 Cauteloso</option>
                <option value={AIPersonality.CHAOTIC}>🎲 Caótico</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Modal for configuring a new game.
 * 
 * Features:
 * - Select 2, 3, or 4 players
 * - Configure each player (Human/AI, Name, Difficulty)
 * - Time control presets
 */
const GameSetupModal: React.FC<GameSetupModalProps> = ({ onStartGame, onClose }) => {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [players, setPlayers] = useState<PlayerConfig[]>([]);
  
  const [useTimer, setUseTimer] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [customIncrement, setCustomIncrement] = useState(0);
  const [showCustom, setShowCustom] = useState(false);

  // Initialize players when playerCount changes
  useEffect(() => {
    let config: GameConfig;
    if (playerCount === 2) config = create2PlayerGame();
    else if (playerCount === 3) config = create3PlayerGame();
    else config = create4PlayerGame();
    
    // Preserve existing configurations if possible when switching counts
    // For now, just reset to default for simplicity, or we could try to merge
    setPlayers(config.players);
  }, [playerCount]);

  const handlePlayerChange = (index: number, updatedPlayer: PlayerConfig) => {
    const newPlayers = [...players];
    newPlayers[index] = updatedPlayer;
    setPlayers(newPlayers);
  };

  const handleStart = () => {
    const baseConfig: GameConfig = {
      playerCount,
      players,
      timePerTurn: undefined,
      incrementPerTurn: undefined
    };
    
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
    }
    
    onStartGame(baseConfig);
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
            >
              3 Jugadores
            </button>
            <button
              className={`game-setup-modal__button ${playerCount === 4 ? 'active' : ''}`}
              onClick={() => setPlayerCount(4)}
            >
              4 Jugadores
            </button>
          </div>
        </div>

        <div className="game-setup-modal__section players-list">
          <label className="game-setup-modal__label">Configuración de Jugadores</label>
          <div className="players-container">
            {players.map((player, index) => (
              <PlayerSetupRow 
                key={index} 
                player={player} 
                index={index} 
                onChange={(updated) => handlePlayerChange(index, updated)} 
              />
            ))}
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
