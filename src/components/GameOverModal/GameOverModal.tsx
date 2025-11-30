import React from 'react';
import './GameOverModal.css';
import { GameStatus } from '../../domain/core/types';

export interface PlayerScore {
  playerName: string;
  playerAvatar: string;
  team: string;
  score: number;
  capturedPiecesCount: number;
  piecesRemaining: number;
  isAI: boolean;
}

interface GameOverModalProps {
  gameStatus: GameStatus;
  onRestart: () => void;
  onNewGame?: () => void; // Opens setup modal instead of restarting
  playerScores?: PlayerScore[]; // Leaderboard data
}

/**
 * Modal displayed when game ends.
 * 
 * Shows winner, leaderboard, and provides restart button.
 */
const GameOverModal: React.FC<GameOverModalProps> = ({ 
  gameStatus, 
  onRestart, 
  onNewGame,
  playerScores = [] 
}) => {
  // Only show for game-ending statuses
  if (gameStatus === GameStatus.NOT_STARTED || gameStatus === GameStatus.IN_PROGRESS) {
    return null;
  }

  const getMessage = (): string => {
    switch (gameStatus) {
      case GameStatus.WINNER_OUR:
        return '¡Victoria! Has ganado';
      case GameStatus.WINNER_OPPONENT:
        return 'Derrota. El oponente ha ganado';
      case GameStatus.CHECKMATE:
        return '¡Jaque Mate!';
      case GameStatus.STALEMATE:
        return 'Empate por ahogado';
      case GameStatus.DRAW:
        return 'Empate';
      default:
        return 'Juego terminado';
    }
  };

  const getIcon = (): string => {
    switch (gameStatus) {
      case GameStatus.WINNER_OUR:
        return '👑';
      case GameStatus.WINNER_OPPONENT:
        return '💀';
      case GameStatus.CHECKMATE:
        return '♔';
      case GameStatus.STALEMATE:
      case GameStatus.DRAW:
        return '🤝';
      default:
        return '🏁';
    }
  };

  // Sort players by score (descending)
  const sortedPlayers = [...playerScores].sort((a, b) => b.score - a.score);

  return (
    <div className="game-over-modal">
      <div className="game-over-modal__backdrop" onClick={onNewGame || onRestart} />
      <div className="game-over-modal__content">
        <div className="game-over-modal__icon">{getIcon()}</div>
        <h2 className="game-over-modal__title">{getMessage()}</h2>
        <p className="game-over-modal__subtitle">
          {gameStatus === GameStatus.WINNER_OUR && 'Has capturado el rey enemigo'}
          {gameStatus === GameStatus.WINNER_OPPONENT && 'Tu rey ha sido capturado'}
          {gameStatus === GameStatus.CHECKMATE && 'No hay movimientos legales disponibles'}
          {gameStatus === GameStatus.STALEMATE && 'No hay movimientos legales pero no estás en jaque'}
          {gameStatus === GameStatus.DRAW && 'La partida termina en empate'}
        </p>

        {/* Leaderboard */}
        {sortedPlayers.length > 0 && (
          <div className="game-over-modal__leaderboard">
            <h3 className="game-over-modal__leaderboard-title">📊 Clasificación Final</h3>
            <div className="game-over-modal__leaderboard-table">
              {sortedPlayers.map((player, index) => (
                <div 
                  key={player.team}
                  className={`game-over-modal__leaderboard-row ${index === 0 ? 'game-over-modal__leaderboard-row--winner' : ''}`}
                >
                  <div className="game-over-modal__rank">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                  </div>
                  <img 
                    src={player.playerAvatar} 
                    alt={player.playerName}
                    className="game-over-modal__avatar"
                  />
                  <div className="game-over-modal__player-info">
                    <div className="game-over-modal__player-name">
                      {player.playerName} {player.isAI && '🤖'}
                    </div>
                    <div className="game-over-modal__player-stats">
                      {player.capturedPiecesCount} capturas • {player.piecesRemaining} vivas
                    </div>
                  </div>
                  <div className="game-over-modal__score">
                    {player.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="game-over-modal__buttons">
          <button 
            className="game-over-modal__button game-over-modal__button--secondary"
            onClick={onRestart}
            title="Reiniciar con la misma configuración"
          >
            🔄 Revancha
          </button>
          <button 
            className="game-over-modal__button game-over-modal__button--primary"
            onClick={onNewGame || onRestart}
          >
            🎮 Nueva Partida
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
