import PlayerCounter, { PlayerType } from "./PlayerCounter/PlayerCounter"
import './PlayerCounter/PlayerCounter.css'
import { useGame } from '../../context/GameContext';

const BoardCounter = () => {
  const { gameState, gameConfig } = useGame();
  const currentTurn = gameState.getCurrentTurn();

  // Only show active players (based on game configuration)
  const activePlayers = gameConfig.players.filter(p => p.isActive);

  return (
    <div className="board-counters">
      {activePlayers.map((player) => {
        const isActive = player.team === currentTurn;
        
        // Convert to legacy PlayerType format for compatibility
        const legacyPlayer: PlayerType = {
          playerPosition: player.position,
          playerName: player.name,
          playerAvatar: player.avatar,
          playerRange: player.isAI ? 'AI Player' : 'Human',
          playerElo: 1200, // Default ELO
        };
        
        return (
          <button 
            type="button" 
            className={`board-counter ${isActive ? ' board-counter__selected' : ''}`} 
            key={player.position}
            disabled={true}
          >
            <PlayerCounter 
              profile={legacyPlayer} 
              selected={isActive} 
            />
          </button>
        )
      })}
    </div >
  )
}
export default BoardCounter