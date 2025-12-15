import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export interface EmailDraft {
  subject: string;
  body: string;
  callToAction: string;
}

export interface CallScript {
  opener: string;
  valueProposition: string;
  qualifyingQuestions: string[];
  objectionHandlers: Record<string, string>;
  closeAttempt: string;
}

export interface LeadScore {
  score: number;
  factors: { factor: string; impact: number; reason: string }[];
  recommendation: string;
  nextBestAction: string;
}

// Generate personalized cold email
export async function generateEmail(
  lead: { name: string; company: string; title: string },
  context: string,
  emailType: 'cold' | 'followup' | 'breakup' | 'meeting_request'
): Promise<EmailDraft> {
  const sdrName = process.env.SDR_NAME || 'Alex';
  const companyName = process.env.COMPANY_NAME || 'Acme Inc';

  const prompts: Record<string, string> = {
    cold: `Write a compelling cold outreach email that's personalized and not salesy.`,
    followup: `Write a follow-up email referencing previous interactions. Be persistent but respectful.`,
    breakup: `Write a "breakup" email - last attempt to get a response. Create urgency without being pushy.`,
    meeting_request: `Write an email requesting a meeting. Be specific about the value they'll get.`,
  };

  const prompt = `You are ${sdrName}, an SDR at ${companyName}.
${prompts[emailType]}

Lead Info:
- Name: ${lead.name}
- Company: ${lead.company}
- Title: ${lead.title}

Previous Interactions & Context:
${context}

Requirements:
- Keep it under 150 words
- Personalize based on their role and company
- Include a clear, low-friction CTA
- Sound human, not templated
- Reference any previous interactions naturally

Return JSON format:
{
  "subject": "email subject line",
  "body": "email body (use \\n for line breaks)",
  "callToAction": "the specific ask"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      subject: `Quick question, ${lead.name}`,
      body: text,
      callToAction: 'Would you be open to a quick chat?',
    };
  }
}

// Generate call script
export async function generateCallScript(
  lead: { name: string; company: string; title: string },
  context: string,
  objective: string
): Promise<CallScript> {
  const sdrName = process.env.SDR_NAME || 'Alex';
  const companyName = process.env.COMPANY_NAME || 'Acme Inc';

  const prompt = `You are ${sdrName}, an SDR at ${companyName}.
Generate a call script for reaching out to a prospect.

Lead Info:
- Name: ${lead.name}
- Company: ${lead.company}  
- Title: ${lead.title}

Previous Interactions & Context:
${context}

Call Objective: ${objective}

Return JSON format:
{
  "opener": "opening line (reference any previous contact)",
  "valueProposition": "2-3 sentence value prop tailored to their role",
  "qualifyingQuestions": ["question 1", "question 2", "question 3"],
  "objectionHandlers": {
    "no time": "response",
    "not interested": "response",
    "send info": "response",
    "already have solution": "response"
  },
  "closeAttempt": "how to ask for next step"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      opener: `Hi ${lead.name}, this is ${sdrName} from ${companyName}.`,
      valueProposition: 'We help companies like yours...',
      qualifyingQuestions: ['What are your current priorities?'],
      objectionHandlers: { 'no time': 'I understand, when would be better?' },
      closeAttempt: 'Would you be open to a 15-minute call?',
    };
  }
}

// Score a lead based on interactions
export async function scoreLeadWithAI(
  lead: { name: string; company: string; title: string; industry?: string },
  context: string,
  interactions: number
): Promise<LeadScore> {
  const prompt = `You are a sales intelligence AI. Score this lead's likelihood to convert.

Lead Info:
- Name: ${lead.name}
- Company: ${lead.company}
- Title: ${lead.title}
${lead.industry ? `- Industry: ${lead.industry}` : ''}
- Total Interactions: ${interactions}

Interaction History:
${context}

Score from 0-100 based on:
- Engagement level (responses, meetings)
- Title/decision-making authority
- Company fit
- Expressed interest or pain points
- Recency of engagement

Return JSON:
{
  "score": 75,
  "factors": [
    {"factor": "Engagement", "impact": 20, "reason": "Responded to 2 emails"},
    {"factor": "Authority", "impact": 15, "reason": "VP level decision maker"}
  ],
  "recommendation": "High priority - schedule demo",
  "nextBestAction": "Send calendar link for demo"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      score: 50,
      factors: [{ factor: 'Default', impact: 50, reason: 'Unable to analyze' }],
      recommendation: 'Continue nurturing',
      nextBestAction: 'Send follow-up email',
    };
  }
}

// Generate LinkedIn message
export async function generateLinkedInMessage(
  lead: { name: string; company: string; title: string },
  context: string,
  messageType: 'connection' | 'inmail' | 'followup'
): Promise<string> {
  const sdrName = process.env.SDR_NAME || 'Alex';

  const prompt = `Write a ${messageType} LinkedIn message.

Lead: ${lead.name}, ${lead.title} at ${lead.company}
Context: ${context}

Requirements:
- ${messageType === 'connection' ? 'Under 300 characters' : 'Under 500 characters'}
- Personal and conversational
- No sales pitch in connection request
- Reference something specific about them or their company

Return just the message text, no JSON.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// Analyze email response sentiment
export async function analyzeResponse(
  originalEmail: string,
  response: string
): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  intent: string;
  suggestedReply: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const prompt = `Analyze this email response from a prospect.

Original Email Sent:
${originalEmail}

Prospect's Response:
${response}

Return JSON:
{
  "sentiment": "positive|neutral|negative",
  "intent": "what they want (e.g., 'wants more info', 'not interested', 'wants to meet')",
  "suggestedReply": "brief suggested response",
  "priority": "high|medium|low"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      sentiment: 'neutral',
      intent: 'unclear',
      suggestedReply: 'Thank you for your response...',
      priority: 'medium',
    };
  }
}
