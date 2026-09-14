import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isEmailAllowed } from '@/lib/allowlist';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const supabase = createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  const allowed = await isEmailAllowed(supabase, user?.email);

  if (!allowed) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=unauthorized`);
  }

  return NextResponse.redirect(origin);
}
