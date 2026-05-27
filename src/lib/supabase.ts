/**
 * Cliente Supabase OPCIONAL. O app funciona 100% local (offline-first) sem
 * backend; quando VITE_SUPABASE_URL/ANON_KEY existem, habilitamos auth real,
 * sync da coleção, match com parceiros reais e chat em tempo real.
 *
 * Auth apelido+PIN sem e-mail: usamos e-mail sintético interno
 * `${slug}@appcopa2026.local` + PIN de 6 dígitos como senha. Lembre de
 * DESATIVAR "Confirm email" no painel do Supabase.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isBackendEnabled = Boolean(url && anon);

export const supabase: SupabaseClient | null = isBackendEnabled
  ? createClient(url!, anon!, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

const SYNTH_DOMAIN = 'appcopa2026.local';
export const slugToEmail = (slug: string) => `${slug.toLowerCase()}@${SYNTH_DOMAIN}`;

export async function backendSignUp(slug: string, pin: string) {
  if (!supabase) return { error: 'backend-off' as const };
  const { error } = await supabase.auth.signUp({
    email: slugToEmail(slug),
    password: pin,
    options: { data: { slug } },
  });
  return { error: error?.message ?? null };
}

export async function backendSignIn(slug: string, pin: string) {
  if (!supabase) return { error: 'backend-off' as const };
  const { error } = await supabase.auth.signInWithPassword({
    email: slugToEmail(slug),
    password: pin,
  });
  return { error: error?.message ?? null };
}
