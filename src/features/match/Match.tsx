import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, countsToMap } from '../../lib/store';
import { db, type PeerRow } from '../../lib/db';
import { computeMatches, computeWishlist, type MatchResult } from '../../lib/match';
import { getTeam } from '../../data/worldcup2026';
import { SECTIONS, getSticker, type Sticker } from '../../data/stickers';
import { Card, Button, Sheet, EmptyState } from '../../components/ui';
import { Icon } from '../../components/icons';
import { Avatar, TeamBadge } from '../../components/team';
import { ensureChat, sendMessage, tradeSummary } from '../../lib/chat';
import { isBackendEnabled } from '../../lib/supabase';
import {
  fetchMatches, fetchTradeStickers, getOrCreateChat, sendChatMessage, type BackendMatch,
} from '../../lib/backend';

function stars(balance: number) {
  if (balance >= 5) return { n: 3, label: 'Troca perfeita', color: 'var(--color-gold)' };
  if (balance >= 3) return { n: 2, label: 'Ótima troca', color: 'var(--color-sky-fest)' };
  return { n: 1, label: 'Boa troca', color: 'var(--color-brand-500)' };
}

function groupBySection(stickers: Sticker[]) {
  const map = new Map<string, Sticker[]>();
  for (const s of stickers) { const a = map.get(s.section) ?? []; a.push(s); map.set(s.section, a); }
  return SECTIONS.filter((sec) => map.has(sec.key)).map((sec) => ({ key: sec.key, title: sec.title, items: map.get(sec.key)! }));
}

export default function Match() {
  return isBackendEnabled ? <BackendMatch /> : <LocalMatch />;
}

/** Aviso quando o usuário não tem repetidas para oferecer numa troca. */
function NoDupesBanner() {
  const nav = useNavigate();
  return (
    <div className="rounded-lg bg-gold-100 border border-gold-300 px-4 py-3">
      <p className="flex items-center gap-2 text-sm font-700 text-navy-800">
        <Icon name="shield" size={16} className="text-gold-600" /> Você ainda não tem repetidas
      </p>
      <p className="text-sm font-600 text-navy-800/80 mt-1">
        Para <b>propor uma troca</b> você precisa ter figurinhas <b>repetidas</b>. Marque-as no álbum
        (toque no <b>+</b> da figurinha). Sem repetidas, dá só pra conversar.
      </p>
      <button onClick={() => nav('/album')} className="mt-2 font-700 text-brand-700">Ir marcar repetidas →</button>
    </div>
  );
}

/* ============================ MATCH REAL (backend) ======================== */

interface OpenTrade { id: string; name: string; avatar: string; favTeam: string; iGet: Sticker[]; iGive: Sticker[] }

function BackendMatch() {
  const nav = useNavigate();
  const counts = useStore((s) => s.counts); // re-render ao marcar
  const [rows, setRows] = useState<BackendMatch[] | null>(null);
  const [open, setOpen] = useState<OpenTrade | null>(null);

  useEffect(() => { fetchMatches().then(setRows); }, [counts]);

  async function montar(m: BackendMatch) {
    const { get, give } = await fetchTradeStickers(m.partner_id);
    setOpen({
      id: m.partner_id, name: m.partner_slug, avatar: m.avatar, favTeam: m.fav_team,
      iGet: get.map(getSticker).filter(Boolean) as Sticker[],
      iGive: give.map(getSticker).filter(Boolean) as Sticker[],
    });
  }

  async function conversar(id: string) {
    const cid = await getOrCreateChat(id);
    if (cid) nav(`/chat/${cid}`);
  }

  async function enviarProposta(t: OpenTrade, give: Sticker[], get: Sticker[]) {
    const cid = await getOrCreateChat(t.id);
    if (cid) { await sendChatMessage(cid, tradeSummary(give, get)); setOpen(null); nav(`/chat/${cid}`); }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="font-display font-800 text-3xl uppercase tracking-wide">Trocar</h1>
        <Button variant="soft" onClick={() => nav('/trocar/lista')}><Icon name="stack" size={18} /> Pra trocar</Button>
      </header>
      <p className="text-ink-soft font-600 -mt-1">Pessoas de verdade que combinam com a sua coleção.</p>

      {!Object.values(counts).some((c) => c >= 2) && <NoDupesBanner />}

      {rows === null && <p className="text-center text-ink-soft font-600 py-8">Procurando parceiros…</p>}

      {rows && rows.length === 0 && (
        <EmptyState icon="search" title="Ainda sem parceiros" hint="Marque o que você tem e o que falta — e convide amigos para o Figurama!" />
      )}

      {rows && rows.map((m) => {
        const q = stars(m.balance);
        const t = getTeam(m.fav_team);
        return (
          <Card key={m.partner_id} className="p-4">
            <div className="flex items-start gap-3">
              <Avatar avatar={m.avatar} size={48} />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-800 text-lg uppercase">{m.partner_slug}</span>
                  {t && <TeamBadge code={t.code} size="sm" />}
                </div>
                <div className="flex items-center gap-1 mt-0.5" style={{ color: q.color }}>
                  {Array.from({ length: q.n }).map((_, i) => <Icon key={i} name="star" size={14} />)}
                  <span className="text-xs font-700 uppercase tracking-wide ml-1">{q.label}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-[var(--color-have)]/10 py-2">
                <div className="font-display font-800 text-xl text-[var(--color-have)] tnum">{m.i_get}</div>
                <div className="text-[11px] font-600 text-ink-soft uppercase">ele tem que te faltam</div>
              </div>
              <div className="rounded-lg bg-[var(--color-sky-fest)]/10 py-2">
                <div className="font-display font-800 text-xl text-[var(--color-sky-fest)] tnum">{m.i_give}</div>
                <div className="text-[11px] font-600 text-ink-soft uppercase">suas que ele quer</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="soft" className="flex-1" onClick={() => conversar(m.partner_id)}>Conversar</Button>
              <Button className="flex-1" onClick={() => montar(m)}>Montar troca</Button>
            </div>
          </Card>
        );
      })}

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? `Montar troca com ${open.name}` : ''}>
        {open && <TradeBuilder iGet={open.iGet} iGive={open.iGive} onSend={(g, r) => enviarProposta(open, g, r)} />}
      </Sheet>
    </div>
  );
}

