import React from 'react';
import './CornerPlayerCard.css';
import { PieceType } from '../../domain/core/types';

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
    isAI
  } = player;

  return (
    <div 
      className={`corner-player-card corner-player-card--${playerPosition} ${isActive ? 'corner-player-card--active' : ''}`}
      data-team={team}
    >
      {/* Active Turn Pulse */}
      {isActive && <div className="corner-player-card__pulse" />}

      {/* Header: Avatar + Name + Score */}
      <div className="corner-player-card__header">
        <img 
          src={playerAvatar} 
          alt={playerName}
          className="corner-player-card__avatar"
        />
        <div className="corner-player-card__info">
          <div className="corner-player-card__name">
            {playerName} {isAI && '🤖'}
          </div>
          <div className="corner-player-card__pieces">
            {piecesRemaining} piezas
          </div>
        </div>
        <div className="corner-player-card__score">
          <div className="corner-player-card__score-value">{score}</div>
          {materialAdvantage !== 0 && (
            <div className={`corner-player-card__advantage ${materialAdvantage > 0 ? 'positive' : 'negative'}`}>
              {materialAdvantage > 0 ? '+' : ''}{materialAdvantage}
            </div>
          )}
        </div>
      </div>

      {/* Captured Pieces Row */}
      {capturedPieces.length > 0 && (
        <div className="corner-player-card__captured">
          {capturedPieces.slice(0, 8).map((piece, index) => (
            <img
              key={`${piece.type}-${index}`}
              src={piece.image}
              alt={piece.type}
              className="corner-player-card__piece-icon"
              title={piece.type}
            />
          ))}
          {capturedPieces.length > 8 && (
            <span className="corner-player-card__more">+{capturedPieces.length - 8}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default CornerPlayerCard;
