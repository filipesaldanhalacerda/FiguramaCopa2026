import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, statsFromCounts, countsToMap } from '../../lib/store';
import { db, type PeerRow } from '../../lib/db';
import { computeMatches, computeWishlist } from '../../lib/match';
import { getTeam, FUN_FACTS, FIXTURES, TOURNAMENT } from '../../data/worldcup2026';
import { Card, ProgressRing, Button } from '../../components/ui';
import { Icon } from '../../components/icons';
import { Avatar, TeamBadge } from '../../components/team';
import { motion } from 'framer-motion';

export default function Home() {
  const profile = useStore((s) => s.profile)!;
  const counts = useStore((s) => s.counts);
  const stats = useMemo(() => statsFromCounts(counts), [counts]);
  const [peers, setPeers] = useState<PeerRow[]>([]);
  const nav = useNavigate();
  const favTeam = getTeam(profile.favTeam);

  useEffect(() => { db.peers.toArray().then(setPeers); }, []);

  const matches = useMemo(() => {
    const mine = countsToMap(counts);
    const mutual = computeMatches(mine, peers);
    if (mutual.length) return mutual.map((m) => ({ peer: m.peer, n: m.iGet.length, kind: 'troca' as const }));
    return computeWishlist(mine, peers).slice(0, 6).map((w) => ({ peer: w.peer, n: w.iGet.length, kind: 'tem' as const }));
  }, [counts, peers]);

  const nextFixture = useMemo(
    () => FIXTURES.find((f) => f.home === profile.favTeam || f.away === profile.favTeam) ?? FIXTURES[0],
    [profile.favTeam],
  );
  const fact = useMemo(() => FUN_FACTS[new Date().getDate() % FUN_FACTS.length], []);

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <Avatar color={profile.avatar} size={48} />
        <div className="flex-1">
          <p className="text-ink-soft font-600 leading-none text-sm">Bem-vindo de volta</p>
          <h1 className="font-display font-800 text-2xl leading-tight uppercase tracking-wide">{profile.displayName}</h1>
        </div>
        {favTeam && <TeamBadge code={favTeam.code} />}
      </header>

      {/* progresso */}
      <Card className="p-5 flex items-center gap-5">
        <ProgressRing percent={stats.percent}>
          <div className="text-center">
            <div className="font-display font-800 text-2xl text-brand-600 leading-none tnum">{stats.percent}%</div>
            <div className="text-[11px] font-600 text-ink-soft uppercase">do álbum</div>
          </div>
        </ProgressRing>
        <div className="flex-1">
          <p className="font-display font-800 text-lg uppercase tracking-wide">Sua coleção</p>
          <div className="mt-2 grid grid-cols-3 gap-1 text-center">
            <Stat n={stats.have} label="tem" color="var(--color-have)" />
            <Stat n={stats.dupes} label="repetidas" color="var(--color-dupe)" />
            <Stat n={stats.missing} label="faltam" color="var(--color-ink-soft)" />
          </div>
        </div>
      </Card>

      {/* atalhos */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => nav('/album')} className="!justify-start"><Icon name="album" size={20} /> Marcar</Button>
        <Button variant="navy" onClick={() => nav('/trocar')} className="!justify-start"><Icon name="swap" size={20} /> Trocas</Button>
      </div>

      {/* atalho: repetidas pra trocar */}
      {stats.dupes > 0 && (
        <Card onClick={() => nav('/trocar/lista')} className="p-4 flex items-center gap-3 border-l-4 border-l-gold-400">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-gold-100 text-gold-600"><Icon name="swap" size={20} /></span>
          <div className="flex-1">
            <p className="font-display font-800 tnum">{stats.dupes} repetidas pra trocar</p>
            <p className="text-sm font-600 text-ink-soft">Veja organizadas por seleção</p>
          </div>
          <Icon name="forward" size={18} className="text-ink-soft" />
        </Card>
      )}

      {/* parceiros */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-800 text-xl uppercase tracking-wide">Parceiros pra você</h2>
          <button className="font-700 text-brand-600 text-sm" onClick={() => nav('/trocar')}>ver todos</button>
        </div>
        {matches.length === 0 ? (
          <Card className="p-4 text-ink-soft font-600">Marque o que você tem e o que falta para acharmos trocas.</Card>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {matches.map((m) => {
              const t = getTeam(m.peer.favTeam);
              return (
                <motion.button whileTap={{ scale: 0.96 }} key={m.peer.id} onClick={() => nav('/trocar')}
                  className="min-w-[160px] rounded-[var(--radius-card)] bg-paper border-2 border-line p-4 text-left shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between">
                    <Avatar color={m.peer.avatar} size={40} />
                    {t && <TeamBadge code={t.code} size="sm" />}
                  </div>
                  <div className="font-display font-800 mt-2 uppercase">{m.peer.name}</div>
                  <p className="text-sm text-ink-soft font-600 mt-0.5">
                    {m.kind === 'troca' ? `${m.n} pra trocar com você` : `tem ${m.n} que te faltam`}
                  </p>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>

      {/* próximo jogo */}
      <section>
        <h2 className="font-display font-800 text-xl mb-2 uppercase tracking-wide">Fique de olho na Copa</h2>
        <Card className="p-4" onClick={() => nav('/copa/jogos')}>
          <div className="flex items-center justify-between">
            <TeamLine code={nextFixture.home} />
            <div className="text-center px-2">
              <div className="font-display font-800 text-ink-soft">VS</div>
              <div className="text-[11px] font-600 text-ink-soft">Grupo {nextFixture.group}</div>
            </div>
            <TeamLine code={nextFixture.away} align="right" />
          </div>
        </Card>
      </section>

      {/* curiosidade */}
      <Card className="p-4 border-l-4 border-l-gold-400">
        <p className="font-700 text-xs text-gold-600 uppercase tracking-widest">Você sabia?</p>
        <p className="font-600 mt-1">{fact}</p>
      </Card>

      <p className="text-center text-xs text-ink-soft tnum">
        {fmt(TOURNAMENT.start)} – {fmt(TOURNAMENT.end)} · 48 seleções · 12 grupos
      </p>
    </div>
  );
}

const fmt = (d: string) => d.split('-').reverse().join('/');

function Stat({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div>
      <div className="font-display font-800 text-lg tnum" style={{ color }}>{n}</div>
      <div className="text-[10px] font-700 text-ink-soft uppercase">{label}</div>
    </div>
  );
}

function TeamLine({ code, align = 'left' }: { code: string; align?: 'left' | 'right' }) {
  const t = getTeam(code)!;
  return (
    <div className={`flex flex-1 items-center gap-2 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      <TeamBadge code={code} />
      <span className="font-700 text-sm leading-tight">{t.name}</span>
    </div>
  );
}
