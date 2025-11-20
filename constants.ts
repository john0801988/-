import { Item, ItemType, LevelConfig } from './types';

export const TILE_SIZE = 48; // Slightly larger for detail
export const VIEW_DISTANCE = 350;
export const PLAYER_SPEED = 3.5;
export const ENEMY_SPEED = 2;
export const BULLET_SPEED = 12;

export const COLORS = {
  PLAYER_BODY: '#FFFFFF', 
  PLAYER_ACCENT: '#1F2937', // Dark Slate (Panda Black)
  ENEMY_BODY: '#FCD34D', // Duck Yellow
  ENEMY_BEAK: '#F97316', // Orange
  WALL_TOP: '#475569', // Slate 600
  WALL_FACE: '#1E293B', // Slate 800
  FLOOR: '#0F172A', // Slate 900
  LOOT: '#38BDF8',
  EXIT: '#22C55E',
  PROJECTILE: '#F59E0B',
};

export const LEVELS: LevelConfig[] = [
  {
    id: 'level_1',
    name: 'Bamboo Outskirts',
    description: 'The edge of the forest. Light enemy presence.',
    difficulty: 1,
    mapWidth: 30,
    mapHeight: 30,
    enemyCountMin: 5,
    enemyCountMax: 8,
    lootCountMin: 10,
    lootCountMax: 15,
    wallColor: '#4ade80', // Greenish walls
    floorColor: '#064e3b', // Dark green floor
  },
  {
    id: 'level_2',
    name: 'Duck City Park',
    description: 'Urban combat zone. Moderate resistance.',
    difficulty: 2,
    mapWidth: 45,
    mapHeight: 45,
    enemyCountMin: 12,
    enemyCountMax: 18,
    lootCountMin: 15,
    lootCountMax: 25,
    wallColor: '#94a3b8', // Concrete
    floorColor: '#1e293b', // Asphalt
  },
  {
    id: 'level_3',
    name: 'The Mothership',
    description: 'Elite Duck Guards. High risk, high reward.',
    difficulty: 3,
    mapWidth: 60,
    mapHeight: 60,
    enemyCountMin: 25,
    enemyCountMax: 35,
    lootCountMin: 20,
    lootCountMax: 40,
    wallColor: '#64748b', // Metal
    floorColor: '#0f172a', // Dark Metal
  },
];

export const LOOT_TABLE: Item[] = [
  { id: 'bamboo', name: 'Chewed Bamboo', type: ItemType.JUNK, weight: 0.5, value: 15, color: '#86EFAC' },
  { id: 'bread', name: 'Stale Bread', type: ItemType.JUNK, weight: 0.2, value: 10, color: '#A8A29E' },
  { id: 'duck_feather', name: 'Golden Feather', type: ItemType.VALUABLE, weight: 0.1, value: 200, color: '#FCD34D' },
  { id: 'tech_scrap', name: 'Duck Tech', type: ItemType.WEAPON_MOD, weight: 1.0, value: 450, color: '#818CF8' },
  { id: 'bandage', name: 'Bandage', type: ItemType.MEDKIT, weight: 0.5, value: 60, color: '#F87171' },
  { id: 'energy_cell', name: 'Energy Cell', type: ItemType.AMMO, weight: 0.2, value: 30, color: '#4ADE80' },
  { id: 'fusion_core', name: 'Fusion Core', type: ItemType.VALUABLE, weight: 2.5, value: 1000, color: '#FBBF24' },
];

export const INITIAL_PLAYER_STATS = {
  hp: 100,
  maxHp: 100,
  money: 500,
  inventory: [],
  maxWeight: 20.0,
  level: 1,
};