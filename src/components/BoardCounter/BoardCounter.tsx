import PlayerCounter, { PlayerType } from "./PlayerCounter/PlayerCounter"
import './PlayerCounter/PlayerCounter.css'
import { Players } from '../../constants/playersMockup';
import { useGame } from '../../context/GameContext';
import { TeamType } from '../../domain/core/types';

const BoardCounter = () => {
  const { gameState } = useGame();
  const currentTurn = gameState.getCurrentTurn();

  // Map TeamType to player position string
  const currentPlayerPosition = currentTurn === TeamType.OUR ? 'bottom' : 'top';

  return (
    <div className="board-counters">
      {Players.map((player: PlayerType) => {
        const isActive = player.playerPosition === currentPlayerPosition;
        return (
          <button 
            type="button" 
            className={`board-counter ${isActive ? ' board-counter__selected' : ''}`} 
            key={player.playerPosition}
            disabled={true}
          >
            <PlayerCounter 
              key={player.playerPosition} 
              profile={player} 
              selected={isActive} 
            />
          </button>
        )
      })}
    </div >
  )
}
export default BoardCounter