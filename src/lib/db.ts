/**
 * Persistência local (offline-first) com Dexie / IndexedDB.
 * A coleção do usuário e o "outbox" de sincronização vivem aqui; quando o
 * Supabase estiver configurado, sync.ts envia o outbox e baixa parceiros reais.
 */
import Dexie, { type Table } from 'dexie';

export interface MineRow {
  stickerId: number;
  count: number; // 0 = falta, 1 = tem, 2+ = repetida
}

export interface PeerRow {
  id: string;
  name: string;
  avatar: string;
  favTeam: string;
  city?: string;
  /** coleção do parceiro: stickerId -> count */
  collection: Record<number, number>;
  demo?: boolean;
}

export interface ChatRow {
  id: string; // = peerId
  peerId: string;
  lastBody: string;
  lastAt: number;
  unread: number;
}

export interface MessageRow {
  id?: number;
  chatId: string;
  sender: 'me' | 'peer';
  body: string;
  isQuick?: boolean;
  at: number;
}

export interface OutboxRow {
  id?: number;
  type: 'sticker' | 'profile';
  payload: unknown;
  at: number;
}

export interface KvRow {
  key: string;
  value: unknown;
}

class FiguramaDB extends Dexie {
  mine!: Table<MineRow, number>;
  peers!: Table<PeerRow, string>;
  chats!: Table<ChatRow, string>;
  messages!: Table<MessageRow, number>;
  outbox!: Table<OutboxRow, number>;
  kv!: Table<KvRow, string>;

  constructor() {
    super('figurama');
    this.version(1).stores({
      mine: 'stickerId',
      peers: 'id, favTeam',
      chats: 'id, lastAt',
      messages: '++id, chatId, at',
      outbox: '++id, at',
      kv: 'key',
    });
  }
}

export const db = new FiguramaDB();

// --------- helpers de KV (perfil/configs) ---------
export async function kvGet<T>(key: string): Promise<T | undefined> {
  const row = await db.kv.get(key);
  return row?.value as T | undefined;
}
export async function kvSet(key: string, value: unknown): Promise<void> {
  await db.kv.put({ key, value });
}

// --------- coleção ---------
export async function loadCollection(): Promise<Map<number, number>> {
  const rows = await db.mine.toArray();
  return new Map(rows.map((r) => [r.stickerId, r.count]));
}

export async function setStickerCount(stickerId: number, count: number): Promise<void> {
  if (count <= 0) {
    await db.mine.delete(stickerId);
  } else {
    await db.mine.put({ stickerId, count });
  }
  await db.outbox.add({ type: 'sticker', payload: { stickerId, count }, at: Date.now() });
}
