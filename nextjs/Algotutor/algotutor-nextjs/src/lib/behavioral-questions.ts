// Behavioral interview questions for tech interviews

export interface BehavioralQuestion {
  id: string;
  question: string;
  category: 'leadership' | 'teamwork' | 'conflict' | 'failure' | 'success' | 'technical' | 'growth';
  company?: string[];
  tips: string[];
  starFramework: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  followUps: string[];
}

export const BEHAVIORAL_QUESTIONS: BehavioralQuestion[] = [
  {
    id: 'tell-me-about-yourself',
    question: 'Tell me about yourself.',
    category: 'growth',
    company: ['All'],
    tips: [
      'Keep it to 2-3 minutes',
      'Focus on professional journey, not personal life',
      'Highlight relevant experience for the role',
      'End with why you\'re excited about this opportunity'
    ],
    starFramework: {
      situation: 'Your background and current role',
      task: 'Key responsibilities and achievements',
      action: 'Skills and technologies you\'ve mastered',
      result: 'Why this role is the next step'
    },
    followUps: [
      'What made you choose software engineering?',
      'What are you most proud of in your career?'
    ]
  },
  {
    id: 'challenging-project',
    question: 'Tell me about a challenging project you worked on.',
    category: 'technical',
    company: ['Google', 'Meta', 'Amazon', 'Microsoft'],
    tips: [
      'Choose a technically complex project',
      'Explain the challenge clearly',
      'Focus on YOUR contributions',
      'Quantify the impact if possible'
    ],
    starFramework: {
      situation: 'What was the project and why was it challenging?',
      task: 'What was your specific role and responsibility?',
      action: 'What technical decisions did you make? How did you overcome obstacles?',
      result: 'What was the outcome? Metrics, learnings, impact?'
    },
    followUps: [
      'What would you do differently?',
      'How did you handle disagreements on technical decisions?',
      'What did you learn from this project?'
    ]
  },
  {
    id: 'conflict-with-teammate',
    question: 'Tell me about a time you had a conflict with a teammate.',
    category: 'conflict',
    company: ['Amazon', 'Meta', 'Google'],
    tips: [
      'Don\'t badmouth the other person',
      'Focus on the resolution, not the drama',
      'Show emotional intelligence',
      'Demonstrate you can work through disagreements professionally'
    ],
    starFramework: {
      situation: 'What was the context? Who was involved?',
      task: 'What was at stake? Why did it matter?',
      action: 'How did you approach the conversation? What steps did you take?',
      result: 'How was it resolved? What did you learn?'
    },
    followUps: [
      'How do you prevent conflicts from escalating?',
      'What if the other person refused to compromise?'
    ]
  },
  {
    id: 'failure-experience',
    question: 'Tell me about a time you failed.',
    category: 'failure',
    company: ['Amazon', 'Google', 'Meta', 'Microsoft'],
    tips: [
      'Choose a real failure, not a humble brag',
      'Take ownership - don\'t blame others',
      'Focus heavily on what you learned',
      'Show how you\'ve applied those learnings since'
    ],
    starFramework: {
      situation: 'What was the project/task?',
      task: 'What were you trying to achieve?',
      action: 'What went wrong? What was your role in the failure?',
      result: 'What did you learn? How have you applied it since?'
    },
    followUps: [
      'How do you handle setbacks now?',
      'What would you do differently?'
    ]
  },
  {
    id: 'leadership-example',
    question: 'Tell me about a time you demonstrated leadership.',
    category: 'leadership',
    company: ['Amazon', 'Google', 'Meta'],
    tips: [
      'Leadership doesn\'t require a title',
      'Can be technical leadership, mentoring, or initiative',
      'Show how you influenced others',
      'Highlight the positive outcome'
    ],
    starFramework: {
      situation: 'What was the context?',
      task: 'What needed to be done? Why did you step up?',
      action: 'How did you lead? What decisions did you make?',
      result: 'What was the impact on the team/project?'
    },
    followUps: [
      'How do you motivate team members?',
      'How do you handle underperformers?'
    ]
  },
  {
    id: 'tight-deadline',
    question: 'Tell me about a time you had to meet a tight deadline.',
    category: 'success',
    company: ['Amazon', 'Meta', 'Startups'],
    tips: [
      'Show prioritization skills',
      'Demonstrate you can work under pressure',
      'Mention trade-offs you made',
      'Don\'t glorify unhealthy work habits'
    ],
    starFramework: {
      situation: 'What was the deadline and why was it tight?',
      task: 'What needed to be delivered?',
      action: 'How did you prioritize? What did you cut/defer?',
      result: 'Did you meet the deadline? What was the quality?'
    },
    followUps: [
      'How do you estimate project timelines?',
      'What if you realized you couldn\'t meet the deadline?'
    ]
  },
  {
    id: 'disagree-with-manager',
    question: 'Tell me about a time you disagreed with your manager.',
    category: 'conflict',
    company: ['Amazon', 'Google', 'Meta'],
    tips: [
      'Show you can respectfully push back',
      'Focus on data and reasoning, not emotions',
      'Demonstrate you can commit even if you disagree',
      'Don\'t make your manager look bad'
    ],
    starFramework: {
      situation: 'What was the disagreement about?',
      task: 'Why did you feel strongly about your position?',
      action: 'How did you communicate your concerns?',
      result: 'What was the outcome? Did you commit and execute?'
    },
    followUps: [
      'What if your manager still disagreed after your input?',
      'How do you know when to push back vs. accept?'
    ]
  },
  {
    id: 'why-this-company',
    question: 'Why do you want to work here?',
    category: 'growth',
    company: ['All'],
    tips: [
      'Research the company thoroughly',
      'Connect your skills to their needs',
      'Show genuine enthusiasm',
      'Be specific - avoid generic answers'
    ],
    starFramework: {
      situation: 'Your career goals and interests',
      task: 'What you\'re looking for in your next role',
      action: 'How this company aligns with your goals',
      result: 'What you hope to contribute and learn'
    },
    followUps: [
      'What do you know about our products/services?',
      'Where do you see yourself in 5 years?'
    ]
  }
];

export const BEHAVIORAL_CATEGORIES = [
  { id: 'leadership', name: 'Leadership', icon: '👑' },
  { id: 'teamwork', name: 'Teamwork', icon: '🤝' },
  { id: 'conflict', name: 'Conflict Resolution', icon: '⚖️' },
  { id: 'failure', name: 'Failure & Learning', icon: '📚' },
  { id: 'success', name: 'Success Stories', icon: '🏆' },
  { id: 'technical', name: 'Technical Challenges', icon: '💻' },
  { id: 'growth', name: 'Career & Growth', icon: '🌱' }
];

export function getBehavioralQuestionById(id: string): BehavioralQuestion | undefined {
  return BEHAVIORAL_QUESTIONS.find(q => q.id === id);
}

export function getBehavioralQuestionsByCategory(category: string): BehavioralQuestion[] {
  return BEHAVIORAL_QUESTIONS.filter(q => q.category === category);
}
