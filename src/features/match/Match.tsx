import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, countsToMap } from '../../lib/store';
import { db, type PeerRow } from '../../lib/db';
import { computeMatches, computeWishlist, matchQuality, proposeTrade, type MatchResult } from '../../lib/match';
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
    const p = proposeTrade(m);
    const chatId = await ensureChat(m.peer);
    await sendMessage(chatId, tradeSummary(p.give, p.get));
    nav(`/chat/${chatId}`);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="font-display font-800 text-3xl uppercase tracking-wide">Trocar</h1>
        <Button variant="soft" onClick={() => nav('/trocar/lista')}><Icon name="stack" size={18} /> Pra trocar</Button>
      </header>

      <p className="text-ink-soft font-600 -mt-1">
        Trocas justas: você dá a mesma quantidade que recebe. Marque mais repetidas para trocas maiores.
      </p>

      {matches.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display font-800 text-xl uppercase tracking-wide">Trocas justas</h2>
          {matches.map((m) => {
            const q = matchQuality(m);
            const p = proposeTrade(m);
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

                {/* troca justa em destaque */}
                <div className="mt-3 rounded-xl bg-brand-50 px-4 py-3 text-center">
                  <p className="font-display font-800 text-xl text-brand-700 tnum">
                    Troca justa: {p.size} por {p.size}
                  </p>
                  <p className="text-sm font-600 text-ink-soft mt-0.5">
                    {m.peer.name} tem {m.iGet.length} que te faltam
                  </p>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button variant="soft" className="flex-1" onClick={() => setOpen(m)}>Ver figurinhas</Button>
                  <Button className="flex-1" onClick={() => startTrade(m)}>Propor troca</Button>
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
              Dica: marque suas <b>repetidas</b> no álbum (toque no +) para desbloquear trocas justas.
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

      {/* detalhe da troca (equilibrada) */}
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? `Troca com ${open.peer.name}` : ''}>
        {open && <TradeDetail m={open} onConfirm={() => { startTrade(open); setOpen(null); }} />}
      </Sheet>
    </div>
  );
}

function TradeDetail({ m, onConfirm }: { m: MatchResult; onConfirm: () => void }) {
  const p = proposeTrade(m);
  return (
    <div className="space-y-4">
      <p className="text-center font-display font-800 text-xl text-brand-700">Troca justa: {p.size} por {p.size}</p>
      <TradeColumn title="Você dá" color="var(--color-sky-fest)" stickers={p.give} />
      <TradeColumn title="Você recebe" color="var(--color-have)" stickers={p.get} />
      {p.moreGet > 0 && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-600 text-brand-700">
          {m.peer.name} ainda tem <b>{p.moreGet}</b> que te faltam. Combinem mais trocas no chat!
        </p>
      )}
      <Button full size="lg" onClick={onConfirm}>Propor esta troca</Button>
    </div>
  );
}

function TradeColumn({ title, color, stickers }: { title: string; color: string; stickers: { id: number; code: string }[] }) {
  return (
    <div>
      <p className="font-700 mb-2 uppercase tracking-wide text-sm" style={{ color }}>{title} ({stickers.length})</p>
      <div className="flex flex-wrap gap-2">
        {stickers.map((s) => (
          <span key={s.id} className="rounded-md border-2 px-2.5 py-1 font-700 text-sm tnum" style={{ borderColor: color, color }}>
            {s.code}
          </span>
        ))}
        {stickers.length === 0 && <span className="text-ink-soft font-600">nenhuma</span>}
      </div>
    </div>
  );
}
