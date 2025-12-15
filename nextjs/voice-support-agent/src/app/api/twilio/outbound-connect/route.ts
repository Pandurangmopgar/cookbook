/**
 * Twilio webhook when outbound call connects
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateConversationTwiML } from '@/lib/twilio';
import { updateCall } from '@/lib/call-store';
import { buildCustomerContext } from '@/lib/memory';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId') || 'unknown';
  
  const formData = await request.formData();
  const callSid = formData.get('CallSid') as string;
  const callStatus = formData.get('CallStatus') as string;

  console.log(`📞 Outbound call ${callSid} status: ${callStatus}`);

  // Update call status
  updateCall(callSid, { status: 'in-progress' });

  // Get customer context to personalize greeting
  const context = await buildCustomerContext(customerId);
  const isReturning = !context.includes('new customer');
  
  // Personalized greeting for outbound call
  const greeting = isReturning 
    ? "Hi! This is TechCorp support following up with you. How can I assist you today?"
    : "Hi! This is TechCorp support. I'm an AI assistant calling to help you. How can I assist you today?";

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
