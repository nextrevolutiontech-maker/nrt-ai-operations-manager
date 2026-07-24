'use client';

import React, { useState, useEffect } from 'react';
import { DemoBanner } from '@/components/ai/DemoBanner';
import { DemoScenarioSwitcher, DemoScenario } from '@/components/ai/DemoScenarioSwitcher';
import { ExplainDecisionModal, DecisionReasoning } from '@/components/ai/ExplainDecisionModal';
import { AiChatDrawer } from '@/components/ai/AiChatDrawer';
import {
  Sparkles,
  LayoutDashboard,
  CheckSquare,
  History,
  PlaySquare,
  Bot,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  ShieldCheck,
  HelpCircle,
  ArrowUpRight,
  RefreshCw,
  MessageSquare,
  Zap,
} from 'lucide-react';

export default function AiWorkspacePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'approvals' | 'tasks' | 'scenarios'>('dashboard');
  const [briefingPeriod, setBriefingPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedReasoning, setSelectedReasoning] = useState<DecisionReasoning | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Active scenario state
  const [activeScenario, setActiveScenario] = useState<DemoScenario>({
    id: 'stock-out-emergency',
    title: 'Stock Out Emergency in Central Warehouse',
    category: 'Inventory & Procurement',
    description: 'Central Warehouse stock for NRT AI Server Box (SKU: NRT-SRV-001) dropped below threshold (5 units left).',
    targetModule: 'Inventory',
    riskScore: 'HIGH',
    expectedRoi: '$14,500 in prevented lost sales',
  });

  // Sample Scenarios Data
  const demoScenarios: DemoScenario[] = [
    {
      id: 'stock-out-emergency',
      title: 'Stock Out Emergency in Central Warehouse',
      category: 'Inventory & Procurement',
      description: 'Central Warehouse stock for NRT AI Server Box (SKU: NRT-SRV-001) dropped below threshold (5 units left). Demand projected to surge 40%.',
      targetModule: 'Inventory',
      riskScore: 'HIGH',
      expectedRoi: '$14,500 lost sales prevented',
    },
    {
      id: 'supplier-price-surge',
      title: 'Supplier Price Surge & Alternative Sourcing',
      category: 'Procurement Intelligence',
      description: 'Primary Supplier A increased unit price of SSD 1TB modules by 18.5%. Secondary Supplier B offers identical pricing.',
      targetModule: 'Procurement',
      riskScore: 'MEDIUM',
      expectedRoi: '$11,850 cost savings over 3 months',
    },
    {
      id: 'executive-financial-briefing',
      title: 'Monthly Executive Financial & P&L Review',
      category: 'Executive Briefings',
      description: 'Automated executive summary synthesized across Sales, Procurement, and General Ledger for Q3 performance.',
      targetModule: 'Finance',
      riskScore: 'LOW',
      expectedRoi: 'Saved 12 hours manual reporting prep',
    },
    {
      id: 'sales-spike-anomaly',
      title: 'Unusual Regional Sales Spike Detection',
      category: 'Sales & Warehouse Balancing',
      description: 'North Regional Hub experienced 320% surge in Dell XPS 15 orders within 48 hours. South Hub has excess stock.',
      targetModule: 'Warehouse',
      riskScore: 'MEDIUM',
      expectedRoi: '$4,200 saved in rush freight',
    },
    {
      id: 'multi-level-po-approval',
      title: 'High-Value Purchase Order Approval Gate',
      category: 'Approvals & Governance',
      description: 'Purchase Order #PO-2026-089 for $85,000 exceeds single-manager authorization limit ($25,000) and requires CFO sign-off.',
      targetModule: 'Approvals',
      riskScore: 'MEDIUM',
      expectedRoi: '100% compliance audit pass',
    },
    {
      id: 'delayed-shipment-impact',
      title: 'Supplier Delay & Customer SLA Mitigation',
      category: 'Operations & Fulfillment',
      description: 'Shipment #SHP-4091 from Supplier Logistics delayed by 5 days due to port congestion, risking 12 customer orders.',
      targetModule: 'Sales',
      riskScore: 'HIGH',
      expectedRoi: 'Prevented customer churn on 12 VIPs',
    },
    {
      id: 'dead-stock-liquidation',
      title: 'Dead Stock Liquidation & Cash Recovery',
      category: 'Inventory Optimization',
      description: '140 units of legacy Accessories (SKU: APP-KBD-01) have 0 stock movement over 90 days, locking up $12,600.',
      targetModule: 'Inventory',
      riskScore: 'LOW',
      expectedRoi: '$9,800 cash recovered in 14 days',
    },
    {
      id: 'journal-entry-audit',
      title: 'Automated Ledger Anomaly & Audit Detection',
      category: 'Finance Audit',
      description: 'Journal Entry #JE-9042 contains duplicate $5,400 debit entry under Miscellaneous Expense without linked Purchase Receipt.',
      targetModule: 'Finance',
      riskScore: 'HIGH',
      expectedRoi: '$5,400 immediate leakage prevented',
    },
    {
      id: 'conversational-deep-dive',
      title: 'Conversational Deep-Dive & Natural Language Querying',
      category: 'Conversational AI',
      description: 'Interactive natural language inquiry into company-wide operational efficiency, cash flow runway, and inventory valuation.',
      targetModule: 'AI Chat',
      riskScore: 'LOW',
      expectedRoi: 'Instant C-Suite insights',
    },
    {
      id: 'custom-workflow-creation',
      title: 'Prompt-Driven Automated Workflow Creation',
      category: 'Workflow Automation',
      description: 'Created active background workflow rule: "When Warehouse Stock drops below 10%, auto-create PO draft and notify Ops Lead".',
      targetModule: 'Workflows',
      riskScore: 'LOW',
      expectedRoi: 'Eliminates 100% manual reorder tasks',
    },
  ];

  const handleSelectScenario = (id: string) => {
    const found = demoScenarios.find((s) => s.id === id);
    if (found) {
      setActiveScenario(found);
    }
  };

  const handleResetEnvironment = async () => {
    setIsResetting(true);
    setTimeout(() => {
      setActiveScenario(demoScenarios[0]);
      setIsResetting(false);
      alert('Demo environment reset successfully! All sessions, alerts, and tasks restored to initial state.');
    }, 800);
  };

  const sampleReasoning: DecisionReasoning = {
    title: activeScenario.title,
    category: activeScenario.category,
    evidence: [
      'Current Inventory Level: 5 Units',
      'Minimum Threshold: 15 Units',
      'Average Daily Consumption: 3.2 Units/Day',
      'Lead Time from Samsung Supplier: 4 Days',
    ],
    riskScore: activeScenario.riskScore,
    confidenceScore: 96,
    policiesApplied: [
      'POL-INV-001: Automatic Stockout Prevention',
      'POL-PUR-004: Preferred Supplier Allocation',
    ],
    toolsUsed: ['InventoryToolsProvider.getWarehouseStock', 'PurchaseToolsProvider.draftPurchaseOrder'],
    expectedRoi: activeScenario.expectedRoi,
    recommendedAction: `Draft Purchase Order for 50 units based on ${activeScenario.title}`,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. Demo Mode Top Banner */}
      <DemoBanner
        activeScenarioName={activeScenario.title}
        onReset={handleResetEnvironment}
        isResetting={isResetting}
      />

      {/* Main Workspace Header */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/20 text-white">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  AI Operations Command Center
                </h1>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold">
                  v2.0 Orchestrator
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Autonomous multi-domain intelligence across Inventory, Procurement, Finance, and Warehouses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-lg shadow-purple-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Launch Conversational AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 py-4 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard & Executive Briefings</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-2 py-4 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'approvals'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Recommendations & Approvals</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              2 Pending
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 py-4 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>AI Tasks & Decision History</span>
          </button>

          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-2 py-4 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'scenarios'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <PlaySquare className="w-4 h-4 text-purple-400" />
            <span>10 Demo Scenarios Control</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* TAB 1: DASHBOARD & BRIEFINGS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium">System Health Score</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-black text-emerald-400">96%</span>
                  <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                    Optimal
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium">Active Operational Alerts</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-black text-amber-400">3</span>
                  <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                    Requires Action
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium">Staged Action Approvals</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-black text-purple-400">2</span>
                  <span className="text-xs text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded">
                    Risk Assessed
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium">Token Usage Today</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-black text-cyan-400">14.2k</span>
                  <span className="text-xs text-slate-400 font-mono">Limit: 100k</span>
                </div>
              </div>
            </div>

            {/* Executive Briefing Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-bold text-white">Executive Operations Briefing</h2>
                </div>

                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
                  {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setBriefingPeriod(period)}
                      className={`px-3 py-1 rounded-lg capitalize transition-all ${
                        briefingPeriod === period
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs leading-relaxed text-purple-200">
                  <strong className="text-purple-300 font-bold block mb-1">
                    🤖 {briefingPeriod.toUpperCase()} EXECUTIVE SUMMARY:
                  </strong>
                  {activeScenario.description}
                </div>

                {/* Key Metrics grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block">Gross Margin</span>
                    <span className="text-base font-bold text-emerald-400">+14.2% MoM</span>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block">Inventory Turnover</span>
                    <span className="text-base font-bold text-cyan-400">4.8x / Year</span>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block">Lead Time SLA</span>
                    <span className="text-base font-bold text-purple-400">1.8 Days</span>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block">Order Accuracy</span>
                    <span className="text-base font-bold text-emerald-400">99.4%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RECOMMENDATIONS & APPROVALS */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Pending AI Action Approvals</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    High-impact operational recommendations staged by AI requiring 1-click decision.
                  </p>
                </div>
                <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                  2 Pending Sign-Off
                </span>
              </div>

              {/* Action Card */}
              <div className="bg-slate-800/70 border border-purple-500/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {activeScenario.riskScore} RISK
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Category: {activeScenario.category}</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold">
                    ROI: {activeScenario.expectedRoi}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base">{activeScenario.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{activeScenario.description}</p>

                <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedReasoning(sampleReasoning)}
                    className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium underline underline-offset-4"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Why did AI recommend this? (Explain Decision)</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => alert('Action Rejected')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
                    >
                      Reject Action
                    </button>
                    <button
                      onClick={() => alert('Action Approved and Executed!')}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve & Execute Action</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TASKS & DECISION HISTORY */}
        {activeTab === 'tasks' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">AI Tasks & Complete Decision Audit Trail</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Full transparency log of background monitors, rule evaluations, and execution traces.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Stockout Prevention Monitor', status: 'RUNNING', frequency: 'Every 15m', lastOutcome: 'COMPLETED_SUCCESS' },
                { name: 'Daily Financial Audit Routine', status: 'SCHEDULED', frequency: 'Every 24h', lastOutcome: 'NO_ANOMALIES' },
                { name: 'Inter-Warehouse Freight Cost Optimizer', status: 'COMPLETED', frequency: 'Daily', lastOutcome: 'RECOMMENDATION_GENERATED' },
              ].map((task, idx) => (
                <div key={idx} className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 text-purple-300 rounded-lg">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{task.name}</h4>
                      <span className="text-slate-400 text-[11px]">Interval: {task.frequency}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded font-mono font-bold">
                      {task.status}
                    </span>
                    <span className="text-slate-400">{task.lastOutcome}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: 10 DEMO SCENARIOS CONTROL */}
        {activeTab === 'scenarios' && (
          <DemoScenarioSwitcher
            scenarios={demoScenarios}
            activeScenarioId={activeScenario.id}
            onSelectScenario={handleSelectScenario}
            onReset={handleResetEnvironment}
            isLoading={isResetting}
          />
        )}
      </main>

      {/* Floating Chat Drawer Trigger */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-purple-500/40 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 border border-purple-400/40"
      >
        <Bot className="w-6 h-6 animate-pulse" />
        <span className="font-bold text-xs pr-1 hidden md:inline">Ask AI Assistant</span>
      </button>

      {/* AI Chat Drawer */}
      <AiChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Explain Decision Modal */}
      <ExplainDecisionModal
        isOpen={!!selectedReasoning}
        onClose={() => setSelectedReasoning(null)}
        reasoning={selectedReasoning}
      />
    </div>
  );
}
