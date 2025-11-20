import React, { useEffect, useRef, useState, useCallback } from 'react';
import { COLORS, TILE_SIZE, VIEW_DISTANCE, PLAYER_SPEED, ENEMY_SPEED, BULLET_SPEED } from '../constants';
import { Entity, Point, Item, RaidResult, LevelConfig, ItemType } from '../types';
import { generateMap } from '../services/mapGenerator';

interface RaidGameProps {
  levelConfig: LevelConfig;
  onExtract: (result: RaidResult) => void;
  onDie: (result: RaidResult) => void;
}

const RaidGame: React.FC<RaidGameProps> = ({ levelConfig, onExtract, onDie }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game State Refs
  const playerRef = useRef<Entity>({ 
    id: 'player', x: 0, y: 0, radius: 14, type: 'PLAYER', color: COLORS.PLAYER_BODY, hp: 100, maxHp: 100, facing: 0 
  });
  const mapRef = useRef<number[][]>([]);
  const enemiesRef = useRef<Entity[]>([]);
  const lootRef = useRef<Entity[]>([]);
  const projectilesRef = useRef<Entity[]>([]);
  const exitRef = useRef<Point>({ x: 0, y: 0 });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const inventoryRef = useRef<Item[]>([]);
  
  // UI State
  const [playerHp, setPlayerHp] = useState(100);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [showInventory, setShowInventory] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<Item[]>([]);
  const [message, setMessage] = useState<string | null>("Locate the Green Zone to Extract!");

  // Initialize Game
  useEffect(() => {
    const { grid, spawnPoint, enemies, loot, exitPoint } = generateMap(levelConfig);
    mapRef.current = grid;
    playerRef.current.x = spawnPoint.x;
    playerRef.current.y = spawnPoint.y;
    enemiesRef.current = enemies;
    lootRef.current = loot;
    exitRef.current = exitPoint;

    const handleKeyDown = (e: KeyboardEvent) => { 
        keysRef.current[e.code] = true; 
        
        // Inventory Toggle
        if (e.code === 'Tab' || e.code === 'KeyB') {
            e.preventDefault();
            setShowInventory(prev => !prev);
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    const handleMouseDown = () => {
        if (!showInventory) shoot();
    };
    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === 'KeyE') {
            checkForLoot();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keypress', handleKeyPress);

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keypress', handleKeyPress);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelConfig]);

  // Sync ref inventory to state for UI rendering when opening modal
  useEffect(() => {
    if (showInventory) {
        setInventoryItems([...inventoryRef.current]);
    }
  }, [showInventory]);

  const shoot = () => {
    const p = playerRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const angle = Math.atan2(mouseRef.current.y - centerY, mouseRef.current.x - centerX);
    
    projectilesRef.current.push({
        id: Math.random().toString(),
        x: p.x,
        y: p.y,
        radius: 3,
        type: 'PROJECTILE',
        color: COLORS.PROJECTILE,
        velocity: {
            x: Math.cos(angle) * BULLET_SPEED,
            y: Math.sin(angle) * BULLET_SPEED
        }
    });
  };

  const checkForLoot = () => {
      const p = playerRef.current;
      const lootIndex = lootRef.current.findIndex(l => {
          const dx = l.x - p.x;
          const dy = l.y - p.y;
          return Math.sqrt(dx*dx + dy*dy) < (p.radius + l.radius + 20);
      });

      if (lootIndex !== -1) {
          const item = lootRef.current[lootIndex].itemData;
          if (item) {
              inventoryRef.current.push(item);
              setInventoryCount(prev => prev + 1);
              lootRef.current.splice(lootIndex, 1);
              setMessage(`Picked up ${item.name}!`);
              setTimeout(() => setMessage(null), 2000);
          }
      }
  };

  const checkCollision = (x: number, y: number): boolean => {
    const mapW = mapRef.current[0]?.length || 0;
    const mapH = mapRef.current.length || 0;
    
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    
    if (tileX < 0 || tileX >= mapW || tileY < 0 || tileY >= mapH) return true;
    return mapRef.current[tileY][tileX] === 1;
  };

  const update = () => {
    if (showInventory) return; // Pause when inventory open?

    const p = playerRef.current;
    
    // Player Movement
    let dx = 0;
    let dy = 0;
    if (keysRef.current['KeyW']) dy -= PLAYER_SPEED;
    if (keysRef.current['KeyS']) dy += PLAYER_SPEED;
    if (keysRef.current['KeyA']) dx -= PLAYER_SPEED;
    if (keysRef.current['KeyD']) dx += PLAYER_SPEED;

    if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
    }

    if (!checkCollision(p.x + dx, p.y)) p.x += dx;
    if (!checkCollision(p.x, p.y + dy)) p.y += dy;

    // Update facing angle based on mouse
    const canvas = canvasRef.current;
    if (canvas) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        p.facing = Math.atan2(mouseRef.current.y - centerY, mouseRef.current.x - centerX);
    }

    // Projectiles
    for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const proj = projectilesRef.current[i];
        if (!proj.velocity) continue;
        
        proj.x += proj.velocity.x;
        proj.y += proj.velocity.y;

        if (checkCollision(proj.x, proj.y)) {
            projectilesRef.current.splice(i, 1);
            continue;
        }

        const hitEnemyIndex = enemiesRef.current.findIndex(e => {
            const dist = Math.hypot(e.x - proj.x, e.y - proj.y);
            return dist < e.radius + proj.radius;
        });

        if (hitEnemyIndex !== -1) {
            const enemy = enemiesRef.current[hitEnemyIndex];
            enemy.hp = (enemy.hp || 0) - 10;
            // Knockback
            enemy.x += proj.velocity.x * 0.5;
            enemy.y += proj.velocity.y * 0.5;

            if (enemy.hp <= 0) {
                enemiesRef.current.splice(hitEnemyIndex, 1);
            }
            projectilesRef.current.splice(i, 1);
        }
    }

    // Enemies Logic (Duck AI)
    enemiesRef.current.forEach(e => {
        const dist = Math.hypot(p.x - e.x, p.y - e.y);
        e.facing = Math.atan2(p.y - e.y, p.x - e.x); // Face player

        if (dist < 300 && dist > 25) {
            // Simple chase with collision sliding
            const moveX = Math.cos(e.facing!) * ENEMY_SPEED;
            const moveY = Math.sin(e.facing!) * ENEMY_SPEED;
            
            if (!checkCollision(e.x + moveX, e.y)) e.x += moveX;
            if (!checkCollision(e.x, e.y + moveY)) e.y += moveY;
        }

        if (dist < p.radius + e.radius + 5) {
            p.hp = (p.hp || 100) - 0.5;
            setPlayerHp(Math.max(0, Math.floor(p.hp)));
        }
    });

    if ((p.hp || 0) <= 0) {
        onDie({ survived: false, lootObtained: [], xpGained: 0 });
        return;
    }

    const distToExit = Math.hypot(p.x - exitRef.current.x, p.y - exitRef.current.y);
    if (distToExit < TILE_SIZE) {
        onExtract({ survived: true, lootObtained: inventoryRef.current, xpGained: 500 * levelConfig.difficulty + (enemiesRef.current.length * 10) });
        return;
    }
  };

  // Custom Drawing Functions for Pseudo-3D / Sprites
  const drawWall3D = (ctx: CanvasRenderingContext2D, x: number, y: number, colorTop: string, colorFace: string) => {
      const height = TILE_SIZE * 0.6; // Wall Height
      
      // Face (Front Side)
      ctx.fillStyle = colorFace;
      ctx.fillRect(x, y + TILE_SIZE - height, TILE_SIZE, height);
      
      // Top
      ctx.fillStyle = colorTop;
      ctx.fillRect(x, y - height, TILE_SIZE, TILE_SIZE);
      
      // Top Highlight
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x, y - height, TILE_SIZE, 4);
  };

  const drawPanda = (ctx: CanvasRenderingContext2D, entity: Entity) => {
      ctx.save();
      ctx.translate(entity.x, entity.y);
      // No rotation for body in top-down usually, but let's rotate slightly to face mouse
      // Actually, sprites usually don't rotate full 360 in 2.5D, but let's do it for top-down feel
      ctx.rotate(entity.facing || 0);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 0, entity.radius, entity.radius * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      ctx.fillStyle = COLORS.PLAYER_ACCENT;
      ctx.beginPath();
      ctx.arc(10, -8, 6, 0, Math.PI*2); // Right Ear
      ctx.arc(10, 8, 6, 0, Math.PI*2); // Left Ear
      ctx.fill();

      // Body (Head/Body combo)
      ctx.fillStyle = COLORS.PLAYER_BODY;
      ctx.beginPath();
      ctx.arc(0, 0, entity.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Eyes (Black patches)
      ctx.fillStyle = COLORS.PLAYER_ACCENT;
      ctx.beginPath();
      ctx.ellipse(6, -5, 4, 5, Math.PI / 4, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(6, 5, 4, 5, -Math.PI / 4, 0, Math.PI*2);
      ctx.fill();

      // Eyes (White dots)
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(7, -5, 1.5, 0, Math.PI*2);
      ctx.arc(7, 5, 1.5, 0, Math.PI*2);
      ctx.fill();

      // Hands (holding invisible gun)
      ctx.fillStyle = COLORS.PLAYER_ACCENT;
      ctx.beginPath();
      ctx.ellipse(8, 12, 5, 3, Math.PI/4, 0, Math.PI*2); // Left hand
      ctx.fill();
      
      ctx.restore();
  };

  const drawDuck = (ctx: CanvasRenderingContext2D, entity: Entity) => {
      ctx.save();
      ctx.translate(entity.x, entity.y);
      ctx.rotate(entity.facing || 0);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 0, entity.radius, entity.radius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = COLORS.ENEMY_BODY;
      ctx.beginPath();
      ctx.ellipse(-5, 0, 14, 10, 0, 0, Math.PI*2);
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.arc(5, 0, 9, 0, Math.PI*2);
      ctx.fill();

      // Beak (Orange)
      ctx.fillStyle = COLORS.ENEMY_BEAK;
      ctx.beginPath();
      ctx.moveTo(10, -3);
      ctx.lineTo(18, 0);
      ctx.lineTo(10, 3);
      ctx.fill();

      // Wing
      ctx.fillStyle = '#F59E0B'; // Darker yellow
      ctx.beginPath();
      ctx.ellipse(-5, 5, 8, 4, 0.5, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-5, -5, 8, 4, -0.5, 0, Math.PI*2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(8, -3, 1.5, 0, Math.PI*2); // Right
      ctx.arc(8, 3, 1.5, 0, Math.PI*2); // Left
      ctx.fill();

      // Health Bar
      ctx.rotate(-(entity.facing || 0)); // Unrotate for bar
      ctx.fillStyle = 'red';
      ctx.fillRect(-12, -25, 24, 4);
      ctx.fillStyle = 'green';
      ctx.fillRect(-12, -25, 24 * ((entity.hp || 1) / (entity.maxHp || 1)), 4);

      ctx.restore();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const p = playerRef.current;
    const mapW = mapRef.current[0].length;
    const mapH = mapRef.current.length;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2 - p.x, canvas.height / 2 - p.y);

    // Viewport culling
    const startCol = Math.floor((p.x - canvas.width/2) / TILE_SIZE) - 2;
    const endCol = startCol + (canvas.width / TILE_SIZE) + 4;
    const startRow = Math.floor((p.y - canvas.height/2) / TILE_SIZE) - 2;
    const endRow = startRow + (canvas.height / TILE_SIZE) + 4;

    // 1. Draw Floor
    for (let y = Math.max(0, startRow); y < Math.min(mapH, endRow); y++) {
        for (let x = Math.max(0, startCol); x < Math.min(mapW, endCol); x++) {
            if (mapRef.current[y][x] === 0) {
                const tileX = x * TILE_SIZE;
                const tileY = y * TILE_SIZE;
                ctx.fillStyle = levelConfig.floorColor; // Level dependent floor
                ctx.fillRect(tileX, tileY, TILE_SIZE + 1, TILE_SIZE + 1); // +1 to fix subpixel gaps
                // Slight texture
                ctx.fillStyle = 'rgba(255,255,255,0.02)';
                if ((x+y)%2 === 0) ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // 2. Draw Walls (Sorted by Y helps depth but for simple grid, standard loop is ok if we handle overlaps right)
    // For pseudo-3D, walls stick UP, so we should draw them after floor.
    // And we should draw entities "in between" walls if we want perfect sorting, but top-down Z-buffering is complex.
    // Simplified: Draw Floor -> Draw Walls -> Draw Entities on top.
    // Better: Y-Sort everything.
    
    // Let's try basic layering: Floor -> Items -> Walls -> Characters (allows hiding behind walls?)
    // Or: Floor -> Items -> Characters -> Walls (Walls obscure characters). 
    // Standard 2.5D: Y-Sort.
    
    // Collect all renderables
    const renderables: { y: number, draw: () => void }[] = [];

    // Walls
    for (let y = Math.max(0, startRow); y < Math.min(mapH, endRow); y++) {
        for (let x = Math.max(0, startCol); x < Math.min(mapW, endCol); x++) {
            if (mapRef.current[y][x] === 1) {
                renderables.push({
                    y: (y * TILE_SIZE) + TILE_SIZE, // Sort by bottom of tile
                    draw: () => drawWall3D(ctx, x * TILE_SIZE, y * TILE_SIZE, COLORS.WALL_TOP, levelConfig.wallColor)
                });
            }
        }
    }

    // Entities
    [...enemiesRef.current, playerRef.current].forEach(e => {
        renderables.push({
            y: e.y + e.radius, // Sort by feet
            draw: () => e.type === 'PLAYER' ? drawPanda(ctx, e) : drawDuck(ctx, e)
        });
    });

    // Loot
    lootRef.current.forEach(l => {
        renderables.push({
            y: l.y,
            draw: () => {
                ctx.fillStyle = l.color;
                // Draw simple item shape
                ctx.beginPath();
                ctx.arc(l.x, l.y, 6, 0, Math.PI*2);
                ctx.fill();
                // Glow
                ctx.shadowColor = l.color;
                ctx.shadowBlur = 10;
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                // Floating Text if close
                if (Math.hypot(p.x - l.x, p.y - l.y) < 60) {
                    ctx.fillStyle = '#fff';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(l.itemData?.name || '?', l.x, l.y - 15);
                }
            }
        });
    });

    // Exit
    renderables.push({
        y: exitRef.current.y,
        draw: () => {
            ctx.fillStyle = COLORS.EXIT;
            ctx.beginPath();
            ctx.arc(exitRef.current.x, exitRef.current.y, 20, 0, Math.PI * 2);
            ctx.fill();
            
            // Beacons
            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            ctx.arc(exitRef.current.x, exitRef.current.y, 15 + Math.sin(Date.now()/200)*5, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText("EVAC", exitRef.current.x, exitRef.current.y + 4);
        }
    });

    // Sort and Draw
    renderables.sort((a, b) => a.y - b.y);
    renderables.forEach(r => r.draw());

    // Projectiles (Always on top)
    projectilesRef.current.forEach(proj => {
        ctx.fillStyle = proj.color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();

    // Fog of War
    ctx.save();
    // Draw dark overlay
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 50,
        canvas.width / 2, canvas.height / 2, VIEW_DISTANCE
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.8, 'rgba(0,0,0,0.6)');
    gradient.addColorStop(1, 'rgba(0,0,0,1)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx.restore();
  };

  const gameLoop = (time: number) => {
    update();
    draw();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="block cursor-crosshair"
      />
      
      {/* HUD Layer */}
      <div className="absolute top-4 left-4 text-white pointer-events-none select-none">
        <div className="flex items-center gap-4">
            <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase font-bold">Armor Integrity</span>
                <div className="w-48 h-5 bg-slate-800 border border-slate-600 rounded skew-x-[-10deg] overflow-hidden">
                    <div className="bg-green-500 h-full transition-all" style={{ width: `${playerHp}%` }} />
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase font-bold">Loot Storage</span>
                <div className="flex items-center gap-2">
                     <span className="text-2xl font-mono font-bold text-yellow-400">{inventoryCount}</span>
                     <span className="text-xs text-slate-500 self-end mb-1">ITEMS</span>
                </div>
            </div>
        </div>
      </div>

      {/* Controls Hint */}
      <div className="absolute bottom-4 left-4 text-slate-500 text-xs pointer-events-none select-none bg-black/50 p-2 rounded">
        <span className="text-white font-bold">WASD</span> Move • <span className="text-white font-bold">Click</span> Shoot • <span className="text-white font-bold">E</span> Loot • <span className="text-white font-bold">TAB</span> Backpack
      </div>

      {/* Level Info */}
      <div className="absolute top-4 right-4 text-right pointer-events-none select-none">
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{levelConfig.name}</h2>
          <p className="text-xs text-green-400">Danger Level: {'⭐'.repeat(levelConfig.difficulty)}</p>
      </div>

      {/* Backpack Modal */}
      {showInventory && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowInventory(false)}>
              <div className="bg-slate-800 border-2 border-slate-600 rounded-xl p-6 w-full max-w-2xl m-4 shadow-2xl transform scale-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                          <span>🎒</span> Tactical Backpack
                      </h2>
                      <button onClick={() => setShowInventory(false)} className="text-slate-400 hover:text-white">
                          ✕ CLOSE (TAB)
                      </button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 min-h-[200px] max-h-[60vh] overflow-y-auto">
                      {inventoryItems.length === 0 ? (
                          <div className="col-span-4 flex flex-col items-center justify-center text-slate-500 h-48">
                              <span className="text-4xl mb-2 opacity-50">🕸️</span>
                              <p>No items collected yet.</p>
                          </div>
                      ) : (
                          inventoryItems.map((item, idx) => (
                              <div key={idx} className="bg-slate-900 p-3 rounded border border-slate-700 relative group">
                                  <div className="w-full aspect-square rounded bg-slate-800 mb-2 flex items-center justify-center text-2xl border border-slate-700 shadow-inner" style={{borderColor: item.color}}>
                                      {item.type === ItemType.VALUABLE ? '💎' : item.type === ItemType.WEAPON_MOD ? '⚙️' : item.type === ItemType.AMMO ? '🔋' : '📦'}
                                  </div>
                                  <div className="font-bold text-xs text-slate-200 truncate">{item.name}</div>
                                  <div className="text-[10px] text-slate-500 flex justify-between mt-1">
                                      <span>{item.weight}kg</span>
                                      <span className="text-green-500">${item.value}</span>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-700 flex justify-between text-sm text-slate-400">
                      <span>Total Weight: {inventoryItems.reduce((a,b)=>a+b.weight,0).toFixed(1)} kg</span>
                      <span>Est. Value: <span className="text-green-400 font-bold">${inventoryItems.reduce((a,b)=>a+b.value,0)}</span></span>
                  </div>
              </div>
          </div>
      )}

      {/* Message Toast */}
      {message && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 pointer-events-none">
            <div className="bg-slate-900/90 text-yellow-400 px-6 py-3 rounded-lg border border-yellow-500/50 shadow-lg animate-bounce text-center font-bold tracking-wide">
              {message}
            </div>
          </div>
      )}
    </div>
  );
};

export default RaidGame;