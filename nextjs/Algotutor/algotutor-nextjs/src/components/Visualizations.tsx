import React, { useEffect, useState } from 'react';
import { ArrowRight, Activity, Brain } from 'lucide-react';

// --- 1. Gradient Descent Visualization ---
export const GradientDescentViz: React.FC = () => {
  const [step, setStep] = useState(0);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % 60);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Parabola: y = 0.005 * (x - 150)^2 + 40
  // Ball moves from x=20 towards x=150 (minimum)
  const progress = step < 40 ? step / 40 : 1; 
  const x = 30 + (120 * (1 - Math.pow(1 - progress, 3))); // Easing
  const y = 0.005 * Math.pow(x - 150, 2) + 40;

  return (
    <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800 flex flex-col items-center shadow-inner">
      <div className="flex items-center gap-2 text-xs text-blue-400 mb-4 font-mono uppercase tracking-wider">
        <Activity className="w-4 h-4" /> Optimization Visualizer
      </div>
      <div className="relative w-full max-w-[300px] aspect-[3/2]">
        <svg width="100%" height="100%" viewBox="0 0 300 200" className="overflow-visible">
          {/* Axis */}
          <line x1="20" y1="180" x2="280" y2="180" stroke="#475569" strokeWidth="2" />
          <line x1="20" y1="20" x2="20" y2="180" stroke="#475569" strokeWidth="2" />
          
          {/* Loss Curve */}
          <path d="M 20 124 Q 150 250 280 124" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
          
          {/* Minimum Point Marker */}
          <circle cx="150" cy="124.5" r="3" fill="#94a3b8" />
          
          {/* The Learning Ball */}
          <circle cx={x} cy={124.5 - (124.5 - y)} r="8" fill="#ef4444" stroke="white" strokeWidth="2" className="drop-shadow-lg" />
          
          {/* Projection Lines */}
          <line x1={x} y1={124.5 - (124.5 - y)} x2={x} y2="180" stroke="#ef4444" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
          <line x1={x} y1={124.5 - (124.5 - y)} x2="20" y2={124.5 - (124.5 - y)} stroke="#ef4444" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
          
          {/* Labels */}
          <text x="150" y="195" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">Weights (Parameters)</text>
          <text x="10" y="100" fill="#94a3b8" fontSize="10" transform="rotate(-90 10,100)" textAnchor="middle" fontFamily="monospace">Loss (Error)</text>
        </svg>
      </div>
      <div className="text-xs text-slate-400 mt-4 text-center max-w-[280px]">
        The ball (model) rolls down the error surface to find the lowest point (best accuracy). The slope tells us which direction to step.
      </div>
    </div>
  );
};

