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
      case 'top':
        return 1
      case 'right':
        return 2
      case 'bottom':
        return 3
      case 'left':
        return 4
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
