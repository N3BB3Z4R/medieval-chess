import React from 'react';
import './TurnIndicator.css';
import { TeamType } from '../../domain/core/types';

interface TurnIndicatorProps {
  currentTurn: TeamType;
  gameStatus: string;
}

/**
 * Turn indicator component.
 * 
 * Shows whose turn it is with visual feedback.
 */
const TurnIndicator: React.FC<TurnIndicatorProps> = ({ currentTurn, gameStatus }) => {
  if (gameStatus !== 'IN_PROGRESS') {
    return null;
  }

  const teamName = currentTurn === TeamType.OUR ? 'Tu Turno' : 'Turno del Oponente';
  const teamColor = currentTurn === TeamType.OUR ? 'our' : 'opponent';

  return (
    <div className={`turn-indicator turn-indicator--${teamColor}`}>
      <div className="turn-indicator__icon">
        {currentTurn === TeamType.OUR ? '👤' : '🤖'}
      </div>
      <div className="turn-indicator__text">
        <span className="turn-indicator__label">Turno Actual</span>
        <span className="turn-indicator__team">{teamName}</span>
      </div>
      <div className="turn-indicator__pulse" />
    </div>
  );
};

export default TurnIndicator;
