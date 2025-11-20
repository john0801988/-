export enum GamePhase {
  MENU = 'MENU',
  RAID = 'RAID',
  RESULT = 'RESULT',
}

export enum ItemType {
  WEAPON_MOD = 'WEAPON_MOD',
  VALUABLE = 'VALUABLE',
  JUNK = 'JUNK',
  MEDKIT = 'MEDKIT',
  AMMO = 'AMMO',
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  weight: number;
  value: number;
  color: string;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  money: number;
  inventory: Item[];
  maxWeight: number;
  level: number;
}

export interface LevelConfig {
  id: string;
  name: string;
  description: string;
  difficulty: number; // 1-3
  mapWidth: number;
  mapHeight: number;
  enemyCountMin: number;
  enemyCountMax: number;
  lootCountMin: number;
  lootCountMax: number;
  wallColor: string;
  floorColor: string;
}

// Game Engine Types
export interface Point {
  x: number;
  y: number;
}

export interface Entity extends Point {
  id: string;
  radius: number;
  type: 'PLAYER' | 'ENEMY' | 'LOOT' | 'EXIT' | 'PROJECTILE';
  color: string;
  rotation?: number;
  hp?: number;
  maxHp?: number;
  dead?: boolean;
  itemData?: Item; // For loot
  velocity?: Point;
  facing?: number; // angle in radians
}

export interface RaidResult {
  survived: boolean;
  lootObtained: Item[];
  xpGained: number;
}