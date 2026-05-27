import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, statsFromCounts, countsToMap } from '../../lib/store';
import { db, type PeerRow } from '../../lib/db';
import { computeMatches, computeWishlist } from '../../lib/match';
import { getTeam, FUN_FACTS, FIXTURES, TOURNAMENT } from '../../data/worldcup2026';
import { Card, ProgressRing, Pill, Button } from '../../components/ui';
import { motion } from 'framer-motion';

export default function Home() {
  const profile = useStore((s) => s.profile)!;
  const counts = useStore((s) => s.counts);
  const stats = useMemo(() => statsFromCounts(counts), [counts]);
  const [peers, setPeers] = useState<PeerRow[]>([]);
  const nav = useNavigate();
  const favTeam = getTeam(profile.favTeam);

  useEffect(() => {
    db.peers.toArray().then(setPeers);
  }, []);

  const matches = useMemo(() => {
    const mine = countsToMap(counts);
    const mutual = computeMatches(mine, peers);
    if (mutual.length) return mutual.map((m) => ({ peer: m.peer, n: m.iGet.length, kind: 'troca' as const }));
    return computeWishlist(mine, peers).slice(0, 6).map((w) => ({ peer: w.peer, n: w.iGet.length, kind: 'tem' as const }));
  }, [counts, peers]);

  const nextFixture = useMemo(() => {
    return FIXTURES.find((f) => f.home === profile.favTeam || f.away === profile.favTeam) ?? FIXTURES[0];
  }, [profile.favTeam]);

  const fact = useMemo(() => FUN_FACTS[new Date().getDate() % FUN_FACTS.length], []);
  const homeT = getTeam(nextFixture.home);
  const awayT = getTeam(nextFixture.away);

  return (
    <div className="space-y-5">
      {/* saudação */}
      <header className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-3xl">{profile.avatar}</div>
        <div>
          <p className="text-ink-soft font-700 leading-none">Oi,</p>
          <h1 className="font-display font-800 text-2xl leading-tight">
            {profile.displayName} {favTeam?.flag}
          </h1>
        </div>
      </header>

      {/* progresso do álbum */}
      <Card className="p-5 flex items-center gap-5 bg-gradient-to-br from-brand-50 to-paper">
        <ProgressRing percent={stats.percent}>
          <div className="text-center">
            <div className="font-display font-800 text-2xl text-brand-600 leading-none">{stats.percent}%</div>
            <div className="text-[11px] font-700 text-ink-soft">do álbum</div>
          </div>
        </ProgressRing>
        <div className="flex-1">
          <p className="font-display font-800 text-lg">Seu álbum</p>
          <div className="mt-2 grid grid-cols-3 gap-1 text-center">
            <Stat n={stats.have} label="tem" color="var(--color-have)" />
            <Stat n={stats.dupes} label="repetidas" color="var(--color-dupe)" />
            <Stat n={stats.missing} label="faltam" color="var(--color-ink-soft)" />
          </div>
        </div>
      </Card>

      {/* atalhos */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="primary" onClick={() => nav('/album')} className="!justify-start !py-4">
          📒 Marcar figurinhas
        </Button>
        <Button variant="sky" onClick={() => nav('/trocar')} className="!justify-start !py-4">
          🤝 Achar trocas
        </Button>
      </div>

      {/* parceiros */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-800 text-xl">Parceiros pra você</h2>
          <button className="font-700 text-brand-600 text-sm" onClick={() => nav('/trocar')}>ver todos</button>
        </div>
        {matches.length === 0 ? (
          <Card className="p-4 text-ink-soft font-600">
            Marque o que você tem e o que falta pra gente achar trocas! 🔎
          </Card>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {matches.map((m) => {
              const t = getTeam(m.peer.favTeam);
              return (
                <motion.button whileTap={{ scale: 0.96 }} key={m.peer.id} onClick={() => nav('/trocar')}
                  className="min-w-[150px] rounded-[var(--radius-sticker)] bg-paper border-2 border-line p-4 text-left">
                  <div className="text-3xl">{m.peer.avatar}</div>
                  <div className="font-display font-800 mt-1">{m.peer.name} {t?.flag}</div>
                  <p className="text-sm text-ink-soft font-600 mt-0.5">
                    {m.kind === 'troca' ? `${m.n} pra trocar com você` : `tem ${m.n} que te faltam`}
                  </p>
                  <div className="mt-2"><Pill color="var(--color-sky-fest)">Trocar 🔁</Pill></div>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>

      {/* próximo jogo */}
      <section>
        <h2 className="font-display font-800 text-xl mb-2">Fique de olho na Copa 🏆</h2>
        <Card className="p-4" onClick={() => nav('/copa/jogos')}>
          <div className="flex items-center justify-between">
            <TeamMini flag={homeT?.flag} name={homeT?.name} />
            <div className="text-center px-2">
              <div className="font-display font-800 text-brand-600">VS</div>
              <div className="text-[11px] font-700 text-ink-soft">Grupo {nextFixture.group}</div>
            </div>
            <TeamMini flag={awayT?.flag} name={awayT?.name} />
          </div>
        </Card>
      </section>

      {/* curiosidade */}
      <Card className="p-4 bg-gradient-to-br from-[var(--color-gold)]/20 to-paper">
        <p className="font-800 text-sm text-brand-700">VOCÊ SABIA?</p>
        <p className="font-700 mt-1">{fact}</p>
      </Card>

      <p className="text-center text-xs text-ink-soft pt-1">
        {TOURNAMENT.start.split('-').reverse().join('/')} → {TOURNAMENT.end.split('-').reverse().join('/')} · 48 seleções
      </p>
    </div>
  );
}

function Stat({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div>
      <div className="font-display font-800 text-lg" style={{ color }}>{n}</div>
      <div className="text-[10px] font-700 text-ink-soft uppercase">{label}</div>
    </div>
  );
}

function TeamMini({ flag, name }: { flag?: string; name?: string }) {
  return (
    <div className="flex-1 text-center">
      <div className="text-4xl">{flag}</div>
      <div className="text-xs font-700 mt-1 leading-tight">{name}</div>
    </div>
  );
}
