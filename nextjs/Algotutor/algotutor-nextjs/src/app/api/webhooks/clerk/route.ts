import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    // If no webhook secret, just create the profile directly
    const payload = await req.json();
    return handleUserEvent(payload);
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }

  return handleUserEvent(evt);
}

async function handleUserEvent(evt: WebhookEvent | { type: string; data: Record<string, unknown> }) {
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data as {
      id: string;
      email_addresses: Array<{ email_address: string }>;
      first_name?: string;
      last_name?: string;
      image_url?: string;
    };

    const email = email_addresses?.[0]?.email_address;
    const displayName = [first_name, last_name].filter(Boolean).join(' ') || email?.split('@')[0];

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        clerk_user_id: id,
        email,
        display_name: displayName,
        avatar_url: image_url,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'clerk_user_id',
      });

    if (error) {
      console.error('Failed to upsert user profile:', error);
      return new Response('Failed to create user profile', { status: 500 });
    }

    console.log(`User profile ${eventType === 'user.created' ? 'created' : 'updated'} for ${id}`);
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data as { id: string };
    
    await supabase.from('user_profiles').delete().eq('clerk_user_id', id);
    await supabase.from('user_progress').delete().eq('clerk_user_id', id);
    
    console.log(`User profile deleted for ${id}`);
  }

  return new Response('OK', { status: 200 });
}
