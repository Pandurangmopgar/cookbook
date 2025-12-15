import { NextRequest, NextResponse } from 'next/server';
import { getLeadById, updateLead, deleteLead, getLeadInteractions, getLeadTasks } from '@/lib/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lead = getLeadById(id);
  
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  const interactions = getLeadInteractions(id);
  const tasks = getLeadTasks(id);

  return NextResponse.json({ lead, interactions, tasks });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  
  const lead = updateLead(id, data);
  
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  return NextResponse.json({ lead });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteLead(id);
  
  if (!deleted) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
