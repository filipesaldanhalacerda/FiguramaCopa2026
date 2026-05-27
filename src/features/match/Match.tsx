import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, countsToMap } from '../../lib/store';
import { db, type PeerRow } from '../../lib/db';
import { computeMatches, computeWishlist, matchQuality, type MatchResult } from '../../lib/match';
import { getTeam } from '../../data/worldcup2026';
import { Card, Button, Sheet, EmptyState } from '../../components/ui';
import { Icon } from '../../components/icons';
import { Avatar, TeamBadge } from '../../components/team';
import { ensureChat, sendMessage, tradeSummary } from '../../lib/chat';

export default function Match() {
  const counts = useStore((s) => s.counts);
  const nav = useNavigate();
  const [peers, setPeers] = useState<PeerRow[]>([]);
  const [open, setOpen] = useState<MatchResult | null>(null);

  useEffect(() => { db.peers.toArray().then(setPeers); }, []);

  const mine = useMemo(() => countsToMap(counts), [counts]);
  const matches = useMemo(() => computeMatches(mine, peers), [mine, peers]);
  const wishlist = useMemo(() => computeWishlist(mine, peers), [mine, peers]);

  async function startTrade(m: MatchResult) {
    const chatId = await ensureChat(m.peer);
    await sendMessage(chatId, tradeSummary(m.iGet, m.iGive));
    nav(`/chat/${chatId}`);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="font-display font-800 text-3xl uppercase tracking-wide">Trocar</h1>
        <Button variant="soft" onClick={() => nav('/trocar/lista')}><Icon name="qr" size={18} /> Minha lista</Button>
      </header>

      <p className="text-ink-soft font-600 -mt-1">
        Encontramos quem combina com a sua coleção. Quanto mais você marca, melhores as trocas.
      </p>

      {matches.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display font-800 text-xl uppercase tracking-wide">Trocas perfeitas</h2>
          {matches.map((m) => {
            const q = matchQuality(m);
            const t = getTeam(m.peer.favTeam);
            return (
              <Card key={m.peer.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar color={m.peer.avatar} size={48} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-800 text-lg uppercase">{m.peer.name}</span>
                      {t && <TeamBadge code={t.code} size="sm" />}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5" style={{ color: q.color }}>
                      {Array.from({ length: q.stars }).map((_, i) => <Icon key={i} name="star" size={14} />)}
                      <span className="text-xs font-700 uppercase tracking-wide ml-1">{q.label}</span>
                    </div>
                    {m.peer.city && <p className="text-xs text-ink-soft font-600 mt-0.5">{m.peer.city}</p>}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-[var(--color-have)]/10 py-2">
                    <div className="font-display font-800 text-xl text-[var(--color-have)] tnum">{m.iGet.length}</div>
                    <div className="text-[11px] font-600 text-ink-soft uppercase">vêm pra você</div>
                  </div>
                  <div className="rounded-lg bg-[var(--color-sky-fest)]/10 py-2">
                    <div className="font-display font-800 text-xl text-[var(--color-sky-fest)] tnum">{m.iGive.length}</div>
                    <div className="text-[11px] font-600 text-ink-soft uppercase">vão pra ele</div>
                  </div>
                </div>
                <p className="mt-3 text-center font-600">
                  {m.peer.name} tem <b className="text-[var(--color-have)] tnum">{m.iGet.length}</b> que você precisa
                  {' '}e quer <b className="text-[var(--color-sky-fest)] tnum">{m.iGive.length}</b> que você tem.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="soft" className="flex-1" onClick={() => setOpen(m)}>Ver figurinhas</Button>
                  <Button className="flex-1" onClick={() => startTrade(m)}>Trocar</Button>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      {wishlist.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display font-800 text-xl uppercase tracking-wide">
            {matches.length ? 'Também têm o que te falta' : 'Eles têm o que te falta'}
          </h2>
          {matches.length === 0 && (
            <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm font-600 text-brand-700">
              Dica: marque suas <b>repetidas</b> no álbum para desbloquear trocas perfeitas (vão e vêm).
            </p>
          )}
          {wishlist.slice(0, 8).map((w) => {
            const t = getTeam(w.peer.favTeam);
            return (
              <Card key={w.peer.id} className="p-4 flex items-center gap-3">
                <Avatar color={w.peer.avatar} size={44} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-800 uppercase">{w.peer.name}</span>
                    {t && <TeamBadge code={t.code} size="sm" />}
                  </div>
                  <p className="text-sm font-600 text-ink-soft">tem <b className="text-[var(--color-have)] tnum">{w.iGet.length}</b> que te faltam</p>
                </div>
                <Button variant="navy" onClick={async () => { const id = await ensureChat(w.peer); nav(`/chat/${id}`); }}>Conversar</Button>
              </Card>
            );
          })}
        </section>
      )}

      {matches.length === 0 && wishlist.length === 0 && (
        <EmptyState icon="search" title="Ainda sem trocas" hint="Marque o que você tem e o que falta no Meu Álbum para começar." />
      )}

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? `Troca com ${open.peer.name}` : ''}>
        {open && (
          <div className="space-y-4">
            <TradeColumn title="Vêm pra você" color="var(--color-have)" stickers={open.iGet} />
            <TradeColumn title="Vão pra ele" color="var(--color-sky-fest)" stickers={open.iGive} />
            <Button full size="lg" onClick={() => { startTrade(open); setOpen(null); }}>Combinar essa troca</Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function TradeColumn({ title, color, stickers }: { title: string; color: string; stickers: { id: number }[] }) {
  return (
    <div>
      <p className="font-700 mb-2 uppercase tracking-wide text-sm" style={{ color }}>{title} ({stickers.length})</p>
      <div className="flex flex-wrap gap-2">
        {stickers.map((s) => (
          <span key={s.id} className="rounded-md border-2 px-2.5 py-1 font-700 text-sm tnum" style={{ borderColor: color, color }}>
            {s.id}
          </span>
        ))}
        {stickers.length === 0 && <span className="text-ink-soft font-600">nenhuma ainda</span>}
      </div>
    </div>
  );
}
