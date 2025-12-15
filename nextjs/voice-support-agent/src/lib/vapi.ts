/**
 * Vapi client for voice AI
 * https://vapi.ai
 */

const VAPI_API_KEY = process.env.VAPI_API_KEY!;
const VAPI_BASE_URL = 'https://api.vapi.ai';

export interface VapiAssistant {
  id: string;
  name: string;
  model: {
    provider: string;
    model: string;
    systemPrompt: string;
  };
  voice: {
    provider: string;
    voiceId: string;
  };
}

export interface VapiCall {
  id: string;
  assistantId: string;
  phoneNumberId?: string;
  customer?: {
    number: string;
  };
  status: string;
  startedAt?: string;
  endedAt?: string;
}

/**
 * Create a Vapi assistant with MemoryStack integration
 */
export async function createAssistant(
  name: string,
  systemPrompt: string,
  serverUrl: string
): Promise<VapiAssistant> {
  const response = await fetch(`${VAPI_BASE_URL}/assistant`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      model: {
        provider: 'google',
        model: 'gemini-1.5-flash',
        systemPrompt,
        temperature: 0.7,
      },
      voice: {
        provider: '11labs',
        voiceId: 'rachel', // Natural female voice
        stability: 0.5,
        similarityBoost: 0.75,
      },
      firstMessage: "Hello! Welcome to TechCorp support. How can I help you today?",
      serverUrl, // Webhook for MemoryStack integration
      serverUrlSecret: process.env.VAPI_SERVER_SECRET,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create assistant: ${error}`);
  }

  return response.json();
}

/**
 * Get or create the support assistant
 */
export async function getOrCreateSupportAssistant(serverUrl: string): Promise<string> {
  // Check if we have an existing assistant ID
  const existingId = process.env.VAPI_ASSISTANT_ID;
  if (existingId) {
    return existingId;
  }

  // Create new assistant
  const assistant = await createAssistant(
    'TechCorp Support Agent',
    `You are a friendly and helpful customer support agent for TechCorp.

Your role is to:
1. Greet customers warmly
2. Listen to their issues carefully
3. Provide helpful solutions
4. Be patient and professional

Keep responses concise (2-3 sentences) since this is a phone conversation.
Speak naturally and conversationally.`,
    serverUrl
  );

  console.log(`Created Vapi assistant: ${assistant.id}`);
  return assistant.id;
}

/**
 * Start an outbound call using Vapi
 */
export async function startOutboundCall(
  assistantId: string,
  phoneNumber: string,
  customerId: string,
  customerMetadata?: {
    customerName?: string;
    customerEmail?: string;
    ticketId?: string;
    ticketSubject?: string;
  }
): Promise<VapiCall> {
  const response = await fetch(`${VAPI_BASE_URL}/call/phone`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assistantId,
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
      customer: {
        number: phoneNumber,
        name: customerMetadata?.customerName,
      },
      assistantOverrides: {
        metadata: {
          customerId,
          customerName: customerMetadata?.customerName,
          customerEmail: customerMetadata?.customerEmail,
          ticketId: customerMetadata?.ticketId,
          ticketSubject: customerMetadata?.ticketSubject,
        },
        // Personalize first message with customer name
        firstMessage: customerMetadata?.customerName 
          ? `Hello ${customerMetadata.customerName.split(' ')[0]}! This is TechCorp support calling about your recent inquiry. How can I help you today?`
          : "Hello! This is TechCorp support. How can I help you today?",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to start call: ${error}`);
  }

  return response.json();
}

/**
 * Get call details
 */
export async function getCall(callId: string): Promise<VapiCall> {
  const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
    headers: {
      'Authorization': `Bearer ${VAPI_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get call: ${response.statusText}`);
  }

  return response.json();
}

/**
 * List recent calls
 */
export async function listCalls(limit: number = 10): Promise<VapiCall[]> {
  const response = await fetch(`${VAPI_BASE_URL}/call?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${VAPI_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list calls: ${response.statusText}`);
  }

  return response.json();
}

/**
 * End a call
 */
export async function endCall(callId: string): Promise<void> {
  const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${VAPI_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to end call: ${response.statusText}`);
  }
}
