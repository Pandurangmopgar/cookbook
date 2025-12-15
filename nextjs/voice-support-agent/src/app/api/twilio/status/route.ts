/**
 * Twilio status callback webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateCall, endCall, getCall } from '@/lib/call-store';
import { storeMemory } from '@/lib/memory';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  
  const callSid = formData.get('CallSid') as string;
  const callStatus = formData.get('CallStatus') as string;
  const callDuration = formData.get('CallDuration') as string;

  console.log(`📞 Call ${callSid} status update: ${callStatus}`);

  const call = getCall(callSid);

  if (callStatus === 'completed' || callStatus === 'failed' || callStatus === 'busy' || callStatus === 'no-answer') {
    // Generate call summary from transcript
    let summary = `Call ${callStatus}`;
    
    if (call && call.transcript.length > 0) {
      const transcriptText = call.transcript
        .map(t => `${t.role}: ${t.text}`)
        .join('\n');
      
      summary = `Call ${callStatus}. Duration: ${callDuration || 'unknown'}s. Topics discussed: ${
        call.transcript.slice(0, 3).map(t => t.text.slice(0, 50)).join(', ')
      }...`;

      // Store call summary in MemoryStack
      try {
        await storeMemory(
          `Voice support call on ${new Date().toLocaleDateString()}. ${summary}`,
          call.customerId,
          {
            call_sid: callSid,
            duration: callDuration,
            direction: call.direction,
            transcript_length: call.transcript.length,
          }
        );
        console.log(`✅ Stored call memory for customer ${call.customerId}`);
      } catch (error) {
        console.error('Failed to store call memory:', error);
      }
    }

    endCall(callSid, summary);
  } else {
    updateCall(callSid, { 
      status: callStatus as 'ringing' | 'in-progress' 
    });
  }

  return NextResponse.json({ received: true });
}
