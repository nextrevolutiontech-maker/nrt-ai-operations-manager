'use client';

import React from 'react';
import { X, BrainCircuit, ShieldCheck, AlertTriangle, Cpu, TrendingUp, CheckCircle, FileText } from 'lucide-react';

export interface DecisionReasoning {
  title: string;
  category?: string;
  evidence: string[];
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceScore: number;
  policiesApplied: string[];
  toolsUsed: string[];
  expectedRoi: string;
  recommendedAction: string;
}

interface ExplainDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reasoning: DecisionReasoning | null;
}

export const ExplainDecisionModal: React.FC<ExplainDecisionModalProps> = ({
  isOpen,
  onClose,
  reasoning,
}) => {
  if (!isOpen || !reasoning) return null;

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return (
          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> High Risk
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Medium Risk
          </span>
        );
      default:
        return (
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Low Risk
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-b border-purple-500/30 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 rounded-xl border border-purple-500/40 text-purple-300">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                AI Decision Transparency Engine
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">
                Why Did AI Recommend This?
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Target Title & Recommendation */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
            <div className="text-xs text-purple-400 font-medium mb-1">Target Action</div>
            <h4 className="font-semibold text-white text-base mb-2">{reasoning.title}</h4>
            <div className="p-3 bg-purple-950/40 border border-purple-800/50 rounded-lg text-purple-200 text-xs leading-relaxed font-mono">
              ⚡ <strong>Proposed Execution:</strong> {reasoning.recommendedAction}
            </div>
          </div>

          {/* Key Metrics: Risk & Confidence & ROI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Risk */}
            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium mb-2">Risk Evaluation</span>
              {getRiskBadge(reasoning.riskScore)}
            </div>

            {/* Confidence */}
            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium block mb-1">AI Confidence</span>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-xl font-bold text-cyan-400">{reasoning.confidenceScore}%</span>
                <span className="text-xs text-slate-400">Model Certainty</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full"
                  style={{ width: `${reasoning.confidenceScore}%` }}
                />
              </div>
            </div>

            {/* ROI */}
            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium block mb-1">Expected ROI</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-sm">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span>{reasoning.expectedRoi}</span>
              </div>
            </div>
          </div>

          {/* Evidence List */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-400" /> Empirical Evidence Gathered
            </h5>
            <ul className="space-y-2">
              {reasoning.evidence.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50 text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies Applied */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Governance Policies Enforced
            </h5>
            <div className="flex flex-wrap gap-2">
              {reasoning.policiesApplied.map((policy, idx) => (
                <span key={idx} className="bg-indigo-950/60 text-indigo-300 border border-indigo-700/60 text-xs px-2.5 py-1 rounded-md font-mono">
                  {policy}
                </span>
              ))}
            </div>
          </div>

          {/* Tools & Services Called */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" /> AI Tools Called
            </h5>
            <div className="flex flex-wrap gap-2">
              {reasoning.toolsUsed.map((tool, idx) => (
                <span key={idx} className="bg-slate-800 text-cyan-300 border border-cyan-800/50 text-xs px-2.5 py-1 rounded-md font-mono">
                  ⚙️ {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900 border-t border-slate-800 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-purple-500/20"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
