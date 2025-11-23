import React from 'react';
import './GameOverModal.css';
import { GameStatus } from '../../domain/core/types';

interface GameOverModalProps {
  gameStatus: GameStatus;
  onRestart: () => void;
}

/**
 * Modal displayed when game ends.
 * 
 * Shows winner and provides restart button.
 */
const GameOverModal: React.FC<GameOverModalProps> = ({ gameStatus, onRestart }) => {
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
    if (gameStatus === GameStatus.WINNER_OUR) {
      return '🏆';
    } else if (gameStatus === GameStatus.WINNER_OPPONENT) {
      return '💀';
    } else {
      return '🤝';
    }
  };

  return (
    <div className="game-over-modal">
      <div className="game-over-modal__backdrop" onClick={onRestart} />
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
        <button 
          className="game-over-modal__button"
          onClick={onRestart}
        >
          Nueva Partida
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
