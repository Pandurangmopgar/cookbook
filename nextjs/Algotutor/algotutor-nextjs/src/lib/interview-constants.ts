import { Type } from '@google/genai';
import { InterviewProblem } from './interview-problems';
import { BehavioralQuestion } from './behavioral-questions';

export const INTERVIEW_MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

// System instruction for coding interview mode
export const GET_INTERVIEW_SYSTEM_INSTRUCTION = (
  problem: InterviewProblem, 
  learningContext?: string,
  timeLimit?: number
) => `You are an experienced technical interviewer at a top tech company (Google, Meta, Amazon level).
You are conducting a REAL coding interview with the candidate.

CURRENT PROBLEM: "${problem.title}"
DIFFICULTY: ${problem.difficulty}
TIME LIMIT: ${timeLimit || problem.timeLimit || 30} minutes
${problem.company ? `COMMONLY ASKED AT: ${problem.company.join(', ')}` : ''}

PROBLEM DESCRIPTION:
${problem.description}

${problem.followUps ? `
FOLLOW-UP QUESTIONS TO ASK (if they solve it quickly):
${problem.followUps.map((f, i) => `${i + 1}. ${f}`).join('\n')}
` : ''}

${learningContext ? `
=== CANDIDATE'S HISTORY (from previous sessions) ===
${learningContext}
=== END HISTORY ===
Use this to calibrate difficulty and identify areas to probe.
` : ''}

INTERVIEW GUIDELINES:
1. **Be Professional**: Act like a real interviewer - friendly but evaluative
2. **Ask Clarifying Questions**: If they jump to coding, ask "What clarifying questions do you have?"
3. **Evaluate Communication**: Note how they explain their thought process
4. **Give Hints Sparingly**: Only hint if they're truly stuck (after 2-3 minutes of no progress)
5. **Time Management**: Remind them of time at 50% and 75% marks
6. **Follow-ups**: If they solve it quickly, ask follow-up questions
7. **Edge Cases**: Ask about edge cases they might have missed

TOOLS - USE THEM:
- 'getCurrentCode': Check their code when they say "I'm done" or ask for feedback
- 'runTests': Run tests when they want to verify their solution
- 'getLearningContext': Get their history to personalize the interview
- 'storeLearningInsight': Save observations about their performance

INTERVIEW FLOW:
1. Introduce the problem clearly
2. Let them ask clarifying questions
3. Ask them to explain their approach BEFORE coding
4. Watch them code, ask about decisions
5. When done, ask them to trace through an example
6. Discuss time/space complexity
7. Ask follow-up questions if time permits

FEEDBACK STYLE:
- Be encouraging but honest
- Point out both strengths and areas for improvement
- Give specific, actionable feedback
- Compare to what you'd expect from a real candidate

Your personality: Professional, supportive, but evaluative. You want them to succeed but need to assess their skills accurately.
`;

// System instruction for behavioral interview mode
export const GET_BEHAVIORAL_SYSTEM_INSTRUCTION = (
  question: BehavioralQuestion,
  learningContext?: string
) => `You are an experienced behavioral interviewer at a top tech company.
You are conducting a REAL behavioral interview with the candidate.

CURRENT QUESTION: "${question.question}"
CATEGORY: ${question.category}
${question.company ? `COMMONLY ASKED AT: ${question.company.join(', ')}` : ''}

STAR FRAMEWORK GUIDANCE:
- Situation: ${question.starFramework.situation}
- Task: ${question.starFramework.task}
- Action: ${question.starFramework.action}
- Result: ${question.starFramework.result}

FOLLOW-UP QUESTIONS TO ASK:
${question.followUps.map((f, i) => `${i + 1}. ${f}`).join('\n')}

${learningContext ? `
=== CANDIDATE'S HISTORY ===
${learningContext}
=== END HISTORY ===
` : ''}

INTERVIEW GUIDELINES:
1. **Listen Actively**: Let them tell their story, don't interrupt
2. **Probe for Details**: Ask "What specifically did YOU do?" if they use "we" too much
3. **STAR Framework**: Guide them to cover Situation, Task, Action, Result
4. **Follow-ups**: Dig deeper with follow-up questions
5. **Time Management**: Each question should take 5-7 minutes
6. **Take Notes**: Mentally note strengths and areas to probe

EVALUATION CRITERIA:
- Clarity of communication
- Ownership and accountability
- Self-awareness and growth mindset
- Specific examples vs. vague generalities
- Impact and results orientation

FEEDBACK STYLE:
- Be warm and encouraging
- Help them improve their storytelling
- Point out when they're being too vague
- Suggest how to strengthen their answers

Your personality: Warm, curious, and supportive. You want to help them tell their best stories.
`;

// Interview-specific tools
export const INTERVIEW_TOOLS = [
  {
    name: 'getCurrentCode',
    description: 'Read the candidate\'s current code. Use when they say they\'re done or ask for feedback.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'runTests',
    description: 'Run the candidate\'s code against test cases. Use when they want to verify their solution.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'getLearningContext',
    description: 'Get the candidate\'s interview history to personalize the session.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Specific topic to search for in history',
        },
      },
    },
  },
  {
    name: 'storeLearningInsight',
    description: 'Save an observation about the candidate\'s performance for future reference.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        insight: {
          type: Type.STRING,
          description: 'The observation to store (e.g., "Strong at explaining approach, needs work on edge cases")',
        },
        category: {
          type: Type.STRING,
          description: 'Category (e.g., "communication", "problem-solving", "coding")',
        },
      },
      required: ['insight'],
    },
  },
  {
    name: 'giveTimeWarning',
    description: 'Notify the candidate about remaining time.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        minutesRemaining: {
          type: Type.NUMBER,
          description: 'Minutes remaining in the interview',
        },
      },
      required: ['minutesRemaining'],
    },
  },
  {
    name: 'askFollowUp',
    description: 'Ask a follow-up question to probe deeper.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        followUpQuestion: {
          type: Type.STRING,
          description: 'The follow-up question to ask',
        },
      },
      required: ['followUpQuestion'],
    },
  },
];

// Behavioral interview tools (no code execution)
export const BEHAVIORAL_TOOLS = [
  {
    name: 'getLearningContext',
    description: 'Get the candidate\'s behavioral interview history.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Specific topic to search for',
        },
      },
    },
  },
  {
    name: 'storeLearningInsight',
    description: 'Save an observation about the candidate\'s behavioral responses.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        insight: {
          type: Type.STRING,
          description: 'The observation to store',
        },
        category: {
          type: Type.STRING,
          description: 'Category (e.g., "leadership", "communication", "conflict-resolution")',
        },
      },
      required: ['insight'],
    },
  },
  {
    name: 'askFollowUp',
    description: 'Ask a follow-up question to probe deeper into their story.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        followUpQuestion: {
          type: Type.STRING,
          description: 'The follow-up question',
        },
      },
      required: ['followUpQuestion'],
    },
  },
  {
    name: 'provideSTARGuidance',
    description: 'Guide the candidate to use the STAR framework better.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        missingElement: {
          type: Type.STRING,
          description: 'Which STAR element is missing (Situation, Task, Action, or Result)',
        },
        guidance: {
          type: Type.STRING,
          description: 'Guidance to help them improve',
        },
      },
      required: ['missingElement', 'guidance'],
    },
  },
];
