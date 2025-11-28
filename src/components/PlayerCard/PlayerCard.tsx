import React from 'react';
import './PlayerCard.css';
import BoardClock from '../BoardCounter/BoardClock/BoardClock';
import CapturedPieces, { CapturedPiece } from '../CapturedPieces/CapturedPieces';
import { PieceType } from '../../domain/core/types';

export interface PlayerProfile {
  playerPosition: string; // 'bottom', 'top', 'left', 'right'
  playerName: string;
  playerAvatar: string;
  playerRange: string; // 'Human' or 'AI Player'
  playerElo: number;
  team: string; // 'OUR' or 'OPPONENT'
}

export interface PlayerStats {
  capturedPieces: CapturedPiece[];
  materialAdvantage: number;
  score: number;
  piecesRemaining: number;
  movesPlayed: number;
  lastMovedPiece?: {
    type: PieceType;
    from: string;
    to: string;
  };
}

export interface PlayerStatus {
  state: 'active' | 'waiting' | 'thinking' | 'check' | 'disconnected';
  message?: string;
}

interface PlayerCardProps {
  profile: PlayerProfile;
  stats: PlayerStats;
  status: PlayerStatus;
  isActive: boolean; // Current turn
  timePerTurn?: number;
  incrementPerTurn?: number;
  onTimeUp?: () => void;
  variant?: 'desktop' | 'mobile'; // Layout variant
}

/**
 * Enhanced Player Card component.
 * Shows comprehensive player info with medieval board styling.
 */
const PlayerCard: React.FC<PlayerCardProps> = ({
  profile,
  stats,
  status,
  isActive,
  timePerTurn,
  incrementPerTurn,
  onTimeUp,
  variant = 'desktop'
}) => {
  const { playerName, playerAvatar, playerElo, playerRange, team } = profile;
  const { capturedPieces, materialAdvantage, score, piecesRemaining, movesPlayed, lastMovedPiece } = stats;

  const resolvePlayerNumber = () => {
    switch (profile.playerPosition) {
      case 'bottom': return 1;
      case 'top': return 2;
      case 'left': return 3;
      case 'right': return 4;
      default: return 0;
    }
  };

  const getStatusIcon = () => {
    switch (status.state) {
      case 'active': return '⚡';
      case 'waiting': return '⏳';
      case 'thinking': return '🤔';
      case 'check': return '⚠️';
      case 'disconnected': return '🔌';
      default: return '👤';
    }
  };

  const getStatusClass = () => {
    return `player-card--${status.state}`;
  };

  return (
    <div 
      className={`player-card ${isActive ? 'player-card--active' : ''} ${getStatusClass()} player-card--${variant}`}
      data-team={team}
    >
      {/* Active Turn Indicator */}
      {isActive && (
        <div className="player-card__turn-pulse" />
      )}

      {/* Player Number Badge */}
      <div className="player-card__number">{resolvePlayerNumber()}</div>

      {/* Main Content */}
      <div className="player-card__content">
        {/* Header: Avatar + Info */}
        <div className="player-card__header">
          <img 
            src={playerAvatar} 
            alt={playerName}
            className="player-card__avatar"
          />
          <div className="player-card__info">
            <div className="player-card__name">{playerName}</div>
            <div className="player-card__meta">
              <span className="player-card__elo">⭐ {playerElo}</span>
              <span className="player-card__type">{playerRange}</span>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="player-card__status">
            <span className="player-card__status-icon">{getStatusIcon()}</span>
            {status.message && (
              <span className="player-card__status-text">{status.message}</span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="player-card__stats">
          <div className="player-card__stat">
            <span className="player-card__stat-label">Puntos</span>
            <span className="player-card__stat-value">{score}</span>
          </div>
          <div className="player-card__stat">
            <span className="player-card__stat-label">Piezas</span>
            <span className="player-card__stat-value">{piecesRemaining}</span>
          </div>
          <div className="player-card__stat">
            <span className="player-card__stat-label">Jugadas</span>
            <span className="player-card__stat-value">{movesPlayed}</span>
          </div>
        </div>

        {/* Last Move */}
        {lastMovedPiece && (
          <div className="player-card__last-move">
            <span className="player-card__last-move-label">Última jugada:</span>
            <span className="player-card__last-move-value">
              {lastMovedPiece.type} {lastMovedPiece.from} → {lastMovedPiece.to}
            </span>
          </div>
        )}

        {/* Captured Pieces */}
        <CapturedPieces 
          pieces={capturedPieces}
          materialAdvantage={materialAdvantage}
          compact={variant === 'mobile'}
        />

        {/* Clock */}
        {timePerTurn && (
          <div className="player-card__clock">
            <BoardClock
              active={isActive}
              initialTimeSeconds={timePerTurn}
              incrementSeconds={incrementPerTurn}
              onTimeUp={onTimeUp}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
