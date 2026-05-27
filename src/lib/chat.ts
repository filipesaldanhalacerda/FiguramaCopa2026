/**
 * Lógica de chat local. Cria conversas, envia mensagens e (para parceiros de
 * demonstração) gera respostas automáticas para o app parecer vivo sem backend.
 * Quando o Supabase estiver ligado, este módulo passa a usar Realtime.
 */
import { db, type PeerRow } from './db';
import type { Sticker } from '../data/stickers';

export async function ensureChat(peer: PeerRow): Promise<string> {
  const existing = await db.chats.get(peer.id);
  if (!existing) {
    await db.chats.put({ id: peer.id, peerId: peer.id, lastBody: '', lastAt: Date.now(), unread: 0 });
    await db.peers.put(peer); // garante cache do parceiro
  }
  return peer.id;
}

export async function sendMessage(chatId: string, body: string, isQuick = false): Promise<void> {
  const at = Date.now();
  await db.messages.add({ chatId, sender: 'me', body, isQuick, at });
  await db.chats.update(chatId, { lastBody: body, lastAt: at });
  void maybeDemoReply(chatId);
}

const QUICK_REPLIES = [
  'Aceito a troca!',
  'Topo, mas troca 1 por 1',
  'Pode incluir mais uma?',
  'Onde a gente troca?',
  'Levo pra escola amanhã',
  'Combinado!',
];

const DEMO_ANSWERS = [
  'Fechou, troca justa! Levo amanhã.',
  'Aceito essa troca!',
  'Boa! Pode ser, é uma por uma então.',
  'Topo! A gente combina num lugar com adulto por perto.',
  'Perfeito, separei as suas aqui.',
];

async function maybeDemoReply(chatId: string): Promise<void> {
  const peer = await db.peers.get(chatId);
  if (!peer?.demo) return;
  const reply = DEMO_ANSWERS[(Math.random() * DEMO_ANSWERS.length) | 0];
  setTimeout(async () => {
    const at = Date.now();
    await db.messages.add({ chatId, sender: 'peer', body: reply, at });
    const chat = await db.chats.get(chatId);
    await db.chats.update(chatId, { lastBody: reply, lastAt: at, unread: (chat?.unread ?? 0) + 1 });
    window.dispatchEvent(new CustomEvent('chat:update', { detail: chatId }));
  }, 1100 + Math.random() * 1200);
}

export function tradeSummary(give: Sticker[], get: Sticker[]): string {
  const g = give.map((s) => s.code).join(', ') || '—';
  const r = get.map((s) => s.code).join(', ') || '—';
  return `Proposta de troca (${give.length} por ${get.length})\nEu te dou: ${g}\nEu quero: ${r}`;
}

export { QUICK_REPLIES };
