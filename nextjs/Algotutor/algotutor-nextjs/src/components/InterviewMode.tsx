'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import dynamic from 'next/dynamic';
import { 
  Mic, MicOff, Play, Wifi, WifiOff, Loader2, AlertCircle, 
  Clock, ChevronDown, ChevronRight, Building2, Timer, Target,
  CheckCircle, XCircle, Lightbulb, MessageSquare
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import AudioVisualizer from '@/components/AudioVisualizer';
import { useAuth } from '@/contexts/AuthContext';
import { INTERVIEW_PROBLEMS, INTERVIEW_CATEGORIES, InterviewProblem } from '@/lib/interview-problems';
import { GET_INTERVIEW_SYSTEM_INSTRUCTION, INTERVIEW_MODEL_NAME, INTERVIEW_TOOLS } from '@/lib/interview-constants';
import { ConnectionState } from '@/types';
import { base64ToUint8Array, createPcmBlob, decodeAudioData } from '@/services/audioUtils';
import { runUserCodeAsync } from '@/services/codeRunner';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
}

interface InterviewModeProps {
  onBack: () => void;
}

export default function InterviewMode({ onBack }: InterviewModeProps) {
  const { user } = useAuth();
  
  // Problem selection
  const [selectedCategory, setSelectedCategory] = useState(INTERVIEW_CATEGORIES[0]);
  const [selectedProblem, setSelectedProblem] = useState<InterviewProblem>(INTERVIEW_CATEGORIES[0].problems[0]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([INTERVIEW_CATEGORIES[0].id]);
  
  // Interview state
  const [code, setCode] = useState(selectedProblem.starterCode);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Timer
  const [timeRemaining, setTimeRemaining] = useState((selectedProblem.timeLimit || 30) * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Test results
  const [testResults, setTestResults] = useState<{passed: boolean; results: string} | null>(null);
  
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
  
  // Code ref for tools
  const codeRef = useRef(code);
  useEffect(() => { codeRef.current = code; }, [code]);
  
  const problemRef = useRef(selectedProblem);
  useEffect(() => { problemRef.current = selectedProblem; }, [selectedProblem]);
  
  // Chat scroll
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setMessages(m => [...m, { role: 'system', text: '⏰ Time\'s up! Let\'s wrap up and discuss your solution.' }]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeRemaining]);
  
  // Update code when problem changes
  useEffect(() => {
    setCode(selectedProblem.starterCode);
    setMessages([]);
    setTestResults(null);
    setTimeRemaining((selectedProblem.timeLimit || 30) * 60);
    setIsTimerRunning(false);
  }, [selectedProblem]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

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
    setAnalyzing(false);
  }, []);

  const startInterview = async () => {
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
          problemId: selectedProblem.id,
          category: 'interview',
        });
        const response = await fetch(`/api/memory/context?${params}`);
        const data = await response.json();
        learningContext = data.context || '';
      } catch (e) {
        console.error('Failed to fetch learning context:', e);
      }
      
      const systemInstruction = GET_INTERVIEW_SYSTEM_INSTRUCTION(
        selectedProblem, 
        learningContext,
        selectedProblem.timeLimit
      );

      let sessionPromise: Promise<any>;
      
      sessionPromise = ai.live.connect({
        model: INTERVIEW_MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } }, // Professional voice
          },
          systemInstruction: { parts: [{ text: systemInstruction }] },
          tools: [{ functionDeclarations: INTERVIEW_TOOLS as any }],
          inputAudioTranscription: {}, 
          outputAudioTranscription: {}, 
        } as any,
        callbacks: {
          onopen: () => {
            setConnectionState(ConnectionState.CONNECTED);
            setMessages([{ 
              role: 'system', 
              text: `🎯 Interview started for "${selectedProblem.title}". Timer: ${selectedProblem.timeLimit || 30} minutes.` 
            }]);
            setIsMicOn(true);
            setIsTimerRunning(true);

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
              setAnalyzing(true);
              const functionResponses: Array<{ id: string; name: string; response: any }> = [];
              
              for (const fc of msg.toolCall.functionCalls || []) {
                let result = {};
                
                if (fc.name === 'getCurrentCode') {
                  result = { code: codeRef.current };
                  setMessages(prev => [...prev, { role: 'system', text: '📝 Reviewing your code...' }]);
                } else if (fc.name === 'runTests') {
                  setMessages(prev => [...prev, { role: 'system', text: '🧪 Running tests...' }]);
                  const runResult = await runUserCodeAsync(codeRef.current, problemRef.current);
                  result = { passed: runResult.passed, output: runResult.results };
                  setTestResults(runResult);
                  setMessages(prev => [...prev, { 
                    role: 'system', 
                    text: `Tests ${runResult.passed ? 'PASSED ✅' : 'FAILED ❌'}` 
                  }]);
                } else if (fc.name === 'giveTimeWarning') {
                  const args = fc.args as { minutesRemaining: number };
                  setMessages(prev => [...prev, { 
                    role: 'system', 
                    text: `⏰ ${args.minutesRemaining} minutes remaining` 
                  }]);
                  result = { acknowledged: true };
                } else if (fc.name === 'getLearningContext') {
                  try {
                    const userId = user?.id || 'anonymous';
                    const params = new URLSearchParams({ userId, problemId: problemRef.current.id, category: 'interview' });
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
                      body: JSON.stringify({ userId, insight: args.insight, category: args.category || 'interview' }),
                    });
                    result = { success: true };
                  } catch (e) {
                    result = { success: false };
                  }
                }
                
                functionResponses.push({
                  id: fc.id || '',
                  name: fc.name || '',
                  response: { result }
                });
              }

              sessionPromise.then(session => {
                session.sendToolResponse({ functionResponses });
                setAnalyzing(false);
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
            setIsTimerRunning(false);
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
    setIsTimerRunning(false);
    window.location.reload();
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

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white">

      {/* Sidebar - Problem Selection */}
      <div className="w-72 border-r border-[#333] bg-[#111] flex flex-col">
        <div className="p-4 border-b border-[#333]">
          <button
            onClick={onBack}
            className="text-sm text-[#808080] hover:text-white flex items-center gap-2 mb-3"
          >
            ← Back to Practice
          </button>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            Interview Mode
          </h2>
          <p className="text-xs text-[#808080] mt-1">Real coding interview simulation</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {INTERVIEW_CATEGORIES.map(category => (
            <div key={category.id} className="mb-2">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1a1a1a] text-left"
              >
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown className="w-4 h-4 text-[#808080]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#808080]" />
                )}
                <span className="text-sm font-medium">{category.name}</span>
                <span className="ml-auto text-xs text-[#808080]">{category.problems.length}</span>
              </button>
              
              {expandedCategories.includes(category.id) && (
                <div className="ml-4 mt-1 space-y-1">
                  {category.problems.map(problem => (
                    <button
                      key={problem.id}
                      onClick={() => {
                        if (connectionState === ConnectionState.CONNECTED) {
                          if (confirm('Changing problems will end the current interview. Continue?')) {
                            endInterview();
                            setSelectedProblem(problem);
                          }
                        } else {
                          setSelectedProblem(problem);
                        }
                      }}
                      className={twMerge(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        selectedProblem.id === problem.id
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "hover:bg-[#1a1a1a] text-[#b3b3b3]"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{problem.title}</span>
                        <span className={twMerge(
                          "text-xs px-1.5 py-0.5 rounded",
                          problem.difficulty === 'Easy' ? "bg-green-500/20 text-green-400" :
                          problem.difficulty === 'Medium' ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                        )}>
                          {problem.difficulty}
                        </span>
                      </div>
                      {problem.company && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-[#666]">
                          <Building2 className="w-3 h-3" />
                          {problem.company.slice(0, 2).join(', ')}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-[#333] flex items-center justify-between px-4 bg-[#111]">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold">{selectedProblem.title}</h1>
            <span className={twMerge(
              "text-xs px-2 py-1 rounded",
              selectedProblem.difficulty === 'Easy' ? "bg-green-500/20 text-green-400" :
              selectedProblem.difficulty === 'Medium' ? "bg-yellow-500/20 text-yellow-400" :
              "bg-red-500/20 text-red-400"
            )}>
              {selectedProblem.difficulty}
            </span>
            {selectedProblem.company && (
              <div className="flex items-center gap-1 text-xs text-[#808080]">
                <Building2 className="w-3 h-3" />
                {selectedProblem.company.join(', ')}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={twMerge(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg",
              timeRemaining < 300 ? "bg-red-500/20 text-red-400" : "bg-[#1a1a1a] text-white"
            )}>
              <Timer className="w-4 h-4" />
              <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
            </div>
            
            {/* Connection Status */}
            {connectionState === ConnectionState.CONNECTED && (
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#1a1a1a]">
                <AudioVisualizer isActive={true} isSpeaking={isModelSpeaking} />
                {analyzing ? (
                  <span className="text-xs text-violet-400 animate-pulse">ANALYZING</span>
                ) : (
                  <span className="text-xs text-[#808080]">LISTENING</span>
                )}
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
            
            {/* Start/End Button */}
            <button
              onClick={connectionState === ConnectionState.CONNECTED ? endInterview : startInterview}
              className={twMerge(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                connectionState === ConnectionState.CONNECTED
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              )}
              disabled={connectionState === ConnectionState.CONNECTING}
            >
              {connectionState === ConnectionState.CONNECTING ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</>
              ) : connectionState === ConnectionState.CONNECTED ? (
                <><WifiOff className="w-4 h-4" /> End Interview</>
              ) : (
                <><Wifi className="w-4 h-4" /> Start Interview</>
              )}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Problem Description */}
          <div className="w-[400px] border-r border-[#333] overflow-y-auto p-4 bg-[#0d0d0d]">
            <div className="prose prose-invert prose-sm max-w-none">
              <h3 className="text-white">Problem</h3>
              <p className="text-[#b3b3b3] whitespace-pre-wrap">{selectedProblem.description}</p>
              
              <h4 className="text-white mt-4">Examples</h4>
              {selectedProblem.examples.map((ex, i) => (
                <div key={i} className="bg-[#1a1a1a] rounded-lg p-3 mb-2">
                  <div className="text-xs text-[#808080]">Input:</div>
                  <code className="text-green-400 text-sm">{ex.input}</code>
                  <div className="text-xs text-[#808080] mt-2">Output:</div>
                  <code className="text-blue-400 text-sm">{ex.output}</code>
                  {ex.explanation && (
                    <div className="text-xs text-[#666] mt-2">{ex.explanation}</div>
                  )}
                </div>
              ))}
              
              {selectedProblem.constraints && (
                <>
                  <h4 className="text-white mt-4">Constraints</h4>
                  <ul className="text-[#808080] text-sm">
                    {selectedProblem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </>
              )}
              
              {selectedProblem.interviewTips && (
                <>
                  <h4 className="text-white mt-4 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    Interview Tips
                  </h4>
                  <ul className="text-[#808080] text-sm">
                    {selectedProblem.interviewTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <Editor
              height="60%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 },
              }}
            />
            
            {/* Chat/Transcript */}
            <div className="h-[40%] border-t border-[#333] bg-[#0d0d0d] flex flex-col">
              <div className="px-4 py-2 border-b border-[#333] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#808080]" />
                <span className="text-sm font-medium">Interview Transcript</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={twMerge(
                      "rounded-lg px-3 py-2 text-sm max-w-[80%]",
                      msg.role === 'user' ? "bg-blue-500/20 text-blue-200 ml-auto" :
                      msg.role === 'model' ? "bg-[#1a1a1a] text-[#e0e0e0]" :
                      "bg-[#1a1a1a] text-[#808080] text-xs italic"
                    )}
                  >
                    {msg.text}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
