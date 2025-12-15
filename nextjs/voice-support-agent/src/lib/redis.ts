import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Key prefixes
const KEYS = {
  ACTIVE_CALL: 'call:active:',
  CALL_TRANSCRIPT: 'call:transcript:',
  CALL_HISTORY: 'calls:history',
  STATS: 'stats:daily:',
};

export interface LiveCall {
  id: string;
  customerId: string;
  customerPhone: string;
  direction: 'inbound' | 'outbound';
  status: 'ringing' | 'in-progress' | 'ended';
  startTime: string;
  assistantId?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  transcript: TranscriptEntry[];
}

export interface TranscriptEntry {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface CallHistory {
  id: string;
  customerId: string;
  customerPhone: string;
  direction: 'inbound' | 'outbound';
  startTime: string;
  endTime: string;
  duration: number;
  summary?: string;
  sentiment?: string;
  memoriesStored: number;
}

// Store active call
export async function setActiveCall(call: LiveCall): Promise<void> {
  await redis.set(`${KEYS.ACTIVE_CALL}${call.id}`, JSON.stringify(call), { ex: 3600 }); // 1 hour TTL
  await redis.sadd('calls:active:ids', call.id);
}

// Get active call
export async function getActiveCall(callId: string): Promise<LiveCall | null> {
  const data = await redis.get(`${KEYS.ACTIVE_CALL}${callId}`);
  return data ? (typeof data === 'string' ? JSON.parse(data) : data as LiveCall) : null;
}

// Get all active calls
export async function getAllActiveCalls(): Promise<LiveCall[]> {
  const ids = await redis.smembers('calls:active:ids');
  if (!ids || ids.length === 0) return [];
  
  const calls: LiveCall[] = [];
  for (const id of ids) {
    const call = await getActiveCall(id as string);
    if (call && call.status !== 'ended') {
      calls.push(call);
    } else {
      // Clean up ended calls from active set
      await redis.srem('calls:active:ids', id);
    }
  }
  return calls;
}

// Update call transcript
export async function appendTranscript(callId: string, entry: TranscriptEntry): Promise<void> {
  const call = await getActiveCall(callId);
  if (call) {
    call.transcript.push(entry);
    // Simple sentiment detection
    const text = entry.text.toLowerCase();
    if (text.includes('thank') || text.includes('great') || text.includes('perfect')) {
      entry.sentiment = 'positive';
    } else if (text.includes('problem') || text.includes('issue') || text.includes('frustrated')) {
      entry.sentiment = 'negative';
    } else {
      entry.sentiment = 'neutral';
    }
    await setActiveCall(call);
  }
}

// Update call status
export async function updateCallStatus(callId: string, status: LiveCall['status'], extra?: Partial<LiveCall>): Promise<void> {
  const call = await getActiveCall(callId);
  if (call) {
    call.status = status;
    if (extra) {
      Object.assign(call, extra);
    }
    await setActiveCall(call);
  }
}

// End call and move to history
export async function endCall(callId: string, summary?: string, memoriesStored = 0): Promise<void> {
  const call = await getActiveCall(callId);
  if (call) {
    const endTime = new Date().toISOString();
    const duration = Math.round((new Date(endTime).getTime() - new Date(call.startTime).getTime()) / 1000);
    
    const historyEntry: CallHistory = {
      id: call.id,
      customerId: call.customerId,
      customerPhone: call.customerPhone,
      direction: call.direction,
      startTime: call.startTime,
      endTime,
      duration,
      summary,
      sentiment: call.sentiment,
      memoriesStored,
    };
    
    // Add to history (keep last 100)
    await redis.lpush(KEYS.CALL_HISTORY, JSON.stringify(historyEntry));
    await redis.ltrim(KEYS.CALL_HISTORY, 0, 99);
    
    // Remove from active
    await redis.del(`${KEYS.ACTIVE_CALL}${callId}`);
    await redis.srem('calls:active:ids', callId);
    
    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    await redis.hincrby(`${KEYS.STATS}${today}`, 'totalCalls', 1);
    await redis.hincrby(`${KEYS.STATS}${today}`, 'totalDuration', duration);
    await redis.hincrby(`${KEYS.STATS}${today}`, 'memoriesStored', memoriesStored);
  }
}

// Get call history
export async function getCallHistory(limit = 20): Promise<CallHistory[]> {
  const data = await redis.lrange(KEYS.CALL_HISTORY, 0, limit - 1);
  return data.map(d => typeof d === 'string' ? JSON.parse(d) : d as CallHistory);
}

// Get daily stats
export async function getDailyStats(): Promise<{ totalCalls: number; avgDuration: number; memoriesStored: number }> {
  const today = new Date().toISOString().split('T')[0];
  const stats = await redis.hgetall(`${KEYS.STATS}${today}`);
  
  const totalCalls = Number(stats?.totalCalls || 0);
  const totalDuration = Number(stats?.totalDuration || 0);
  const memoriesStored = Number(stats?.memoriesStored || 0);
  
  return {
    totalCalls,
    avgDuration: totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0,
    memoriesStored,
  };
}
