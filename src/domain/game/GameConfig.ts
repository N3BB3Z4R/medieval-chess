import { TeamType } from '../core/types';

/**
 * Player configuration for a game.
 */
export interface PlayerConfig {
  team: TeamType;
  position: 'top' | 'right' | 'bottom' | 'left';
  name: string;
  avatar: string;
  isAI: boolean;
  isActive: boolean;
}

/**
 * Game configuration.
 */
export interface GameConfig {
  playerCount: 2 | 3 | 4;
  players: PlayerConfig[];
  timePerTurn?: number; // seconds, undefined = no timer
}

/**
 * Creates a 2-player game configuration.
 */
export function create2PlayerGame(): GameConfig {
  return {
    playerCount: 2,
    players: [
      {
        team: TeamType.OUR,
        position: 'bottom',
        name: 'Jugador 1',
        avatar: 'https://e00-elmundo.uecdn.es/assets/multimedia/imagenes/2017/10/16/15081525278135.jpg',
        isAI: false,
        isActive: true,
      },
      {
        team: TeamType.OPPONENT,
        position: 'top',
        name: 'Jugador 2',
        avatar: 'https://pbs.twimg.com/profile_images/1362482512702889984/DUddweNT.jpg',
        isAI: false,
        isActive: true,
      },
    ],
    timePerTurn: undefined,
  };
}

/**
 * Creates a 4-player game configuration (for future implementation).
 * Currently returns 2-player config as 4-player logic is not implemented.
 */
export function create4PlayerGame(): GameConfig {
  // TODO: Implement when Phase 7 (4-player support) is complete
  console.warn('4-player mode not yet implemented, falling back to 2-player');
  return create2PlayerGame();
}
