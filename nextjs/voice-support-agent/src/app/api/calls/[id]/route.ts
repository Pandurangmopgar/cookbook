import { NextRequest, NextResponse } from 'next/server';
import { getActiveCall } from '@/lib/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const call = await getActiveCall(params.id);
    
    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    return NextResponse.json(call);
  } catch (error) {
    console.error('Error fetching call:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
