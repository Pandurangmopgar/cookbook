import { NextRequest, NextResponse } from 'next/server';
import { getLeadById, addInteraction, updateLead } from '@/lib/store';
import { getLeadContext, storeLeadInteraction } from '@/lib/memory';
import { generateCallScript } from '@/lib/gemini';

// Generate call script
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { objective = 'Schedule a discovery call' } = await request.json();
    
    const lead = getLeadById(id);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Get context from MemoryStack
    const context = await getLeadContext(id, `${lead.name} ${lead.company} calls conversations`);

    // Generate call script with Gemini
    const script = await generateCallScript(
      { name: lead.name, company: lead.company, title: lead.title },
      context,
      objective
    );

    return NextResponse.json({ script });
  } catch (error) {
    console.error('Failed to generate call script:', error);
    return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });
  }
}

// Log call outcome
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { outcome, notes, sentiment, nextStep } = await request.json();
    
    const lead = getLeadById(id);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Log interaction
    const interaction = addInteraction(id, {
      type: 'call',
      direction: 'outbound',
      content: notes || outcome,
      outcome,
      sentiment,
    });

    // Store in MemoryStack
    await storeLeadInteraction(id, {
      type: 'call',
      summary: `Call with ${lead.name}: ${outcome}. ${notes || ''}`,
      outcome,
      sentiment,
    });

    // Update lead based on outcome
    let newStatus = lead.status;
    if (outcome === 'meeting_booked') {
      newStatus = 'meeting_scheduled';
    } else if (outcome === 'interested') {
      newStatus = 'engaged';
    } else if (outcome === 'not_interested') {
      newStatus = 'closed_lost';
    }

    updateLead(id, { 
      status: newStatus,
      nextFollowUpAt: nextStep ? new Date(nextStep).toISOString() : undefined,
    });

    return NextResponse.json({ success: true, interaction });
  } catch (error) {
    console.error('Failed to log call:', error);
    return NextResponse.json({ error: 'Failed to log call' }, { status: 500 });
  }
}
