import React, { useState } from 'react';
import { PlayerStats, GamePhase, Item, RaidResult, LevelConfig } from './types';
import { INITIAL_PLAYER_STATS, LEVELS } from './constants';
import BaseHub from './components/BaseHub';
import RaidGame from './components/RaidGame';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.MENU);
  const [stats, setStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [lastRaidResult, setLastRaidResult] = useState<RaidResult | null>(null);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);

  const handleStartRaid = (level: LevelConfig) => {
    setCurrentLevel(level);
    setPhase(GamePhase.RAID);
  };

  const handleSellItem = (itemToSell: Item) => {
    setStats(prev => ({
      ...prev,
      money: prev.money + itemToSell.value,
      inventory: prev.inventory.filter(i => i.id !== itemToSell.id)
    }));
  };

  const handleRaidEnd = (result: RaidResult) => {
    setLastRaidResult(result);
    setPhase(GamePhase.RESULT);
    
    if (result.survived) {
        setStats(prev => ({
            ...prev,
            inventory: [...prev.inventory, ...result.lootObtained],
            money: prev.money + (result.xpGained / 5), // Cash bonus
            level: prev.level + (result.xpGained > 1000 ? 1 : 0) // Simple leveling
        }));
    } else {
        // Penalty: Lose ammo/consumables? For now, keep it casual.
    }
  };

  const returnToBase = () => {
    // Auto Heal
    setStats(prev => ({ ...prev, hp: prev.maxHp }));
    setPhase(GamePhase.MENU);
  };

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-green-500 selection:text-black">
      
      {phase === GamePhase.MENU && (
        <BaseHub 
          playerStats={stats} 
          onStartRaid={handleStartRaid} 
          onSellItem={handleSellItem}
        />
      )}

      {phase === GamePhase.RAID && (
        <RaidGame 
          levelConfig={currentLevel}
          onExtract={handleRaidEnd} 
          onDie={handleRaidEnd}
        />
      )}

      {phase === GamePhase.RESULT && lastRaidResult && (
        <div className="flex flex-col items-center justify-center h-full space-y-6 bg-slate-900/95 backdrop-blur p-4 animate-in fade-in duration-500">
            <div className={`text-7xl font-black uppercase tracking-tighter italic drop-shadow-2xl ${lastRaidResult.survived ? 'text-green-500' : 'text-red-500'}`}>
                {lastRaidResult.survived ? 'MISSION COMPLETE' : 'MIA'}
            </div>
            
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-600 pb-4 flex justify-between">
                    <span>Debriefing</span>
                    <span className="text-slate-500 text-sm font-normal self-center">{new Date().toLocaleTimeString()}</span>
                </h2>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-900 p-4 rounded-lg text-center">
                        <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">XP Earned</div>
                        <div className="text-2xl font-mono text-white">+{lastRaidResult.xpGained}</div>
                    </div>
                     <div className="bg-slate-900 p-4 rounded-lg text-center">
                        <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Loot Secured</div>
                        <div className="text-2xl font-mono text-yellow-400">{lastRaidResult.lootObtained.length} Items</div>
                    </div>
                </div>

                {lastRaidResult.lootObtained.length > 0 && (
                    <>
                        <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Acquisitions</div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {lastRaidResult.lootObtained.map((item, idx) => (
                                <div key={idx} className="text-sm flex justify-between items-center bg-slate-900/50 p-3 rounded hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-slate-200 font-medium">{item.name}</span>
                                    </div>
                                    <span className="text-green-500 font-mono text-xs">${item.value}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <button 
                onClick={returnToBase}
                className="px-10 py-4 bg-white hover:bg-slate-200 text-slate-900 font-black text-lg rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105 active:scale-95"
            >
                RETURN TO BASE
            </button>
        </div>
      )}

    </div>
  );
};

export default App;