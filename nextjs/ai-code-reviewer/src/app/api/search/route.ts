import { NextRequest, NextResponse } from 'next/server';

// Use same URL as review route (no www)
const MEMORYSTACK_API = process.env.MEMORYSTACK_API_URL || 'https://memorystack.app/api/v1';

export async function GET(request: NextRequest) {
  console.log('\n🔍 ========== SIDEBAR SEARCH ==========');
  
  try {
    const { searchParams: reqParams } = new URL(request.url);
    const query = reqParams.get('query');
    const developerId = reqParams.get('developerId') || 'dev-user';

    console.log('🔍 DEBUG: query=', query, 'developerId=', developerId);
    console.log('🔍 DEBUG: API_KEY exists=', !!process.env.MEMORYSTACK_API_KEY);
    console.log('🔍 DEBUG: API URL=', MEMORYSTACK_API);

    if (!query || !process.env.MEMORYSTACK_API_KEY) {
      console.log('🔍 DEBUG: Missing query or API key');
      return NextResponse.json({ results: [] });
    }

    // Search for memories
    // Try searching WITHOUT user_id first to debug if project scoping is the issue
    const searchParams = new URLSearchParams({
      query,
      // user_id: developerId,  // Temporarily disabled to debug
      limit: '10',
      mode: 'hybrid'
    });
    
    console.log('🔍 DEBUG: Searching WITHOUT user_id filter to debug scoping');
    
    const searchUrl = `${MEMORYSTACK_API}/memories/search?${searchParams}`;
    console.log('🔍 DEBUG: Search URL:', searchUrl);

    const res = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.MEMORYSTACK_API_KEY}`,
        'X-API-Key': process.env.MEMORYSTACK_API_KEY!,
      },
    });

    console.log('🔍 DEBUG: Response status:', res.status);
    console.log('🔍 DEBUG: Response headers:', Object.fromEntries(res.headers.entries()));
    
    // Read the full response text first to avoid truncation issues
    const responseText = await res.text();
    console.log('🔍 DEBUG: Response length:', responseText.length);
    console.log('🔍 DEBUG: Response preview:', responseText.substring(0, 500));
    
    if (!res.ok) {
      console.error('🔍 DEBUG: Error response:', responseText);
      return NextResponse.json({ results: [], error: 'Search failed' });
    }

    // Parse JSON safely
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('🔍 DEBUG: JSON parse error:', parseError);
      console.error('🔍 DEBUG: Raw response:', responseText);
      return NextResponse.json({ results: [], error: 'Invalid JSON response' });
    }
    
    console.log('🔍 DEBUG: Results count:', data.results?.length || 0);
    console.log('🔍 DEBUG: Response success:', data.success);
    console.log('🔍 DEBUG: Response mode:', data.mode);
    
    // Log each memory's end_user_id to debug the scoping issue
    if (data.results?.length > 0) {
      data.results.forEach((m: any, i: number) => {
        console.log(`🔍 DEBUG: Memory ${i + 1}:`, {
          id: m.id,
          end_user_id: m.end_user_id,
          agent_id: m.agent_id,
          content_preview: m.content?.substring(0, 50)
        });
      });
    }
    
    const results = (data.results || []).map((m: any) => ({
      content: m.content || 'No content',
      similarity: m.similarity || m.rrf_score || 0,
      end_user_id: m.end_user_id, // Include for debugging
    }));

    console.log('🔍 DEBUG: Returning', results.length, 'results');
    console.log('🔍 ========== END SEARCH ==========\n');

    return NextResponse.json({ results });
  } catch (error) {
    console.error('❌ DEBUG: Search error:', error);
    return NextResponse.json({ results: [] });
  }
}
