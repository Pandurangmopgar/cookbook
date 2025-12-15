import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CATEGORIES } from '@/constants';
import { getLearningContext } from '@/lib/memory';
import { Problem } from '@/types';

// Get problem from CATEGORIES (same source as frontend)
function getProblemById(id: string): { problem: Problem; categoryName: string } | undefined {
  for (const category of CATEGORIES) {
    const problem = category.problems.find(p => p.id === id);
    if (problem) return { problem, categoryName: category.name };
  }
  return undefined;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const REALTIME_PROMPT = `You are an expert coding tutor watching a student solve a problem in real-time.
You have access to this student's learning history from previous sessions - USE IT to personalize your feedback!

PROBLEM: {problem_title}
DESCRIPTION: {problem_description}
EXPECTED APPROACH: {hints}

STUDENT'S CURRENT CODE:
\`\`\`python
{code}
\`\`\`

PREVIOUS CODE (what they had before):
\`\`\`python
{previous_code}
\`\`\`

=== STUDENT'S LEARNING HISTORY (from MemoryStack) ===
{learning_context}
=== END LEARNING HISTORY ===

IMPORTANT: Use the learning history above to personalize your feedback! For example:
- If they struggled with loops before, watch for similar patterns
- If they solved similar problems, reference that success
- If they have preferred approaches, acknowledge them
- If they made specific mistakes before, help them avoid repeating them

Analyze what the student is doing RIGHT NOW and provide helpful, encouraging feedback.

RULES:
1. NEVER give the solution or direct code
2. Be specific about what they're doing - reference their actual code
3. If they're on the right track, encourage them
4. If they're going wrong, give a gentle nudge without spoiling
5. If they seem stuck (code hasn't changed much), offer a thinking prompt
6. Keep feedback SHORT (1-2 sentences max)
7. Use Socratic questions when possible
8. REFERENCE their learning history when relevant (e.g., "I remember you solved Two Sum well - this uses a similar pattern!")

Respond in JSON:
{
  "feedback": "your specific feedback about their current code, personalized based on their history",
  "type": "progress" | "warning" | "suggestion" | "encouragement" | "question",
  "approach": "what approach they seem to be taking (or null if unclear)",
  "progress_percent": 0-100 estimate of how close they are to a solution,
  "next_hint": "optional: a question to guide their thinking"
}`;

export async function POST(request: NextRequest) {
  try {
    const { problemId, code, previousCode, userId } = await request.json();

    if (!problemId || code === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = getProblemById(problemId);
    if (!result) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    const { problem, categoryName } = result;

    // Skip if code is just starter code
    if (code.trim() === problem.starterCode.trim()) {
      return NextResponse.json({
        feedback: "Start typing your solution! I'm watching and will help as you code.",
        type: 'encouragement',
        approach: null,
        progress_percent: 0,
      });
    }

    // Get learning context from memory
    let learningContext = 'New student, no history yet.';
    try {
      if (userId) {
        console.log(`🔍 Searching learning context for user: ${userId}, problem: ${problemId}`);
        learningContext = await getLearningContext(userId, problemId, categoryName);
        console.log(`📚 Learning context found: ${learningContext.substring(0, 100)}...`);
      }
    } catch (e) {
      console.error('Failed to get learning context:', e);
      // Continue without context
    }

    // Build prompt - use examples as hints since Problem type doesn't have hints
    const hintText = problem.examples.slice(0, 2).map(e => e.explanation || e.output).join('. ');
    const prompt = REALTIME_PROMPT
      .replace('{problem_title}', problem.title)
      .replace('{problem_description}', problem.description)
      .replace('{hints}', hintText)
      .replace('{code}', code)
      .replace('{previous_code}', previousCode || problem.starterCode)
      .replace('{learning_context}', learningContext);

    // Call Gemini
    const aiResult = await model.generateContent(prompt);
    const text = aiResult.response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        feedback: parsed.feedback || '',
        type: parsed.type || 'encouragement',
        approach: parsed.approach || null,
        progress_percent: parsed.progress_percent || 0,
        next_hint: parsed.next_hint || null,
      });
    }

    // Fallback
    return NextResponse.json({
      feedback: text.slice(0, 200),
      type: 'encouragement',
      approach: null,
      progress_percent: 0,
    });

  } catch (error: any) {
    console.error('Realtime analysis error:', error);
    return NextResponse.json({
      feedback: '',
      type: 'encouragement',
      approach: null,
      progress_percent: 0,
    });
  }
}
