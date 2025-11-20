import { TILE_SIZE, LOOT_TABLE } from '../constants';
import { Entity, LevelConfig } from '../types';

export const generateMap = (levelConfig: LevelConfig) => {
  const { mapWidth, mapHeight } = levelConfig;
  const grid: number[][] = [];
  
  // Initialize with walls (1)
  for (let y = 0; y < mapHeight; y++) {
    const row = [];
    for (let x = 0; x < mapWidth; x++) {
      row.push(1);
    }
    grid.push(row);
  }

  // Improved Cave Generation (Cellular Automata-ish + Drunkard)
  let x = Math.floor(mapWidth / 2);
  let y = Math.floor(mapHeight / 2);
  const maxSteps = (mapWidth * mapHeight) * 0.6; // Fill about 60% related to size

  for (let i = 0; i < maxSteps; i++) {
    grid[y][x] = 0; // Floor
    const dir = Math.floor(Math.random() * 4);
    if (dir === 0 && y > 2) y--;
    else if (dir === 1 && y < mapHeight - 3) y++;
    else if (dir === 2 && x > 2) x--;
    else if (dir === 3 && x < mapWidth - 3) x++;
    
    // Make corridors wider sometimes
    if (Math.random() > 0.7) {
        if (y+1 < mapHeight-1) grid[y+1][x] = 0;
        if (x+1 < mapWidth-1) grid[y][x+1] = 0;
    }
  }

  // Ensure spawn area is clear
  const spawnPoint = { x: Math.floor(mapWidth / 2) * TILE_SIZE, y: Math.floor(mapHeight / 2) * TILE_SIZE };

  // Place Entities
  const enemies: Entity[] = [];
  const loot: Entity[] = [];
  let exitPoint = { x: 0, y: 0 };

  // Find valid floor tiles
  const floorTiles: {x: number, y: number}[] = [];
  for(let py=0; py<mapHeight; py++) {
    for(let px=0; px<mapWidth; px++) {
        if(grid[py][px] === 0) {
            // Avoid spawn area
            if (Math.abs(px - mapWidth/2) > 3 || Math.abs(py - mapHeight/2) > 3) {
                floorTiles.push({x: px, y: py});
            }
        }
    }
  }

  // Shuffle tiles
  const shuffled = floorTiles.sort(() => 0.5 - Math.random());

  // Place Exit
  if (shuffled.length > 0) {
      const exitTile = shuffled.pop()!;
      exitPoint = { x: exitTile.x * TILE_SIZE + TILE_SIZE/2, y: exitTile.y * TILE_SIZE + TILE_SIZE/2 };
  }

  // Place Enemies based on level config
  const enemyCount = Math.floor(Math.random() * (levelConfig.enemyCountMax - levelConfig.enemyCountMin + 1)) + levelConfig.enemyCountMin;
  for(let i=0; i<enemyCount; i++) {
      if(shuffled.length === 0) break;
      const tile = shuffled.pop()!;

      enemies.push({
          id: `enemy-${i}`,
          x: tile.x * TILE_SIZE + TILE_SIZE/2,
          y: tile.y * TILE_SIZE + TILE_SIZE/2,
          radius: 16,
          type: 'ENEMY',
          color: 'yellow',
          hp: 30 + (levelConfig.difficulty * 10),
          maxHp: 30 + (levelConfig.difficulty * 10),
          dead: false,
          facing: Math.random() * Math.PI * 2
      });
  }

  // Place Loot
  const lootCount = Math.floor(Math.random() * (levelConfig.lootCountMax - levelConfig.lootCountMin + 1)) + levelConfig.lootCountMin;
  for(let i=0; i<lootCount; i++) {
      if(shuffled.length === 0) break;
      const tile = shuffled.pop()!;
      const itemTemplate = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
      
      loot.push({
          id: `loot-${i}`,
          x: tile.x * TILE_SIZE + TILE_SIZE/2,
          y: tile.y * TILE_SIZE + TILE_SIZE/2,
          radius: 12,
          type: 'LOOT',
          color: itemTemplate.color,
          itemData: { ...itemTemplate, id: `item-${Math.random().toString(36).substr(2, 9)}` }
      });
  }

  return { grid, spawnPoint, enemies, loot, exitPoint };
};