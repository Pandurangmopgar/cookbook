import { GoogleGenerativeAI } from '@google/generative-ai';
import { Problem } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export interface CodeAnalysis {
  isStuck: boolean;
  stuckReason?: string;
  progress: 'not_started' | 'partial' | 'almost_done' | 'complete';
  issues: string[];
  positives: string[];
}

export interface TutorHint {
  type: 'encouragement' | 'question' | 'concept' | 'direction' | 'example';
  content: string;
  followUp?: string;
}

const ANALYSIS_PROMPT = `You are an expert coding tutor analyzing a student's code.
Analyze their progress on this problem and identify if they're stuck.

Problem: {problem_title}
Description: {problem_description}
Student's Code:
\`\`\`python
{code}
\`\`\`

Respond in JSON format:
{
  "isStuck": boolean,
  "stuckReason": "why they might be stuck (if applicable)",
  "progress": "not_started" | "partial" | "almost_done" | "complete",
  "issues": ["list of issues in their code"],
  "positives": ["things they're doing right"]
}`;


const HINT_PROMPT = `You are a Socratic coding tutor with MEMORY of this student's learning journey.
Your goal is to guide the student to discover the solution themselves, using what you know about them.

Problem: {problem_title}
Category: {category}
Description: {problem_description}
Common Mistakes: {common_mistakes}

Student's Current Code:
\`\`\`python
{code}
\`\`\`

Analysis: {analysis}

=== STUDENT'S LEARNING HISTORY (from MemoryStack - USE THIS!) ===
{learning_context}
=== END LEARNING HISTORY ===

Previous hints given this session: {previous_hints}

IMPORTANT - PERSONALIZE YOUR RESPONSE:
- If the student has solved similar problems before, reference that success!
- If they struggled with specific concepts, address those gently
- If they have patterns of mistakes, help them avoid repeating them
- Make them feel like you KNOW them and their learning journey

RULES:
1. NEVER give the direct answer or solution code
2. Ask leading questions that guide their thinking
3. Acknowledge what they're doing right
4. If they're close, give a small nudge
5. Reference concepts they should know
6. Keep hints concise (2-3 sentences max)
7. PERSONALIZE based on their learning history above!

Respond in JSON format:
{
  "type": "encouragement" | "question" | "concept" | "direction" | "example",
  "content": "your personalized hint here - reference their history when relevant!",
  "followUp": "optional follow-up question"
}`;

// Analyze student's code progress
export async function analyzeCode(
  problem: Problem,
  code: string
): Promise<CodeAnalysis> {
  const prompt = ANALYSIS_PROMPT
    .replace('{problem_title}', problem.title)
    .replace('{problem_description}', problem.description)
    .replace('{code}', code);

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Analysis failed:', e);
  }

  return {
    isStuck: false,
    progress: 'partial',
    issues: [],
    positives: [],
  };
}


// Generate a contextual hint
export async function generateHint(
  problem: Problem,
  code: string,
  analysis: CodeAnalysis,
  learningContext: string,
  previousHints: string[],
  categoryName?: string
): Promise<TutorHint> {
  const prompt = HINT_PROMPT
    .replace('{problem_title}', problem.title)
    .replace('{category}', categoryName || problem.difficulty)
    .replace('{problem_description}', problem.description)
    .replace('{common_mistakes}', 'Watch for edge cases and off-by-one errors')
    .replace('{code}', code)
    .replace('{analysis}', JSON.stringify(analysis))
    .replace('{learning_context}', learningContext)
    .replace('{previous_hints}', previousHints.join(' | ') || 'None');

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Hint generation failed:', e);
  }

  // Fallback hint
  return {
    type: 'encouragement',
    content: "Keep going! You're making progress. Think about the problem step by step.",
  };
}

// Check if code matches expected pattern (without running)
export function quickCodeCheck(code: string, problem: Problem): string[] {
  const issues: string[] = [];
  
  // Check for common patterns based on problem type
  if (problem.id === 'binary-search') {
    if (!code.includes('while') && !code.includes('for')) {
      issues.push('Consider using a loop to repeatedly narrow down the search range');
    }
    if (!code.includes('//') && !code.includes('mid')) {
      issues.push('You might need a variable to track the middle position');
    }
  }
  
  if (problem.id === 'two-sum') {
    if (!code.includes('{}') && !code.includes('dict')) {
      issues.push('A dictionary/hash map could help with efficient lookups');
    }
  }
  
  if (problem.id === 'valid-parentheses') {
    if (!code.includes('[') && !code.includes('stack')) {
      issues.push('Consider what data structure helps with matching pairs');
    }
  }

  return issues;
}
