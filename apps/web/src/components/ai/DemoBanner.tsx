'use client';

import React from 'react';
import { Sparkles, RotateCcw, Database, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface DemoBannerProps {
  activeScenarioName?: string;
  onReset: () => void;
  isResetting?: boolean;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  activeScenarioName = 'Stock Out Emergency in Central Warehouse',
  onReset,
  isResetting = false,
}) => {
  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border-b border-amber-500/20 backdrop-blur-sm px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        {/* Demo Mode Badge */}
        <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span>DEMO MODE: ON</span>
        </div>

        {/* Active Scenario Info */}
        <div className="flex items-center gap-2 text-slate-200 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400">Active Scenario:</span>
          <span className="text-white font-semibold underline decoration-purple-500/50 underline-offset-4">
            {activeScenarioName}
          </span>
        </div>

        {/* Data Source Badge */}
        <div className="hidden md:flex items-center gap-1 text-slate-400 bg-slate-800/60 border border-slate-700/60 px-2 py-0.5 rounded">
          <Database className="w-3 h-3 text-cyan-400" />
          <span>Data Source: <strong className="text-cyan-300">Demo Dataset</strong></span>
        </div>
      </div>

      {/* One-Click Reset Button */}
      <button
        onClick={onReset}
        disabled={isResetting}
        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 border border-rose-500/30 px-3 py-1 rounded-lg transition-all shadow-sm font-medium hover:scale-105 active:scale-95 disabled:opacity-50"
      >
        <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
        <span>{isResetting ? 'Resetting...' : 'Reset Demo Environment'}</span>
      </button>
    </div>
  );
};
