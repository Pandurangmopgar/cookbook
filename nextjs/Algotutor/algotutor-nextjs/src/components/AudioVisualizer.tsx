import React, { useEffect, useState } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  isSpeaking: boolean; // Is the model speaking?
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive, isSpeaking }) => {
  const [bars, setBars] = useState<number[]>([10, 15, 20, 15, 10]);

  useEffect(() => {
    if (!isActive) {
      setBars([10, 10, 10, 10, 10]);
      return;
    }

    const interval = setInterval(() => {
      // Create a random visualization pattern
      setBars(prev => prev.map(() => {
        const base = isSpeaking ? 30 : 15;
        const variance = isSpeaking ? 40 : 10;
        return Math.max(10, Math.random() * variance + base);
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, isSpeaking]);

  return (
    <div className="flex items-center gap-1 h-12 justify-center">
      {bars.map((height, i) => (
        <div
          key={i}
          className={`w-2 rounded-full transition-all duration-100 ${
            isActive ? (isSpeaking ? 'bg-blue-400' : 'bg-emerald-400') : 'bg-slate-600'
          }`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;