/**
 * Vapi Webhook Handler
 * Real-time call updates with Redis + MemoryStack integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildCustomerContext, storeMemory, searchMemories } from '@/lib/memory';
import { 
  setActiveCall, 
  updateCallStatus, 
  appendTranscript, 
  endCall as redisEndCall,
  getActiveCall,
  LiveCall,
  TranscriptEntry 
} from '@/lib/redis';

export async function POST(request: NextRequest) {
  console.log('🔔 Vapi webhook received');
  
  try {
    const body = await request.json();
    const { message } = body;
    
    console.log('📞 Event type:', message?.type);

    switch (message?.type) {
      case 'assistant-request':
        return handleAssistantRequest(body);
      
      case 'function-call':
        return handleFunctionCall(body);
      
      case 'end-of-call-report':
        return handleEndOfCallReport(body);
      
      case 'status-update':
        return handleStatusUpdate(body);
      
      case 'transcript':
        return handleTranscript(body);
        
      case 'speech-update':
        return handleSpeechUpdate(body);
      
      case 'conversation-update':
        return handleConversationUpdate(body);
      
      case 'hang':
        return handleHang(body);
      
      default:
        console.log('📝 Unhandled event type:', message?.type);
        return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * Handle assistant-request: Inject customer context
 */
async function handleAssistantRequest(body: any) {
  const { call } = body;
  // Prefer email for customer ID (better scoping), fallback to phone
  const customerEmail = call?.metadata?.customerEmail;
  const customerId = customerEmail || call?.metadata?.customerId || call?.customer?.number;
  
  if (!customerId) {
    return NextResponse.json({});
  }

  console.log('🧠 Loading context for:', customerId, '| Email:', customerEmail);
  
  try {
    const context = await buildCustomerContext(customerId);
    
    return NextResponse.json({
      assistant: {
        model: {
          messages: [
            {
              role: 'system',
              content: `CUSTOMER CONTEXT:\n${context}\n\nUse this context to personalize responses.`
            }
          ]
        }
      }
    });
  } catch (error) {
    console.error('Error loading context:', error);
    return NextResponse.json({});
  }
}

/**
 * Handle function calls
 */
async function handleFunctionCall(body: any) {
  const { functionCall, call } = body;
  const customerId = call?.customer?.number || call?.metadata?.customerId;
  
  switch (functionCall?.name) {
    case 'searchCustomerHistory':
      const query = functionCall?.parameters?.query;
      if (query && customerId) {
        const memories = await searchMemories(query, customerId, 5);
        return NextResponse.json({
          result: memories.map(m => m.content).join('\n') || 'No history found.'
        });
      }
      return NextResponse.json({ result: 'No query provided.' });
    
    case 'saveNote':
      const note = functionCall?.parameters?.note;
      if (note && customerId) {
        await storeMemory(note, customerId, { type: 'agent_note' });
        return NextResponse.json({ result: 'Note saved.' });
      }
      return NextResponse.json({ result: 'No note provided.' });
    
    default:
      return NextResponse.json({ result: 'Unknown function.' });
  }
}

/**
 * Handle status updates - Create/update call in Redis
 */
async function handleStatusUpdate(body: any) {
  const message = body.message || body;
  const call = message.call || body.call || {};
  const status = message.status || body.status;
  
  const callId = call.id || message.callId;
  const customerPhone = call.customer?.number || 'Unknown';
  const customerId = call.customer?.number || call.metadata?.customerId || customerPhone;
  
  console.log('📊 Status update:', status, 'for call:', callId);
  
  if (!callId) {
    return NextResponse.json({ success: true });
  }
  
  if (status === 'ringing' || status === 'in-progress') {
    // Create or update active call
    const liveCall: LiveCall = {
      id: callId,
      customerId,
      customerPhone,
      direction: call.type === 'inboundPhoneCall' ? 'inbound' : 'outbound',
      status: status === 'ringing' ? 'ringing' : 'in-progress',
      startTime: new Date().toISOString(),
      assistantId: call.assistantId,
      transcript: [],
    };
    
    await setActiveCall(liveCall);
    console.log('✅ Active call created/updated:', callId);
  } else if (status === 'ended' || status === 'forwarding') {
    await updateCallStatus(callId, 'ended');
  }
  
  return NextResponse.json({ success: true });
}

/**
 * Handle real-time transcript updates
 */
async function handleTranscript(body: any) {
  const message = body.message || body;
  const call = message.call || body.call || {};
  const callId = call.id || message.callId;
  const transcript = message.transcript || body.transcript;
  
  if (!callId || !transcript) {
    return NextResponse.json({ success: true });
  }
  
  // Get the latest entry
  const latestEntry = Array.isArray(transcript) ? transcript[transcript.length - 1] : transcript;
  
  if (latestEntry) {
    const entry: TranscriptEntry = {
      role: latestEntry.role === 'assistant' ? 'assistant' : 'user',
      text: latestEntry.text || latestEntry.content || '',
      timestamp: new Date().toISOString(),
    };
    
    if (entry.text) {
      await appendTranscript(callId, entry);
      console.log(`💬 [${entry.role}]: ${entry.text.substring(0, 50)}...`);
    }
  }
  
  return NextResponse.json({ success: true });
}

