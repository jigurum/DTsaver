/**
 * Game types for Drive-Thru Vigilante 3D (드라이빙스루 무법자 3D)
 */

export type GamePhase = 'START' | 'PLAYING' | 'GAMEOVER';

export type GameOverReason =
  | 'TIME_OUT'
  | 'SHOT_BY_ROBBER'
  | 'SHOT_INNOCENT';

export type NpcType = 'EMPLOYEE' | 'ROBBER' | 'NONE';

export type NpcState =
  | 'APPROACHING'
  | 'WAITING'
  | 'AIMING'
  | 'ATTACKING'
  | 'ELIMINATED'
  | 'SERVED'
  | 'DEPARTED';

export interface ScorePopup {
  id: number;
  text: string;
  points: number;
  type: 'robber' | 'order' | 'penalty';
  createdAt: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  robbersDefeated: number;
  ordersCompleted: number;
  shotsFired: number;
  shotsHit: number;
  reason?: GameOverReason;
}
