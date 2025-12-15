import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const MEMORYSTACK_API = process.env.MEMORYSTACK_API_KEY 
  ? 'https://memorystack.app/api/v1' 
  : null;

const REVIEW_PROMPT = `You are an expert code reviewer. Analyze this code and provide structured feedback.

Developer's coding history and patterns:
{context}

Language: {language}
Code:
\`\`\`
{code}
\`\`\`

Provide your review in this format:

## Overall Assessment
State if the code is GOOD, NEEDS_IMPROVEMENT, or has CRITICAL issues.

## Security Issues
List any security vulnerabilities or risks. If none, say "No security issues found."

## Performance
Identify any performance concerns or optimizations. If none, say "Performance looks good."

## Code Quality
Comment on readability, maintainability, and structure.

## Suggestions
Provide specific, actionable improvements.

## Positive Patterns
Note any good practices you observed.

Be specific with line references where possible. Keep feedback constructive and educational.`;

type Severity = 'info' | 'warning' | 'error' | 'suggestion';

function extractSeverity(feedback: string): Severity {
  const lower = feedback.toLowerCase();
  if (lower.includes('critical') || lower.includes('security vulnerability') || lower.includes('major issue')) return 'error';
  if (lower.includes('needs_improvement') || lower.includes('warning') || lower.includes('should be')) return 'warning';
  if (lower.includes('suggestion') || lower.includes('consider')) return 'suggestion';
  return 'info';
}

async function getContext(developerId: string, language: string): Promise<{ context: string; raw: string | null; debug: any }> {
  console.log('\n🔍 DEBUG: getContext called');
  console.log('🔍 DEBUG: developerId=', developerId, 'language=', language);
  console.log('🔍 DEBUG: MEMORYSTACK_API=', MEMORYSTACK_API);
  console.log('🔍 DEBUG: API_KEY exists=', !!process.env.MEMORYSTACK_API_KEY);
  
  if (!MEMORYSTACK_API || !process.env.MEMORYSTACK_API_KEY) {
    console.log('🔍 DEBUG: No API configured, skipping memory search');
    return { context: 'No previous reviews found for this developer.', raw: null, debug: { skipped: true } };
  }
  
  try {
    // Use GET with query params for search
    const searchParams = new URLSearchParams({
      query: `${language} code review patterns issues`,
      user_id: developerId,
      limit: '3',
      mode: 'hybrid'
    });
    console.log('🔍 DEBUG: Search URL:', `${MEMORYSTACK_API}/memories/search?${searchParams}`);
    
    const res = await fetch(`${MEMORYSTACK_API}/memories/search?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.MEMORYSTACK_API_KEY}`,
        'X-API-Key': process.env.MEMORYSTACK_API_KEY!,
      },
    });
    
    const text = await res.text();
    console.log('🔍 DEBUG: Search response status:', res.status);
    console.log('🔍 DEBUG: Search response text:', text.substring(0, 200));
    
    const data = text ? JSON.parse(text) : { results: [] };
    console.log('🔍 DEBUG: Search results count:', data.results?.length || 0);
    
    if (!data.results?.length) {
      console.log('🔍 DEBUG: No results found');
      return { context: 'No previous reviews found for this developer.', raw: null, debug: { resultsCount: 0 } };
    }
    
    console.log('🔍 DEBUG: Found', data.results.length, 'memories');
    
    const memories = data.results.map((m: any, i: number) => {
      const content = m.content?.substring(0, 300) || '';
      console.log(`🔍 DEBUG: Memory ${i + 1}:`, content.substring(0, 50) + '...');
      return `${i + 1}. ${content}`;
    });
    
    return { 
      context: `Previous reviews and patterns:\n${memories.join('\n')}`,
      raw: memories.join(' | '),
      debug: { resultsCount: data.results.length, mode: data.mode }
    };
  } catch (e) { 
    console.error('❌ DEBUG: Failed to get context:', e);
    return { context: 'No previous reviews found.', raw: null, debug: { error: String(e) } }; 
  }
}

