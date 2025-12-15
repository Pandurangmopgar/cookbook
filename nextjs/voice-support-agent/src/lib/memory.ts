/**
 * MemoryStack client for customer support memory
 * Using the official @memorystack/sdk
 */

import { MemoryStackClient } from '@memorystack/sdk';

// Initialize the SDK client
const client = new MemoryStackClient({
  apiKey: process.env.MEMORYSTACK_API_KEY!,
  enableLogging: true,
});

export interface Memory {
  id: string;
  content: string;
  memory_type?: string;
  confidence?: number;
  created_at: string;
  metadata?: Record<string, unknown>;
}

// Vapi Assistant ID for scoping memories to this specific voice agent
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;

/**
 * Store a memory for a customer
 * @param content - The memory content
 * @param customerId - Customer identifier (email preferred, phone as fallback)
 * @param metadata - Additional metadata
 */
export async function storeMemory(
  content: string,
  customerId: string,
  metadata?: Record<string, unknown>
): Promise<{ id: string }> {
  console.log('💾 Storing memory via SDK for customer:', customerId);
  console.log('📝 Content:', content.substring(0, 100) + '...');
  console.log('🤖 Agent ID:', VAPI_ASSISTANT_ID);
  
  const result = await client.add(content, {
    // user_id is the end user (customer) - use email if available, phone as fallback
    user_id: customerId,
    // agent_id scopes memories to this specific Vapi assistant
    agent_id: VAPI_ASSISTANT_ID,
    metadata: {
      source: 'voice_support',
      customer_phone: metadata?.customer_phone,
      ...metadata,
    },
  });
  
  console.log('✅ Memory stored successfully!');
  console.log('📊 Result:', JSON.stringify(result, null, 2));
  
  return { id: result.memory_ids?.[0] || 'stored' };
}

/**
 * Search customer memories
 */
export async function searchMemories(
  query: string,
  customerId: string,
  limit: number = 5
): Promise<Memory[]> {
  console.log('🔍 Searching memories for customer:', customerId);
  console.log('🤖 Agent ID:', VAPI_ASSISTANT_ID);
  
  const results = await client.search(query, {
    user_id: customerId,
    agent_id: VAPI_ASSISTANT_ID,
    limit,
  });
  
  console.log(`📊 Found ${results.results?.length || 0} memories`);
  
  return (results.results || []).map((r: any) => ({
    id: r.id,
    content: r.content,
    memory_type: r.memory_type,
    confidence: r.confidence,
    created_at: r.created_at,
    metadata: r.metadata,
  }));
}

/**
 * Get all memories for a customer
 */
export async function getCustomerMemories(
  customerId: string,
  limit: number = 20
): Promise<Memory[]> {
  try {
    console.log('📋 Getting memories for customer:', customerId);
    console.log('🤖 Agent ID:', VAPI_ASSISTANT_ID);
    
    // Search with a broad query to get customer history
    const results = await client.search('customer interaction history support call', {
      user_id: customerId,
      agent_id: VAPI_ASSISTANT_ID,
      limit,
    });
    
    return (results.results || []).map((r: any) => ({
      id: r.id,
      content: r.content,
      memory_type: r.memory_type,
      confidence: r.confidence,
      created_at: r.created_at,
      metadata: r.metadata,
    }));
  } catch (error) {
    console.error('Error getting customer memories:', error);
    return [];
  }
}

/**
 * Build context string from customer memories
 */
export async function buildCustomerContext(customerId: string): Promise<string> {
  try {
    const memories = await getCustomerMemories(customerId, 10);
    
    if (memories.length === 0) {
      return 'This is a new customer with no previous interaction history.';
    }

    const context = memories
      .map((m, i) => `${i + 1}. ${m.content} (${new Date(m.created_at).toLocaleDateString()})`)
      .join('\n');

    return `Customer interaction history:\n${context}`;
  } catch (error) {
    console.error('Error building customer context:', error);
    return 'Unable to retrieve customer history.';
  }
}
