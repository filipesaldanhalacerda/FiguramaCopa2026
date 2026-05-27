/**
 * Integração com o Supabase — Etapa 1: contas reais (apelido+PIN), perfil e
 * sincronização da coleção entre aparelhos. O app continua funcionando local;
 * quando o backend está ligado, o que o usuário marca é salvo no servidor e
 * pode ser recuperado em outro dispositivo via login.
 */
import { supabase, slugToEmail } from './supabase';
import type { Profile } from './store';

export interface ProfileRow {
  id: string;
  slug: string;
  display_name: string;
  avatar: string;
  fav_team: string;
  recovery_hash: string | null;
}

let authedUid: string | null = null;
export const isAuthed = () => !!authedUid;

supabase?.auth.onAuthStateChange((_e, session) => {
  authedUid = session?.user?.id ?? null;
});

/** Lê a sessão existente ao iniciar (login persiste entre recarregamentos). */
export async function initBackend(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  authedUid = data.session?.user?.id ?? null;
  return !!authedUid;
}

function humanizeSignup(msg: string): string {
  if (/already|registered|exists|duplicate/i.test(msg)) return 'Esse apelido já está em uso. Escolha outro.';
  if (/password|6 char|short/i.test(msg)) return 'PIN inválido (precisa de 6 dígitos).';
  return 'Não consegui criar a conta agora. Tente outro apelido.';
}

/** Cria a conta no servidor e grava o perfil. Retorna erro amigável se falhar. */
export async function backendSignUp(p: Profile, pin: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: null }; // backend desligado → segue local
  const { data, error } = await supabase.auth.signUp({
    email: slugToEmail(p.slug),
    password: pin,
    options: { data: { slug: p.slug } },
  });
  if (error) return { error: humanizeSignup(error.message) };
  const uid = data.user?.id ?? null;
  authedUid = uid;
  if (uid) {
    const { error: pe } = await supabase.from('profiles').upsert({
      id: uid, slug: p.slug, display_name: p.displayName, avatar: p.avatar,
      fav_team: p.favTeam, recovery_hash: p.recoveryHash,
    });
    if (pe) return { error: 'Conta criada, mas houve erro ao salvar o perfil. Tente entrar.' };
  }
  return { error: null };
}

/** Entra numa conta existente (outro aparelho) e devolve o perfil do servidor. */
export async function backendLogIn(slug: string, pin: string): Promise<{ error: string | null; row?: ProfileRow }> {
  if (!supabase) return { error: 'backend-off' };
  const norm = slug.trim().toLowerCase().replace(/\s+/g, '_');
  const { data, error } = await supabase.auth.signInWithPassword({ email: slugToEmail(norm), password: pin });
  if (error) return { error: 'Apelido ou PIN incorretos.' };
  authedUid = data.user?.id ?? null;
  const { data: row, error: re } = await supabase.from('profiles').select('*').eq('id', authedUid).single();
  if (re || !row) return { error: 'Conta encontrada, mas sem perfil. Fale com o suporte.' };
  return { error: null, row: row as ProfileRow };
}

/** Sobe uma figurinha (upsert) ou remove (count<=0). Silencioso se offline. */
export async function pushSticker(stickerId: number, count: number): Promise<void> {
  if (!supabase || !authedUid) return;
  try {
    if (count <= 0) {
      await supabase.from('user_stickers').delete().eq('user_id', authedUid).eq('sticker_id', stickerId);
    } else {
      await supabase.from('user_stickers').upsert({ user_id: authedUid, sticker_id: stickerId, count });
    }
  } catch {
    /* offline — a versão local continua válida e sobe depois */
  }
}

/** Sobe toda a coleção local de uma vez (usado logo após o cadastro). */
export async function pushAll(counts: Record<number, number>): Promise<void> {
  if (!supabase || !authedUid) return;
  const rows = Object.entries(counts)
    .filter(([, c]) => c >= 1)
    .map(([id, count]) => ({ user_id: authedUid!, sticker_id: Number(id), count }));
  if (rows.length) {
    try { await supabase.from('user_stickers').upsert(rows); } catch { /* ignora */ }
  }
}

/** Baixa a coleção do servidor (ao entrar/recarregar). */
export async function pullCollection(): Promise<Record<number, number>> {
  if (!supabase || !authedUid) return {};
  const { data } = await supabase.from('user_stickers').select('sticker_id,count').eq('user_id', authedUid);
  const out: Record<number, number> = {};
  for (const r of data ?? []) out[(r as { sticker_id: number }).sticker_id] = (r as { count: number }).count;
  return out;
}

export async function backendLogout(): Promise<void> {
  await supabase?.auth.signOut().catch(() => {});
  authedUid = null;
}
