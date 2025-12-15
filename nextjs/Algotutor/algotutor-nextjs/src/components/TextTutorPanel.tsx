import React, { useRef, useEffect } from 'react';
import { Brain, Lightbulb, Loader2, Eye, EyeOff, Sparkles, MessageSquare } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { AIFeedback } from '@/services/textTutor';

interface TextHint {
  hint: string;
  type: string;
}

interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
}

interface TextTutorPanelProps {
  aiFeedback: AIFeedback | null;
  hints: TextHint[];
  isWatching: boolean;
  realtimeEnabled: boolean;
  isAnalyzing: boolean;
  hintIndex: number;
  maxHints: number;
  onToggleRealtime: () => void;
  onGetHint: () => void;
  // Voice mode props
  messages?: ChatMessage[];
  isVoiceMode?: boolean;
}

export default function TextTutorPanel({
  aiFeedback,
  hints,
  isWatching,
  realtimeEnabled,
  isAnalyzing,
  hintIndex,
  maxHints,
  onToggleRealtime,
  onGetHint,
  messages = [],
  isVoiceMode = false,
}: TextTutorPanelProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          <h2 className="font-semibold text-white">AI Tutor</h2>
          
          {/* Real-time Toggle */}
          <button
            onClick={onToggleRealtime}
            className={twMerge(
              "ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors",
              realtimeEnabled 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-slate-600 hover:bg-slate-500"
            )}
            title={realtimeEnabled ? 'Click to disable real-time feedback' : 'Click to enable real-time feedback'}
          >
            {realtimeEnabled ? (
              <>
                <Eye className="w-3 h-3" />
                {isWatching ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Analyzing</span>
                  </>
                ) : (
                  <span>Watching</span>
                )}
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" />
                <span>Paused</span>
              </>
            )}
          </button>
        </div>
        
        {/* Progress Bar */}
        {aiFeedback && aiFeedback.progress_percent > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Progress</span>
              <span>{aiFeedback.progress_percent}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all duration-500"
                style={{ width: `${aiFeedback.progress_percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Live Transcript for Voice Mode */}
        {isVoiceMode && messages.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              <MessageSquare className="w-3 h-3" /> Live Transcript
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-950 rounded-lg p-3">
              {messages.map((msg, i) => (
                <div key={i} className={twMerge(
                  "flex flex-col",
                  msg.role === 'user' ? "items-end" : "items-start",
                  msg.role === 'system' ? "items-center" : ""
                )}>
                  {msg.role !== 'system' && (
                    <span className="text-[10px] text-slate-500 mb-0.5 font-mono uppercase">
                      {msg.role === 'user' ? 'You' : 'Algo'}
                    </span>
                  )}
                  <div className={twMerge(
                    "px-2 py-1.5 rounded text-xs max-w-[95%]",
                    msg.role === 'user' ? "bg-blue-600 text-white" : 
                    msg.role === 'model' ? "bg-slate-800 text-slate-200 border border-slate-700" :
                    "bg-transparent text-slate-500 italic text-center"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* AI Live Feedback */}
        {aiFeedback && aiFeedback.feedback && (
          <div className={twMerge(
            "rounded-lg p-4",
            aiFeedback.type === 'warning' 
              ? "bg-yellow-900/30 border border-yellow-700" 
              : aiFeedback.type === 'progress'
              ? "bg-green-900/30 border border-green-700"
              : aiFeedback.type === 'question'
              ? "bg-purple-900/30 border border-purple-700"
              : "bg-slate-700"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <span className={twMerge(
                "text-xs px-2 py-0.5 rounded",
                aiFeedback.type === 'warning' ? "bg-yellow-600" :
                aiFeedback.type === 'progress' ? "bg-green-600" :
                aiFeedback.type === 'question' ? "bg-purple-600" :
                "bg-slate-600"
              )}>
                {aiFeedback.type}
              </span>
            </div>
            <p className="text-sm text-slate-200">{aiFeedback.feedback}</p>
            
            {aiFeedback.next_hint && (
              <p className="text-sm text-purple-400 mt-3 italic border-t border-slate-600 pt-3">
                💭 {aiFeedback.next_hint}
              </p>
            )}
          </div>
        )}

        {/* Detected Approach */}
        {aiFeedback?.approach && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
            <p className="text-xs text-blue-400 mb-1">Your Approach</p>
            <p className="text-sm text-blue-200">{aiFeedback.approach}</p>
          </div>
        )}

        {/* Manual Hints */}
        {hints.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 uppercase">Hints Used</p>
            {hints.map((hint, i) => (
              <div key={i} className="bg-slate-700 rounded-lg p-3">
                <span className={twMerge(
                  "text-xs px-2 py-0.5 rounded mb-2 inline-block",
                  hint.type === 'question' ? "bg-purple-600" :
                  hint.type === 'concept' ? "bg-blue-600" :
                  hint.type === 'direction' ? "bg-orange-600" :
                  "bg-slate-600"
                )}>
                  {hint.type}
                </span>
                <p className="text-sm text-slate-200 mt-1">{hint.hint}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!aiFeedback && hints.length === 0 && (
          <div className="text-center text-slate-500 py-8">
            {realtimeEnabled ? (
              <>
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Start coding!</p>
                <p className="text-xs mt-1">I'll analyze your code and give feedback as you type</p>
              </>
            ) : (
              <>
                <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Solo mode enabled</p>
                <p className="text-xs mt-1">Real-time feedback is paused</p>
                <p className="text-xs mt-2 text-purple-400">You can still use "Get Hint" button!</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onGetHint}
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 transition-colors"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lightbulb className="w-4 h-4" />
          )}
          Get Hint ({hintIndex}/{maxHints})
        </button>
        
        <p className="text-xs text-slate-500 text-center mt-2">
          Hints are progressive - start with gentle nudges
        </p>
      </div>
    </div>
  );
}
