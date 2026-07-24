'use client';

import React from 'react';
import { Play, Sparkles, AlertTriangle, TrendingUp, Package, ShieldCheck, DollarSign, Layers, Search, Workflow, RefreshCw } from 'lucide-react';

export interface DemoScenario {
  id: string;
  title: string;
  category: string;
  description: string;
  targetModule: string;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedRoi: string;
}

interface DemoScenarioSwitcherProps {
  scenarios: DemoScenario[];
  activeScenarioId?: string;
  onSelectScenario: (id: string) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const DemoScenarioSwitcher: React.FC<DemoScenarioSwitcherProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onReset,
  isLoading = false,
}) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'Inventory & Procurement':
        return <Package className="w-5 h-5 text-amber-400" />;
      case 'Procurement Intelligence':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'Executive Briefings':
        return <DollarSign className="w-5 h-5 text-purple-400" />;
      case 'Approvals & Governance':
        return <ShieldCheck className="w-5 h-5 text-cyan-400" />;
      case 'Workflow Automation':
        return <Workflow className="w-5 h-5 text-indigo-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
            <Sparkles className="w-4 h-4" /> Live Sales & Client Demo Control Center
          </div>
          <h2 className="text-xl font-bold text-white mt-1">10 Preset Demo Scenarios</h2>
          <p className="text-xs text-slate-400 mt-1">
            Click any scenario to instantly seed live operational state and trigger AI Orchestration during client demos.
          </p>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
        >
          <RefreshCw className="w-4 h-4 text-rose-400" />
          <span>Reset Demo Environment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario, index) => {
          const isActive = scenario.id === activeScenarioId;

          return (
            <div
              key={scenario.id}
              onClick={() => onSelectScenario(scenario.id)}
              className={`group relative cursor-pointer rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500'
                  : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              {/* Scenario Number */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
                  Scenario #{index + 1} • {scenario.targetModule}
                </span>

                {isActive && (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full animate-pulse">
                    ACTIVE
                  </span>
                )}
              </div>

              {/* Title & Icon */}
              <div className="flex items-start gap-3 my-2">
                <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-700 shrink-0">
                  {getIcon(scenario.category)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm leading-snug group-hover:text-purple-300 transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {scenario.description}
                  </p>
                </div>
              </div>

              {/* Footer Specs & Launch CTA */}
              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium text-[11px]">
                  ROI: {scenario.expectedRoi}
                </span>

                <button
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-700 text-slate-200 group-hover:bg-purple-600 group-hover:text-white'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isActive ? 'Triggered' : 'Launch Demo'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
