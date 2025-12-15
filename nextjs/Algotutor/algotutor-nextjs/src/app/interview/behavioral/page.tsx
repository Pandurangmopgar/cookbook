'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import Link from 'next/link';
import { 
  Mic, MicOff, Wifi, WifiOff, Loader2, 
  ChevronLeft, MessageSquare, User, Bot, Sparkles,
  CheckCircle, AlertCircle, ArrowRight
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import AudioVisualizer from '@/components/AudioVisualizer';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BEHAVIORAL_QUESTIONS, 
  BEHAVIORAL_CATEGORIES, 
  BehavioralQuestion,
  getBehavioralQuestionsByCategory 
} from '@/lib/behavioral-questions';
import { GET_BEHAVIORAL_SYSTEM_INSTRUCTION, INTERVIEW_MODEL_NAME, BEHAVIORAL_TOOLS } from '@/lib/interview-constants';
import { ConnectionState } from '@/types';
import { base64ToUint8Array, createPcmBlob, decodeAudioData } from '@/services/audioUtils';

interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
}

export default function BehavioralInterviewPage() {
  const { user } = useAuth();
  
  // Question selection
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<BehavioralQuestion | null>(null);
  
  // Interview state
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const inputStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  
  // Transcription
  const currentInputTransRef = useRef('');
  const currentOutputTransRef = useRef('');
  
  // Chat scroll
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const cleanupAudio = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (inputStreamRef.current) {
      inputStreamRef.current.getTracks().forEach(track => track.stop());
      inputStreamRef.current = null;
    }
    if (inputAudioContextRef.current?.state !== 'closed') {
      inputAudioContextRef.current?.close();
      inputAudioContextRef.current = null;
    }
    audioQueueRef.current.forEach(node => {
      try { node.stop(); } catch(e) {}
    });
    audioQueueRef.current = [];
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    }
    setIsModelSpeaking(false);
  }, []);

  const startInterview = async () => {
    if (!selectedQuestion) return;
    if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      alert("Please provide NEXT_PUBLIC_GOOGLE_API_KEY in .env.local");
      return;
    }

    try {
      setConnectionState(ConnectionState.CONNECTING);
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        inputStreamRef.current = stream;
      } catch (err) {
        setConnectionState(ConnectionState.DISCONNECTED);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY! });
      
      // Get learning context
      let learningContext = '';
      const userId = user?.id || 'anonymous';
      try {
        const params = new URLSearchParams({
          userId,
          problemId: selectedQuestion.id,
          category: 'behavioral',
        });
        const response = await fetch(`/api/memory/context?${params}`);
        const data = await response.json();
        learningContext = data.context || '';
      } catch (e) {
        console.error('Failed to fetch learning context:', e);
      }
      
      const systemInstruction = GET_BEHAVIORAL_SYSTEM_INSTRUCTION(selectedQuestion, learningContext);

      let sessionPromise: Promise<any>;
      
      sessionPromise = ai.live.connect({
        model: INTERVIEW_MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } },
          },
          systemInstruction: { parts: [{ text: systemInstruction }] },
          tools: [{ functionDeclarations: BEHAVIORAL_TOOLS as any }],
          inputAudioTranscription: {}, 
          outputAudioTranscription: {}, 
        } as any,
        callbacks: {
          onopen: () => {
            setConnectionState(ConnectionState.CONNECTED);
            setMessages([{ 
              role: 'system', 
              text: `🎯 Behavioral interview started. Question: "${selectedQuestion.question}"` 
            }]);
            setIsMicOn(true);

            if (!inputAudioContextRef.current) return;
            
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current = source;
            
            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const serverContent = msg.serverContent as any;
            if (serverContent?.outputTranscription) {
              currentOutputTransRef.current += serverContent.outputTranscription.text;
            }
            if (serverContent?.inputTranscription) {
              currentInputTransRef.current += serverContent.inputTranscription.text;
            }

            if (serverContent?.turnComplete) {
              if (currentInputTransRef.current.trim()) {
                setMessages(prev => [...prev, { role: 'user', text: currentInputTransRef.current }]);
                currentInputTransRef.current = '';
              }
              if (currentOutputTransRef.current.trim()) {
                setMessages(prev => [...prev, { role: 'model', text: currentOutputTransRef.current }]);
                currentOutputTransRef.current = '';
              }
            }

            if (msg.toolCall) {
              const functionResponses: Array<{ id: string; name: string; response: any }> = [];
              
              for (const fc of msg.toolCall.functionCalls || []) {
                let result = {};
                
                if (fc.name === 'getLearningContext') {
                  try {
                    const userId = user?.id || 'anonymous';
                    const params = new URLSearchParams({ userId, problemId: selectedQuestion.id, category: 'behavioral' });
                    const response = await fetch(`/api/memory/context?${params}`);
                    const data = await response.json();
                    result = { learningContext: data.context };
                  } catch (e) {
                    result = { learningContext: 'Unable to fetch history.' };
                  }
                } else if (fc.name === 'storeLearningInsight') {
                  const args = fc.args as { insight: string; category?: string };
                  try {
                    const userId = user?.id || 'anonymous';
                    await fetch('/api/memory/context', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId, insight: args.insight, category: args.category || 'behavioral' }),
                    });
                    result = { success: true };
                  } catch (e) {
                    result = { success: false };
                  }
                } else if (fc.name === 'provideSTARGuidance') {
                  const args = fc.args as { missingElement: string; guidance: string };
                  setMessages(prev => [...prev, { 
                    role: 'system', 
                    text: `💡 STAR Tip: Your ${args.missingElement} could be stronger. ${args.guidance}` 
                  }]);
                  result = { acknowledged: true };
                }
                
                functionResponses.push({
                  id: fc.id || '',
                  name: fc.name || '',
                  response: { result }
                });
              }

              sessionPromise.then(session => {
                session.sendToolResponse({ functionResponses });
              });
            }

            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              setIsModelSpeaking(true);
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(base64ToUint8Array(base64Audio), ctx);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                setTimeout(() => setIsModelSpeaking(false), 100);
              });

              source.start(nextStartTimeRef.current);
              audioQueueRef.current.push(source);
              nextStartTimeRef.current += audioBuffer.duration;
            }

            if (msg.serverContent?.interrupted) {
              audioQueueRef.current.forEach(node => {
                try { node.stop(); } catch(e) {}
              });
              audioQueueRef.current = [];
              nextStartTimeRef.current = 0;
              setIsModelSpeaking(false);
            }
          },
          onclose: () => {
            setConnectionState(ConnectionState.DISCONNECTED);
            setMessages(prev => [...prev, { role: 'system', text: "Interview session ended." }]);
            setIsMicOn(false);
            cleanupAudio();
          },
          onerror: (err) => {
            console.error(err);
            setConnectionState(ConnectionState.ERROR);
            cleanupAudio();
          }
        }
      });

    } catch (e) {
      console.error(e);
      setConnectionState(ConnectionState.ERROR);
    }
  };

  const endInterview = () => {
    cleanupAudio();
    setConnectionState(ConnectionState.DISCONNECTED);
  };

  const toggleMic = () => {
    if (connectionState !== ConnectionState.CONNECTED) return;
    if (isMicOn) {
      inputAudioContextRef.current?.suspend();
    } else {
      inputAudioContextRef.current?.resume();
    }
    setIsMicOn(!isMicOn);
  };

  // Question selection view
  if (!selectedQuestion) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Header */}
        <header className="border-b border-[#333] bg-[#111]">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-[#808080] hover:text-white flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Link>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-violet-500" />
                Behavioral Interview Practice
              </h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Practice Behavioral Questions</h2>
            <p className="text-[#808080]">
              Master the STAR method with AI-powered mock interviews
            </p>
          </div>

          {/* Category Selection */}
          {!selectedCategory ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {BEHAVIORAL_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="p-6 rounded-xl bg-[#111] border border-[#333] hover:border-violet-500/50 transition-all text-left group"
                >
                  <span className="text-3xl mb-3 block">{cat.icon}</span>
                  <h3 className="font-semibold mb-1 group-hover:text-violet-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#808080]">
                    {getBehavioralQuestionsByCategory(cat.id).length} questions
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-[#808080] hover:text-white flex items-center gap-2 mb-6"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to categories
              </button>
              
              <h3 className="text-lg font-semibold mb-4">
                {BEHAVIORAL_CATEGORIES.find(c => c.id === selectedCategory)?.icon}{' '}
                {BEHAVIORAL_CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </h3>
              
              <div className="space-y-3">
                {getBehavioralQuestionsByCategory(selectedCategory).map(q => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestion(q)}
                    className="w-full p-4 rounded-xl bg-[#111] border border-[#333] hover:border-violet-500/50 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium group-hover:text-violet-400 transition-colors">
                          {q.question}
                        </h4>
                        {q.company && (
                          <p className="text-xs text-[#666] mt-1">
                            Common at: {q.company.join(', ')}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#666] group-hover:text-violet-400 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Interview view
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#333] bg-[#111] shrink-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (connectionState === ConnectionState.CONNECTED) {
                  endInterview();
                }
                setSelectedQuestion(null);
                setMessages([]);
              }}
              className="text-[#808080] hover:text-white flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-lg font-semibold">{selectedQuestion.question}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {connectionState === ConnectionState.CONNECTED && (
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#1a1a1a]">
                <AudioVisualizer isActive={true} isSpeaking={isModelSpeaking} />
                <span className="text-xs text-[#808080]">
                  {isModelSpeaking ? 'SPEAKING' : 'LISTENING'}
                </span>
                <button 
                  onClick={toggleMic}
                  className={twMerge(
                    "p-1.5 rounded transition-colors",
                    isMicOn ? "bg-red-500/20 text-red-400" : "bg-[#333] text-[#808080]"
                  )}
                >
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              </div>
            )}
            
            <button
              onClick={connectionState === ConnectionState.CONNECTED ? endInterview : startInterview}
              className={twMerge(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                connectionState === ConnectionState.CONNECTED
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-violet-600 hover:bg-violet-700 text-white"
              )}
              disabled={connectionState === ConnectionState.CONNECTING}
            >
              {connectionState === ConnectionState.CONNECTING ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</>
              ) : connectionState === ConnectionState.CONNECTED ? (
                <><WifiOff className="w-4 h-4" /> End Session</>
              ) : (
                <><Wifi className="w-4 h-4" /> Start Practice</>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        {/* Tips Panel */}
        <div className="w-80 border-r border-[#333] p-4 overflow-y-auto bg-[#0d0d0d]">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            STAR Framework
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-lg bg-[#1a1a1a]">
              <div className="font-medium text-blue-400 mb-1">Situation</div>
              <p className="text-[#808080]">{selectedQuestion.starFramework.situation}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#1a1a1a]">
              <div className="font-medium text-green-400 mb-1">Task</div>
              <p className="text-[#808080]">{selectedQuestion.starFramework.task}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#1a1a1a]">
              <div className="font-medium text-yellow-400 mb-1">Action</div>
              <p className="text-[#808080]">{selectedQuestion.starFramework.action}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#1a1a1a]">
              <div className="font-medium text-purple-400 mb-1">Result</div>
              <p className="text-[#808080]">{selectedQuestion.starFramework.result}</p>
            </div>
          </div>
          
          <h4 className="font-semibold mt-6 mb-3 text-sm">Tips</h4>
          <ul className="space-y-2 text-sm text-[#808080]">
            {selectedQuestion.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && connectionState !== ConnectionState.CONNECTED && (
              <div className="text-center py-12 text-[#808080]">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Click "Start Practice" to begin your mock interview</p>
                <p className="text-sm mt-2">The AI interviewer will ask you the question and provide feedback</p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div
                key={i}
                className={twMerge(
                  "flex gap-3",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {msg.role !== 'user' && (
                  <div className={twMerge(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    msg.role === 'model' ? "bg-violet-500/20" : "bg-[#333]"
                  )}>
                    {msg.role === 'model' ? (
                      <Bot className="w-4 h-4 text-violet-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#808080]" />
                    )}
                  </div>
                )}
                
                <div className={twMerge(
                  "rounded-xl px-4 py-3 max-w-[70%]",
                  msg.role === 'user' ? "bg-blue-600 text-white" :
                  msg.role === 'model' ? "bg-[#1a1a1a] text-[#e0e0e0]" :
                  "bg-[#1a1a1a] text-[#808080] text-sm italic"
                )}>
                  {msg.text}
                </div>
                
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
