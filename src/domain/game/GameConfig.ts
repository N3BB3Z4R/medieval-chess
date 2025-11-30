import { TeamType } from '../core/types';
import { AIDifficulty, AIPersonality } from '../ai/interfaces';

/**
 * AI Configuration for a player.
 */
export interface PlayerAIConfig {
  difficulty: AIDifficulty;
  personality: AIPersonality;
}

/**
 * Player configuration for a game.
 */
export interface PlayerConfig {
  team: TeamType;
  position: 'top' | 'right' | 'bottom' | 'left';
  name: string;
  avatar: string;
  isAI: boolean;
  aiConfig?: PlayerAIConfig;
  isActive: boolean;
}

/**
 * Game configuration.
 */
export interface GameConfig {
  playerCount: 2 | 3 | 4;
  players: PlayerConfig[];
  timePerTurn?: number; // seconds, undefined = no timer
  incrementPerTurn?: number; // seconds added after each turn (Chess.com style)
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
 * Creates a 3-player game configuration.
 */
export function create3PlayerGame(): GameConfig {
  return {
    playerCount: 3,
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
      {
        team: TeamType.OPPONENT_2,
        position: 'right',
        name: 'Jugador 3',
        avatar: 'https://pbs.twimg.com/profile_images/1362482512702889984/DUddweNT.jpg',
        isAI: false,
        isActive: true,
      },
    ],
    timePerTurn: undefined,
  };
}

/**
 * Creates a 4-player game configuration.
 */
export function create4PlayerGame(): GameConfig {
  return {
    playerCount: 4,
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
      {
        team: TeamType.OPPONENT_2,
        position: 'right',
        name: 'Jugador 3',
        avatar: 'https://pbs.twimg.com/profile_images/1362482512702889984/DUddweNT.jpg',
        isAI: false,
        isActive: true,
      },
      {
        team: TeamType.OPPONENT_3,
        position: 'left',
        name: 'Jugador 4',
        avatar: 'https://pbs.twimg.com/profile_images/1362482512702889984/DUddweNT.jpg',
        isAI: false,
        isActive: true,
      },
    ],
    timePerTurn: undefined,
  };
}
