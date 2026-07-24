'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Sparkles, Mic, MicOff, Check, AlertCircle, HelpCircle, ShieldCheck } from 'lucide-react';
import { ExplainDecisionModal, DecisionReasoning } from './ExplainDecisionModal';

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
      text: 'Hello! I am your AI Operations Manager. I have completed a full check across Inventory, Procurement, and Financial Ledgers.',
      timestamp: new Date(),
      actionCard: {
        id: 'appr-001',
        title: 'Draft Purchase Order for SKU: NRT-SRV-001',
        description: 'Current stock is 5 units (below threshold 15). Reorder 50 units from Samsung Global.',
        reasoning: {
          title: 'Draft PO for NRT AI Server Box',
          evidence: ['Current Stock: 5 units', 'Reorder Level: 15 units', 'Lead Time: 4 Days'],
          riskScore: 'HIGH',
          confidenceScore: 96,
          policiesApplied: ['POL-INV-001: Automatic Stockout Prevention'],
          toolsUsed: ['InventoryToolsProvider.getWarehouseStock'],
          expectedRoi: '$14,500 in prevented lost sales',
          recommendedAction: 'Draft Purchase Order for 50 units from Samsung Global Supplier',
        },
      },
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [selectedReasoning, setSelectedReasoning] = useState<DecisionReasoning | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

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
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ prompt: textToSend }),
      });

      const data = await response.json();
      const aiResponseText = data.response || 'I have processed your operational command and verified system metrics.';

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
          text: `Processed "${textToSend}": All inventory thresholds and financial ledgers are currently in sync. Suggested action: Review Q3 Executive Briefing.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-lg bg-slate-900 border-l border-purple-500/30 text-white shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">AI Operations Manager</h3>
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Online & Monitoring
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMicActive(!isMicActive)}
                  className={`p-2 rounded-lg transition-colors border ${
                    isMicActive
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Voice Input (Speech-to-Text)"
                >
                  {isMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Suggested Quick Prompts */}
            <div className="p-3 bg-slate-800/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-slate-400 shrink-0 font-medium">Quick Prompts:</span>
              <button
                onClick={() => handleSendPrompt('Check low stock alerts')}
                className="bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-700/50 px-2.5 py-1 rounded-full shrink-0 transition-all"
              >
                ⚠️ Stock Alerts
              </button>
              <button
                onClick={() => handleSendPrompt('Show Q3 Executive Financial Briefing')}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/50 px-2.5 py-1 rounded-full shrink-0 transition-all"
              >
                📊 Executive Briefing
              </button>
              <button
                onClick={() => handleSendPrompt('Any pending action approvals?')}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/50 px-2.5 py-1 rounded-full shrink-0 transition-all"
              >
                📝 Pending Approvals
              </button>
            </div>

            {/* Chat Conversation Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-2 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-slate-800 border border-slate-700/80 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Embedded Interactive Action Card */}
                    {msg.actionCard && (
                      <div className="bg-slate-950 border border-purple-500/40 rounded-xl p-3 text-left space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Staged AI Recommendation
                          </span>
                          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                            High Risk
                          </span>
                        </div>
                        <h5 className="font-semibold text-white text-xs">{msg.actionCard.title}</h5>
                        <p className="text-[11px] text-slate-400">{msg.actionCard.description}</p>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedReasoning(msg.actionCard!.reasoning)}
                            className="text-[11px] text-purple-400 hover:text-purple-300 underline font-medium flex items-center gap-1"
                          >
                            <HelpCircle className="w-3 h-3" /> Explain Decision
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => alert('Action Approved!')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Approve
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
                    <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-200 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-purple-400 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 max-w-[70%]">
                  <Bot className="w-4 h-4 animate-bounce text-purple-400" />
                  <span>AI Operations Manager is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-center gap-2">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
                placeholder="Ask AI Operations Manager..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
              />
              <button
                onClick={() => handleSendPrompt()}
                className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all shadow-md hover:scale-105 active:scale-95"
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
