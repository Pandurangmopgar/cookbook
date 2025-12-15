/**
 * Vapi Call API
 * Start outbound calls and manage calls via Vapi
 */

import { NextRequest, NextResponse } from 'next/server';
import { startOutboundCall, getOrCreateSupportAssistant, listCalls, endCall } from '@/lib/vapi';
import { startCallTracking } from '@/lib/call-store';

/**
 * POST /api/vapi/call - Start an outbound call
 */
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, customerName, customerEmail, ticketId, ticketSubject } = await request.json();
    
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedNumber = normalizePhoneNumber(phoneNumber);
    
    // Use email as customerId for MemoryStack scoping, fallback to phone
    const customerId = customerEmail || normalizedNumber;
    
    console.log('📞 Starting outbound call to:', normalizedNumber);
    console.log('👤 Customer:', customerName, '|', customerEmail);
    console.log('🎫 Ticket:', ticketId, '-', ticketSubject);
    
    // Get or create the support assistant
    const serverUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/vapi/webhook`;
    const assistantId = await getOrCreateSupportAssistant(serverUrl);
    
    // Start the call with customer metadata
    const call = await startOutboundCall(assistantId, normalizedNumber, customerId, {
      customerName,
      customerEmail,
      ticketId,
      ticketSubject,
    });
    
    // Track the call locally with full customer details
    startCallTracking({
      callSid: call.id,
      customerId,
      customerPhone: normalizedNumber,
      direction: 'outbound',
      status: call.status || 'initiated',
      customerName,
      customerEmail,
      ticketId,
    });
    
    console.log('✅ Call started:', call.id);
    
    return NextResponse.json({
      success: true,
      callId: call.id,
      status: call.status,
      customerId,
    });
  } catch (error) {
    console.error('Error starting call:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start call' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vapi/call - List recent calls
 */
export async function GET() {
  try {
    const calls = await listCalls(20);
    
    return NextResponse.json({
      calls: calls.map(call => ({
        id: call.id,
        status: call.status,
        customer: call.customer?.number,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
      }))
    });
  } catch (error) {
    console.error('Error listing calls:', error);
    return NextResponse.json(
      { error: 'Failed to list calls' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vapi/call - End a call
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');
    
    if (!callId) {
      return NextResponse.json(
        { error: 'Call ID is required' },
        { status: 400 }
      );
    }
    
    await endCall(callId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ending call:', error);
    return NextResponse.json(
      { error: 'Failed to end call' },
      { status: 500 }
    );
  }
}

/**
 * Normalize phone number to E.164 format
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Add + if not present and starts with country code
  if (!cleaned.startsWith('+')) {
    // Assume US number if 10 digits
    if (cleaned.length === 10) {
      cleaned = '+1' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  
  return cleaned;
}
