import type { SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_ALLOWED = [
  'dayvtholiveira@gmail.com',
  'dieinison2015@gmail.com',
];

export async function isEmailAllowed(
  supabase: SupabaseClient,
  email: string | null | undefined,
): Promise<boolean> {
  if (!email) return false;
  const normalized = email.toLowerCase();

  try {
    const { data, error } = await supabase
      .from('allowed_users')
      .select('email')
      .eq('email', normalized)
      .maybeSingle();
    if (!error && data) return true;
    if (!error) return false;
  } catch {
    // Falha de rede: usa fallback embarcado
  }

  return FALLBACK_ALLOWED.includes(normalized);
}
