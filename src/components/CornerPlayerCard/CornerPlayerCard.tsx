import React from 'react';
import './CornerPlayerCard.css';
import { PieceType } from '../../domain/core/types';
import GroupedCapturedPieces from './GroupedCapturedPieces';
import BoardClock from '../BoardCounter/BoardClock/BoardClock';

export interface CornerPlayerData {
  playerName: string;
  playerAvatar: string;
  playerPosition: 'bottom' | 'top' | 'left' | 'right';
  team: string;
  score: number;
  materialAdvantage: number;
  capturedPieces: Array<{ type: PieceType; image: string }>;
  isActive: boolean;
  piecesRemaining: number;
  isAI: boolean;
  timePerTurn?: number; // Time control in seconds
  incrementPerTurn?: number; // Increment per turn in seconds
  onTimeUp?: () => void; // Callback when time runs out
  rank?: number; // Position in the game (1st, 2nd, 3rd, 4th)
  totalPlayers?: number; // Total number of players
}

interface CornerPlayerCardProps {
  player: CornerPlayerData;
}

/**
 * Ultra-compact player card for board corners.
 * Fits in the 4x4 forbidden zones of the medieval chess board.
 */
const CornerPlayerCard: React.FC<CornerPlayerCardProps> = ({ player }) => {
  const {
    playerName,
    playerAvatar,
    playerPosition,
    team,
    score,
    materialAdvantage,
    capturedPieces,
    isActive,
    piecesRemaining,
    isAI,
    timePerTurn,
    incrementPerTurn,
    onTimeUp,
    rank,
    totalPlayers
  } = player;

  // Obtener el emoji de posición
  const getRankEmoji = (position: number) => {
    switch(position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}º`;
    }
  };

  return (
    <div 
      className={`corner-player-card corner-player-card--${playerPosition} ${isActive ? 'corner-player-card--active' : ''}`}
      data-team={team}
    >
      {/* Active Turn Pulse */}
      {isActive && <div className="corner-player-card__pulse" />}

      {/* Ranking Badge */}
      {rank && totalPlayers && totalPlayers > 2 && (
        <div className="corner-player-card__rank-badge">
          {getRankEmoji(rank)}
        </div>
      )}

      {/* Header: Avatar + Info Principal */}
      <div className="corner-player-card__header">
        <div className="corner-player-card__avatar-container">
          <img 
            src={playerAvatar} 
            alt={playerName}
            className="corner-player-card__avatar"
          />
          {isActive && <div className="corner-player-card__active-indicator">●</div>}
        </div>
        
        <div className="corner-player-card__main-info">
          <div className="corner-player-card__name">
            {playerName} {isAI && '🤖'}
          </div>
          
          {/* Stats Grid */}
          <div className="corner-player-card__stats">
            <div className="corner-player-card__stat">
              <span className="corner-player-card__stat-icon">⚔️</span>
              <span className="corner-player-card__stat-value">{piecesRemaining}</span>
            </div>
            <div className="corner-player-card__stat">
              <span className="corner-player-card__stat-icon">⭐</span>
              <span className="corner-player-card__stat-value">{score}</span>
            </div>
            {materialAdvantage !== 0 && (
              <div className={`corner-player-card__stat corner-player-card__stat--advantage ${materialAdvantage > 0 ? 'positive' : 'negative'}`}>
                <span className="corner-player-card__stat-icon">📊</span>
                <span className="corner-player-card__stat-value">
                  {materialAdvantage > 0 ? '+' : ''}{materialAdvantage}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clock - only show if time control is enabled */}
      {timePerTurn && (
        <div className="corner-player-card__clock-container">
          <div className="corner-player-card__clock-label">⏱️ Tiempo</div>
          <BoardClock
            active={isActive}
            initialTimeSeconds={timePerTurn}
            incrementSeconds={incrementPerTurn}
            onTimeUp={onTimeUp}
          />
        </div>
      )}

      {/* Captured Pieces Section */}
      {capturedPieces.length > 0 && (
        <div className="corner-player-card__captures">
          <div className="corner-player-card__captures-header">
            <span className="corner-player-card__captures-icon">🏆</span>
            <span className="corner-player-card__captures-label">Capturas ({capturedPieces.length})</span>
          </div>
          <GroupedCapturedPieces pieces={capturedPieces} />
        </div>
      )}
    </div>
  );
};

export default CornerPlayerCard;