/* ============================ MATCH LOCAL (demo) ========================== */

function LocalMatch() {
  const counts = useStore((s) => s.counts);
  const nav = useNavigate();
  const [peers, setPeers] = useState<PeerRow[]>([]);
  const [open, setOpen] = useState<MatchResult | null>(null);

  useEffect(() => { db.peers.toArray().then(setPeers); }, []);
  const mine = useMemo(() => countsToMap(counts), [counts]);
  const matches = useMemo(() => computeMatches(mine, peers), [mine, peers]);
  const wishlist = useMemo(() => computeWishlist(mine, peers), [mine, peers]);

  async function startTrade(peer: PeerRow, give: Sticker[], get: Sticker[]) {
    const chatId = await ensureChat(peer);
    await sendMessage(chatId, tradeSummary(give, get));
    setOpen(null);
    nav(`/chat/${chatId}`);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="font-display font-800 text-3xl uppercase tracking-wide">Trocar</h1>
        <Button variant="soft" onClick={() => nav('/trocar/lista')}><Icon name="stack" size={18} /> Pra trocar</Button>
      </header>
      <p className="text-ink-soft font-600 -mt-1">Você escolhe quais figurinhas quer dar e receber.</p>

      {!Object.values(counts).some((c) => c >= 2) && <NoDupesBanner />}

      {matches.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display font-800 text-xl uppercase tracking-wide">Combinam com você</h2>
          {matches.map((m) => {
            const q = stars(m.balance);
            const t = getTeam(m.peer.favTeam);
            return (
              <Card key={m.peer.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar avatar={m.peer.avatar} size={48} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-800 text-lg uppercase">{m.peer.name}</span>
                      {t && <TeamBadge code={t.code} size="sm" />}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5" style={{ color: q.color }}>
                      {Array.from({ length: q.n }).map((_, i) => <Icon key={i} name="star" size={14} />)}
                      <span className="text-xs font-700 uppercase tracking-wide ml-1">{q.label}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-[var(--color-have)]/10 py-2">
                    <div className="font-display font-800 text-xl text-[var(--color-have)] tnum">{m.iGet.length}</div>
                    <div className="text-[11px] font-600 text-ink-soft uppercase">ele tem que te faltam</div>
                  </div>
                  <div className="rounded-lg bg-[var(--color-sky-fest)]/10 py-2">
                    <div className="font-display font-800 text-xl text-[var(--color-sky-fest)] tnum">{m.iGive.length}</div>
                    <div className="text-[11px] font-600 text-ink-soft uppercase">suas que ele quer</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="soft" className="flex-1" onClick={async () => { const id = await ensureChat(m.peer); nav(`/chat/${id}`); }}>Conversar</Button>
                  <Button className="flex-1" onClick={() => setOpen(m)}>Montar troca</Button>
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
              Dica: marque suas <b>repetidas</b> no álbum (toque no +) para montar trocas justas.
            </p>
          )}
          {wishlist.slice(0, 8).map((w) => {
            const t = getTeam(w.peer.favTeam);
            return (
              <Card key={w.peer.id} className="p-4 flex items-center gap-3">
                <Avatar avatar={w.peer.avatar} size={44} />
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

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? `Montar troca com ${open.peer.name}` : ''}>
        {open && <TradeBuilder iGet={open.iGet} iGive={open.iGive} onSend={(g, r) => startTrade(open.peer, g, r)} />}
      </Sheet>
    </div>
  );
}

/* ============================ CONSTRUTOR DE TROCA ========================= */

function TradeBuilder({ iGet, iGive, onSend }: { iGet: Sticker[]; iGive: Sticker[]; onSend: (give: Sticker[], get: Sticker[]) => void }) {
  const [giveSel, setGiveSel] = useState<Set<number>>(new Set());
  const [getSel, setGetSel] = useState<Set<number>>(new Set());
  const giveGroups = useMemo(() => groupBySection(iGive), [iGive]);
  const getGroups = useMemo(() => groupBySection(iGet), [iGet]);

  const toggle = (sel: Set<number>, set: (s: Set<number>) => void, id: number) => {
    const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); set(n);
  };
  function suggestFair() {
    const k = Math.min(iGive.length, iGet.length, 10);
    setGiveSel(new Set(iGive.slice(0, k).map((s) => s.id)));
    setGetSel(new Set(iGet.slice(0, k).map((s) => s.id)));
  }
  const canSend = giveSel.size > 0 && getSel.size > 0;
  const balanced = giveSel.size === getSel.size;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-600 text-ink-soft text-sm">Toque para escolher os dois lados.</p>
        <button onClick={suggestFair} className="shrink-0 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-700 text-brand-700 border border-brand-100">Sugerir troca justa</button>
      </div>
      <SelectBlock title="Você dá" subtitle="suas repetidas que ele precisa" color="var(--color-sky-fest)" groups={giveGroups} sel={giveSel} onToggle={(id) => toggle(giveSel, setGiveSel, id)}
        emptyHint="Você não tem repetidas que ele precisa. Marque repetidas no álbum (toque no +) para poder oferecer." />
      <SelectBlock title="Você recebe" subtitle="o que ele tem e te falta" color="var(--color-have)" groups={getGroups} sel={getSel} onToggle={(id) => toggle(getSel, setGetSel, id)} />
      <div className="sticky bottom-0 -mx-5 bg-cream px-5 pt-3 pb-1 border-t-2 border-line">
        <div className="flex items-center justify-center gap-3 mb-1 font-700">
          <span style={{ color: 'var(--color-sky-fest)' }} className="tnum">Você dá {giveSel.size}</span>
          <span className="text-ink-soft">·</span>
          <span style={{ color: 'var(--color-have)' }} className="tnum">Você recebe {getSel.size}</span>
        </div>
        {!balanced && canSend && <p className="text-center text-xs font-700 text-[var(--color-dupe)] mb-2">Troca justa é a mesma quantidade dos dois lados.</p>}
        <Button full size="lg" disabled={!canSend}
          onClick={() => onSend(iGive.filter((s) => giveSel.has(s.id)), iGet.filter((s) => getSel.has(s.id)))}>
          {canSend ? `Enviar proposta (${giveSel.size} por ${getSel.size})` : 'Escolha figurinhas dos dois lados'}
        </Button>
      </div>
    </div>
  );
}

function SelectBlock({ title, subtitle, color, groups, sel, onToggle, emptyHint }: {
  title: string; subtitle: string; color: string;
  groups: { key: string; title: string; items: Sticker[] }[];
  sel: Set<number>; onToggle: (id: number) => void; emptyHint?: string;
}) {
  return (
    <div>
      <p className="font-700 uppercase tracking-wide text-sm" style={{ color }}>{title}</p>
      <p className="text-xs text-ink-soft font-600 mb-2">{subtitle}</p>
      {groups.length === 0 ? (
        <p className="rounded-lg bg-page px-3 py-2 text-sm font-600 text-ink-soft">{emptyHint ?? 'nenhuma figurinha aqui'}</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1 rounded-lg bg-page p-2">
          {groups.map((g) => (
            <div key={g.key}>
              <div className="flex items-center gap-1.5 mb-1">
                {g.key === 'especiais' ? <Icon name="star" size={14} className="text-gold-500" /> : <TeamBadge code={g.key} size="sm" />}
                <span className="text-[11px] font-700 uppercase text-ink-soft">{g.title}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((s) => {
                  const on = sel.has(s.id);
                  return (
                    <button key={s.id} onClick={() => onToggle(s.id)}
                      className="rounded-md border-2 px-2 py-0.5 text-sm font-700 tnum transition-colors"
                      style={on ? { background: color, borderColor: color, color: '#fff' } : { borderColor: 'var(--color-line)', color: 'var(--color-ink-soft)', background: '#fff' }}>
                      {s.code}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
