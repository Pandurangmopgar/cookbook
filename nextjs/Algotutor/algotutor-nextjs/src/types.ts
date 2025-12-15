import { Type } from '@google/genai';

export type VisualizationType = 'gradient-descent' | 'linear-regression' | 'neural-network' | 'attention';

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'easy' | 'medium' | 'hard';
  description: string;
  category?: string;
  functionName?: string; 
  visualization?: VisualizationType;
  hints?: string[];
  concepts?: string[];
  commonMistakes?: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints?: string[];
  timeComplexity?: string;
  spaceComplexity?: string;
  starterCode: string;
  testCases: Array<{
    input: any[];
    expected: any;
  }>;
  // Solution reveal fields
  solution?: string;
  solutionExplanation?: string;
}

export interface Category {
  id: string;
  name: string;
  problems: Problem[];
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

// Tool definitions for Gemini
export const TOOLS = [
  {
    name: 'getCurrentCode',
    description: 'Read the code currently written by the user in the editor. Use this whenever the user asks for feedback, says they are stuck, or asks if their code is correct.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'runTests',
    description: 'Execute the user\'s code against the defined test cases and return the results. Use this when the user asks to run their code or verify their solution.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'getLearningContext',
    description: 'Fetch the student\'s learning history from MemoryStack. Use this to understand their past struggles, successes, and learning patterns to personalize your tutoring.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Optional specific query to search for in learning history (e.g., "loops", "recursion", "hash maps")',
        },
      },
    },
  },
  {
    name: 'storeLearningInsight',
    description: 'Save an important observation about the student\'s learning to MemoryStack. Use this when you notice patterns, breakthroughs, or areas that need improvement.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        insight: {
          type: Type.STRING,
          description: 'The learning insight to store (e.g., "Student struggles with off-by-one errors in loops")',
        },
        category: {
          type: Type.STRING,
          description: 'Category of the insight (e.g., "loops", "recursion", "data structures")',
        },
      },
      required: ['insight'],
    },
  },
];