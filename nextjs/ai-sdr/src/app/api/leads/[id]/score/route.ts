import { NextRequest, NextResponse } from 'next/server';
import { getLeadById, updateLead, getLeadInteractions } from '@/lib/store';
import { getLeadContext } from '@/lib/memory';
import { scoreLeadWithAI } from '@/lib/gemini';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const lead = getLeadById(id);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Get context from MemoryStack
    const context = await getLeadContext(id, `${lead.name} ${lead.company} all interactions`);
    const interactions = getLeadInteractions(id);

    // Score with AI
    const scoreResult = await scoreLeadWithAI(
      { 
        name: lead.name, 
        company: lead.company, 
        title: lead.title,
        industry: lead.industry,
      },
      context,
      interactions.length
    );

    // Update lead score
    updateLead(id, { score: scoreResult.score });

    return NextResponse.json({ 
      score: scoreResult.score,
      factors: scoreResult.factors,
      recommendation: scoreResult.recommendation,
      nextBestAction: scoreResult.nextBestAction,
    });
  } catch (error) {
    console.error('Failed to score lead:', error);
    return NextResponse.json({ error: 'Failed to score lead' }, { status: 500 });
  }
}
