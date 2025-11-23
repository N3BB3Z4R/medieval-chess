import React, { useState } from 'react';
import './GameSetupModal.css';
import { create2PlayerGame, create4PlayerGame, GameConfig } from '../../domain/game/GameConfig';

interface GameSetupModalProps {
  onStartGame: (config: GameConfig) => void;
  onClose: () => void;
}

/**
 * Modal for configuring a new game.
 * 
 * Features:
 * - Select 2, 3, or 4 players
 * - Configure AI opponents (future)
 * - Set turn timer (future)
 */
const GameSetupModal: React.FC<GameSetupModalProps> = ({ onStartGame, onClose }) => {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [showTimer, setShowTimer] = useState(false);
  const [timePerTurn, setTimePerTurn] = useState(60);

  const handleStart = () => {
    let config: GameConfig;
    
    if (playerCount === 2) {
      config = create2PlayerGame();
    } else {
      // 3-4 players not yet implemented
      config = create4PlayerGame(); // Falls back to 2-player
    }
    
    if (showTimer) {
      config.timePerTurn = timePerTurn;
    }
    
    onStartGame(config);
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
          <label className="game-setup-modal__checkbox">
            <input
              type="checkbox"
              checked={showTimer}
              onChange={(e) => setShowTimer(e.target.checked)}
            />
            <span>Activar Temporizador</span>
          </label>
          
          {showTimer && (
            <div className="game-setup-modal__timer">
              <label>Tiempo por turno (segundos)</label>
              <input
                type="range"
                min="30"
                max="300"
                step="30"
                value={timePerTurn}
                onChange={(e) => setTimePerTurn(Number(e.target.value))}
              />
              <span className="game-setup-modal__timer-value">{timePerTurn}s</span>
            </div>
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
