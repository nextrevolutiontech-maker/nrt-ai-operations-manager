'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, X, Send, Loader2, Bot, Sparkles, Activity, Globe, Volume2, VolumeX } from 'lucide-react';
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<'ur-PK' | 'en-US'>('ur-PK');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Assalam-u-Alaikum! Main aapka NRT AI Digital Employee hoon. Aap mujh se kuch bhi pooch sakte hain.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [liveWordChunks, setLiveWordChunks] = useState<string[]>([]);
  const [liveStreamingText, setLiveStreamingText] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isVoiceModeRef = useRef(false);
  const languageRef = useRef(language);
  const wordsBufferRef = useRef<string[]>([]);

  useEffect(() => {
    isVoiceModeRef.current = isVoiceMode;
  }, [isVoiceMode]);

  useEffect(() => {
    languageRef.current = language;
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isVoiceMode]);

  // Clean text before passing to SpeechSynthesis so markdown/emojis/logs aren't read aloud
  const convertUrduScriptToRoman = (text: string): string => {
    if (!text) return text;
    if (!/[\u0600-\u06FF]/.test(text)) return text;

    return text
      .replace(/وعلیکم\s*السلام[!؟.]?/g, 'Walaikum Assalam!')
      .replace(/السلام\s*علیکم[!؟.]?/g, 'Assalam-u-Alaikum!')
      .replace(/آج\s*کی\s*پروگریس\s*رپورٹ\s*کے\s*مطابق/g, 'Aaj ki progress report ke mutabiq')
      .replace(/اہم\s*انتباہات/g, 'Ahem Alerts & Warnings')
      .replace(/ہائی/g, 'High')
      .replace(/میڈیم/g, 'Medium')
      .replace(/لو/g, 'Low')
      .replace(/کا\s*اسٹاک\s*حفاظتی\s*حد\s*سے\s*نیچے/g, 'ka stock safety threshold se niche hai')
      .replace(/صرف/g, 'sirf')
      .replace(/یونٹس\s*باقی\s*ہیں/g, 'units baki hain')
      .replace(/سپلائر/g, 'Supplier')
      .replace(/کی\s*شپمنٹ/g, 'ki shipment')
      .replace(/میں\s*(\d+)\s*دن\s*کی\s*تاخیر/g, 'mein $1 din ki takheer')
      .replace(/اہم\s*کارکردگی\s*کے\s*اشاریے/g, 'Key Performance Indicators')
      .replace(/آرڈر\s*سائیکل\s*کا\s*وقت/g, 'Order Cycle Time')
      .replace(/گھنٹے/g, 'ghante')
      .replace(/انوینٹری\s*ٹرن\s*اوور/g, 'Inventory Turnover')
      .replace(/مجموعی\s*منافع\s*کا\s*فیصد/g, 'Gross Profit %')
      .replace(/استثنائیات/g, 'Exceptions')
      .replace(/کم\s*اسٹاک\s*آئٹمز/g, 'Low Stock Items')
      .replace(/سپلائر\s*کی\s*تاخیر/g, 'Supplier Delays')
      .replace(/مالی\s*خطرات/g, 'Financial Risks')
      .replace(/خلاف\s*ورزیاں/g, 'Violations')
      .replace(/تجویز\s*کردہ\s*اقدامات/g, 'Recommended Actions')
      .replace(/کا\s*بین\s*ویر\s*ہاؤس\s*اسٹاک\s*ٹرانسفر\s*کریں/g, 'ka inter warehouse stock transfer karein')
      .replace(/خام\s*مال\s*کی\s*دوبارہ\s*بھرپائی\s*کے\s*لیے/g, 'Raw material replenishment ke liye')
      .replace(/تقسیم\s*شدہ\s*بلینکٹ\s*PO\s*جاری\s*کریں/g, 'distributed blanket PO issue karein')
      .replace(/آج\s*کے\s*دن\s*میں/g, 'Aaj ke din mein')
      .replace(/آرڈرز\s*بھیجے\s*گئے/g, 'orders bheje gaye')
      .replace(/جو\s*کہ\s*ہدف/g, 'jo ke target')
      .replace(/کے\s*قریب\s*ہیں/g, 'ke qareeb hain')
      .replace(/جس\s*کی\s*کامیابی\s*کی\s*شرح/g, 'jis ki success rate')
      .replace(/[\u0600-\u06FF]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const sanitizeTextForSpeech = (rawText: string): string => {
    const textWithoutUrdu = convertUrduScriptToRoman(rawText);
    return textWithoutUrdu
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove markdown bold
      .replace(/#+\s?/g, '') // Remove headings
      .replace(/\[[^\]]+\]/g, '') // Remove tags
      .replace(/⚠️|⚡|✅|❌|🔍|💡|📊|📈|📉|🤖|✨/g, '') // Remove emojis & symbols
      .replace(/https?:\/\/\S+/g, '') // Remove URLs
      .replace(/\n+/g, '. ') // Convert linebreaks to sentence pauses
      .replace(/\s+/g, ' ')
      .trim();
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const cleanedText = sanitizeTextForSpeech(text);
    if (!cleanedText) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    // Detect Urdu script vs Roman Urdu / English
    const isUrduScript = /[\u0600-\u06FF]/.test(cleanedText);
    const voices = window.speechSynthesis.getVoices();

    if (isUrduScript) {
      const urduVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online')) && (v.lang.includes('ur') || v.lang.includes('hi')))
        || voices.find(v => v.lang.includes('ur') || v.lang.includes('hi') || v.name.includes('Urdu') || v.name.includes('Hindi'));
      if (urduVoice) utterance.voice = urduVoice;
      utterance.lang = urduVoice?.lang || 'ur-PK';
    } else {
      // Prioritize 100% FREE Microsoft Natural Online / Google Neural Voices (English / Urdu only)
      const bestVoice =
        voices.find(v => v.lang.toLowerCase().startsWith('en') && (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Google') || v.name.includes('Neural'))) ||
        voices.find(v => (v.lang.toLowerCase().includes('ur') || v.lang.toLowerCase().includes('hi') || v.name.includes('Urdu') || v.name.includes('Hindi'))) ||
        voices.find(v => v.lang.toLowerCase().startsWith('en'));
      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang || 'en-US';
      } else {
        utterance.lang = 'en-US';
      }
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);

    // Pause recognition while speaking to prevent self-triggering
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      if (isVoiceModeRef.current) {
        startVoiceRecognitionSilently();
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (isVoiceModeRef.current) {
        startVoiceRecognitionSilently();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const startVoiceRecognitionSilently = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = languageRef.current;
      recognition.interimResults = true; // Real-time word streaming enabled!
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      wordsBufferRef.current = [];
      setLiveWordChunks([]);
      setLiveStreamingText('');

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        const accumulatedText = wordsBufferRef.current.join(' ').trim();
        if (accumulatedText) {
          setInputText(accumulatedText);
          sendMessage(accumulatedText);
          wordsBufferRef.current = [];
          setLiveWordChunks([]);
          setLiveStreamingText('');
        }
      };
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        if (currentText) {
          const wordsArray = currentText.split(/\s+/).filter(Boolean);
          wordsBufferRef.current = wordsArray;
          setLiveWordChunks(wordsArray);
          setLiveStreamingText(currentText);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const result: any = await aiService.chat(text, sessionId);
      const aiResponse = result?.response || result?.content || (typeof result === 'string' ? result : JSON.stringify(result));
      if (result?.sessionId) {
        setSessionId(result.sessionId);
      }
      const aiMsg: Message = { role: 'ai', content: aiResponse };
      setMessages(prev => [...prev, aiMsg]);
      
      // ALWAYS speak response out loud!
      speak(aiResponse);
    } catch (err: any) {
      let errText = err?.response?.data?.message || err?.message || 'Server se connect nahi ho pa raha. Kripya login check karein.';
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        errText = 'Permission error: Please refresh your session or login again.';
      }
      const errMsg: Message = { role: 'ai', content: errText };
      setMessages(prev => [...prev, errMsg]);
      speak(errText);
    } finally {
      setIsLoading(false);
    }
  };

  const [voiceBusinessStep, setVoiceBusinessStep] = useState<string>('Checking Inventory...');

  const startVoiceMode = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsOpen(true);
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: '💡 Voice Speech-to-Text works best in Google Chrome or MS Edge. Standard text input is active below.' }
      ]);
      return;
    }

    setIsVoiceMode(true);
    setIsOpen(false);

    // Dynamic Business Context Steps Sequence
    const businessSteps = [
      'Checking Inventory...',
      'Reading Warehouse Karachi & Lahore...',
      'Analysing Sales & Risk...',
      'Preparing Recommendation...',
    ];

    for (let i = 0; i < businessSteps.length; i++) {
      setVoiceBusinessStep(businessSteps[i]);
      await new Promise((r) => setTimeout(r, 400));
    }

    startVoiceRecognitionSilently();
  };

  const stopVoiceMode = () => {
    stopSpeaking();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsListening(false);
    setIsVoiceMode(false);
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'ur-PK' ? 'en-US' : 'ur-PK'));
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
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

        {!isOpen && !isVoiceMode && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-white text-slate-800 rounded-full shadow-lg border border-slate-100 hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center group relative"
            title="Open AI Chat"
          >
            <Bot className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
          </button>
        )}
      </div>

      {/* SMART VOICE OVERLAY (Sidebar Design) */}
      {isVoiceMode && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] z-[100] bg-slate-900/95 backdrop-blur-2xl flex flex-col items-center justify-between py-8 border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-500">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -left-1/4 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Header Bar */}
          <div className="w-full px-6 flex items-center justify-between z-20">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-md transition-colors"
              title="Toggle Language Mode"
            >
              <Globe className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>{language === 'ur-PK' ? 'Urdu / Roman Urdu' : 'English'}</span>
            </button>

            <button
              onClick={stopVoiceMode}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
              title="Close Voice Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Visualizer & Status */}
          <div className="relative z-10 flex flex-col items-center w-full px-8 my-auto">
            <div className="relative flex items-center justify-center mb-8">
              <div className={`absolute inset-0 rounded-full transition-all duration-700 ${isSpeaking ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 blur-2xl opacity-80 animate-pulse scale-150' : isListening ? 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500 blur-2xl opacity-70 animate-pulse scale-150' : 'bg-blue-500 blur-xl opacity-30 scale-100'}`}></div>
              <div className="w-28 h-28 bg-gradient-to-br from-slate-900 to-slate-800 rounded-full shadow-2xl border border-white/10 flex items-center justify-center relative z-10 overflow-hidden">
                {isSpeaking ? (
                  <div className="flex items-center gap-1.5 h-10">
                    <span className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite] h-8"></span>
                    <span className="w-1.5 bg-teal-400 rounded-full animate-[bounce_1s_infinite_0.1s] h-10"></span>
                    <span className="w-1.5 bg-cyan-400 rounded-full animate-[bounce_0.7s_infinite_0.2s] h-6"></span>
                    <span className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_0.9s_infinite_0.3s] h-9"></span>
                  </div>
                ) : isListening ? (
                  <div className="flex items-center gap-1.5 h-10">
                    <span className="w-1.5 bg-fuchsia-500 rounded-full animate-[bounce_1s_infinite] h-6"></span>
                    <span className="w-1.5 bg-violet-500 rounded-full animate-[bounce_1.2s_infinite_0.1s] h-10"></span>
                    <span className="w-1.5 bg-orange-500 rounded-full animate-[bounce_0.9s_infinite_0.2s] h-5"></span>
                    <span className="w-1.5 bg-fuchsia-500 rounded-full animate-[bounce_1.1s_infinite_0.3s] h-8"></span>
                  </div>
                ) : isLoading ? (
                  <Loader2 className="w-10 h-10 text-fuchsia-400 animate-spin" />
                ) : (
                  <Sparkles className="w-10 h-10 text-white/50" />
                )}
              </div>
            </div>

            {/* Transcript Messages & Live Streaming Preview */}
            <div className="w-full text-center space-y-4 max-h-[220px] overflow-y-auto px-2">
              {isListening && liveStreamingText ? (
                <div className="animate-in fade-in duration-150">
                  <p className="text-base md:text-lg font-medium text-fuchsia-300 leading-relaxed italic">
                    "{liveStreamingText}..."
                  </p>
                </div>
              ) : messages.length > 0 && (
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
                  <p className="text-base md:text-lg font-medium text-white/90 leading-relaxed">
                    "{messages[messages.length - 1].content}"
                  </p>
                </div>
              )}
            </div>

            {/* Live Real-Time Word Array Stream Visualizer */}
            {isListening && liveWordChunks.length > 0 && (
              <div className="w-full flex flex-col items-center gap-1.5 animate-in fade-in duration-200 mt-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-fuchsia-400/90">
                  ⚡ Word Stream Buffer Array ({liveWordChunks.length}):
                </span>
                <div className="flex flex-wrap justify-center gap-1 max-h-16 overflow-y-auto px-2">
                  {liveWordChunks.map((word, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-xs bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/30 rounded-md font-mono animate-in zoom-in-75 duration-150 shadow-sm">
                      [{idx}] {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              <p className="text-fuchsia-300/90 text-xs font-bold tracking-wider uppercase animate-pulse">
                {isSpeaking ? '🗣️ AI Speaking...' : isListening ? '🎙️ Listening...' : isLoading ? `⏳ ${voiceBusinessStep}` : 'Tap Mic to Speak'}
              </p>
              {isSpeaking && (
                <button onClick={stopSpeaking} className="p-1 bg-white/10 hover:bg-white/20 text-xs text-white rounded-md transition-colors" title="Stop Voice">
                  <VolumeX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Voice Controls Bottom */}
          <div className="z-20 flex items-center gap-4">
            <button
              onClick={isListening ? stopVoiceMode : startVoiceRecognitionSilently}
              className={`p-6 rounded-full transition-all shadow-2xl hover:scale-105 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.5)]'
                  : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-[0_0_25px_rgba(192,38,211,0.5)]'
              }`}
              title={isListening ? 'Stop Listening' : 'Start Mic'}
            >
              {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
          </div>
        </div>
      )}

      {/* STANDARD CHAT PANEL */}
      {isOpen && !isVoiceMode && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] max-h-[700px] h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
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

          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mr-3 shrink-0 mt-1 border border-slate-300">
                    <Bot className="w-4 h-4 text-slate-700" />
                  </div>
                )}
                <div className={`group relative max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none shadow-md'
                    : 'bg-white text-slate-800 shadow-sm border border-slate-200 rounded-bl-none'
                }`}>
                  {msg.role === 'ai' ? (
                    <div>
                      {msg.content.split('\n').map((line, idx) => {
                        if (!line.trim()) return null;
                        const cleanLine = line.replace(/^#+\s?/, '');
                        const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
                        return (
                          <div key={idx} className="leading-relaxed">
                            {parts.map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong key={pIdx} className="font-semibold text-violet-700">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return part;
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    msg.content
                  )}
                  {msg.role === 'ai' && (
                    <button
                      onClick={() => speak(msg.content)}
                      className="ml-2 inline-flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                      title="Speak Out Loud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
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
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
            <button
              onClick={startVoiceMode}
              className="p-3 bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-violet-700 rounded-xl transition-colors group"
              title="Switch to Voice Mode"
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
