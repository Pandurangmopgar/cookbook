import React, { useState } from 'react';
import { Problem } from '@/types';
import { ChevronDown, ChevronRight, Tag, Clock, Database } from 'lucide-react';
import { GradientDescentViz, LinearRegressionViz, NeuralNetworkViz, AttentionViz } from './Visualizations';
import SolutionReveal from './SolutionReveal';

interface ProblemPaneProps {
  problem: Problem;
  onAuthRequired?: () => void;
}

const ProblemPane: React.FC<ProblemPaneProps> = ({ problem, onAuthRequired }) => {
  const [showComplexity, setShowComplexity] = useState(true);

  const renderVisualization = () => {
    switch(problem.visualization) {
      case 'gradient-descent': return <GradientDescentViz />;
      case 'linear-regression': return <LinearRegressionViz />;
      case 'neural-network': return <NeuralNetworkViz />;
      case 'attention': return <AttentionViz />;
      default: return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#282828] text-slate-300 font-sans custom-scrollbar">
      {/* Header Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-white tracking-tight">{problem.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
            problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {problem.difficulty}
          </span>
          
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <Tag className="w-3 h-3" />
            <span>Topics</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Description */}
        <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-slate-200">
          <p className="whitespace-pre-wrap">{problem.description}</p>
        </div>

        {/* Visualization Area */}
        {problem.visualization && (
          <div className="my-6">
            {renderVisualization()}
          </div>
        )}

        {/* Examples */}
        <div className="space-y-6">
          {problem.examples.map((ex, i) => (
             <div key={i} className="space-y-3">
               <h3 className="text-white font-semibold text-sm">Example {i + 1}:</h3>
               <div className="bg-[#1e1e1e] border-l-[3px] border-slate-500 pl-4 py-3 pr-4 rounded-r-lg space-y-2 font-mono text-sm">
                  <div className="flex gap-2">
                    <span className="text-slate-500 font-semibold select-none">Input:</span> 
                    <span className="text-slate-200">{ex.input}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-500 font-semibold select-none">Output:</span> 
                    <span className="text-slate-200">{ex.output}</span>
                  </div>
                  {ex.explanation && (
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-slate-500 font-semibold select-none">Explanation:</span> 
                        <span className="text-slate-400 font-sans italic">{ex.explanation}</span>
                      </div>
                  )}
               </div>
             </div>
          ))}
        </div>

        {/* Constraints */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Constraints:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-300 ml-1">
              {problem.constraints.map((c, i) => (
                <li key={i} className="pl-1">
                  <code className="bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-200 font-mono text-xs border border-slate-700/50">{c}</code>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Complexity Section */}
        {(problem.timeComplexity || problem.spaceComplexity) && (
           <div className="border-t border-slate-800 pt-4 mt-6">
              <button 
                onClick={() => setShowComplexity(!showComplexity)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider mb-3"
              >
                 Recommended Complexity
                 {showComplexity ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
              
              {showComplexity && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {problem.timeComplexity && (
                     <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex items-center gap-3">
                        <div className="p-1.5 bg-blue-500/10 rounded text-blue-400">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold">Time Complexity</div>
                          <div className="font-mono text-sm text-blue-200">{problem.timeComplexity}</div>
                        </div>
                     </div>
                   )}
                   {problem.spaceComplexity && (
                     <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex items-center gap-3">
                        <div className="p-1.5 bg-purple-500/10 rounded text-purple-400">
                          <Database className="w-4 h-4" />
                        </div>
                         <div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold">Space Complexity</div>
                          <div className="font-mono text-sm text-purple-200">{problem.spaceComplexity}</div>
                        </div>
                     </div>
                   )}
                </div>
              )}
           </div>
        )}

        {/* Solution Reveal Section */}
        <div className="border-t border-slate-800 pt-6 mt-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Solution
          </h3>
          <SolutionReveal 
            problem={problem} 
            onAuthRequired={onAuthRequired || (() => {})} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProblemPane;