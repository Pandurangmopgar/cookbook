'use client';

import { useState, useRef } from 'react';
import { Code, Loader2, History, Search, Upload, Github, FileCode, Database, Brain, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface Review {
  id: string;
  feedback: string;
  sections: ReviewSection[];
  overallStatus: 'good' | 'needs_improvement' | 'critical';
  timestamp: string;
  fileName?: string;
}

interface ReviewSection {
  title: string;
  content: string;
  type: 'positive' | 'issue' | 'suggestion' | 'info';
}

interface MemoryActivity {
  action: string;
  description: string;
  timestamp: string;
}

const LANG_MAP: Record<string, string> = {
  js: 'javascript', ts: 'typescript', py: 'python', java: 'java',
  go: 'go', rs: 'rust', jsx: 'javascript', tsx: 'typescript'
};

// Render markdown content with proper formatting
function renderMarkdownContent(content: string) {
  // Split content into parts (code blocks vs regular text)
  const parts = content.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    // Handle code blocks
    if (part.startsWith('```')) {
      const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
      if (match) {
        const lang = match[1] || '';
        const code = match[2].trim();
        return (
          <pre key={index} className="bg-gray-900 rounded p-3 my-2 overflow-x-auto border border-gray-700">
            {lang && <div className="text-xs text-gray-500 mb-1">{lang}</div>}
            <code className="text-xs text-gray-300 font-mono">{code}</code>
          </pre>
        );
      }
    }
    
    // Handle inline formatting
    return (
      <span key={index} className="whitespace-pre-wrap">
        {part.split('\n').map((line, lineIndex) => {
          // Handle bullet points
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <div key={lineIndex} className="flex gap-2 my-1">
                <span className="text-gray-500">•</span>
                <span>{formatInlineMarkdown(line.replace(/^[\s]*[-*]\s/, ''))}</span>
              </div>
            );
          }
          // Handle numbered lists
          const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
          if (numberedMatch) {
            return (
              <div key={lineIndex} className="flex gap-2 my-1">
                <span className="text-gray-500 min-w-[1.5rem]">{numberedMatch[1]}.</span>
                <span>{formatInlineMarkdown(numberedMatch[2])}</span>
              </div>
            );
          }
          // Regular line
          return <div key={lineIndex}>{formatInlineMarkdown(line) || '\u00A0'}</div>;
        })}
      </span>
    );
  });
}

// Format inline markdown (bold, italic, code)
function formatInlineMarkdown(text: string) {
  // Handle inline code
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-gray-800 px-1 rounded text-blue-300 text-xs">{part.slice(1, -1)}</code>;
    }
    // Handle bold
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bp, j) => {
      if (bp.startsWith('**') && bp.endsWith('**')) {
        return <strong key={`${i}-${j}`} className="text-gray-200">{bp.slice(2, -2)}</strong>;
      }
      return bp;
    });
  });
}

// Parse AI response into structured sections
function parseReviewResponse(text: string): { sections: ReviewSection[], status: 'good' | 'needs_improvement' | 'critical' } {
  const sections: ReviewSection[] = [];
  let status: 'good' | 'needs_improvement' | 'critical' = 'good';
  
  // Detect overall status
  const lowerText = text.toLowerCase();
  if (lowerText.includes('critical') || lowerText.includes('security vulnerability') || lowerText.includes('major issue')) {
    status = 'critical';
  } else if (lowerText.includes('needs_improvement') || lowerText.includes('needs improvement') || lowerText.includes('should be')) {
    status = 'needs_improvement';
  }

  // Split by markdown headers or numbered sections
  const lines = text.split('\n');
  let currentSection: ReviewSection | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    // Check for headers (## or **)
    const headerMatch = line.match(/^(?:#{1,3}|\*\*)\s*(.+?)(?:\*\*)?$/);
    const numberedMatch = line.match(/^(\d+)\.\s*\*\*(.+?)\*\*/);
    
    if (headerMatch || numberedMatch) {
      // Save previous section
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim();
        if (currentSection.content) sections.push(currentSection);
      }
      
      const title = (headerMatch?.[1] || numberedMatch?.[2] || '').replace(/\*\*/g, '').trim();
      let type: ReviewSection['type'] = 'info';
      
      if (title.toLowerCase().includes('security') || title.toLowerCase().includes('issue') || title.toLowerCase().includes('error')) {
        type = 'issue';
      } else if (title.toLowerCase().includes('suggestion') || title.toLowerCase().includes('consider') || title.toLowerCase().includes('improvement')) {
        type = 'suggestion';
      } else if (title.toLowerCase().includes('positive') || title.toLowerCase().includes('good') || title.toLowerCase().includes('strength')) {
        type = 'positive';
      }
      
      currentSection = { title, content: '', type };
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    } else {
      // Content before first header
      if (line.trim()) {
        if (!currentSection) {
          currentSection = { title: 'Overview', content: '', type: 'info' };
        }
        currentContent.push(line);
      }
    }
  }
  
  // Save last section
  if (currentSection) {
    currentSection.content = currentContent.join('\n').trim();
    if (currentSection.content) sections.push(currentSection);
  }
  
  // If no sections parsed, create one from full text
  if (sections.length === 0) {
    sections.push({ title: 'Review', content: text, type: 'info' });
  }
  
  return { sections, status };
}

export default function Home() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [fileName, setFileName] = useState('');
  const [developerId, setDeveloperId] = useState('dev-user');
  const [githubUrl, setGithubUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [reviewHistory, setReviewHistory] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [inputMode, setInputMode] = useState<'paste' | 'upload' | 'github'>('paste');
  const [memoryActivities, setMemoryActivities] = useState<MemoryActivity[]>([]);
  const [showMemoryPanel, setShowMemoryPanel] = useState(true);
  const [contextUsed, setContextUsed] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return LANG_MAP[ext] || 'javascript';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target?.result as string);
      setFileName(file.name);
      setLanguage(detectLanguage(file.name));
    };
    reader.readAsText(file);
  };

  const handleGithubFetch = async () => {
    if (!githubUrl.trim()) return;
    setIsFetching(true);
    try {
      const res = await fetch(`/api/github?url=${encodeURIComponent(githubUrl)}`);
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      setCode(data.content);
      setFileName(data.fileName);
      setLanguage(detectLanguage(data.fileName));
    } catch { alert('Failed to fetch from GitHub'); }
    finally { setIsFetching(false); }
  };

  const handleCodeReview = async () => {
    if (!code.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setCurrentReview(null);
    setMemoryActivities([]);
    setContextUsed(null);

    // Show memory search activity
    setMemoryActivities(prev => [...prev, {
      action: 'search',
      description: `Searching past reviews for ${developerId}...`,
      timestamp: new Date().toLocaleTimeString()
    }]);

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, developerId, fileName }),
      });
      const data = await res.json();
      
      // Debug logging
      console.log('🔍 DEBUG: API Response received');
      console.log('🔍 DEBUG: Context used:', data.contextUsed);
      console.log('🔍 DEBUG: Debug info:', data.debug);
      
      // Parse the response
      const { sections, status } = parseReviewResponse(data.review.feedback);
      
      const review: Review = {
        ...data.review,
        sections,
        overallStatus: status,
        fileName
      };
      
      setCurrentReview(review);
      setReviewHistory(prev => [review, ...prev].slice(0, 10));
      
      // Show context used
      if (data.contextUsed) {
        setContextUsed(data.contextUsed);
        console.log('✅ DEBUG: Context was retrieved from MemoryStack');
        setMemoryActivities(prev => [...prev, {
          action: 'context',
          description: `Retrieved ${data.debug?.search?.resultsCount || 0} past reviews for personalization`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        console.log('ℹ️ DEBUG: No context retrieved (first review for this user?)');
        setMemoryActivities(prev => [...prev, {
          action: 'context',
          description: 'No previous reviews found for this developer',
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
      
      // Show memory store activity
      const storeSuccess = data.debug?.store?.memoryIds?.length > 0;
      console.log('💾 DEBUG: Memory store result:', storeSuccess ? 'SUCCESS' : 'FAILED', data.debug?.store);
      setMemoryActivities(prev => [...prev, {
        action: 'store',
        description: storeSuccess 
          ? `✅ Stored review (ID: ${data.debug?.store?.memoryIds?.[0]?.substring(0, 8)}...)` 
          : '⚠️ Review not stored (check API key)',
        timestamp: new Date().toLocaleTimeString()
      }]);
      
    } catch (error) {
      console.error('Review failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&developerId=${developerId}`);
    const data = await res.json();
    setSearchResults(data.results || []);
  };

  const getSectionStyle = (type: ReviewSection['type']) => {
    switch (type) {
      case 'positive': return 'border-l-emerald-500 bg-emerald-500/5';
      case 'issue': return 'border-l-amber-500 bg-amber-500/5';
      case 'suggestion': return 'border-l-blue-500 bg-blue-500/5';
      default: return 'border-l-gray-500 bg-gray-500/5';
    }
  };

  const getStatusBadge = (status: Review['overallStatus']) => {
    switch (status) {
      case 'good': return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">Good</span>;
      case 'needs_improvement': return <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">Needs Improvement</span>;
      case 'critical': return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">Critical Issues</span>;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Sidebar */}
      <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-semibold text-white">Code Reviewer</h1>
          </div>
          <input
            type="text"
            value={developerId}
            onChange={(e) => setDeveloperId(e.target.value)}
            placeholder="Developer ID"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-500"
          />
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search past reviews..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-500"
            />
            <button onClick={handleSearch} className="px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 text-gray-300">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MemoryStack Panel */}
        <div className="border-b border-gray-800">
          <button 
            onClick={() => setShowMemoryPanel(!showMemoryPanel)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-800/50"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">MemoryStack</span>
            </div>
            {showMemoryPanel ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </button>
          
          {showMemoryPanel && (
            <div className="px-4 pb-4 space-y-2">
              {memoryActivities.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Run a review to see memory activity</p>
              ) : (
                memoryActivities.map((activity, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    {activity.action === 'search' && <Search className="w-3 h-3 text-blue-400 mt-0.5" />}
                    {activity.action === 'context' && <Brain className="w-3 h-3 text-purple-400 mt-0.5" />}
                    {activity.action === 'store' && <Zap className="w-3 h-3 text-emerald-400 mt-0.5" />}
                    <div>
                      <p className="text-gray-400">{activity.description}</p>
                      <p className="text-gray-600">{activity.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
              
              {contextUsed && (
                <div className="mt-2 p-2 bg-purple-500/10 rounded border border-purple-500/20">
                  <p className="text-xs text-purple-300 font-medium mb-1">Context Retrieved:</p>
                  <p className="text-xs text-gray-400 line-clamp-3">{contextUsed}</p>
                </div>
              )}
              
              {/* Debug Panel */}
              <div className="mt-2 p-2 bg-gray-800/50 rounded border border-gray-700">
                <p className="text-xs text-gray-500 font-medium mb-1">Debug Info (check console for full logs)</p>
                <p className="text-xs text-gray-600">Open browser DevTools → Console to see memory operations</p>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase mb-3 flex items-center gap-1">
            <History className="w-3 h-3" /> Recent
          </h4>
          {searchResults.length > 0 ? (
            searchResults.map((r, i) => (
              <div key={i} className="p-2 bg-gray-800/50 rounded mb-2 text-xs border border-gray-800">
                <div className="text-blue-400 mb-1">Match: {(r.similarity * 100).toFixed(0)}%</div>
                <p className="text-gray-400 line-clamp-2">{r.content}</p>
              </div>
            ))
          ) : (
            reviewHistory.map((review) => (
              <div key={review.id} className="p-2 bg-gray-800/50 rounded mb-2 text-xs border border-gray-800">
                {review.fileName && <div className="text-gray-500 mb-1">{review.fileName}</div>}
                <div className="mb-1">{getStatusBadge(review.overallStatus)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <h2 className="text-lg font-medium text-white">Code Review</h2>
          <p className="text-sm text-gray-500">AI-powered analysis with personalized feedback via MemoryStack</p>
        </div>

        <div className="p-6 bg-gray-900/50 border-b border-gray-800">
          {/* Input Mode Tabs */}
          <div className="flex gap-2 mb-4">
            {(['paste', 'upload', 'github'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setInputMode(mode)}
                className={`px-4 py-2 rounded text-sm flex items-center gap-2 transition-colors ${
                  inputMode === mode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                {mode === 'paste' && <FileCode className="w-4 h-4" />}
                {mode === 'upload' && <Upload className="w-4 h-4" />}
                {mode === 'github' && <Github className="w-4 h-4" />}
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {inputMode === 'github' && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/user/repo/blob/main/src/file.ts"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200"
              />
              <button onClick={handleGithubFetch} disabled={isFetching} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 text-gray-300">
                {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch'}
              </button>
            </div>
          )}

          {inputMode === 'upload' && (
            <div className="mb-4">
              <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" accept=".js,.ts,.jsx,.tsx,.py,.java,.go,.rs" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-6 border border-dashed border-gray-700 rounded-lg hover:border-gray-600 hover:bg-gray-800/30 transition-colors flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-gray-500" />
                <span className="text-gray-500 text-sm">Click to upload</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 mb-3">
            {fileName && <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">{fileName}</span>}
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300">
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
            <button onClick={handleCodeReview} disabled={isAnalyzing || !code.trim()} className="px-5 py-2 bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm flex items-center gap-2">
              {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : 'Review Code'}
            </button>
          </div>
          
          <textarea
            value={code}
            onChange={(e) => { setCode(e.target.value); setFileName(''); }}
            placeholder="Paste your code here..."
            className="w-full h-48 px-4 py-3 bg-gray-950 border border-gray-800 rounded font-mono text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-gray-700"
          />
        </div>

        {/* Review Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentReview ? (
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-medium text-white">Review Results</h3>
                {getStatusBadge(currentReview.overallStatus)}
                {currentReview.fileName && <span className="text-sm text-gray-500">{currentReview.fileName}</span>}
              </div>
              
              <div className="space-y-4">
                {currentReview.sections.map((section, i) => (
                  <div key={i} className={`p-4 rounded-lg border-l-4 ${getSectionStyle(section.type)}`}>
                    <h4 className="font-medium text-gray-200 mb-2">{section.title}</h4>
                    <div className="text-sm text-gray-400 leading-relaxed prose prose-invert prose-sm max-w-none">
                      {renderMarkdownContent(section.content)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !isAnalyzing ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Code className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-500 mb-1">Ready to Review</h3>
                <p className="text-gray-600 text-sm">Upload a file, paste code, or fetch from GitHub</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-blue-500 mx-auto mb-3 animate-spin" />
                <p className="text-gray-500">Analyzing code...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
