import React, { useMemo, useState } from 'react';
import { PlayerStats, Item, ItemType, LevelConfig } from '../types';
import { LEVELS } from '../constants';

interface BaseHubProps {
  playerStats: PlayerStats;
  onStartRaid: (level: LevelConfig) => void;
  onSellItem: (item: Item) => void;
}

const BaseHub: React.FC<BaseHubProps> = ({ playerStats, onStartRaid, onSellItem }) => {
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(LEVELS[0]);
  
  const currentWeight = useMemo(() => {
    return playerStats.inventory.reduce((acc, item) => acc + item.weight, 0);
  }, [playerStats.inventory]);

  const weightPercentage = Math.min(100, (currentWeight / playerStats.maxWeight) * 100);
  const isOverweight = currentWeight > playerStats.maxWeight;

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-4 space-y-4">
      {/* Header */}
      <header className="bg-slate-800 p-6 rounded-2xl shadow-lg border-b-4 border-green-500 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
              Escape From <span className="text-green-400">Duckov</span>
            </h1>
            <p className="text-slate-400 text-sm font-mono">Agent Panda // Status: READY</p>
        </div>
        <div className="text-right">
            <div className="text-3xl font-bold text-yellow-400">${playerStats.money.toLocaleString()}</div>
            <div className="text-xs text-slate-500 tracking-widest">CRYPTO-BAMBOO FUNDS</div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        
        {/* Left Column: Character & Mission (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto">
            
            {/* Character Card */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="bg-slate-900 rounded-lg h-40 flex items-center justify-center relative overflow-hidden mb-4">
                     <div className="w-24 h-24 bg-white rounded-full shadow-lg border-4 border-slate-900 flex items-center justify-center text-4xl relative z-10">
                        🐼
                     </div>
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/50 to-slate-900"></div>
                </div>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-slate-200">Panda Vitals</h3>
                    <div className="w-full bg-slate-900 rounded-full h-4 border border-slate-700">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: `${(playerStats.hp / playerStats.maxHp) * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                        <span>HP: {playerStats.hp}/{playerStats.maxHp}</span>
                        <span>Weight: {currentWeight.toFixed(1)}/{playerStats.maxWeight}KG</span>
                    </div>
                </div>
            </div>

            {/* Mission Selection */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                    Select Operation
                </h3>
                
                <div className="space-y-2 flex-1 overflow-y-auto mb-4">
                    {LEVELS.map(level => (
                        <button
                            key={level.id}
                            onClick={() => setSelectedLevel(level)}
                            className={`w-full p-3 rounded-lg text-left transition-all border-2 relative overflow-hidden
                                ${selectedLevel.id === level.id 
                                    ? 'bg-slate-700 border-green-500 shadow-[0_0_15px_rgba(74,222,128,0.2)]' 
                                    : 'bg-slate-900/50 border-transparent hover:bg-slate-700/50 hover:border-slate-600'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white">{level.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                                    LVL {level.difficulty}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400">{level.description}</p>
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => onStartRaid(selectedLevel)}
                    className="w-full py-4 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-black text-xl rounded-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                    Deploy to Raid
                </button>
            </div>
        </div>

        {/* Right Column: Stash (8 cols) */}
        <div className="lg:col-span-8 bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-200 text-xl flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                    Global Stash
                </h3>
                <div className={`text-sm font-mono px-3 py-1 rounded bg-slate-900 ${isOverweight ? 'text-red-500 border border-red-900' : 'text-green-400 border border-slate-700'}`}>
                    STASH WEIGHT: {currentWeight.toFixed(1)} / {playerStats.maxWeight.toFixed(1)} KG
                </div>
            </div>

            {/* Weight Bar */}
            <div className="w-full bg-slate-900 h-1 mb-4">
                <div 
                    className={`h-full transition-all duration-300 ${isOverweight ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${weightPercentage}%` }}
                />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-2 content-start">
                {playerStats.inventory.length === 0 ? (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-700 rounded-xl">
                        <span className="text-4xl mb-2">📦</span>
                        <p>Stash is empty. Go raid some ducks!</p>
                    </div>
                ) : (
                    playerStats.inventory.map((item) => (
                        <div key={item.id} className="bg-slate-900 p-3 rounded border border-slate-700 flex justify-between items-center group hover:border-slate-500 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-lg border shadow-inner" style={{ borderColor: item.color }}>
                                    {item.type === ItemType.WEAPON_MOD ? '🔧' : 
                                     item.type === ItemType.VALUABLE ? '💎' :
                                     item.type === ItemType.MEDKIT ? '💊' : 
                                     item.type === ItemType.AMMO ? '⚡' : '🦴'}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-200 text-sm">{item.name}</div>
                                    <div className="text-xs text-slate-500 flex gap-2">
                                        <span>{item.weight}kg</span>
                                        <span className="text-green-500">${item.value}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => onSellItem(item)}
                                className="px-4 py-2 bg-slate-800 hover:bg-green-600 hover:text-white text-green-500 text-xs font-bold rounded border border-slate-700 transition-colors"
                            >
                                SELL
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BaseHub;