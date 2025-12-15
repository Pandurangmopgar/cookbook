'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import dynamic from 'next/dynamic';
import { 
  Mic, MicOff, Play, Zap, Wifi, WifiOff, MessageSquare, Loader2, AlertCircle, RefreshCw, 
  ChevronDown, ChevronRight, Code2, BookOpen, PanelLeft, PanelRightClose, PanelRightOpen, GripVertical, Type, Volume2,
  Terminal, CheckCircle, XCircle, ChevronUp, User, LogOut, LayoutDashboard, Check
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import ProblemPane from '@/components/ProblemPane';
import AudioVisualizer from '@/components/AudioVisualizer';
import TextTutorPanel from '@/components/TextTutorPanel';
import AICodingTutor from '@/components/AICodingTutor';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useCodeProgress } from '@/hooks/useCodeProgress';
import { useSolvedProblems } from '@/hooks/useSolvedProblems';
import { CATEGORIES, GET_SYSTEM_INSTRUCTION, MODEL_NAME } from '@/constants';
import { ConnectionState, TOOLS, Problem, Category } from '@/types';
import { base64ToUint8Array, createPcmBlob, decodeAudioData } from '@/services/audioUtils';
import { runUserCode, runUserCodeAsync } from '@/services/codeRunner';
import { analyzeCodeRealtime, getTextHint, AIFeedback } from '@/services/textTutor';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
}

interface TextHint {
  hint: string;
  type: string;
}

type TutorMode = 'voice' | 'text';