async function storeReview(developerId: string, feedback: string, language: string, severity: Severity, fileName?: string): Promise<{ success: boolean; debug: any }> {
  console.log('\n💾 DEBUG: storeReview called');
  console.log('💾 DEBUG: developerId=', developerId, 'language=', language, 'severity=', severity);
  
  if (!MEMORYSTACK_API || !process.env.MEMORYSTACK_API_KEY) {
    console.log('💾 DEBUG: No API configured, skipping memory store');
    return { success: false, debug: { skipped: true } };
  }
  
  try {
    // Extract key points from feedback for storage
    const summary = feedback
      .replace(/\*\*/g, '')
      .replace(/##/g, '')
      .substring(0, 800);
    
    // API expects messages array format
    const storePayload = {
      messages: [
        { role: 'user', content: `Code review request for ${fileName || 'code snippet'} (${language})` },
        { role: 'assistant', content: summary }
      ],
      user_id: developerId,
      metadata: { 
        language, 
        severity, 
        type: 'code_review',
        fileName: fileName || 'snippet',
        reviewedAt: new Date().toISOString(),
        agent_id: 'ai-code-reviewer'
      },
    };
    console.log('💾 DEBUG: Store payload (truncated):', JSON.stringify({ 
      ...storePayload, 
      messages: storePayload.messages.map(m => ({ ...m, content: m.content.substring(0, 50) + '...' }))
    }));
    
    const res = await fetch(`${MEMORYSTACK_API}/memories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MEMORYSTACK_API_KEY}`,
        'X-API-Key': process.env.MEMORYSTACK_API_KEY!,
      },
      body: JSON.stringify(storePayload),
    });
    
    const data = await res.json();
    console.log('💾 DEBUG: Store response status:', res.status);
    console.log('💾 DEBUG: Store response:', JSON.stringify(data));
    
    if (data.success) {
      console.log('✅ DEBUG: Memory stored successfully! IDs:', data.memory_ids);
    } else {
      console.log('❌ DEBUG: Memory store failed:', data.error);
    }
    
    return { success: data.success, debug: { status: res.status, memoryIds: data.memory_ids } };
  } catch (e) { 
    console.error('❌ DEBUG: Failed to store review:', e);
    return { success: false, debug: { error: String(e) } };
  }
}

export async function POST(request: NextRequest) {
  console.log('\n🤖 ========== CODE REVIEW REQUEST ==========');
  
  try {
    const { code, language, developerId, fileName } = await request.json();
    console.log('🤖 DEBUG: developerId=', developerId, 'language=', language, 'fileName=', fileName);
    console.log('🤖 DEBUG: code length=', code?.length || 0);
    
    if (!code || !language || !developerId) {
      console.log('❌ DEBUG: Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get context from MemoryStack
    console.log('\n📥 DEBUG: Fetching context from MemoryStack...');
    const { context, raw: contextUsed, debug: searchDebug } = await getContext(developerId, language);
    console.log('📥 DEBUG: Context retrieved, length=', context.length);

    // Build prompt with context
    const prompt = REVIEW_PROMPT
      .replace('{context}', context)
      .replace('{language}', language)
      .replace('{code}', code.substring(0, 10000)); // Limit code size

    // Generate review
    console.log('\n🧠 DEBUG: Generating AI review...');
    const result = await model.generateContent(prompt);
    const feedback = result.response.text();
    const severity = extractSeverity(feedback);
    console.log('🧠 DEBUG: Review generated, length=', feedback.length, 'severity=', severity);

    const review = {
      id: Date.now().toString(),
      feedback,
      severity,
      timestamp: new Date().toLocaleString(),
    };

    // Store review in MemoryStack for future context
    console.log('\n📤 DEBUG: Storing review in MemoryStack...');
    const storeResult = await storeReview(developerId, feedback, language, severity, fileName);

    console.log('\n✅ DEBUG: Request complete');
    console.log('🤖 ========== END REQUEST ==========\n');

    return NextResponse.json({ 
      review,
      contextUsed, // Return what context was used so UI can show it
      debug: {
        search: searchDebug,
        store: storeResult.debug,
        contextLength: context.length,
        feedbackLength: feedback.length
      }
    });
  } catch (error) {
    console.error('❌ DEBUG: Review error:', error);
    return NextResponse.json({ error: 'Failed to review code' }, { status: 500 });
  }
}
