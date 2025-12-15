import { NextRequest, NextResponse } from 'next/server';
import { getLeadById, addInteraction } from '@/lib/store';
import { getLeadContext, storeLeadInteraction } from '@/lib/memory';
import { generateLinkedInMessage } from '@/lib/gemini';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { messageType = 'connection' } = await request.json();
    
    const lead = getLeadById(id);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Get context from MemoryStack
    const context = await getLeadContext(id, `${lead.name} ${lead.company} linkedin`);

    // Generate LinkedIn message
    const message = await generateLinkedInMessage(
      { name: lead.name, company: lead.company, title: lead.title },
      context,
      messageType
    );

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Failed to generate LinkedIn message:', error);
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 });
  }
}

// Log LinkedIn interaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action, message } = await request.json();
    
    const lead = getLeadById(id);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Log interaction
    const interaction = addInteraction(id, {
      type: 'linkedin',
      direction: 'outbound',
      content: `${action}: ${message}`,
    });

    // Store in MemoryStack
    await storeLeadInteraction(id, {
      type: 'linkedin',
      summary: `LinkedIn ${action} to ${lead.name}: ${message.substring(0, 100)}...`,
    });

    return NextResponse.json({ success: true, interaction });
  } catch (error) {
    console.error('Failed to log LinkedIn interaction:', error);
    return NextResponse.json({ error: 'Failed to log interaction' }, { status: 500 });
  }
}