// --- 2. Linear Regression Visualization ---
export const LinearRegressionViz: React.FC = () => {
  const [iter, setIter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIter((i) => (i + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Data points
  const points = [
    {x: 50, y: 150}, {x: 100, y: 110}, {x: 150, y: 100}, {x: 200, y: 70}, {x: 250, y: 40}
  ];

  // Animated Line: Starting horizontal, rotating to fit
  // y = mx + b
  const progress = iter < 50 ? iter / 50 : 1;
  const startY1 = 100; const startY2 = 100;
  const endY1 = 160; const endY2 = 30;
  
  const y1 = startY1 + (endY1 - startY1) * progress;
  const y2 = startY2 + (endY2 - startY2) * progress;

  return (
    <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800 flex flex-col items-center">
       <div className="flex items-center gap-2 text-xs text-emerald-400 mb-4 font-mono uppercase tracking-wider">
        <Activity className="w-4 h-4" /> Model Fitting
      </div>
      <svg width="300" height="200" viewBox="0 0 300 200">
        <rect width="300" height="200" fill="#0f172a" rx="8" />
        <line x1="30" y1="180" x2="280" y2="180" stroke="#334155" strokeWidth="2" />
        <line x1="30" y1="20" x2="30" y2="180" stroke="#334155" strokeWidth="2" />
        
        {/* Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#cbd5e1" opacity="0.8" />
        ))}
        
        {/* Residuals (Error bars) */}
        {points.map((p, i) => {
           // Interpolate line Y at this X
           const lineY = y1 + ((p.x - 30) / 250) * (y2 - y1);
           return (
             <line key={`res-${i}`} x1={p.x} y1={p.y} x2={p.x} y2={lineY} stroke="#ef4444" strokeWidth="1" strokeDasharray="2" opacity={0.6} />
           );
        })}

        {/* The Line */}
        <line x1="30" y1={y1} x2="280" y2={y2} stroke="#10b981" strokeWidth="3" />
        
      </svg>
      <div className="text-xs text-slate-400 mt-4 text-center max-w-[280px]">
        The green line adjusts its <strong>slope</strong> and <strong>intercept</strong> to minimize the red distances (residuals) to the data points.
      </div>
    </div>
  );
};

// --- 3. Neural Network Visualization ---
export const NeuralNetworkViz: React.FC = () => {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 40);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const layers = [3, 4, 2]; // Nodes per layer
  const layerX = [50, 150, 250];

  return (
    <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800 flex flex-col items-center">
       <div className="flex items-center gap-2 text-xs text-purple-400 mb-4 font-mono uppercase tracking-wider">
        <Brain className="w-4 h-4" /> Neural Architecture
      </div>
      <svg width="300" height="180" viewBox="0 0 300 180">
        {/* Connections */}
        {layers.slice(0, -1).map((nodes, i) => (
            Array.from({length: nodes}).map((_, n1) => (
               Array.from({length: layers[i+1]}).map((_, n2) => {
                   const x1 = layerX[i];
                   const y1 = 90 - (nodes * 20) + (n1 * 40);
                   const x2 = layerX[i+1];
                   const y2 = 90 - (layers[i+1] * 20) + (n2 * 40);
                   
                   // Pulse animation
                   const isActive = Math.floor(pulse / 10) === i;
                   
                   return (
                     <g key={`${i}-${n1}-${n2}`}>
                       <line 
                         x1={x1} y1={y1} x2={x2} y2={y2} 
                         stroke={isActive ? "#a855f7" : "#334155"} 
                         strokeWidth={isActive ? 2 : 1}
                         opacity={isActive ? 1 : 0.3}
                       />
                       {isActive && (
                         <circle r="3" fill="#fff">
                           <animateMotion 
                             dur="0.5s" 
                             repeatCount="1"
                             path={`M${x1},${y1} L${x2},${y2}`}
                           />
                         </circle>
                       )}
                     </g>
                   )
               })
            ))
        ))}

        {/* Nodes */}
        {layers.map((nodes, i) => (
          Array.from({length: nodes}).map((_, n) => (
             <circle 
               key={`node-${i}-${n}`}
               cx={layerX[i]} 
               cy={90 - (nodes * 20) + (n * 40)} 
               r="10" 
               fill="#1e293b" 
               stroke={i === 0 ? "#60a5fa" : i === 1 ? "#a855f7" : "#34d399"}
               strokeWidth="2"
             />
          ))
        ))}
        
        {/* Labels */}
        <text x="50" y="170" textAnchor="middle" fill="#64748b" fontSize="10">Input</text>
        <text x="150" y="170" textAnchor="middle" fill="#64748b" fontSize="10">Hidden</text>
        <text x="250" y="170" textAnchor="middle" fill="#64748b" fontSize="10">Output</text>
      </svg>
      <div className="text-xs text-slate-400 mt-4 text-center max-w-[280px]">
        Data flows from left to right. Each connection has a <strong>weight</strong> that strengthens or weakens the signal.
      </div>
    </div>
  );
};

// --- 4. Attention Visualization ---
export const AttentionViz: React.FC = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  
  const words = ["The", "cat", "sat", "on", "mat"];
  const matrix = [
     [0.1, 0.0, 0.0, 0.0, 0.0],
     [0.8, 0.2, 0.1, 0.0, 0.0], // cat attends heavily to "The"
     [0.1, 0.9, 0.2, 0.0, 0.0], // sat attends to "cat"
     [0.0, 0.0, 0.9, 0.1, 0.0], // on attends to "sat"
     [0.0, 0.0, 0.0, 0.9, 0.1], // mat attends to "on"
  ];

  return (
    <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-800 flex flex-col items-center">
       <div className="flex items-center gap-2 text-xs text-amber-400 mb-4 font-mono uppercase tracking-wider">
        <ArrowRight className="w-4 h-4" /> Self-Attention Mechanism
      </div>
      
      <div className="grid grid-cols-6 gap-1">
         {/* Header Row */}
         <div className="w-10 h-10"></div>
         {words.map((w, i) => (
            <div key={i} className="w-10 h-10 flex items-center justify-center text-[10px] text-slate-400 -rotate-45 transform origin-bottom-left">
              {w}
            </div>
         ))}
         
         {/* Rows */}
         {words.map((rowWord, i) => (
           <React.Fragment key={i}>
             <div className="w-10 h-10 flex items-center justify-end pr-2 text-[10px] text-slate-400 font-bold">
               {rowWord}
             </div>
             {words.map((_, j) => {
               const val = matrix[i][j] || 0.1; // fallback
               return (
                 <div 
                   key={`${i}-${j}`}
                   className="w-10 h-10 border border-slate-800 transition-all duration-300"
                   style={{ 
                     backgroundColor: `rgba(251, 191, 36, ${val})`, // Amber
                     transform: hovered === i && j < i ? 'scale(1.1)' : 'scale(1)'
                   }}
                   onMouseEnter={() => setHovered(i)}
                   onMouseLeave={() => setHovered(null)}
                   title={`Weight: ${val}`}
                 />
               );
             })}
           </React.Fragment>
         ))}
      </div>

      <div className="text-xs text-slate-400 mt-6 text-center max-w-[280px]">
        The brightness shows how much the word on the left <strong>"pays attention"</strong> to the word on the top. Context is built by looking at related words.
      </div>
    </div>
  )
}