/**
 * Handle speech updates (real-time partial transcripts)
 */
async function handleSpeechUpdate(body: any) {
  const message = body.message || body;
  const call = message.call || body.call || {};
  const callId = call.id || message.callId;
  
  // Speech updates contain partial transcripts
  const role = message.role || 'user';
  const status = message.status; // 'started', 'stopped'
  
  console.log(`🎤 Speech ${status} from ${role}`);
  
  return NextResponse.json({ success: true });
}

/**
 * Handle conversation updates (real-time message updates)
 */
async function handleConversationUpdate(body: any) {
  const message = body.message || body;
  const call = message.call || body.call || {};
  const callId = call.id || message.callId;
  const conversation = message.conversation || body.conversation || [];
  
  if (!callId) {
    return NextResponse.json({ success: true });
  }
  
  console.log(`💬 Conversation update for call ${callId}, ${conversation.length} messages`);
  
  // Get the latest message from conversation
  if (conversation.length > 0) {
    const latestMsg = conversation[conversation.length - 1];
    
    if (latestMsg && latestMsg.content) {
      const entry: TranscriptEntry = {
        role: latestMsg.role === 'assistant' ? 'assistant' : 'user',
        text: latestMsg.content,
        timestamp: new Date().toISOString(),
      };
      
      // Check if this is a new message (avoid duplicates)
      const existingCall = await getActiveCall(callId);
      if (existingCall) {
        const lastTranscript = existingCall.transcript[existingCall.transcript.length - 1];
        if (!lastTranscript || lastTranscript.text !== entry.text) {
          await appendTranscript(callId, entry);
          console.log(`📝 Added transcript: [${entry.role}] ${entry.text.substring(0, 50)}...`);
        }
      }
    }
  }
  
  return NextResponse.json({ success: true });
}

/**
 * Handle hang event (call ended by user or system)
 */
async function handleHang(body: any) {
  const message = body.message || body;
  const call = message.call || body.call || {};
  const callId = call.id || message.callId;
  
  console.log(`📴 Call hung up: ${callId}`);
  
  if (callId) {
    await updateCallStatus(callId, 'ended');
  }
  
  return NextResponse.json({ success: true });
}

/**
 * Handle end-of-call report
 */
async function handleEndOfCallReport(body: any) {
  const message = body.message || body;
  const call = message.call || body.call || {};
  const transcript = message.transcript || body.transcript || message.artifact?.transcript;
  const summary = message.summary || body.summary || message.analysis?.summary;
  
  // Prefer email as customer ID (better for scoping), fallback to phone
  const customerEmail = call.metadata?.customerEmail;
  const customerPhone = call.customer?.number;
  const customerId = customerEmail || call.metadata?.customerId || customerPhone || 'unknown';
  const callId = call.id || message.callId;
  const assistantId = call.assistantId || process.env.VAPI_ASSISTANT_ID;
  
  console.log('👤 Customer ID:', customerId, '| Email:', customerEmail, '| Phone:', customerPhone);
  
  console.log('📝 Call ended:', callId);
  
  let memoriesStored = 0;
  
  try {
    // Generate summary
    let summaryText = summary;
    if (!summaryText && transcript && Array.isArray(transcript)) {
      summaryText = generateSummary(transcript);
    } else if (!summaryText) {
      summaryText = 'Voice call completed';
    }
    
    // Store call summary
    await storeMemory(
      `Call summary: ${summaryText}`,
      customerId,
      {
        type: 'call_summary',
        call_id: callId,
        vapi_assistant_id: assistantId,
        timestamp: new Date().toISOString()
      }
    );
    memoriesStored++;
    
    // Extract and store key points
    if (transcript && Array.isArray(transcript)) {
      const keyPoints = extractKeyPoints(transcript);
      for (const point of keyPoints) {
        await storeMemory(point, customerId, {
          type: 'call_detail',
          call_id: callId,
          vapi_assistant_id: assistantId
        });
        memoriesStored++;
      }
    }
    
    console.log(`✅ Stored ${memoriesStored} memories for customer:`, customerId);
  } catch (error) {
    console.error('❌ Error storing memories:', error);
  }
  
  // End call in Redis
  if (callId) {
    await redisEndCall(callId, summary, memoriesStored);
  }
  
  return NextResponse.json({ success: true });
}

function generateSummary(transcript: any[]): string {
  if (!transcript || transcript.length === 0) return 'No conversation recorded.';
  
  const customerMessages = transcript
    .filter((t: any) => t.role === 'user')
    .map((t: any) => t.text)
    .join(' ');
  
  const words = customerMessages.split(' ').slice(0, 50).join(' ');
  return words.length > 0 ? `Customer discussed: ${words}...` : 'Brief call.';
}

function extractKeyPoints(transcript: any[]): string[] {
  const points: string[] = [];
  if (!transcript) return points;
  
  for (const entry of transcript) {
    if (entry.role === 'user') {
      const text = entry.text?.toLowerCase() || '';
      
      if (text.includes('problem') || text.includes('issue') || text.includes('not working')) {
        points.push(`Issue reported: ${entry.text}`);
      }
      if (text.includes('prefer') || text.includes('like') || text.includes('want')) {
        points.push(`Preference: ${entry.text}`);
      }
    }
  }
  
  return points.slice(0, 5);
}
