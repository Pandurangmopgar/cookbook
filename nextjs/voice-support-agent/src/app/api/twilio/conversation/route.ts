/**
 * Twilio conversation handler using speech recognition
 * This approach is more reliable than raw audio streaming
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateContinueTwiML } from '@/lib/twilio';
import { searchMemories, storeMemory, buildCustomerContext } from '@/lib/memory';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Store conversation history per customer
const conversationHistory = new Map<string, Array<{ role: string; content: string }>>();

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const { searchParams } = new URL(request.url);
  
  const speechResult = formData.get('SpeechResult') as string;
  const customerId = searchParams.get('customerId') || 'unknown';
  const callSid = formData.get('CallSid') as string;
  
  console.log(`🎤 Customer (${customerId}): ${speechResult}`);

  // Get or create conversation history
  let history = conversationHistory.get(customerId) || [];
  
  // Add user message to history
  history.push({ role: 'user', content: speechResult });

  try {
    // Get customer context from MemoryStack
    const customerContext = await buildCustomerContext(customerId);
    
    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const systemPrompt = `You are a friendly customer support agent for TechCorp. 
Keep responses concise (2-3 sentences max) since this is a phone conversation.
Be helpful, warm, and professional.

CUSTOMER CONTEXT:
${customerContext}

CONVERSATION HISTORY:
${history.map(h => `${h.role}: ${h.content}`).join('\n')}

Respond naturally to the customer's latest message. Don't use markdown or special formatting.`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();
    
    console.log(`🤖 Agent: ${response}`);
    
    // Add assistant response to history
    history.push({ role: 'assistant', content: response });
    conversationHistory.set(customerId, history);
    
    // Store the interaction in MemoryStack
    await storeMemory(
      `Customer said: "${speechResult}" | Agent responded: "${response}"`,
      customerId,
      { call_sid: callSid, interaction_type: 'voice_support' }
    );

    // Generate TwiML to speak response and gather next input
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const gatherUrl = `${appUrl}/api/twilio/conversation`;
    
    const twiml = generateContinueTwiML(gatherUrl, response, customerId);

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'application/xml' },
    });
    
  } catch (error) {
    console.error('Error generating response:', error);
    
    const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">I apologize, but I'm having trouble processing your request. Let me transfer you to a human agent.</Say>
  <Hangup />
</Response>`;

    return new NextResponse(fallbackTwiml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
