import React from 'react';
import './GameControlPanel.css';
import { GameStatus } from '../../domain/core/types';

interface GameControlPanelProps {
  gameStatus: GameStatus;
  onNewGame: () => void;
  onSurrender: () => void;
  matchType?: string;
  timeControl?: string;
}

/**
 * Left panel with game controls and match info.
 * Appears only in desktop layout (16:9).
 */
const GameControlPanel: React.FC<GameControlPanelProps> = ({
  gameStatus,
  onNewGame,
  onSurrender,
  matchType = '2 Jugadores',
  timeControl = 'Sin límite'
}) => {
  const isGameActive = gameStatus === GameStatus.IN_PROGRESS;

  return (
    <div className="game-control-panel">
      {/* Header */}
      <div className="game-control-panel__header">
        <h2 className="game-control-panel__title">⚔️ MESS</h2>
        <p className="game-control-panel__subtitle">Medieval Chess</p>
      </div>

      {/* Actions */}
      <div className="game-control-panel__actions">
        <button 
          className="game-control-panel__button game-control-panel__button--primary"
          onClick={onNewGame}
        >
          🎮 Nueva Partida
        </button>
        {isGameActive && (
          <button 
            className="game-control-panel__button game-control-panel__button--danger"
            onClick={onSurrender}
          >
            🏳️ Rendirse
          </button>
        )}
      </div>

      {/* Match Info */}
      <div className="game-control-panel__info">
        <h3 className="game-control-panel__info-title">📋 Partida Actual</h3>
        
        <div className="game-control-panel__info-item">
          <span className="game-control-panel__info-label">Tipo:</span>
          <span className="game-control-panel__info-value">{matchType}</span>
        </div>
        
        <div className="game-control-panel__info-item">
          <span className="game-control-panel__info-label">Tiempo:</span>
          <span className="game-control-panel__info-value">{timeControl}</span>
        </div>
        
        <div className="game-control-panel__info-item">
          <span className="game-control-panel__info-label">Estado:</span>
          <span className={`game-control-panel__status game-control-panel__status--${
            gameStatus === GameStatus.IN_PROGRESS ? 'active' : 'ended'
          }`}>
            {gameStatus === GameStatus.IN_PROGRESS ? '⚡ En juego' : '🏁 Terminada'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameControlPanel;
