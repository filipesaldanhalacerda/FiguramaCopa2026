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

export const getUid = () => authedUid;

/* ---------------------------- MATCH (Etapa 2) ----------------------------- */

export interface BackendMatch {
  partner_id: string;
  partner_slug: string;
  avatar: string;
  fav_team: string;
  i_get: number;
  i_give: number;
  balance: number;
}

/** Lista de parceiros reais ordenada por troca equilibrada. */
export async function fetchMatches(): Promise<BackendMatch[]> {
  if (!supabase || !authedUid) return [];
  const { data } = await supabase.rpc('match_partners_ranked', { p_limit: 30 });
  return (data ?? []) as BackendMatch[];
}

/** Detalhe da troca com um parceiro: ids das figurinhas que recebo/dou. */
export async function fetchTradeStickers(partnerId: string): Promise<{ get: number[]; give: number[] }> {
  if (!supabase) return { get: [], give: [] };
  const { data } = await supabase.rpc('trade_stickers', { p_partner: partnerId });
  return (data as { get: number[]; give: number[] }) ?? { get: [], give: [] };
}

/* ----------------------------- CHAT (Etapa 3) ----------------------------- */

export interface ChatMsg {
  id: number; chat_id: string; sender_id: string; body: string; is_quick: boolean; created_at: string;
}
export interface ChatPeer { id: string; name: string; avatar: string; favTeam: string }

export async function getOrCreateChat(otherId: string): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.rpc('get_or_create_chat', { p_other: otherId });
  return (data as string) ?? null;
}

export async function listChats() {
  if (!supabase || !authedUid) return [];
  const { data } = await supabase.rpc('my_chats');
  return (data ?? []) as {
    chat_id: string; other_id: string; other_slug: string; other_name: string;
    other_avatar: string; other_fav_team: string; last_body: string | null; last_at: string | null; unread: number;
  }[];
}

/** Marca a conversa como lida (zera o não-lidas dela). */
export async function markRead(chatId: string): Promise<void> {
  if (!supabase || !authedUid) return;
  try { await supabase.rpc('mark_read', { p_chat: chatId }); } catch { /* ignora */ }
}

/** Total de mensagens não lidas em todas as conversas. */
export async function unreadTotal(): Promise<number> {
  if (!supabase || !authedUid) return 0;
  const { data } = await supabase.rpc('unread_total');
  return (data as number) ?? 0;
}

export async function loadChatPeer(chatId: string): Promise<ChatPeer | null> {
  if (!supabase || !authedUid) return null;
  const { data: chat } = await supabase.from('chats').select('user_a,user_b').eq('id', chatId).single();
  if (!chat) return null;
  const other = chat.user_a === authedUid ? chat.user_b : chat.user_a;
  const { data: p } = await supabase.from('profiles').select('display_name,avatar,fav_team').eq('id', other).single();
  return p ? { id: other, name: p.display_name, avatar: p.avatar, favTeam: p.fav_team } : null;
}

export async function loadMessages(chatId: string): Promise<ChatMsg[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at');
  return (data ?? []) as ChatMsg[];
}

export async function sendChatMessage(chatId: string, body: string, isQuick = false): Promise<void> {
  if (!supabase || !authedUid) return;
  await supabase.from('messages').insert({ chat_id: chatId, sender_id: authedUid, body, is_quick: isQuick });
}

export async function blockUser(otherId: string): Promise<void> {
  if (!supabase || !authedUid) return;
  try { await supabase.from('blocks').insert({ blocker_id: authedUid, blocked_id: otherId }); } catch { /* ignora */ }
}

export async function reportUser(otherId: string, chatId: string, reason = 'denúncia no chat'): Promise<void> {
  if (!supabase || !authedUid) return;
  try { await supabase.from('reports').insert({ reporter_id: authedUid, reported_id: otherId, chat_id: chatId, reason }); } catch { /* ignora */ }
}

/** Assina novas mensagens do chat em tempo real. Retorna função de unsubscribe. */
export function subscribeMessages(chatId: string, onInsert: (m: ChatMsg) => void): () => void {
  const sb = supabase;
  if (!sb) return () => {};
  const ch = sb
    .channel(`chat:${chatId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
      (payload) => onInsert(payload.new as ChatMsg))
    .subscribe();
  return () => { sb.removeChannel(ch); };
}