export default function App() {
  // Auth
  const { user, signOut, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Select first problem by default
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES[0]);
  const [selectedProblem, setSelectedProblem] = useState<Problem>(CATEGORIES[0].problems[0]);
  
  // Code progress persistence
  const { savedCode, saveCode, markSolved, incrementAttempts, loading: progressLoading } = useCodeProgress(selectedProblem.id);
  
  // Track all solved problems for sidebar checkmarks
  const { isSolved, addSolved, count: solvedCount } = useSolvedProblems();
  
  const [code, setCode] = useState(selectedProblem.starterCode);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([CATEGORIES[0].id]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTutorPanelOpen, setIsTutorPanelOpen] = useState(true);

  // Tutor Mode State
  const [tutorMode, setTutorMode] = useState<TutorMode>('text');
  
  // Text Mode State
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [previousCode, setPreviousCode] = useState<string>('');
  const [isWatching, setIsWatching] = useState(false);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [textHints, setTextHints] = useState<TextHint[]>([]);
  const [textHintIndex, setTextHintIndex] = useState(0);
  const [isGettingHint, setIsGettingHint] = useState(false);

  // Test Results State
  const [testResults, setTestResults] = useState<{passed: boolean; results: string; testCaseResults?: {passed: boolean; input: any; expected: any; actual: any}[]} | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [activeOutputTab, setActiveOutputTab] = useState<'testcase' | 'output'>('testcase');

  // Resize State
  const [problemPaneWidth, setProblemPaneWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);

  // Left Pane Tab State (Problem vs Solution)
  const [leftPaneTab, setLeftPaneTab] = useState<'problem' | 'solution'>('problem');

  // Problem Switch Confirmation Modal
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [pendingProblem, setPendingProblem] = useState<Problem | null>(null);

  // Update code when problem changes - load saved code if available
  useEffect(() => {
    // Load saved code if user is logged in and has progress, otherwise use starter code
    if (savedCode && user) {
      setCode(savedCode);
    } else {
      setCode(selectedProblem.starterCode);
    }
    setMessages([]); // Clear chat on problem switch
    // Reset text mode state
    setAiFeedback(null);
    setPreviousCode('');
    setTextHints([]);
    setTextHintIndex(0);
    setTestResults(null); // Clear test results
    setShowOutput(false);
    setActiveTestCase(0);
    setActiveOutputTab('testcase');
    setLeftPaneTab('problem'); // Reset to Problem tab on problem switch
  }, [selectedProblem, savedCode, user]);

  // Auto-save code when it changes (debounced)
  useEffect(() => {
    if (!user || !code || code === selectedProblem.starterCode) return;
    
    const timer = setTimeout(() => {
      saveCode(code);
    }, 3000); // Save after 3 seconds of no typing
    
    return () => clearTimeout(timer);
  }, [code, user, saveCode, selectedProblem.starterCode]);

  // Real-time AI code analysis for text mode (debounced 2s)
  useEffect(() => {
    if (tutorMode !== 'text' || !realtimeEnabled) {
      setIsWatching(false);
      return;
    }
    
    if (!selectedProblem || !code) return;
    if (code === previousCode) return;
    
    setIsWatching(true);
    
    const timer = setTimeout(async () => {
      try {
        const feedback = await analyzeCodeRealtime(code, previousCode, selectedProblem);
        if (feedback.feedback) {
          setAiFeedback(feedback);
        }
        setPreviousCode(code);
      } catch (e) {
        console.error('Realtime analysis error:', e);
      } finally {
        setIsWatching(false);
      }
    }, 2000);
    
    return () => {
      clearTimeout(timer);
      setIsWatching(false);
    };
  }, [code, selectedProblem, tutorMode, realtimeEnabled, previousCode]);

  // Get text hint handler
  const handleGetTextHint = async () => {
    if (!selectedProblem || isGettingHint) return;
    setIsGettingHint(true);
    
    try {
      const result = await getTextHint(
        code,
        selectedProblem,
        textHintIndex,
        textHints.map(h => h.hint)
      );
      setTextHints(prev => [...prev, result]);
      setTextHintIndex(prev => prev + 1);
    } catch (e) {
      console.error('Failed to get hint:', e);
    } finally {
      setIsGettingHint(false);
    }
  };
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const inputStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  
  // Transcription accumulators
  const currentInputTransRef = useRef('');
  const currentOutputTransRef = useRef('');

  // Code Ref for Tools
  const codeRef = useRef(code);
  useEffect(() => { codeRef.current = code; }, [code]);
  
  // Current Problem Ref for Tools
  const problemRef = useRef(selectedProblem);
  useEffect(() => { problemRef.current = selectedProblem; }, [selectedProblem]);

  // Scroll ref
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Resizing Logic
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      // Calculate new width based on mouse position
      // If sidebar is open, subtract its width (320px or w-80)
      const sidebarOffset = isSidebarOpen ? 320 : 0;
      const newWidth = e.clientX - sidebarOffset;
      
      // Allow resizing from 0 (hidden) to 70% of screen width like NeetCode
      const maxWidth = window.innerWidth * 0.7;
      const clampedWidth = Math.max(0, Math.min(maxWidth, newWidth));
      setProblemPaneWidth(clampedWidth);
    }
  }, [isResizing, isSidebarOpen]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);


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
    if (inputAudioContextRef.current) {
      if (inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
      }
      inputAudioContextRef.current = null;
    }
    audioQueueRef.current.forEach(node => {
      try { node.stop(); } catch(e) {}
    });
    audioQueueRef.current = [];
    if (audioContextRef.current) {
       if (audioContextRef.current.state !== 'closed') {
         audioContextRef.current.close();
       }
       audioContextRef.current = null;
    }
    setIsModelSpeaking(false);
    setAnalyzing(false);
  }, []);

  const connectToGemini = async () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
      alert("Please provide NEXT_PUBLIC_GOOGLE_API_KEY in .env.local");
      return;
    }

    try {
      setConnectionState(ConnectionState.CONNECTING);
      setPermissionDenied(false);
      
      // 1. Initialize Audio Contexts
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
        inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      } catch (e) {
        console.error("AudioContext error", e);
        alert("Could not initialize audio. Please ensure you are using a modern browser.");
        setConnectionState(ConnectionState.DISCONNECTED);
        return;
      }

      // 2. Request Mic Permission
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        inputStreamRef.current = stream;
      } catch (err) {
        console.error("Mic Error:", err);
        setPermissionDenied(true);
        setConnectionState(ConnectionState.DISCONNECTED);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY! });
      
      // 3. Fetch learning context from MemoryStack BEFORE connecting
      let learningContext = '';
      const userId = user?.id || 'anonymous';
      try {
        setMessages(prev => [...prev, { role: 'system', text: '🧠 Loading your learning history...' }]);
        const params = new URLSearchParams({
          userId,
          problemId: selectedProblem.id,
          category: selectedProblem.title,
        });
        const response = await fetch(`/api/memory/context?${params}`);
        const data = await response.json();
        learningContext = data.context || '';
        if (data.problemHistory) {
          learningContext += `\n\nProblem-specific history for "${selectedProblem.title}": ${data.problemHistory.totalAttempts} previous attempts, ${data.problemHistory.solved ? 'solved before' : 'not yet solved'}.`;
        }
        console.log('📚 Learning context loaded:', learningContext.substring(0, 200));
      } catch (e) {
        console.error('Failed to fetch learning context:', e);
        // Continue without context
      }
      
      // 4. Connect to Live API with learning context in system instruction
      console.log('🎯 Connecting with problem:', selectedProblem.title);
      console.log('📝 Problem description:', selectedProblem.description?.substring(0, 100));
      const systemInstruction = GET_SYSTEM_INSTRUCTION(selectedProblem, learningContext);
      console.log('📋 System instruction preview:', systemInstruction.substring(0, 300));

      let sessionPromise: Promise<any>;
      
      sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: { parts: [{ text: systemInstruction }] },
          tools: [{ functionDeclarations: TOOLS as any }],
          inputAudioTranscription: {}, 
          outputAudioTranscription: {}, 
        } as any,
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Connected");
            setConnectionState(ConnectionState.CONNECTED);
            setMessages(prev => [...prev, { role: 'system', text: `Connected. Tutor is ready to help with "${selectedProblem.title}".` }]);
            setIsMicOn(true);

            // Start Input Stream
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
                 const text = currentInputTransRef.current;
                 setMessages(prev => [...prev, { role: 'user', text }]);
                 currentInputTransRef.current = '';
              }
              if (currentOutputTransRef.current.trim()) {
                 const text = currentOutputTransRef.current;
                 setMessages(prev => [...prev, { role: 'model', text }]);
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
                  setMessages(prev => [...prev, { role: 'system', text: 'Algo is reading your code...' }]);
                } else if (fc.name === 'runTests') {
                  // Use the problemRef to get the latest problem context even inside the callback
                  setMessages(prev => [...prev, { role: 'system', text: `Running tests for ${problemRef.current.title} with E2B...` }]);
                  const runResult = await runUserCodeAsync(codeRef.current, problemRef.current);
                  result = { 
                    passed: runResult.passed, 
                    output: runResult.results 
                  };
                  setMessages(prev => [...prev, { role: 'system', text: `Tests ${runResult.passed ? 'PASSED ✅' : 'FAILED ❌'}` }]);
                } else if (fc.name === 'getLearningContext') {
                  // Fetch learning context from MemoryStack
                  setMessages(prev => [...prev, { role: 'system', text: '🧠 Fetching your learning history...' }]);
                  try {
                    const args = fc.args as { query?: string } || {};
                    const userId = user?.id || 'anonymous';
                    const params = new URLSearchParams({
                      userId,
                      problemId: problemRef.current.id,
                      category: problemRef.current.title,
                      ...(args.query && { query: args.query }),
                    });
                    const response = await fetch(`/api/memory/context?${params}`);
                    const data = await response.json();
                    result = { 
                      learningContext: data.context,
                      problemHistory: data.problemHistory,
                    };
                    setMessages(prev => [...prev, { role: 'system', text: '✅ Learning context loaded' }]);
                  } catch (e) {
                    console.error('Failed to fetch learning context:', e);
                    result = { learningContext: 'Unable to fetch learning history.', error: true };
                  }
                } else if (fc.name === 'storeLearningInsight') {
                  // Store learning insight to MemoryStack
                  const args = fc.args as { insight: string; category?: string } || { insight: '' };
                  setMessages(prev => [...prev, { role: 'system', text: '💾 Saving learning insight...' }]);
                  try {
                    const userId = user?.id || 'anonymous';
                    await fetch('/api/memory/context', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId,
                        insight: args.insight,
                        category: args.category || problemRef.current.title,
                      }),
                    });
                    result = { success: true };
                    setMessages(prev => [...prev, { role: 'system', text: '✅ Insight saved for future sessions' }]);
                  } catch (e) {
                    console.error('Failed to store learning insight:', e);
                    result = { success: false, error: true };
                  }
                }
                
                functionResponses.push({
                  id: fc.id || '',
                  name: fc.name || '',
                  response: { result: result }
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
              
              const audioBuffer = await decodeAudioData(
                base64ToUint8Array(base64Audio),
                ctx
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                 setTimeout(() => {
                   setIsModelSpeaking(false); 
                 }, 100);
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
              
              if (currentOutputTransRef.current) {
                 setMessages(prev => [...prev, { role: 'model', text: currentOutputTransRef.current + '...' }]);
                 currentOutputTransRef.current = '';
              }
            }
          },
          onclose: () => {
            setConnectionState(ConnectionState.DISCONNECTED);
            setMessages(prev => [...prev, { role: 'system', text: "Session ended." }]);
            setIsMicOn(false);
            cleanupAudio();
          },
          onerror: (err) => {
            console.error(err);
            setConnectionState(ConnectionState.ERROR);
            setMessages(prev => [...prev, { role: 'system', text: "An error occurred with the connection." }]);
            cleanupAudio();
          }
        }
      });

    } catch (e) {
      console.error(e);
      setConnectionState(ConnectionState.ERROR);
    }
  };

  const disconnect = () => {
    cleanupAudio();
    setConnectionState(ConnectionState.DISCONNECTED);
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
    <div className={twMerge(
      "flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden",
      isResizing ? "cursor-col-resize select-none" : ""
    )}>
      {/* Problem Switch Confirmation Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Switch Problem?</h3>
            </div>
            <p className="text-[#b3b3b3] text-sm mb-6">
              Changing the problem will end your current voice session. Your code progress will be reset.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowSwitchModal(false);
                  setPendingProblem(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#b3b3b3] hover:text-white hover:bg-[#333] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  disconnect();
                  if (pendingProblem) {
                    setSelectedProblem(pendingProblem);
                  }
                  setShowSwitchModal(false);
                  setPendingProblem(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white transition-colors"
              >
                Switch Problem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - NeetCode Dark Theme */}
      <header className="h-12 border-b border-[#333] flex items-center justify-between px-4 bg-[#1a1a1a] z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-[#333] text-[#808080] hover:text-white transition-colors"
            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight hidden md:inline text-white">AlgoTutor</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="flex items-center bg-[#262626] rounded-md p-0.5">
            <button
              onClick={() => {
                if (connectionState === ConnectionState.CONNECTED) {
                  disconnect();
                }
                setTutorMode('text');
              }}
              className={twMerge(
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors",
                tutorMode === 'text' 
                  ? "bg-[#333] text-white" 
                  : "text-[#808080] hover:text-white"
              )}
            >
              <Type className="w-3.5 h-3.5" />
              Text
            </button>
            <button
              onClick={() => setTutorMode('voice')}
              className={twMerge(
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors",
                tutorMode === 'voice' 
                  ? "bg-[#333] text-white" 
                  : "text-[#808080] hover:text-white"
              )}
            >
              <Volume2 className="w-3.5 h-3.5" />
              Voice
            </button>
          </div>

          {/* Voice Mode Controls */}
          {tutorMode === 'voice' && connectionState === ConnectionState.CONNECTED && (
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-[#262626] border border-[#333]">
               <AudioVisualizer isActive={true} isSpeaking={isModelSpeaking} />
               <div className="h-4 w-px bg-[#444] mx-1"></div>
               {analyzing ? (
                 <div className="flex items-center gap-2 text-violet-400 text-xs font-mono animate-pulse">
                   <Loader2 className="w-3 h-3 animate-spin" />
                   ANALYZING
                 </div>
               ) : (
                 <span className="text-xs font-mono text-[#808080]">LISTENING</span>
               )}
               <div className="h-4 w-px bg-[#444] mx-1"></div>
               <button 
                onClick={toggleMic}
                className={twMerge(
                  "p-1.5 rounded transition-colors",
                  isMicOn ? "bg-[#ef4743]/10 text-[#ef4743] hover:bg-[#ef4743]/20" : "bg-[#333] text-[#808080] hover:bg-[#444]"
                )}
               >
                 {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
               </button>
            </div>
          )}

          {/* Voice Mode Start/End Button */}
          {tutorMode === 'voice' && (
            <button
              onClick={connectionState === ConnectionState.CONNECTED ? disconnect : connectToGemini}
              className={twMerge(
                "flex items-center gap-2 px-4 py-1.5 rounded-md font-medium transition-all text-sm",
                connectionState === ConnectionState.CONNECTED
                  ? "bg-[#ef4743] hover:bg-[#d93d3a] text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
              disabled={connectionState === ConnectionState.CONNECTING}
            >
              {connectionState === ConnectionState.CONNECTING ? (
                <span className="flex items-center gap-2">Connecting...</span>
              ) : connectionState === ConnectionState.CONNECTED ? (
                <>
                  <WifiOff className="w-4 h-4" /> End
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4" /> Start Tutor
                </>
              )}
            </button>
          )}

          {/* User Menu */}
          <div className="relative">
            {authLoading ? (
              <div className="w-8 h-8 rounded-full bg-[#333] animate-pulse" />
            ) : user ? (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium hover:ring-2 hover:ring-violet-400/50 transition-all"
                >
                  {user.email?.charAt(0).toUpperCase()}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e1e1e] border border-[#333] rounded-lg shadow-xl py-1 z-50">
                    <div className="px-3 py-2 border-b border-[#333]">
                      <p className="text-xs text-[#808080]">Signed in as</p>
                      <p className="text-sm text-white truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        window.location.href = '/dashboard';
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-[#b3b3b3] hover:bg-[#333] hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        signOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-[#b3b3b3] hover:bg-[#333] hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-[#333] text-white hover:bg-[#404040] transition-colors"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigation - LeetCode style wider sidebar */}
        {isSidebarOpen && (
          <div className="w-80 shrink-0 bg-[#1a1a1a] border-r border-[#333] flex flex-col hidden md:flex font-sans">
             {/* Header */}
            <div className="h-12 shrink-0 px-4 border-b border-[#333] flex items-center justify-between">
               <div className="flex items-center gap-2 text-white">
                  <BookOpen className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold">Problems</span>
               </div>
               <div className="flex items-center gap-2">
                  {solvedCount > 0 && (
                    <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      {solvedCount}
                    </div>
                  )}
                  <div className="text-[10px] font-mono text-[#808080] bg-[#262626] px-1.5 py-0.5 rounded">
                    {CATEGORIES.reduce((acc, cat) => acc + cat.problems.length, 0)}
                  </div>
               </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
              {CATEGORIES.map(category => {
                const isExpanded = expandedCategories.includes(category.id);
                return (
                  <div key={category.id}>
                    <button 
                      onClick={() => toggleCategory(category.id)}
                      className={twMerge(
                        "w-full flex items-center justify-between px-3 py-2 text-left rounded transition-all duration-200 group",
                        isExpanded 
                          ? "bg-[#262626] text-white" 
                          : "text-[#808080] hover:bg-[#262626] hover:text-[#b3b3b3]"
                      )}
                    >
                      <span className="text-sm font-medium truncate">{category.name}</span>
                      <ChevronDown className={twMerge(
                        "w-4 h-4 text-[#666] transition-transform duration-200",
                        isExpanded ? "rotate-180 text-[#999]" : ""
                      )} />
                    </button>

                    {/* Problems List */}
                    <div className={twMerge(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <div className="pl-2 space-y-0.5 py-1">
                        {category.problems.map(problem => {
                           const isSelected = selectedProblem.id === problem.id;
                           const problemSolved = isSolved(problem.id);
                           return (
                            <button
                              key={problem.id}
                              onClick={() => {
                                if (connectionState === ConnectionState.CONNECTED) {
                                  setPendingProblem(problem);
                                  setShowSwitchModal(true);
                                  return;
                                }
                                setSelectedProblem(problem);
                              }}
                              className={twMerge(
                                "w-full text-left px-2 py-2 rounded text-[13px] transition-all flex items-center gap-2",
                                isSelected 
                                  ? "bg-[#333] text-white" 
                                  : "text-[#808080] hover:text-[#b3b3b3] hover:bg-[#262626]"
                              )}
                            >
                              {/* Checkmark for solved problems - only show when solved */}
                              {problemSolved && (
                                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                  <Check className="w-4 h-4 text-emerald-400" />
                                </div>
                              )}
                              <span className="truncate flex-1">{problem.title}</span>
                              {/* Difficulty indicator */}
                              <span className={twMerge(
                                "text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0",
                                problem.difficulty === 'Easy' ? "text-emerald-400 bg-emerald-500/10" :
                                problem.difficulty === 'Medium' ? "text-amber-400 bg-amber-500/10" :
                                "text-rose-400 bg-rose-500/10"
                              )}>
                                {problem.difficulty}
                              </span>
                            </button>
                           );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NeetCode-Style Two Section Layout with Gap */}
        <div className="flex flex-1 gap-1 p-2 bg-[#1a1a1a] overflow-hidden">
          
          {/* Left Section: Problem Pane */}
          {problemPaneWidth > 0 && (
            <div 
              className="flex flex-col bg-[#1a1a1a] rounded-lg overflow-hidden shrink-0 border border-[#3d3d3d]"
              style={{ width: `${problemPaneWidth}px` }}
            >
              {/* Problem Pane Tab Header */}
              <div className="h-9 bg-[#262626] border-b border-[#3d3d3d] flex items-center px-1 shrink-0">
                <div className="flex items-center">
                  <button 
                    onClick={() => setLeftPaneTab('problem')}
                    className={twMerge(
                      "px-3 py-1.5 text-xs font-medium transition-colors",
                      leftPaneTab === 'problem' 
                        ? "text-white bg-[#1a1a1a] rounded-t-md border-t border-l border-r border-[#3d3d3d] -mb-px relative z-10"
                        : "text-[#808080] hover:text-[#b3b3b3]"
                    )}
                  >
                    Problem
                  </button>
                  <button 
                    onClick={() => setLeftPaneTab('solution')}
                    className={twMerge(
                      "px-3 py-1.5 text-xs font-medium transition-colors",
                      leftPaneTab === 'solution' 
                        ? "text-white bg-[#1a1a1a] rounded-t-md border-t border-l border-r border-[#3d3d3d] -mb-px relative z-10"
                        : "text-[#808080] hover:text-[#b3b3b3]"
                    )}
                  >
                    Solution
                  </button>
                </div>
              </div>
              
              {/* Problem/Solution Content */}
              <div className="flex-1 overflow-hidden">
                {problemPaneWidth > 100 ? (
                  leftPaneTab === 'problem' ? (
                    <ProblemPane 
                      problem={selectedProblem} 
                      onAuthRequired={() => setShowAuthModal(true)}
                    />
                  ) : (
                    <div className="h-full overflow-y-auto p-4 bg-[#1e1e1e]">
                      {selectedProblem.solution ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white">Optimal Solution</h3>
                          {/* Syntax-highlighted code using Monaco Editor */}
                          <div className="rounded-lg overflow-hidden border border-[#3d3d3d]" style={{ height: `${Math.min(selectedProblem.solution.split('\n').length * 20 + 40, 300)}px` }}>
                            <Editor
                              height="100%"
                              defaultLanguage="python"
                              theme="vs-dark"
                              value={selectedProblem.solution}
                              options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 13,
                                padding: { top: 12 },
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                lineNumbers: 'on',
                                scrollbar: {
                                  vertical: 'auto',
                                  horizontal: 'auto',
                                  useShadows: false,
                                  verticalScrollbarSize: 8,
                                  horizontalScrollbarSize: 8,
                                },
                                folding: false,
                                renderLineHighlight: 'none',
                                overviewRulerBorder: false,
                                overviewRulerLanes: 0,
                                hideCursorInOverviewRuler: true,
                              }}
                            />
                          </div>
                          {selectedProblem.solutionExplanation && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-white">Explanation</h4>
                              <p className="text-sm text-[#b3b3b3] leading-relaxed">{selectedProblem.solutionExplanation}</p>
                            </div>
                          )}
                          <div className="flex gap-4 text-xs">
                            {selectedProblem.timeComplexity && (
                              <div className="bg-[#2a2a2a] px-3 py-1.5 rounded border border-[#3d3d3d]">
                                <span className="text-[#808080]">Time: </span>
                                <span className="text-emerald-400 font-mono">{selectedProblem.timeComplexity}</span>
                              </div>
                            )}
                            {selectedProblem.spaceComplexity && (
                              <div className="bg-[#2a2a2a] px-3 py-1.5 rounded border border-[#3d3d3d]">
                                <span className="text-[#808080]">Space: </span>
                                <span className="text-blue-400 font-mono">{selectedProblem.spaceComplexity}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-[#808080]">
                          <p>Solution not available for this problem yet.</p>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="transform -rotate-90 text-[#808080] text-sm font-medium whitespace-nowrap">
                      Problem
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NeetCode-Style Resizer Handle */}
          <div 
            className="group relative w-[3px] hover:w-[4px] bg-transparent hover:bg-[#3b82f6]/30 transition-all cursor-col-resize flex items-center justify-center z-20 rounded-full my-1"
            onMouseDown={startResizing}
            onDoubleClick={() => {
              if (problemPaneWidth < 100) {
                setProblemPaneWidth(450);
              } else {
                setProblemPaneWidth(0);
              }
            }}
            title="Drag to resize, double-click to toggle"
          >
            {/* Grip dots - visible on hover */}
            <div className="flex flex-col gap-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-[2px] h-[2px] rounded-full bg-[#888]"></div>
              <div className="w-[2px] h-[2px] rounded-full bg-[#888]"></div>
              <div className="w-[2px] h-[2px] rounded-full bg-[#888]"></div>
            </div>
          </div>

          {/* Right Section: Code Editor + AI Tutor (combined) */}
          <div className="flex-1 flex flex-row bg-[#1a1a1a] rounded-lg overflow-hidden min-w-[300px] border border-[#3d3d3d]">
            {/* Code Editor Column */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Editor Tab Header - Clean minimal header */}
              <div className="h-9 bg-[#262626] border-b border-[#3d3d3d] flex items-center px-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-[#3b82f6]" />
                  <span className="text-xs font-medium text-white">Code</span>
                </div>
              </div>
          {/* Code Editor */}
          <div className="flex-1 relative min-h-0">
            <Editor
              height="100%"
              defaultLanguage="python" 
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 20 },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                overviewRulerBorder: false,
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  useShadows: false,
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
                renderLineHighlight: 'line',
                renderLineHighlightOnlyWhenFocus: true,
              }}
            />
            {/* Disconnected Overlay for Voice Mode */}
            {tutorMode === 'voice' && connectionState === ConnectionState.DISCONNECTED && (
               <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  {permissionDenied && (
                     <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl text-center max-w-sm pointer-events-auto">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-white">Microphone Denied</h3>
                        <p className="text-slate-400 text-xs mt-2">Check browser permissions to use voice.</p>
                        <button 
                          onClick={() => window.location.reload()}
                          className="mt-4 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm w-full"
                        >
                          Reload Page
                        </button>
                     </div>
                  )}
               </div>
            )}
          </div>
          
          {/* Output Panel - NeetCode Style */}
          {showOutput && (
            <div className="bg-[#1a1a1a] border-t border-[#333] flex flex-col shrink-0" style={{ height: '220px' }}>
              {/* Tab Header */}
              <div className="px-4 py-2 bg-[#262626] border-b border-[#333] flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setActiveOutputTab('testcase')}
                    className={twMerge(
                      "px-3 py-1.5 text-xs font-medium rounded-t transition-colors",
                      activeOutputTab === 'testcase' 
                        ? "text-white bg-[#1a1a1a]" 
                        : "text-[#808080] hover:text-[#b3b3b3]"
                    )}
                  >
                    Test Case
                  </button>
                  <button 
                    onClick={() => setActiveOutputTab('output')}
                    className={twMerge(
                      "px-3 py-1.5 text-xs font-medium rounded-t transition-colors",
                      activeOutputTab === 'output' 
                        ? "text-white bg-[#1a1a1a]" 
                        : "text-[#808080] hover:text-[#b3b3b3]"
                    )}
                  >
                    Output
                  </button>
                </div>
                <button 
                  onClick={() => setShowOutput(false)}
                  className="p-1 hover:bg-[#333] rounded text-[#808080] hover:text-white"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              
              {/* Content Area */}
              <div className="flex-1 overflow-y-auto">
                {activeOutputTab === 'testcase' ? (
                  /* Test Case Tab - Shows problem test cases */
                  <div className="p-4">
                    {/* Case Selector */}
                    {selectedProblem.testCases && (
                      <div className="flex items-center gap-2 mb-4">
                        {selectedProblem.testCases.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveTestCase(idx)}
                            className={twMerge(
                              "px-3 py-1 rounded text-xs font-medium transition-colors",
                              activeTestCase === idx 
                                ? "bg-[#333] text-white" 
                                : "text-[#808080] hover:text-[#b3b3b3] hover:bg-[#2a2a2a]"
                            )}
                          >
                            Case {idx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Test Case Input/Expected */}
                    {selectedProblem.testCases && selectedProblem.testCases[activeTestCase] && (
                      <div className="space-y-3 font-mono text-sm">
                        <div>
                          <div className="text-[#808080] text-xs mb-1">Input:</div>
                          <div className="bg-[#262626] rounded p-3 text-[#e6e6e6]">
                            {Object.entries(selectedProblem.testCases[activeTestCase].input).map(([key, val]) => (
                              <div key={key}>{key}={JSON.stringify(val)}</div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#808080] text-xs mb-1">Expected Output:</div>
                          <div className="bg-[#262626] rounded p-3 text-[#e6e6e6]">
                            {JSON.stringify(selectedProblem.testCases[activeTestCase].expected)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Output Tab - Shows execution results */
                  <div className="p-4">
                    {isRunning ? (
                      <div className="flex items-center gap-2 text-[#808080]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running...
                      </div>
                    ) : testResults ? (
                      <>
                        {/* Status Header */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={twMerge(
                            "text-lg font-semibold",
                            testResults.passed ? "text-[#2cbb5d]" : "text-[#ef4743]"
                          )}>
                            {testResults.passed ? 'Accepted' : 'Wrong Answer'}
                          </span>
                          <span className="text-xs text-[#808080]">
                            Passed test cases: {testResults.testCaseResults?.filter(t => t.passed).length || 0} / {testResults.testCaseResults?.length || selectedProblem.testCases?.length || 0}
                          </span>
                        </div>
                        
                        {/* Case Selector */}
                        {testResults.testCaseResults && testResults.testCaseResults.length > 0 && (
                          <div className="flex items-center gap-2 mb-4">
                            {testResults.testCaseResults.map((tc, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveTestCase(idx)}
                                className={twMerge(
                                  "px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1",
                                  activeTestCase === idx 
                                    ? "bg-[#333] text-white" 
                                    : "text-[#808080] hover:text-[#b3b3b3] hover:bg-[#2a2a2a]"
                                )}
                              >
                                {tc.passed ? (
                                  <span className="text-[#2cbb5d]">✓</span>
                                ) : (
                                  <span className="text-[#ef4743]">✗</span>
                                )}
                                Case {idx + 1}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Input / Your Output / Expected */}
                        {testResults.testCaseResults && testResults.testCaseResults[activeTestCase] && (
                          <div className="space-y-3 font-mono text-sm">
                            <div>
                              <div className="text-[#808080] text-xs mb-1">Input:</div>
                              <div className="bg-[#262626] rounded p-3 text-[#e6e6e6]">
                                {typeof testResults.testCaseResults[activeTestCase].input === 'object' 
                                  ? Object.entries(testResults.testCaseResults[activeTestCase].input).map(([key, val]) => (
                                      <div key={key}>{key}={JSON.stringify(val)}</div>
                                    ))
                                  : JSON.stringify(testResults.testCaseResults[activeTestCase].input)
                                }
                              </div>
                            </div>
                            <div>
                              <div className="text-[#808080] text-xs mb-1">Your Output:</div>
                              <div className="bg-[#262626] rounded p-3 text-[#e6e6e6]">
                                {JSON.stringify(testResults.testCaseResults[activeTestCase].actual)}
                              </div>
                            </div>
                            <div>
                              <div className="text-[#808080] text-xs mb-1">Expected:</div>
                              <div className="bg-[#262626] rounded p-3 text-[#e6e6e6]">
                                {JSON.stringify(testResults.testCaseResults[activeTestCase].expected)}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[#808080] text-sm">
                        Run your code to see output
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Action Bar */}
          <div className="h-8 bg-[#1a1a1a] border-t border-[#333] flex items-center justify-between px-3 shrink-0">
             <div className="flex items-center gap-2">
               {testResults && (
                 <button
                   onClick={() => setShowOutput(!showOutput)}
                   className={twMerge(
                     "flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors",
                     showOutput ? "bg-[#333] text-white" : "text-[#808080] hover:text-white hover:bg-[#2a2a2a]"
                   )}
                 >
                   <Terminal className="w-3 h-3" />
                   Console
                   {showOutput ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                 </button>
               )}
             </div>
             <div className="flex items-center gap-2">
               <button
                 onClick={async () => {
                   setIsRunning(true);
                   setShowOutput(true);
                   setActiveOutputTab('output'); // Switch to output tab when running
                   setTestResults(null);
                   
                   // Save code and increment attempts when user clicks Run
                   if (user) {
                     saveCode(code);
                     incrementAttempts();
                   }
                   
                   try {
                     const res = await runUserCodeAsync(code, selectedProblem);
                     setTestResults({ passed: res.passed, results: res.results, testCaseResults: res.testCaseResults });
                     
                     // Mark as solved if all tests pass
                     if (res.passed && user) {
                       markSolved();
                       addSolved(selectedProblem.id); // Update sidebar checkmark immediately
                     }
                   } catch (e) {
                     setTestResults({ passed: false, results: 'Error running code' });
                   } finally {
                     setIsRunning(false);
                   }
                 }}
                 disabled={isRunning}
                 className="flex items-center gap-1.5 px-3 py-1 bg-[#2cbb5d] hover:bg-[#26a352] text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
               >
                 {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run
               </button>
               {tutorMode === 'text' && (
                 <button
                   onClick={() => setIsTutorPanelOpen(!isTutorPanelOpen)}
                   className="p-2 rounded hover:bg-[#333] text-[#808080] hover:text-white transition-colors"
                   title={isTutorPanelOpen ? "Hide AI Tutor" : "Show AI Tutor"}
                 >
                   {isTutorPanelOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
                 </button>
               )}
             </div>
          </div>
            </div>

            {/* AI Tutor Panel - Inside right section, separated by border */}
            {tutorMode === 'text' && isTutorPanelOpen && (
              <div className="w-72 shrink-0 border-l border-[#3d3d3d] overflow-hidden">
                <TextTutorPanel
                  aiFeedback={aiFeedback}
                  hints={textHints}
                  isWatching={isWatching}
                  realtimeEnabled={realtimeEnabled}
                  isAnalyzing={isGettingHint}
                  hintIndex={textHintIndex}
                  maxHints={5}
                  onToggleRealtime={() => setRealtimeEnabled(!realtimeEnabled)}
                  onGetHint={handleGetTextHint}
                  messages={messages}
                  isVoiceMode={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
