import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, countsToMap } from '../../lib/store';
import { db, type PeerRow } from '../../lib/db';
import { computeMatches, computeWishlist, matchQuality, type MatchResult } from '../../lib/match';
import { getTeam } from '../../data/worldcup2026';
import { Card, Pill, Button, Sheet, EmptyState } from '../../components/ui';
import { ensureChat, sendMessage, tradeSummary } from '../../lib/chat';
import { motion } from 'framer-motion';

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
        <h1 className="font-display font-800 text-3xl">Trocar 🔁</h1>
        <Button variant="soft" onClick={() => nav('/trocar/lista')}>📋 Minha lista</Button>
      </header>

      <p className="text-ink-soft font-600 -mt-1">
        Achamos quem combina com a sua coleção. Quanto mais você marca, melhores as trocas! ✨
      </p>

      {/* trocas perfeitas (mútuas) */}
      {matches.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display font-800 text-xl">Trocas perfeitas 🤝</h2>
          {matches.map((m) => {
            const q = matchQuality(m);
            const t = getTeam(m.peer.favTeam);
            return (
              <Card key={m.peer.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-3xl">{m.peer.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-800 text-lg">{m.peer.name} {t?.flag}</span>
                      <Pill color={q.color}>{q.emoji} {q.label}</Pill>
                    </div>
                    {m.peer.city && <p className="text-xs text-ink-soft font-700">{m.peer.city}</p>}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-2xl bg-[var(--color-have)]/12 py-2">
                    <div className="font-display font-800 text-xl text-[var(--color-have)]">{m.iGet.length}</div>
                    <div className="text-[11px] font-700 text-ink-soft">vêm pra você</div>
                  </div>
                  <div className="rounded-2xl bg-[var(--color-sky-fest)]/12 py-2">
                    <div className="font-display font-800 text-xl text-[var(--color-sky-fest)]">{m.iGive.length}</div>
                    <div className="text-[11px] font-700 text-ink-soft">vão pra ele</div>
                  </div>
                </div>
                <p className="mt-3 text-center font-700">
                  {m.peer.name} tem <b className="text-[var(--color-have)]">{m.iGet.length}</b> que você precisa
                  {' '}e quer <b className="text-[var(--color-sky-fest)]">{m.iGive.length}</b> que você tem.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="soft" className="flex-1" onClick={() => setOpen(m)}>Ver figurinhas</Button>
                  <Button variant="primary" className="flex-1" onClick={() => startTrade(m)}>Trocar 🤝</Button>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      {/* descoberta: eles têm o que te falta */}
      {wishlist.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display font-800 text-xl">
            {matches.length ? 'Também têm o que te falta 👀' : 'Eles têm o que te falta 👀'}
          </h2>
          {matches.length === 0 && (
            <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-700 text-brand-700">
              💡 Marque suas <b>repetidas</b> no álbum pra desbloquear trocas perfeitas (vão e vêm)!
            </p>
          )}
          {wishlist.slice(0, 8).map((w) => {
            const t = getTeam(w.peer.favTeam);
            return (
              <Card key={w.peer.id} className="p-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-100 text-2xl">{w.peer.avatar}</div>
                <div className="flex-1">
                  <div className="font-display font-800">{w.peer.name} {t?.flag}</div>
                  <p className="text-sm font-700 text-ink-soft">tem <b className="text-[var(--color-have)]">{w.iGet.length}</b> que te faltam</p>
                </div>
                <Button variant="sky" onClick={async () => { const id = await ensureChat(w.peer); nav(`/chat/${id}`); }}>Conversar</Button>
              </Card>
            );
          })}
        </section>
      )}

      {matches.length === 0 && wishlist.length === 0 && (
        <EmptyState emoji="🔎" title="Ainda sem trocas" hint="Marque o que você tem e o que falta no Meu Álbum pra começar!" />
      )}

      {/* detalhe da troca */}
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? `Troca com ${open.peer.name}` : ''}>
        {open && (
          <div className="space-y-4">
            <TradeColumn title="Vêm pra você 🎁" color="var(--color-have)" stickers={open.iGet} />
            <TradeColumn title="Vão pra ele 📤" color="var(--color-sky-fest)" stickers={open.iGive} />
            <Button full size="lg" onClick={() => { startTrade(open); setOpen(null); }}>Combinar essa troca 🤝</Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function TradeColumn({ title, color, stickers }: { title: string; color: string; stickers: { id: number; label: string }[] }) {
  return (
    <div>
      <p className="font-800 mb-2" style={{ color }}>{title} ({stickers.length})</p>
      <div className="flex flex-wrap gap-2">
        {stickers.map((s) => (
          <motion.span key={s.id} whileTap={{ scale: 0.9 }}
            className="rounded-xl border-2 px-3 py-1.5 font-800 text-sm" style={{ borderColor: color, color }}>
            #{s.id}
          </motion.span>
        ))}
        {stickers.length === 0 && <span className="text-ink-soft font-700">nenhuma ainda</span>}
      </div>
    </div>
  );
}
