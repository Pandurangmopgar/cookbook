import { NextRequest, NextResponse } from 'next/server';
import { getAllLeads, createLead, getStats } from '@/lib/store';
import { storeLeadProfile } from '@/lib/memory';

export async function GET() {
  const leads = getAllLeads();
  const stats = getStats();
  return NextResponse.json({ leads, stats });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const lead = createLead({
      name: data.name,
      email: data.email,
      company: data.company,
      title: data.title,
      phone: data.phone,
      linkedin: data.linkedin,
      industry: data.industry,
      companySize: data.companySize,
      status: 'new',
      tags: data.tags || [],
      notes: data.notes,
    });

    // Store in MemoryStack for AI context
    await storeLeadProfile(lead.id, {
      name: lead.name,
      company: lead.company,
      title: lead.title,
      email: lead.email,
      phone: lead.phone,
      linkedin: lead.linkedin,
      industry: lead.industry,
      companySize: lead.companySize,
    });

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Failed to create lead:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
