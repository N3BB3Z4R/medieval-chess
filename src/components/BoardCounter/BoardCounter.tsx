import PlayerCounter, { PlayerType } from "./PlayerCounter/PlayerCounter"
import './PlayerCounter/PlayerCounter.css'
import { Players } from '../../constants/playersMockup';
import { useState } from "react";

const BoardCounter = () => {
  const [whichPlayerIsPlaying, setWhichPlayerIsPlaying] = useState<string>('')

  const handleClickOnPlayer = (playerPosition: string) => {
    setWhichPlayerIsPlaying(playerPosition)
  }

  return (
    <div className="board-counters">
      {Players.map((player: PlayerType) => {
        return (
          <button type="button" className={`board-counter ${whichPlayerIsPlaying === player.playerPosition ? ' board-counter__selected' : ''}`} key={player.playerPosition} onClick={() => handleClickOnPlayer(player.playerPosition)}>
            <PlayerCounter key={player.playerPosition} profile={player} selected={whichPlayerIsPlaying === player.playerPosition} />
          </button>
        )
      })}
    </div >
  )
}
export default BoardCounter