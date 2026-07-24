'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, X, Send, Loader2, Bot, Sparkles, Activity } from 'lucide-react';
import { aiService } from '../../services/ai';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export function AiVoiceButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Assalam-u-Alaikum! Main aapka NRT AI Digital Employee hoon. Aap mujh se kuch bhi pooch sakte hain.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isVoiceMode]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await aiService.chat(text, sessionId);
      setSessionId(result.sessionId);
      const aiMsg: Message = { role: 'ai', content: result.response };
      setMessages(prev => [...prev, aiMsg]);
      
      if (isVoiceMode) {
        speak(result.response);
      }
    } catch (err: any) {
      let errText = 'Sorry, main abhi server se connect nahi kar pa raha. Thoda wait karein.';
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        errText = 'Permission error: Please logout and login again to refresh your session.';
      } else if (err?.response?.status === 404) {
        errText = 'AI service not found. Please make sure the backend server is running.';
      }
      const errMsg: Message = { role: 'ai', content: errText };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      if (isVoiceMode) {
        // Auto stop voice mode after interaction for demonstration, or keep it running.
        // We'll keep it running to allow back-and-forth.
      }
    }
  };

  const startVoiceMode = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support Speech Recognition. Please use Google Chrome.');
      return;
    }

    setIsVoiceMode(true);
    setIsOpen(false); // Hide text chat if open

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      sendMessage(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceMode = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setIsVoiceMode(false);
  };

  return (
    <>
      {/* Floating Buttons Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* Voice Trigger Button (Smart Mode) */}
        {!isVoiceMode && (
          <button
            onClick={startVoiceMode}
            className="w-14 h-14 bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-orange-500 text-white rounded-full shadow-[0_0_20px_rgba(192,38,211,0.4)] hover:shadow-[0_0_30px_rgba(192,38,211,0.6)] hover:scale-110 transition-all duration-300 flex items-center justify-center group relative overflow-hidden"
            title="Start Smart Voice Assistant"
          >
            <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Mic className="w-6 h-6 z-10 group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Text Chat Trigger Button */}
        {!isOpen && !isVoiceMode && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-white text-slate-800 rounded-full shadow-lg border border-slate-100 hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center group"
            title="Open AI Chat"
          >
            <Bot className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
          </button>
        )}
      </div>

      {/* SMART VOICE OVERLAY (Sidebar Redesign) */}
      {isVoiceMode && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] z-[100] bg-slate-900/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in slide-in-from-right duration-500 border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             {/* Animated Background Orbs (Scaled down) */}
             <div className="absolute top-1/4 -left-1/4 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px] animate-pulse"></div>
             <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-[80px] animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>

          <button 
            onClick={stopVoiceMode}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex flex-col items-center w-full px-8">
            {/* Smart Center Orb */}
            <div className="relative flex items-center justify-center mb-8">
              <div className={`absolute inset-0 rounded-full transition-all duration-700 ${isListening ? 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500 blur-2xl opacity-70 animate-pulse scale-150' : 'bg-blue-500 blur-xl opacity-30 scale-100'}`}></div>
              <div className="w-24 h-24 bg-gradient-to-br from-slate-900 to-slate-800 rounded-full shadow-2xl border border-white/10 flex items-center justify-center relative z-10 overflow-hidden">
                {isListening ? (
                  <div className="flex items-center gap-1 h-8">
                    <span className="w-1 bg-fuchsia-500 rounded-full animate-[bounce_1s_infinite] h-5"></span>
                    <span className="w-1 bg-violet-500 rounded-full animate-[bounce_1.2s_infinite_0.1s] h-8"></span>
                    <span className="w-1 bg-orange-500 rounded-full animate-[bounce_0.9s_infinite_0.2s] h-4"></span>
                    <span className="w-1 bg-fuchsia-500 rounded-full animate-[bounce_1.1s_infinite_0.3s] h-6"></span>
                    <span className="w-1 bg-violet-500 rounded-full animate-[bounce_1s_infinite_0.4s] h-5"></span>
                  </div>
                ) : isLoading ? (
                  <Loader2 className="w-8 h-8 text-fuchsia-400 animate-spin" />
                ) : (
                  <Sparkles className="w-8 h-8 text-white/50" />
                )}
              </div>
            </div>

            {/* Transcripts */}
            <div className="w-full text-center space-y-6">
              {messages.length > 1 && (
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                  <p className="text-lg md:text-xl font-medium text-white/90 leading-relaxed">
                    "{messages[messages.length - 1].content}"
                  </p>
                </div>
              )}
              
              <div className="h-6">
                <p className="text-fuchsia-300/80 text-xs font-medium tracking-widest uppercase">
                  {isListening ? 'Listening...' : isLoading ? 'Processing...' : 'Tap Mic to Speak'}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-8">
              <button
                onClick={isListening ? stopVoiceMode : startVoiceMode}
                className={`p-5 rounded-full transition-all shadow-2xl ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    : 'bg-white hover:bg-slate-100 text-slate-900'
                }`}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STANDARD TEXT CHAT PANEL */}
      {isOpen && !isVoiceMode && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] max-h-[700px] h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold">NRT Digital Employee</p>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
                  Active & Ready
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-3 shrink-0 mt-1 border border-slate-300">
                    <Bot className="w-4 h-4 text-slate-700" />
                  </div>
                )}
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none shadow-md'
                    : 'bg-white text-slate-800 shadow-sm border border-slate-200 rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-3 shrink-0">
                  <Bot className="w-4 h-4 text-slate-700" />
                </div>
                <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-200">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
            <button
              onClick={startVoiceMode}
              className="p-3 bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-violet-700 rounded-xl transition-colors group"
              title="Switch to Smart Voice"
            >
              <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
              placeholder="Ask me anything..."
              className="flex-1 text-sm text-slate-900 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 transition-all"
            />

            <button
              onClick={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
