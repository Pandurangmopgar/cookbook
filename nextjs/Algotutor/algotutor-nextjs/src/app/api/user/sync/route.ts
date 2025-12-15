import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const email = user.emailAddresses?.[0]?.emailAddress;
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || email?.split('@')[0];

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      clerk_user_id: userId,
      email,
      display_name: displayName,
      avatar_url: user.imageUrl,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'clerk_user_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to sync user profile:', error);
    return NextResponse.json({ error: 'Failed to sync profile' }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
