'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Play, Lightbulb, CheckCircle, XCircle,
  Clock, Brain, Loader2, Sparkles, Eye, EyeOff,
  PanelRightClose, PanelRightOpen
} from 'lucide-react';
import { Problem } from '@/types';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
}

interface Hint {
  type: string;
  content: string;
  followUp?: string;
}

interface AIFeedback {
  feedback: string;
  type: string;
  approach: string | null;
  progress_percent: number;
  next_hint?: string;
}

function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return 'user_temp';
  const stored = localStorage.getItem('ai_tutor_user_id');
  if (stored) return stored;
  const newId = `user_${Math.random().toString(36).slice(2, 9)}`;
  localStorage.setItem('ai_tutor_user_id', newId);
  return newId;
}

interface AICodingTutorProps {
  problem: Problem;
}

export default function AICodingTutor({ problem }: AICodingTutorProps) {
  const [code, setCode] = useState(problem.starterCode);
  const [userId, setUserId] = useState('user_temp');
  
  useEffect(() => { setUserId(getOrCreateUserId()); }, []);
  useEffect(() => { setCode(problem.starterCode); setTestResults([]); setHints([]); setHintIndex(0); setAiFeedback(null); setPreviousCode(''); setStartTime(Date.now()); setElapsed(0); }, [problem]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [error, setError] = useState('');
  const [hints, setHints] = useState<Hint[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [previousCode, setPreviousCode] = useState<string>('');
  const [isWatching, setIsWatching] = useState(false);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => { setElapsed(Math.floor((Date.now() - startTime) / 1000)); }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (!realtimeEnabled) { setIsWatching(false); return; }
    if (!code || code === previousCode) return;
    setIsWatching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/realtime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problemId: problem.id, code, previousCode, userId }),
        });
        const data = await res.json();
        if (data.feedback) setAiFeedback(data);
        setPreviousCode(code);
      } catch {} finally { setIsWatching(false); }
    }, 2000);
    return () => { clearTimeout(timer); setIsWatching(false); };
  }, [code, problem, userId, realtimeEnabled, previousCode]);

  const runCode = async () => {
    setIsRunning(true); setError('');
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: problem.id, code, userId, timeSpent: elapsed, hintsUsed: hints.length }),
      });
      const result = await res.json();
      if (result.error) setError(result.error);
      else setTestResults(result.testResults || []);
    } catch { setError('Failed to execute code'); }
    finally { setIsRunning(false); }
  };

  const getHint = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: problem.id, code, userId, hintIndex, previousHints: hints.map(h => h.content) }),
      });
      const data = await res.json();
      if (data.hint) { setHints(prev => [...prev, data.hint]); setHintIndex(prev => prev + 1); }
    } catch {} finally { setIsAnalyzing(false); }
  };

  const analyzeCode = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: problem.id, code, userId, previousHints: hints.map(h => h.content) }),
      });
      const data = await res.json();
      if (data.hint) setHints(prev => [...prev, data.hint]);
    } catch {} finally { setIsAnalyzing(false); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="h-full flex overflow-hidden bg-gray-900">
      {/* Center - Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatTime(elapsed)}</span>
            <span className="flex items-center gap-1"><Lightbulb className="w-4 h-4" />{hints.length} hints</span>
          </div>
          <div className="flex gap-2">
            <button onClick={analyzeCode} disabled={isAnalyzing} className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm disabled:opacity-50">
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Analyze
            </button>
            <button onClick={runCode} disabled={isRunning} className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm disabled:opacity-50">
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run
            </button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm">
              {sidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <Editor height="100%" defaultLanguage="python" theme="vs-dark" value={code} onChange={(v) => setCode(v || '')} options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 16 }, scrollBeyondLastLine: false }} />
        </div>
        <div className="h-40 bg-gray-900 border-t border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Output</h3>
          {error && <div className="text-red-400 text-sm font-mono whitespace-pre-wrap">{error}</div>}
          {testResults.length > 0 && (
            <div className="space-y-2">
              {testResults.map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {t.passed ? <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-500 mt-0.5" />}
                  <div>
                    <span className={t.passed ? 'text-green-400' : 'text-red-400'}>Test {i + 1}: {t.passed ? 'Passed' : 'Failed'}</span>
                    {!t.passed && <div className="text-gray-500 text-xs mt-1">Expected: {t.expected} | Got: {t.actual}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right - AI Tutor */}
      {sidebarOpen && (
        <div className="w-[320px] bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <h2 className="font-semibold">AI Tutor</h2>
              <button onClick={() => setRealtimeEnabled(!realtimeEnabled)} className={`ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${realtimeEnabled ? 'bg-green-600' : 'bg-gray-600'}`}>
                {realtimeEnabled ? <><Eye className="w-3 h-3" />{isWatching ? <><Loader2 className="w-3 h-3 animate-spin" />Analyzing</> : 'Watching'}</> : <><EyeOff className="w-3 h-3" />Paused</>}
              </button>
            </div>
            {aiFeedback && aiFeedback.progress_percent > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Progress</span><span>{aiFeedback.progress_percent}%</span></div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all" style={{ width: `${aiFeedback.progress_percent}%` }} /></div>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {aiFeedback?.feedback && (
              <div className={`rounded-lg p-4 ${aiFeedback.type === 'warning' ? 'bg-yellow-900/30 border border-yellow-700' : aiFeedback.type === 'progress' ? 'bg-green-900/30 border border-green-700' : 'bg-gray-700'}`}>
                <span className={`text-xs px-2 py-0.5 rounded ${aiFeedback.type === 'warning' ? 'bg-yellow-600' : aiFeedback.type === 'progress' ? 'bg-green-600' : 'bg-gray-600'}`}>{aiFeedback.type}</span>
                <p className="text-sm text-gray-200 mt-2">{aiFeedback.feedback}</p>
                {aiFeedback.next_hint && <p className="text-sm text-purple-400 mt-3 italic border-t border-gray-600 pt-3">💭 {aiFeedback.next_hint}</p>}
              </div>
            )}
            {aiFeedback?.approach && <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3"><p className="text-xs text-blue-400 mb-1">Your Approach</p><p className="text-sm text-blue-200">{aiFeedback.approach}</p></div>}
            {hints.length > 0 && <div className="space-y-2"><p className="text-xs text-gray-500 uppercase">Hints Used</p>{hints.map((h, i) => <div key={i} className="bg-gray-700 rounded-lg p-3"><p className="text-sm text-gray-200">{h.content}</p></div>)}</div>}
            {!aiFeedback && hints.length === 0 && <div className="text-center text-gray-500 py-8"><Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">Start coding!</p><p className="text-xs mt-1">I'll analyze your code as you type</p></div>}
          </div>
          <div className="p-4 border-t border-gray-700">
            <button onClick={getHint} disabled={isAnalyzing} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50">
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />} Get Hint ({hintIndex}/{problem.hints?.length || 3})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
