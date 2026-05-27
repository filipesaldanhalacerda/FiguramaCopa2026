import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GROUPS, TOURNAMENT, getTeam } from '../../data/worldcup2026';
import { useStore } from '../../lib/store';
import { Card } from '../../components/ui';
import { Icon, type IconName } from '../../components/icons';
import { TeamBadge } from '../../components/team';
import { motion } from 'framer-motion';

export default function Copa() {
  const nav = useNavigate();
  const favCode = useStore((s) => s.profile?.favTeam);
  const fav = favCode ? getTeam(favCode) : undefined;

  const days = useMemo(
    () => Math.max(0, Math.ceil((new Date(TOURNAMENT.start).getTime() - Date.now()) / 86400000)),
    [],
  );
  const op = TOURNAMENT.opener;
  const fmt = (d: string) => d.split('-').reverse().slice(0, 2).join('/');

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display font-800 text-3xl uppercase tracking-wide">Copa 2026</h1>
        <p className="text-ink-soft font-600">Grupos, seleções, jogos e curiosidades.</p>
      </header>

      {/* HERO contagem regressiva (div próprio para não conflitar com o Card) */}
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-navy-800 p-5 text-white shadow-[var(--shadow-card)]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-500/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-gold-500/25 blur-2xl" />
        <p className="font-700 text-[11px] uppercase tracking-widest text-gold-400">Contagem regressiva</p>
        {days > 0 ? (
          <div className="mt-1 flex items-end gap-2">
            <span className="font-display font-800 text-6xl leading-none tnum">{days}</span>
            <span className="mb-1.5 font-700 text-white/80">{days === 1 ? 'dia para a Copa' : 'dias para a Copa'}</span>
          </div>
        ) : (
          <p className="mt-1 font-display font-800 text-4xl uppercase">Acontecendo agora</p>
        )}
        <p className="mt-2 font-600 text-white/85 text-sm">{TOURNAMENT.hosts.join('  ·  ')}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {['48 seleções', '12 grupos', '104 jogos'].map((s) => (
            <span key={s} className="rounded-full bg-white/12 px-2.5 py-1 text-xs font-700">{s}</span>
          ))}
        </div>
      </div>

      {/* jogo de abertura */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-700 uppercase tracking-widest text-gold-600">Jogo de abertura</p>
          <span className="text-xs font-700 text-ink-soft tnum">{fmt(op.date)}</span>
        </div>
        <div className="flex items-center justify-between">
          <OpenTeam code={op.home} />
          <div className="px-2 text-center">
            <div className="font-display font-800 text-ink-soft">VS</div>
          </div>
          <OpenTeam code={op.away} align="right" />
        </div>
        <p className="mt-3 text-center text-xs font-600 text-ink-soft">{op.venue}</p>
      </Card>

      {/* seu time */}
      {fav && (
        <Card onClick={() => nav(`/copa/time/${fav.code}`)} className="p-4 flex items-center gap-3">
          <TeamBadge code={fav.code} size="lg" />
          <div className="flex-1">
            <p className="text-[11px] font-700 uppercase tracking-widest text-brand-600">Seu time</p>
            <p className="font-display font-800 text-lg uppercase leading-none">{fav.name}</p>
            <p className="text-xs font-600 text-ink-soft mt-0.5">Grupo {fav.group} · {fav.confed}</p>
          </div>
          <Icon name="forward" size={18} className="text-ink-soft" />
        </Card>
      )}

      {/* atalhos */}
      <div className="grid grid-cols-2 gap-3">
        <Shortcut icon="calendar" label="Calendário" onClick={() => nav('/copa/jogos')} color="var(--color-sky-fest)" />
        <Shortcut icon="bulb" label="Quiz da Copa" onClick={() => nav('/copa/quiz')} color="var(--color-gold-500)" />
      </div>

      {/* grupos */}
      <section>
        <h2 className="font-display font-800 text-xl mb-3 uppercase tracking-wide">Os 12 grupos</h2>
        <div className="space-y-3">
          {GROUPS.map((g) => (
            <Card key={g.id} onClick={() => nav(`/copa/grupo/${g.id}`)} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-800 text-lg uppercase">Grupo {g.id}</span>
                <Icon name="forward" size={16} className="text-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {g.teams.map((code) => (
                  <div key={code} className="flex items-center gap-2 min-w-0">
                    <TeamBadge code={code} size="sm" />
                    <span className="text-sm font-700 truncate">{getTeam(code)?.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function OpenTeam({ code, align = 'left' }: { code: string; align?: 'left' | 'right' }) {
  const t = getTeam(code)!;
  return (
    <div className={`flex flex-1 items-center gap-2 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      <TeamBadge code={code} size="md" />
      <span className="font-700 text-sm leading-tight">{t.name}</span>
    </div>
  );
}

function Shortcut({ icon, label, onClick, color }: { icon: IconName; label: string; onClick: () => void; color: string }) {
  return (
    <motion.button whileTap={{ scale: 0.96 }} onClick={onClick}
      className="rounded-[var(--radius-card)] p-4 text-white text-left shadow-[var(--shadow-card)]" style={{ backgroundColor: color }}>
      <Icon name={icon} size={26} />
      <div className="font-display font-800 text-lg mt-2 uppercase tracking-wide">{label}</div>
    </motion.button>
  );
}
