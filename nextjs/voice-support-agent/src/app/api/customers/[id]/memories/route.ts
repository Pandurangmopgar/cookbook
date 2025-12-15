/**
 * API to get customer memories
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerMemories, searchMemories } from '@/lib/memory';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const customerId = params.id;
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  try {
    let memories;
    
    if (query) {
      memories = await searchMemories(query, customerId, 10);
    } else {
      memories = await getCustomerMemories(customerId, 20);
    }

    return NextResponse.json({ memories });
  } catch (error) {
    console.error('Error fetching customer memories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memories' },
      { status: 500 }
    );
  }
}
