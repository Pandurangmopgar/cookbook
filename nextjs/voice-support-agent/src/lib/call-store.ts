/**
 * Call store using Redis for real-time updates
 * Re-exports from redis.ts for backward compatibility
 */

import {
  setActiveCall,
  getActiveCall,
  getAllActiveCalls,
  updateCallStatus,
  appendTranscript,
  endCall as redisEndCall,
  getCallHistory,
  getDailyStats,
  LiveCall,
  TranscriptEntry,
  CallHistory,
} from './redis';

// Re-export types
export type { LiveCall, TranscriptEntry, CallHistory };

// Legacy interface for backward compatibility
export interface ActiveCall {
  callSid: string;
  customerId: string;
  customerPhone: string;
  direction: 'inbound' | 'outbound';
  status: 'ringing' | 'in-progress' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  transcript: Array<{ role: 'customer' | 'agent'; text: string; timestamp: Date }>;
  summary?: string;
}

/**
 * Start tracking a new call
 */
export async function startCallTracking(params: {
  callSid: string;
  customerId: string;
  customerPhone: string;
  direction: 'inbound' | 'outbound';
  status?: string;
}): Promise<void> {
  const call: LiveCall = {
    id: params.callSid,
    customerId: params.customerId,
    customerPhone: params.customerPhone,
    direction: params.direction,
    status: params.status === 'in-progress' ? 'in-progress' : 'ringing',
    startTime: new Date().toISOString(),
    transcript: [],
  };
  await setActiveCall(call);
}

/**
 * Update call (legacy compatibility)
 */
export async function updateCall(callSid: string, updates: Partial<ActiveCall>): Promise<void> {
  if (updates.status) {
    const status = updates.status === 'completed' || updates.status === 'failed' 
      ? 'ended' 
      : updates.status as LiveCall['status'];
    await updateCallStatus(callSid, status);
  }
  
  if (updates.transcript && updates.transcript.length > 0) {
    const lastEntry = updates.transcript[updates.transcript.length - 1];
    await appendTranscript(callSid, {
      role: lastEntry.role === 'customer' ? 'user' : 'assistant',
      text: lastEntry.text,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Add transcript entry
 */
export async function addTranscript(
  callSid: string,
  role: 'customer' | 'agent',
  text: string
): Promise<void> {
  await appendTranscript(callSid, {
    role: role === 'customer' ? 'user' : 'assistant',
    text,
    timestamp: new Date().toISOString(),
  });
}

/**
 * End call tracking
 */
export async function endCallTracking(callSid: string, summary?: string): Promise<void> {
  await redisEndCall(callSid, summary);
}

/**
 * Get active calls
 */
export async function getActiveCalls(): Promise<LiveCall[]> {
  return getAllActiveCalls();
}

/**
 * Get call by ID
 */
export async function getCall(callSid: string): Promise<LiveCall | null> {
  return getActiveCall(callSid);
}

// Re-export for direct use
export { getCallHistory, getDailyStats };
