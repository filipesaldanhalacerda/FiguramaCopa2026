import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, statsFromCounts, countsToMap } from '../../lib/store';
import { db } from '../../lib/db';
import { computeMatches, computeWishlist } from '../../lib/match';
import { getTeam, FUN_FACTS, FIXTURES, TOURNAMENT } from '../../data/worldcup2026';
import { Card, ProgressRing } from '../../components/ui';
import { Icon, type IconName } from '../../components/icons';
import { Avatar, TeamBadge } from '../../components/team';
import { isBackendEnabled } from '../../lib/supabase';
import { fetchMatches } from '../../lib/backend';
import { motion } from 'framer-motion';

interface HomeCard { id: string; name: string; avatar: string; favTeam: string; n: number; kind: 'troca' | 'tem' }

export default function Home() {
  const profile = useStore((s) => s.profile)!;
  const counts = useStore((s) => s.counts);
  const stats = useMemo(() => statsFromCounts(counts), [counts]);
  const [matches, setMatches] = useState<HomeCard[]>([]);
  const nav = useNavigate();
  const favTeam = getTeam(profile.favTeam);

  useEffect(() => {
    let alive = true;
    if (isBackendEnabled) {
      fetchMatches().then((rows) => {
        if (!alive) return;
        setMatches(rows.slice(0, 8).map((r) => ({
          id: r.partner_id, name: r.partner_slug, avatar: r.avatar, favTeam: r.fav_team,
          n: Math.max(r.i_get, r.i_give), kind: r.i_get > 0 && r.i_give > 0 ? 'troca' : 'tem',
        })));
      });
    } else {
      db.peers.toArray().then((peers) => {
        if (!alive) return;
        const mine = countsToMap(counts);
        const mutual = computeMatches(mine, peers);
        const list: HomeCard[] = mutual.length
          ? mutual.map((m) => ({ id: m.peer.id, name: m.peer.name, avatar: m.peer.avatar, favTeam: m.peer.favTeam, n: m.iGet.length, kind: 'troca' }))
          : computeWishlist(mine, peers).slice(0, 6).map((w) => ({ id: w.peer.id, name: w.peer.name, avatar: w.peer.avatar, favTeam: w.peer.favTeam, n: w.iGet.length, kind: 'tem' }));
        setMatches(list);
      });
    }
    return () => { alive = false; };
  }, [counts]);

  const nextFixture = useMemo(
    () => FIXTURES.find((f) => f.home === profile.favTeam || f.away === profile.favTeam) ?? FIXTURES[0],
    [profile.favTeam],
  );
  const fact = useMemo(() => FUN_FACTS[new Date().getDate() % FUN_FACTS.length], []);
  const days = Math.max(0, Math.ceil((new Date(TOURNAMENT.start).getTime() - Date.now()) / 86400000));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const progressMsg = stats.have === 0
    ? 'Bora começar seu álbum!'
    : stats.percent >= 100 ? 'Álbum completo. Você é craque!' : `Faltam ${stats.missing} figurinhas`;

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <Avatar avatar={profile.avatar} size={48} />
        <div className="flex-1 min-w-0">
          <p className="text-ink-soft font-600 leading-none text-sm">{greeting},</p>
          <h1 className="font-display font-800 text-2xl leading-tight uppercase tracking-wide truncate">{profile.displayName}</h1>
        </div>
        {favTeam && <TeamBadge code={favTeam.code} size="md" />}
      </header>

      {/* contagem regressiva */}
      <button onClick={() => nav('/copa')}
        className="w-full flex items-center gap-3 rounded-[var(--radius-card)] bg-navy-800 text-white px-4 py-3 shadow-[var(--shadow-card)] active:brightness-110">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold-500 text-navy-900"><Icon name="trophy" size={18} /></span>
        <div className="flex-1 text-left">
          <p className="font-display font-800 leading-none uppercase tnum">{days > 0 ? `Faltam ${days} dias` : 'A Copa começou!'}</p>
          <p className="text-xs font-600 text-white/70">Copa do Mundo 2026</p>
        </div>
        <Icon name="forward" size={18} className="text-white/60" />
      </button>

      {/* progresso (toca pra ir ao álbum) */}
      <Card onClick={() => nav('/album')} className="p-5 flex items-center gap-5">
        <ProgressRing percent={stats.percent} size={96}>
          <div className="text-center">
            <div className="font-display font-800 text-xl text-brand-600 leading-none tnum">{stats.percent}%</div>
          </div>
        </ProgressRing>
        <div className="flex-1">
          <p className="font-display font-800 text-lg uppercase tracking-wide leading-none">Seu álbum</p>
          <p className="text-sm font-600 text-ink-soft mt-1">{progressMsg}</p>
          <div className="mt-3 grid grid-cols-3 gap-1 text-center">
            <Stat n={stats.have} label="tenho" color="var(--color-have)" />
            <Stat n={stats.dupes} label="repetidas" color="var(--color-dupe)" />
            <Stat n={stats.missing} label="faltam" color="var(--color-ink-soft)" />
          </div>
        </div>
      </Card>

      {/* ações principais */}
      <div className="grid grid-cols-2 gap-3">
        <ActionTile icon="album" label="Marcar figurinhas" color="#0b7a4b" onClick={() => nav('/album')} />
        <ActionTile icon="swap" label="Achar trocas" color="#16203f" onClick={() => nav('/trocar')} />
      </div>

      {/* repetidas pra trocar */}
      {stats.dupes > 0 && (
        <Card onClick={() => nav('/trocar/lista')} className="p-4 flex items-center gap-3 border-l-4 border-l-gold-400">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-gold-100 text-gold-600"><Icon name="stack" size={20} /></span>
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
          <h2 className="font-display font-800 text-xl uppercase tracking-wide">Trocas pra você</h2>
          <button className="font-700 text-brand-600 text-sm" onClick={() => nav('/trocar')}>ver todas</button>
        </div>
        {matches.length === 0 ? (
          <Card className="p-4 text-ink-soft font-600">Marque o que você tem e o que falta para acharmos trocas.</Card>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {matches.map((m) => {
              const t = getTeam(m.favTeam);
              return (
                <motion.button whileTap={{ scale: 0.96 }} key={m.id} onClick={() => nav('/trocar')}
                  className="w-[158px] shrink-0 rounded-[var(--radius-card)] bg-paper border-2 border-line p-4 text-left shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between">
                    <Avatar avatar={m.avatar} size={40} />
                    {t && <TeamBadge code={t.code} size="sm" />}
                  </div>
                  <div className="font-display font-800 mt-2 uppercase truncate">{m.name}</div>
                  <p className="text-sm text-ink-soft font-600 mt-0.5 leading-tight">
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
        <h2 className="font-display font-800 text-xl mb-2 uppercase tracking-wide">
          {nextFixture.home === profile.favTeam || nextFixture.away === profile.favTeam ? 'Jogo do seu time' : 'Fique de olho na Copa'}
        </h2>
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
    </div>
  );
}

function Stat({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div>
      <div className="font-display font-800 text-lg tnum" style={{ color }}>{n}</div>
      <div className="text-[10px] font-700 text-ink-soft uppercase">{label}</div>
    </div>
  );
}

function ActionTile({ icon, label, color, onClick }: { icon: IconName; label: string; color: string; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.96 }} onClick={onClick}
      className="flex flex-col gap-3 rounded-[var(--radius-card)] p-4 text-left text-white shadow-[var(--shadow-card)]"
      style={{ backgroundColor: color }}>
      <Icon name={icon} size={26} />
      <span className="font-display font-800 text-base uppercase tracking-wide leading-tight">{label}</span>
    </motion.button>
  );
}

function TeamLine({ code, align = 'left' }: { code: string; align?: 'left' | 'right' }) {
  const t = getTeam(code)!;
  return (
    <div className={`flex flex-1 items-center gap-2 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      <TeamBadge code={code} size="md" />
      <span className="font-700 text-sm leading-tight">{t.name}</span>
    </div>
  );
}
