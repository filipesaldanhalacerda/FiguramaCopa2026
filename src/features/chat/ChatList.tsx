import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, type ChatRow, type PeerRow } from '../../lib/db';
import { getTeam } from '../../data/worldcup2026';
import { Card, EmptyState } from '../../components/ui';
import { Avatar, TeamBadge } from '../../components/team';
import { isBackendEnabled } from '../../lib/supabase';
import { listChats } from '../../lib/backend';

interface Row {
  id: string; name: string; avatar: string; favTeam: string; last: string; unread?: number;
}

export default function ChatList() {
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const backend = isBackendEnabled;

  useEffect(() => {
    (async () => {
      if (backend) {
        const cs = await listChats();
        setRows(cs.map((c) => ({
          id: c.chat_id, name: c.other_name, avatar: c.other_avatar, favTeam: c.other_fav_team,
          last: (c.last_body ?? '').replace(/\n/g, ' ') || 'Combine sua troca.',
        })));
      } else {
        const chats = await db.chats.orderBy('lastAt').reverse().toArray();
        const withPeers = await Promise.all(chats.map(async (c: ChatRow) => ({ c, peer: await db.peers.get(c.peerId) as PeerRow | undefined })));
        setRows(withPeers.map(({ c, peer }) => ({
          id: c.id, name: peer?.name ?? 'Parceiro', avatar: peer?.avatar ?? 'ball', favTeam: peer?.favTeam ?? 'BRA',
          last: c.lastBody.replace(/\n/g, ' ') || 'Combine sua troca.', unread: c.unread,
        })));
      }
    })();
  }, [backend]);

  return (
    <div className="space-y-3">
      <h1 className="font-display font-800 text-3xl mb-1 uppercase tracking-wide">Conversas</h1>
      {rows.length === 0 ? (
        <EmptyState icon="chat" title="Nenhuma conversa" hint="Vá em Trocar e combine uma troca para começar a conversar." />
      ) : (
        rows.map((c) => {
          const t = getTeam(c.favTeam);
          return (
            <Card key={c.id} onClick={() => nav(`/chat/${c.id}`)} className="p-3 flex items-center gap-3">
              <Avatar avatar={c.avatar} size={48} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display font-800 uppercase">{c.name}</p>
                  {t && <TeamBadge code={t.code} size="sm" />}
                </div>
                <p className="truncate text-sm font-600 text-ink-soft">{c.last}</p>
              </div>
              {!!c.unread && c.unread > 0 && (
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-gold-500 px-1.5 text-xs font-800 text-navy-900 tnum">{c.unread}</span>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
