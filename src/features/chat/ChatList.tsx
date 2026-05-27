import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, type ChatRow, type PeerRow } from '../../lib/db';
import { getTeam } from '../../data/worldcup2026';
import { Card, EmptyState } from '../../components/ui';

export default function ChatList() {
  const nav = useNavigate();
  const [rows, setRows] = useState<(ChatRow & { peer?: PeerRow })[]>([]);

  useEffect(() => {
    (async () => {
      const chats = await db.chats.orderBy('lastAt').reverse().toArray();
      const withPeers = await Promise.all(
        chats.map(async (c) => ({ ...c, peer: await db.peers.get(c.peerId) })),
      );
      setRows(withPeers);
    })();
  }, []);

  return (
    <div className="space-y-3">
      <h1 className="font-display font-800 text-3xl mb-1">Conversas 💬</h1>
      {rows.length === 0 ? (
        <EmptyState emoji="💬" title="Nenhuma conversa ainda" hint="Vá em Trocar e combine uma troca pra começar a conversar!" />
      ) : (
        rows.map((c) => {
          const t = c.peer ? getTeam(c.peer.favTeam) : undefined;
          return (
            <Card key={c.id} onClick={() => nav(`/chat/${c.id}`)} className="p-3 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-2xl">{c.peer?.avatar ?? '🙂'}</div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-800">{c.peer?.name ?? 'Parceiro'} {t?.flag}</p>
                <p className="truncate text-sm font-600 text-ink-soft">{c.lastBody.replace(/\n/g, ' ') || 'Combine sua troca!'}</p>
              </div>
              {c.unread > 0 && (
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[var(--color-magenta)] px-1.5 text-xs font-800 text-white">
                  {c.unread}
                </span>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
