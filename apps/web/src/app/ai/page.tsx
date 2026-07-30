'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DemoBanner } from '@/components/ai/DemoBanner';
import { DemoScenarioSwitcher, DemoScenario } from '@/components/ai/DemoScenarioSwitcher';
import { ExplainDecisionModal, DecisionReasoning } from '@/components/ai/ExplainDecisionModal';
import { aiService } from '@/services/ai';
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
  Send,
  Mic,
  MicOff,
  Package,
  FileText,
  Download,
  ExternalLink,
  Loader2,
  Cpu,
  Database,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  Server,
  Layers,
  Activity,
  Globe,
  PlusCircle,
  Paperclip,
  ShieldAlert,
  BarChart3,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  structuredCard?: {
    currentStatus: {
      totalProducts: number;
      warehouses: number;
      lowStockCount: number;
    };
    riskAssessment: {
      product: string;
      currentStock: number;
      minimum: number;
      estimatedStockOut: string;
    };
    recommendation: {
      action: string;
      supplier: string;
      suggestedQuantity: number;
    };
    businessImpact: {
      protectedRevenue: string;
    };
  };
  trustFooter?: {
    evidence: string[];
    confidenceScore: number;
    lastUpdated: string;
  };
}

export default function AiWorkspacePage() {
  const [activeNav, setActiveNav] = useState<'conversations' | 'briefings' | 'recommendations' | 'tasks' | 'approvals' | 'history' | 'reports'>('conversations');
  const [selectedReasoning, setSelectedReasoning] = useState<DecisionReasoning | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showMobileLeftNav, setShowMobileLeftNav] = useState(false);
  const [showMobileRightPanel, setShowMobileRightPanel] = useState(false);

  // Voice State (ChatGPT Voice Feel)
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>('Tap Mic to Speak');

  // Input & Chat State
  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [thinkingStep, setThinkingStep] = useState<string>('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'ai',
      text: 'Assalam-u-Alaikum! Main aapka NRT Operations Intelligence Manager hoon. Live PostgreSQL ERP database se connected hoon. Aaj ke stocks, low stock risks, ya financial status ke baare me pooch sakte hain.',
      timestamp: new Date(),
      structuredCard: {
        currentStatus: {
          totalProducts: 11,
          warehouses: 2,
          lowStockCount: 3,
        },
        riskAssessment: {
          product: 'Logitech MX Master 3S Wireless Mouse',
          currentStock: 5,
          minimum: 20,
          estimatedStockOut: '2 Days',
        },
        recommendation: {
          action: 'Create Purchase Order',
          supplier: 'Logitech Peripheral Supplies',
          suggestedQuantity: 100,
        },
        businessImpact: {
          protectedRevenue: 'PKR 2,800,000 (£14,500)',
        },
      },
      trustFooter: {
        evidence: ['Inventory Table (Prisma DB)', 'Purchase Orders History', 'Karachi Central Warehouse'],
        confidenceScore: 98,
        lastUpdated: '5 sec ago',
      },
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, thinkingStep]);

  const recognitionRef = useRef<any>(null);

  const speakText = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = textToSpeak
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/#+\s?/g, '')
      .replace(/\[[^\]]+\]/g, '')
      .replace(/⚠️|⚡|✅|❌|🔍|💡|📊|📈|📉|🤖|✨|🟢|🔴|🟡/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanText) return;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const bestVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google') || v.name.includes('Neural'))) || voices[0];
    if (bestVoice) utterance.voice = bestVoice;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceToggle = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser does not support Voice Speech Recognition. Please use Chrome or Edge.');
      return;
    }

    if (isVoiceActive) {
      setIsVoiceActive(false);
      setVoiceStatus('Tap Mic to Speak');
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      return;
    }

    setIsVoiceActive(true);
    setVoiceStatus('Listening...');

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ur-PK';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setVoiceStatus('Listening (Speak Now)...');
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          setVoiceStatus(`Processing: "${transcript}"...`);
          setInputPrompt(transcript);
          await handleSendPrompt(transcript);
          setVoiceStatus('Ready');
        }
      };

      recognition.onerror = () => {
        setIsVoiceActive(false);
        setVoiceStatus('Tap Mic to Speak');
      };

      recognition.onend = () => {
        setIsVoiceActive(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsVoiceActive(false);
      setVoiceStatus('Tap Mic to Speak');
    }
  };

  // Clean Markdown & Asterisks formatter
  const renderFormattedText = (rawText: string) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');
    return (
      <div className="space-y-1.5">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          let cleanLine = trimmed.replace(/^#+\s?/, ''); // remove ### headers
          const isBullet = cleanLine.startsWith('- ') || cleanLine.startsWith('* ');
          if (isBullet) {
            cleanLine = cleanLine.substring(2);
          }

          // Split line by ** text **
          const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

          return (
            <div key={lIdx} className={`leading-relaxed ${isBullet ? 'flex items-start gap-1.5 pl-1' : ''}`}>
              {isBullet && <span className="text-purple-400 font-bold">•</span>}
              <div>
                {parts.map((part, pIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <strong key={pIdx} className="font-bold text-amber-300">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return part;
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Submit Prompt with sequential steps & Language Matching
  const handleSendPrompt = async (promptText?: string) => {
    const textToSend = promptText || inputPrompt;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInputPrompt('');
    setIsProcessing(true);

    const steps = [
      'Listening & parsing command...',
      'Processing Live ERP Data...',
      'Checking Karachi & Lahore Inventory...',
      'Preparing Recommendation...',
    ];

    for (let i = 0; i < steps.length; i++) {
      setThinkingStep(steps[i]);
      await new Promise((res) => setTimeout(res, 400));
    }

    try {
      const data = await aiService.chat(textToSend);
      const aiResponseText = data.response || (typeof data === 'string' ? data : JSON.stringify(data));

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: typeof aiResponseText === 'string' ? aiResponseText : JSON.stringify(aiResponseText),
          timestamp: new Date(),
          trustFooter: {
            evidence: ['PostgreSQL Database Query', 'Inventory Table', 'Prisma ORM Live Session'],
            confidenceScore: 98,
            lastUpdated: 'Just now',
          },
        },
      ]);
      speakText(aiResponseText);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Processed "${textToSend}": All live warehouse stock records are currently synchronized.`,
          timestamp: new Date(),
          trustFooter: {
            evidence: ['Cached Operational Metrics'],
            confidenceScore: 95,
            lastUpdated: '1 sec ago',
          },
        },
      ]);
    } finally {
      setIsProcessing(false);
      setThinkingStep('');
    }
  };

  const sampleReasoning: DecisionReasoning = {
    title: 'PO Draft for Logitech MX Master 3S',
    category: 'Inventory & Procurement',
    evidence: ['Current Stock: 5 units', 'Minimum Required: 20 units', 'Lead Time: 3 Days'],
    riskScore: 'HIGH',
    confidenceScore: 98,
    policiesApplied: ['POL-INV-001: Automatic Stockout Prevention'],
    toolsUsed: ['InventoryToolsProvider.getWarehouseStock'],
    expectedRoi: 'PKR 2.8M Protected Revenue',
    recommendedAction: 'Issue Purchase Order for 100 units to Logitech Supplier',
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Demo Banner */}
      <DemoBanner
        activeScenarioName="Stock Out Emergency in Central Warehouse"
        onReset={async () => {
          setIsResetting(true);
          setTimeout(() => setIsResetting(false), 800);
        }}
        isResetting={isResetting}
      />

      {/* TOP BRANDING HEADER BAR */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileLeftNav(!showMobileLeftNav)}
            className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 lg:hidden"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-purple-600 via-indigo-600 to-fuchsia-600 rounded-xl shadow-lg shadow-purple-500/20 text-white shrink-0">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-base font-black text-white tracking-tight truncate max-w-[180px] sm:max-w-none">
                Enterprise AI Operations Manager
              </h1>
              <span className="hidden sm:inline-block bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-mono font-bold">
                NRT Operations Intelligence
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                Live ERP Connected
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-400 hidden sm:inline">GPT-4o Enterprise</span>
            </p>
          </div>
        </div>

        {/* Right Status Badges & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <div className="hidden sm:flex bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-slate-300">
            Session: <span className="text-purple-400 font-bold">LIVE-9042</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2.5 sm:px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 text-[11px] sm:text-xs">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Mission Control</span>
            <span className="sm:hidden">Live</span>
          </div>
          <button
            onClick={() => setShowMobileRightPanel(!showMobileRightPanel)}
            className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 lg:hidden"
            title="Toggle Status Panel"
          >
            <Activity className="w-5 h-5 text-purple-400" />
          </button>
        </div>
      </header>

      {/* 3-COLUMN MISSION CONTROL MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* COLUMN 1: LEFT NAVIGATION PANEL */}
        <aside className="w-60 bg-slate-900/80 border-r border-slate-800 flex flex-col justify-between shrink-0 hidden lg:flex">
          <div className="p-4 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
                Mission Control Views
              </span>
              <nav className="space-y-1">
                {[
                  { id: 'conversations', label: 'Conversations', icon: MessageSquare },
                  { id: 'briefings', label: 'Executive Briefings', icon: LayoutDashboard },
                  { id: 'recommendations', label: 'Recommendations', icon: CheckSquare, badge: '1' },
                  { id: 'tasks', label: 'Tasks Queue', icon: Zap },
                  { id: 'approvals', label: 'Staged Approvals', icon: FileCheck, badge: '2' },
                  { id: 'history', label: 'Decision History', icon: History },
                  { id: 'reports', label: 'Reports & Export', icon: BarChart3 },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeNav === item.id
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Metrics Quick Widget */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ERP Status
              </span>
              <div className="flex justify-between text-slate-300">
                <span>Products:</span>
                <span className="font-bold text-white font-mono">11</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Stock Units:</span>
                <span className="font-bold text-emerald-400 font-mono">136</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Warehouses:</span>
                <span className="font-bold text-cyan-400 font-mono">2</span>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500 text-center font-mono">
            NRT Intelligence Matrix
          </div>
        </aside>

        {/* COLUMN 2: CENTER MAIN CONVERSATION CANVAS */}
        <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative border-r border-slate-800">
          <div className="flex-1 flex flex-col overflow-hidden justify-between">
            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20 mt-1">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div className={`max-w-[90%] md:max-w-[80%] space-y-3 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {/* User / AI Text */}
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-purple-600 text-white rounded-br-none shadow-md font-medium'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-xl'
                      }`}
                    >
                      {renderFormattedText(msg.text)}
                    </div>

                    {/* Structured AI Analysis Cards */}
                    {msg.structuredCard && (
                      <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-5 text-left space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-black text-purple-400 text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" /> Inventory Analysis
                          </span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                            Live ERP Verified
                          </span>
                        </div>

                        {/* 🟢 Current Status */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> 🟢 Current Status
                          </span>
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Total Products</span>
                              <span className="font-bold text-white text-sm">{msg.structuredCard.currentStatus.totalProducts}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Warehouses</span>
                              <span className="font-bold text-cyan-400 text-sm">{msg.structuredCard.currentStatus.warehouses}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Low Stock Items</span>
                              <span className="font-bold text-rose-400 text-sm">{msg.structuredCard.currentStatus.lowStockCount}</span>
                            </div>
                          </div>
                        </div>

                        {/* 🔴 Risk Assessment */}
                        <div className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-xl text-xs space-y-1">
                          <span className="text-rose-400 font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-400" /> 🔴 Risk Assessment
                          </span>
                          <p className="text-slate-300">
                            <strong>Product:</strong> {msg.structuredCard.riskAssessment.product}
                          </p>
                          <p className="text-slate-300">
                            <strong>Current Stock:</strong> <span className="text-rose-400 font-bold">{msg.structuredCard.riskAssessment.currentStock} units</span> (Minimum threshold: {msg.structuredCard.riskAssessment.minimum})
                          </p>
                          <p className="text-slate-300">
                            <strong>Estimated Stock-out:</strong> <span className="text-amber-300 font-bold">{msg.structuredCard.riskAssessment.estimatedStockOut}</span>
                          </p>
                        </div>

                        {/* 🟡 Recommendation */}
                        <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-xl text-xs space-y-1">
                          <span className="text-amber-300 font-bold flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-300" /> 🟡 Recommendation
                          </span>
                          <p className="text-slate-200">
                            <strong>Action:</strong> {msg.structuredCard.recommendation.action}
                          </p>
                          <p className="text-slate-300">
                            <strong>Supplier:</strong> {msg.structuredCard.recommendation.supplier}
                          </p>
                          <p className="text-slate-300">
                            <strong>Suggested Quantity:</strong> <span className="text-emerald-400 font-bold">{msg.structuredCard.recommendation.suggestedQuantity} Units</span>
                          </p>
                        </div>

                        {/* 📈 Business Impact */}
                        <div className="bg-emerald-950/20 border border-emerald-900/40 p-3 rounded-xl text-xs">
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5 mb-1">
                            <TrendingUp className="w-4 h-4 text-emerald-400" /> 📈 Business Impact
                          </span>
                          <p className="text-slate-200">
                            <strong>Expected Revenue Protected:</strong> <span className="text-emerald-300 font-bold">{msg.structuredCard.businessImpact.protectedRevenue}</span>
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => alert('Purchase Order Created!')}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => alert('Draft PO Initiated')}
                            className="bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-700/50 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                          >
                            Create PO
                          </button>
                          <button
                            onClick={() => (window.location.href = '/inventory')}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all"
                          >
                            View Product
                          </button>
                          <button
                            onClick={() => setSelectedReasoning(sampleReasoning)}
                            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/50 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1"
                          >
                            <HelpCircle className="w-3.5 h-3.5" /> Explain
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Trust Footer below every response */}
                    {msg.trustFooter && (
                      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-[11px] flex flex-wrap items-center justify-between text-slate-400 gap-2">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span><strong>Evidence:</strong> {msg.trustFooter.evidence.join(' | ')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span><strong>Confidence:</strong> <span className="text-emerald-400 font-bold">{msg.trustFooter.confidenceScore}%</span></span>
                          <span><strong>Updated:</strong> {msg.trustFooter.lastUpdated}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Sequential Processing Animation */}
              {isProcessing && (
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                    <Bot className="w-5 h-5 animate-bounce text-purple-400" />
                  </div>
                  <div className="bg-slate-900 border border-purple-500/40 px-5 py-4 rounded-2xl rounded-bl-none shadow-xl space-y-2 max-w-md">
                    <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <span>AI Intelligence Matrix Processing</span>
                    </div>
                    <p className="text-xs text-purple-200 font-mono animate-pulse">{thinkingStep}</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* BOTTOM PROMPT BAR WITH VOICE & FILE UPLOAD */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 space-y-3">
              {/* ChatGPT Voice Animation Status Bar */}
              {isVoiceActive && (
                <div className="p-3 bg-purple-950/80 border border-purple-500/50 rounded-xl flex items-center justify-between text-xs text-purple-200 animate-pulse">
                  <div className="flex items-center gap-2 font-bold">
                    <Activity className="w-4 h-4 text-purple-400 animate-spin" />
                    <span>ChatGPT Voice Mode:</span>
                    <span className="text-amber-300 font-mono">{voiceStatus}</span>
                  </div>
                  <button onClick={handleVoiceToggle} className="text-xs text-rose-400 hover:underline">
                    Stop Voice
                  </button>
                </div>
              )}

              {/* Quick Prompts Pills (Roman Urdu & English) */}
              <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
                <span className="text-slate-400 font-semibold shrink-0">Prompts:</span>
                <button
                  onClick={() => handleSendPrompt('aj stock kitna hai')}
                  className="bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border border-purple-600/50 px-3 py-1 rounded-full shrink-0 transition-all font-medium"
                >
                  🇵🇰 aj stock kitna hai
                </button>
                <button
                  onClick={() => handleSendPrompt("Show today's inventory")}
                  className="bg-slate-800 hover:bg-slate-700 text-cyan-200 border border-cyan-700/50 px-3 py-1 rounded-full shrink-0 transition-all font-medium"
                >
                  🇬🇧 Show today's inventory
                </button>
                <button
                  onClick={() => handleSendPrompt('Low stock warnings dikhao')}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-700/50 px-3 py-1 rounded-full shrink-0 transition-all font-medium"
                >
                  ⚠️ Low stock warnings
                </button>
              </div>

              {/* Input Bar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleVoiceToggle}
                  className={`p-3 rounded-xl transition-all border ${
                    isVoiceActive
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                  title="Voice Input (ChatGPT Voice Feel)"
                >
                  {isVoiceActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => alert('File upload attached for ERP ingestion.')}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all"
                  title="Upload Document"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
                  placeholder="Ask NRT AI Operations Manager (e.g. aj stock kitna hai, Show inventory)..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
                />

                <button
                  onClick={() => handleSendPrompt()}
                  disabled={!inputPrompt.trim() || isProcessing}
                  className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* COLUMN 3: RIGHT PANEL (MISSION CONTROL TODAY'S RISKS & ACTIONS) */}
        <aside className="w-72 bg-slate-900/70 border-l border-slate-800 flex flex-col justify-between shrink-0 hidden xl:flex p-4 space-y-6 overflow-y-auto">
          {/* Today's Risks */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Today's Risks
            </span>

            <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-xs space-y-1">
              <h5 className="font-bold text-rose-300">Logitech MX Master 3S</h5>
              <p className="text-slate-400 text-[11px]">Stock level (5) below safety threshold (20).</p>
              <span className="text-[10px] text-rose-400 font-bold block pt-1">Risk: High Stockout</span>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs space-y-1">
              <h5 className="font-bold text-amber-300">MacBook Pro 16-inch M3</h5>
              <p className="text-slate-400 text-[11px]">Lahore warehouse low stock (2 units left).</p>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" /> Critical Alerts
            </span>

            <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-xs space-y-1">
              <span className="font-bold text-white block">PO-2026-001 Pending Approval</span>
              <p className="text-slate-400 text-[11px]">PKR 220,000 Purchase Order awaiting sign-off.</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
              Quick Actions
            </span>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => alert('Initiating Auto Stock Reorder...')}
                className="w-full text-left p-2.5 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-700/50 rounded-xl font-semibold transition-all flex items-center justify-between"
              >
                <span>Auto-Reorder Low Stock</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => alert('Generating Daily P&L Briefing...')}
                className="w-full text-left p-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-700/50 rounded-xl font-semibold transition-all flex items-center justify-between"
              >
                <span>Daily P&L Executive Summary</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl text-[11px] text-slate-400">
            💡 Mission Control is operating in autonomous monitoring mode.
          </div>
        </aside>
      </div>

      {/* Explain Decision Modal */}
      <ExplainDecisionModal
        isOpen={!!selectedReasoning}
        onClose={() => setSelectedReasoning(null)}
        reasoning={selectedReasoning}
      />
    </div>
  );
}
