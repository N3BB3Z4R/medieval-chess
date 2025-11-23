import PlayerCounter, { PlayerType } from "./PlayerCounter/PlayerCounter"
import './PlayerCounter/PlayerCounter.css'
import { useGame } from '../../context/GameContext';
import { GameStatus, TeamType as DomainTeamType } from '../../domain/core/types';

const BoardCounter = () => {
  const { gameState, gameConfig, dispatch } = useGame();
  const currentTurn = gameState.getCurrentTurn();

  // Only show active players (based on game configuration)
  const activePlayers = gameConfig.players.filter(p => p.isActive);

  // Handler for when a player's time runs out
  const handleTimeUp = (playerTeam: string) => {
    console.log(`Time's up for ${playerTeam}!`);
    // Determine winner (opposite of timed-out player)
    const winnerStatus = playerTeam === DomainTeamType.OUR 
      ? GameStatus.WINNER_OPPONENT 
      : GameStatus.WINNER_OUR;
    
    // Set game as completed with winner
    dispatch({ 
      type: 'SET_STATUS', 
      payload: { status: winnerStatus }
    });
  };

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
              timePerTurn={gameConfig.timePerTurn}
              incrementPerTurn={gameConfig.incrementPerTurn}
              onTimeUp={() => handleTimeUp(player.team)}
            />
          </button>
        )
      })}
    </div >
  )
}
export default BoardCounter