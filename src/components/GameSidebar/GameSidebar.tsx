import React from 'react';
import './GameSidebar.css';
import PlayerCard, { PlayerProfile, PlayerStats, PlayerStatus } from '../PlayerCard/PlayerCard';
import MoveHistory from '../MoveHistory/MoveHistory';
import { Move } from '../../domain/core/Move';

interface GameSidebarProps {
  players: Array<{
    profile: PlayerProfile;
    stats: PlayerStats;
    status: PlayerStatus;
    isActive: boolean;
    timePerTurn?: number;
    incrementPerTurn?: number;
    onTimeUp?: () => void;
  }>;
  moveHistory: readonly Move[];
  variant?: 'desktop' | 'mobile';
  boardHeight?: number; // To match Messboard height
}

/**
 * Game Sidebar component.
 * Contains player cards and move history in a unified sidebar.
 */
const GameSidebar: React.FC<GameSidebarProps> = ({
  players,
  moveHistory,
  variant = 'desktop',
  boardHeight = 800
}) => {
  return (
    <div 
      className={`game-sidebar game-sidebar--${variant}`}
      style={variant === 'desktop' ? { height: `${boardHeight + 12}px` } : undefined}
    >
      {/* Players Section */}
      <div className={`game-sidebar__players game-sidebar__players--${variant}`}>
        {players.map((player) => (
          <PlayerCard
            key={`${player.profile.team}-${player.profile.playerPosition}`}
            profile={player.profile}
            stats={player.stats}
            status={player.status}
            isActive={player.isActive}
            timePerTurn={player.timePerTurn}
            incrementPerTurn={player.incrementPerTurn}
            onTimeUp={player.onTimeUp}
            variant={variant}
          />
        ))}
      </div>

      {/* Move History Section */}
      <div className="game-sidebar__history">
        <MoveHistory moves={moveHistory} />
      </div>
    </div>
  );
};

export default GameSidebar;
