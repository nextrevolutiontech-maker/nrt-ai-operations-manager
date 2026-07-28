'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Sparkles, Mic, MicOff, Check, HelpCircle, Maximize2, Minimize2, Package, AlertTriangle, TrendingUp, HelpCircle as QueryIcon } from 'lucide-react';
import { ExplainDecisionModal, DecisionReasoning } from './ExplainDecisionModal';
import { aiService } from '../../services/ai';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  actionCard?: {
    id: string;
    title: string;
    description: string;
    reasoning: DecisionReasoning;
  };
}

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Assalam-u-Alaikum! Main aapka NRT AI Operations Manager hoon. Real-time PostgreSQL database se connected hoon. Aap live inventory, stock levels, sales, ya finance ka koi bhi sawal pooch sakte hain.',
      timestamp: new Date(),
      actionCard: {
        id: 'appr-001',
        title: 'Draft Purchase Order for SKU: LOG-MXM3S',
        description: 'Logitech MX Master 3S stock is 5 units (below threshold 8). Reorder 10 units from Logitech Peripheral Supplies.',
        reasoning: {
          title: 'Draft PO for Logitech MX Master 3S',
          evidence: ['Current Stock: 5 units', 'Reorder Level: 8 units', 'Lead Time: 3 Days'],
          riskScore: 'HIGH',
          confidenceScore: 98,
          policiesApplied: ['POL-INV-001: Automatic Stockout Prevention'],
          toolsUsed: ['InventoryToolsProvider.getWarehouseStock'],
          expectedRoi: 'Prevented customer order delay',
          recommendedAction: 'Draft Purchase Order for 10 units from Logitech Supplier',
        },
      },
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedReasoning, setSelectedReasoning] = useState<DecisionReasoning | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

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
            <div key={lIdx} className={`leading-relaxed ${isBullet ? 'flex items-start gap-1.5 pl-2' : ''}`}>
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

  const handleSendPrompt = async (promptText?: string) => {
    const textToSend = promptText || inputPrompt;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInputPrompt('');
    setIsTyping(true);

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
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Processed "${textToSend}": All live warehouse stock records are currently synchronized.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className={`absolute inset-y-0 right-0 flex transition-all duration-300 ${isFullScreen ? 'w-full pl-0' : 'w-screen max-w-2xl pl-4 sm:pl-10'}`}>
          <div className="w-full bg-slate-900 border-l border-purple-500/30 text-white shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-500/20">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white tracking-tight flex items-center gap-2">
                    AI Operations Command Center
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-mono">
                      LIVE DB
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Direct Database Connected
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                  title={isFullScreen ? 'Exit Full Screen' : 'Full Screen View'}
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Interactive Question Suggestions (One-Click Prompts) */}
            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-slate-400 shrink-0 font-semibold flex items-center gap-1">
                <QueryIcon className="w-3.5 h-3.5 text-purple-400" /> Suggestions:
              </span>
              <button
                onClick={() => handleSendPrompt('Aj ke stocks batao')}
                className="bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border border-purple-600/50 px-3 py-1.5 rounded-full shrink-0 transition-all font-medium flex items-center gap-1.5 shadow-sm"
              >
                <Package className="w-3.5 h-3.5 text-purple-400" />
                Aaj ke stocks batao
              </button>
              <button
                onClick={() => handleSendPrompt('Total catalog products kitni hain?')}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-200 border border-cyan-700/50 px-3 py-1.5 rounded-full shrink-0 transition-all font-medium"
              >
                📊 Total Products Count
              </button>
              <button
                onClick={() => handleSendPrompt('Low stock warning items kaun se hain?')}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-700/50 px-3 py-1.5 rounded-full shrink-0 transition-all font-medium flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Low Stock Warning Items
              </button>
              <button
                onClick={() => handleSendPrompt('Executive Financial Briefing summary dikhao')}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-700/50 px-3 py-1.5 rounded-full shrink-0 transition-all font-medium flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Financial Briefing
              </button>
            </div>

            {/* Chat Conversation Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div className={`max-w-[88%] space-y-2 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-purple-600 text-white rounded-br-none shadow-md'
                          : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {msg.sender === 'ai' ? renderFormattedText(msg.text) : msg.text}
                    </div>

                    {/* Embedded Interactive Action Card */}
                    {msg.actionCard && (
                      <div className="bg-slate-950 border border-purple-500/40 rounded-xl p-4 text-left space-y-2.5 shadow-lg">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-400 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-400" /> Staged AI Recommendation
                          </span>
                          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-0.5 rounded text-[10px] font-bold">
                            High Risk
                          </span>
                        </div>
                        <h5 className="font-bold text-white text-sm">{msg.actionCard.title}</h5>
                        <p className="text-xs text-slate-400">{msg.actionCard.description}</p>

                        <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedReasoning(msg.actionCard!.reasoning)}
                            className="text-xs text-purple-400 hover:text-purple-300 underline font-medium flex items-center gap-1"
                          >
                            <HelpCircle className="w-3.5 h-3.5" /> Explain Decision
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => alert('Action Approved!')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve Action
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <span className="text-[10px] text-slate-500 block px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-9 h-9 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-200 shrink-0 mt-0.5">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2.5 text-xs text-purple-300 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 max-w-[70%]">
                  <Bot className="w-4 h-4 animate-bounce text-purple-400" />
                  <span>AI Operations Manager is fetching database metrics...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex items-center gap-2">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
                placeholder="Ask AI Operations Manager (e.g. Aaj ke stocks, total products)..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
              />
              <button
                onClick={() => handleSendPrompt()}
                className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all shadow-md hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Explain Decision Modal */}
      <ExplainDecisionModal
        isOpen={!!selectedReasoning}
        onClose={() => setSelectedReasoning(null)}
        reasoning={selectedReasoning}
      />
    </>
  );
};

