import { MemoryStackClient } from '@memorystack/sdk';

// Lazy initialization to ensure env vars are available at runtime
let _memoryClient: MemoryStackClient | null = null;

function getMemoryClient(): MemoryStackClient {
  if (!_memoryClient) {
    const apiKey = process.env.MEMORYSTACK_API_KEY;
    if (!apiKey) {
      throw new Error('MEMORYSTACK_API_KEY environment variable is not set');
    }
    _memoryClient = new MemoryStackClient({
      apiKey,
      baseUrl: 'https://memorystack.app',
      agentName: 'ai_sdr',
      agentType: 'sales',
    });
  }
  return _memoryClient;
}

// Store lead interaction
export async function storeLeadInteraction(
  leadId: string,
  interaction: {
    type: 'email' | 'call' | 'meeting' | 'note' | 'linkedin';
    summary: string;
    outcome?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  }
): Promise<void> {
  const content = `[${interaction.type.toUpperCase()}] ${interaction.summary}${
    interaction.outcome ? ` | Outcome: ${interaction.outcome}` : ''
  }`;

  await getMemoryClient().add(content, {
    userId: leadId,
    metadata: {
      interaction_type: interaction.type,
      sentiment: interaction.sentiment || 'neutral',
      timestamp: new Date().toISOString(),
    },
  });
}

// Get lead context for personalization
export async function getLeadContext(
  leadId: string,
  query: string
): Promise<string> {
  try {
    const results = await getMemoryClient().search(query, { userId: leadId, limit: 10 });

    if (!results.results || results.results.length === 0) {
      return 'No previous interactions found with this lead.';
    }

    return results.results
      .map((mem: any) => `• ${mem.content}`)
      .join('\n');
  } catch (e) {
    console.error('Failed to get lead context:', e);
    return 'No previous interactions found.';
  }
}

// Store lead profile info
export async function storeLeadProfile(
  leadId: string,
  profile: {
    name: string;
    company: string;
    title: string;
    email: string;
    phone?: string;
    linkedin?: string;
    industry?: string;
    companySize?: string;
    painPoints?: string[];
    interests?: string[];
  }
): Promise<void> {
  const content = `Lead Profile: ${profile.name}, ${profile.title} at ${profile.company}. 
Email: ${profile.email}${profile.phone ? `, Phone: ${profile.phone}` : ''}.
${profile.industry ? `Industry: ${profile.industry}.` : ''}
${profile.companySize ? `Company Size: ${profile.companySize}.` : ''}
${profile.painPoints?.length ? `Pain Points: ${profile.painPoints.join(', ')}.` : ''}
${profile.interests?.length ? `Interests: ${profile.interests.join(', ')}.` : ''}`;

  await getMemoryClient().add(content, {
    userId: leadId,
    metadata: {
      type: 'profile',
      ...profile,
    },
  });
}

// Search all leads
export async function searchLeads(query: string): Promise<any[]> {
  try {
    const results = await getMemoryClient().search(query, { limit: 20 });
    return results.results || [];
  } catch (e) {
    console.error('Failed to search leads:', e);
    return [];
  }
}
