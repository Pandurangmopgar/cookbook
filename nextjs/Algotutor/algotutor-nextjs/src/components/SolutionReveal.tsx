'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Eye, EyeOff, Lock, Loader2, AlertTriangle, CheckCircle, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Problem } from '@/types';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface SolutionRevealProps {
  problem: Problem;
  onAuthRequired: () => void;
}

export default function SolutionReveal({ problem, onAuthRequired }: SolutionRevealProps) {
  const { user } = useAuth();
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alreadyRevealed, setAlreadyRevealed] = useState(false);

  // Check if user has already revealed this solution
  useEffect(() => {
    if (user && problem.id) {
      checkPreviousReveal();
    } else {
      setRevealed(false);
      setAlreadyRevealed(false);
    }
  }, [user, problem.id]);

  const checkPreviousReveal = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_progress')
      .select('solution_revealed')
      .eq('clerk_user_id', user.id)
      .eq('problem_id', problem.id)
      .single();

    if (data?.solution_revealed) {
      setAlreadyRevealed(true);
      setRevealed(true);
    }
  };

  const handleRevealClick = () => {
    if (!user) {
      onAuthRequired();
      return;
    }
    
    if (alreadyRevealed) {
      setRevealed(!revealed);
      return;
    }
    
    setShowConfirm(true);
  };

  const confirmReveal = async () => {
    if (!user) return;
    
    setLoading(true);
    
    // Record the reveal in database
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        clerk_user_id: user.id,
        problem_id: problem.id,
        solution_revealed: true,
        revealed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'clerk_user_id,problem_id'
      });

    if (!error) {
      setRevealed(true);
      setAlreadyRevealed(true);
    }
    
    setLoading(false);
    setShowConfirm(false);
  };

  const copyToClipboard = async () => {
    if (problem.solution) {
      await navigator.clipboard.writeText(problem.solution);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If no solution available
  if (!problem.solution) {
    return (
      <div className="p-4 bg-[#262626] rounded-lg border border-[#333]">
        <div className="flex items-center gap-2 text-[#808080]">
          <Lock className="w-4 h-4" />
          <span className="text-sm">Solution not available for this problem</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Reveal Solution?</h3>
            </div>
            <p className="text-[#b3b3b3] text-sm mb-2">
              Are you sure you want to see the solution? This action will be recorded.
            </p>
            <p className="text-[#808080] text-xs mb-6">
              💡 Tip: Try solving it yourself first! You'll learn more by struggling through the problem.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#b3b3b3] hover:text-white hover:bg-[#333] transition-colors"
              >
                Keep Trying
              </button>
              <button
                onClick={confirmReveal}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Show Solution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reveal Button */}
      <button
        onClick={handleRevealClick}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
          revealed
            ? 'bg-[#333] text-white hover:bg-[#404040]'
            : user
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white'
              : 'bg-[#333] text-[#808080] hover:bg-[#404040] hover:text-white'
        }`}
      >
        {!user ? (
          <>
            <Lock className="w-4 h-4" />
            Sign in to View Solution
          </>
        ) : revealed ? (
          <>
            <EyeOff className="w-4 h-4" />
            Hide Solution
          </>
        ) : alreadyRevealed ? (
          <>
            <Eye className="w-4 h-4" />
            Show Solution (Previously Viewed)
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" />
            Reveal Solution
          </>
        )}
      </button>

      {/* Solution Content */}
      {revealed && (
        <div className="bg-[#1e1e1e] border border-[#3d3d3d] rounded-lg overflow-hidden animate-in slide-in-from-top-2 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#2a2a2a] border-b border-[#3d3d3d]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">Optimal Solution</span>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-[#808080] hover:text-white hover:bg-[#333] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Code with Monaco Editor for syntax highlighting */}
          <div className="overflow-hidden" style={{ height: `${Math.min(problem.solution.split('\n').length * 20 + 40, 300)}px` }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={problem.solution}
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

          {/* Explanation */}
          {problem.solutionExplanation && (
            <div className="px-4 py-3 bg-[#2a2a2a] border-t border-[#3d3d3d]">
              <h4 className="text-xs font-semibold text-[#808080] uppercase tracking-wider mb-2">
                Explanation
              </h4>
              <p className="text-sm text-[#b3b3b3] leading-relaxed">
                {problem.solutionExplanation}
              </p>
            </div>
          )}

          {/* Complexity */}
          {(problem.timeComplexity || problem.spaceComplexity) && (
            <div className="px-4 py-3 border-t border-[#3d3d3d] flex gap-6">
              {problem.timeComplexity && (
                <div className="bg-[#2a2a2a] px-3 py-1.5 rounded border border-[#3d3d3d]">
                  <span className="text-xs text-[#808080]">Time: </span>
                  <span className="text-xs font-mono text-emerald-400">{problem.timeComplexity}</span>
                </div>
              )}
              {problem.spaceComplexity && (
                <div className="bg-[#2a2a2a] px-3 py-1.5 rounded border border-[#3d3d3d]">
                  <span className="text-xs text-[#808080]">Space: </span>
                  <span className="text-xs font-mono text-blue-400">{problem.spaceComplexity}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
