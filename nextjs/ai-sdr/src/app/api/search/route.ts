import { NextRequest, NextResponse } from 'next/server';
import { searchLeads } from '@/lib/memory';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  try {
    const results = await searchLeads(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
