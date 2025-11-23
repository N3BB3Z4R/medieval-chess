import BoardClock from "../BoardClock/BoardClock";

export interface PlayerType {
  playerPosition: string;
  playerName: string;
  playerAvatar: string;
  playerRange: string;
  playerElo: number;
}

const PlayerCounter = (props: { profile: PlayerType, selected: boolean }) => {
  const { playerPosition, playerName, playerAvatar, playerRange, playerElo } = props.profile;

  const resolvePlayerPosition = () => {
    return `player-${playerPosition}`
  }

  const resolvePlayerNumber = () => {
    switch (playerPosition) {
      case 'bottom':
        return 1  // Player 1 (OUR team)
      case 'top':
        return 2  // Player 2 (OPPONENT team)
      case 'left':
        return 3  // Player 3 (future 4-player)
      case 'right':
        return 4  // Player 4 (future 4-player)
      default:
        return 0
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className={`player-counter ${resolvePlayerPosition()}`}>
        <div className="player-counter__number">{resolvePlayerNumber()}</div>
        <div className="player-counter__wrapper">
          <img src={playerAvatar} alt={playerName} />
          <div className="player-counter__text-wrapper">
            <div className="player-counter__name">{playerName}</div>
            <div className="player-counter__points">{playerElo}</div>
          </div>
        </div>
        <h4 className="player-counter__range">{playerRange}</h4>
      </div>
      <BoardClock active={props.selected} />
    </div>
  )
}
export default PlayerCounter
