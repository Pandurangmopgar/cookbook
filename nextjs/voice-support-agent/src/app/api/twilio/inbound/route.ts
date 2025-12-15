/**
 * Twilio webhook for inbound calls
 * Configure this URL in your Twilio phone number settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateConversationTwiML, normalizePhoneNumber } from '@/lib/twilio';
import { addCall } from '@/lib/call-store';
import { buildCustomerContext } from '@/lib/memory';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  
  const callSid = formData.get('CallSid') as string;
  const from = formData.get('From') as string;
  const to = formData.get('To') as string;
  
  console.log(`📞 Inbound call from ${from} to ${to} (SID: ${callSid})`);

  // Use phone number as customer ID (normalize it)
  const customerId = normalizePhoneNumber(from);
  
  // Track the call
  addCall({
    callSid,
    customerId,
    customerPhone: from,
    direction: 'inbound',
    status: 'in-progress',
    startTime: new Date(),
    transcript: [],
  });

  // Get customer context to personalize greeting
  const context = await buildCustomerContext(customerId);
  const isReturning = !context.includes('new customer');
  
  // Personalized greeting
  const greeting = isReturning 
    ? "Welcome back to TechCorp support! I'm your AI assistant. How can I help you today?"
    : "Hello and welcome to TechCorp support! I'm your AI assistant. How can I help you today?";

  // Get the conversation URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const gatherUrl = `${appUrl}/api/twilio/conversation`;

  // Return TwiML to start conversation with speech recognition
  const twiml = generateConversationTwiML(gatherUrl, greeting, customerId);

  return new NextResponse(twiml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
