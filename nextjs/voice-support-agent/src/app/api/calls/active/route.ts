/**
 * Active Call API - Get real-time call status and transcript
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveCall, getAllActiveCalls } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');
    
    if (callId) {
      // Get specific call
      const call = await getActiveCall(callId);
      
      if (call) {
        return NextResponse.json({
          call: {
            id: call.id,
            customerId: call.customerId,
            customerPhone: call.customerPhone,
            direction: call.direction,
            status: call.status,
            startTime: call.startTime,
            transcript: call.transcript || [],
            sentiment: call.sentiment,
          }
        });
      } else {
        return NextResponse.json({
          status: 'not_found',
          message: 'Call not found or has ended'
        });
      }
    } else {
      // Get all active calls
      const calls = await getAllActiveCalls();
      
      return NextResponse.json({
        calls: calls.map(call => ({
          id: call.id,
          customerId: call.customerId,
          customerPhone: call.customerPhone,
          direction: call.direction,
          status: call.status,
          startTime: call.startTime,
          transcriptCount: call.transcript?.length || 0,
        }))
      });
    }
  } catch (error) {
    console.error('Error fetching active call:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call status' },
      { status: 500 }
    );
  }
}
