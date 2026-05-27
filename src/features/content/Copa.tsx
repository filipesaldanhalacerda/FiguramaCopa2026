import { useNavigate } from 'react-router-dom';
import { GROUPS, TOURNAMENT } from '../../data/worldcup2026';
import { Card } from '../../components/ui';
import { Icon, type IconName } from '../../components/icons';
import { TeamBadge } from '../../components/team';
import { motion } from 'framer-motion';

export default function Copa() {
  const nav = useNavigate();
  const daysToGo = Math.max(0, Math.ceil((new Date(TOURNAMENT.start).getTime() - Date.now()) / 86400000));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display font-800 text-3xl uppercase tracking-wide">Copa 2026</h1>
        <p className="text-ink-soft font-600">Grupos, seleções, jogos e curiosidades.</p>
      </header>

      <Card className="p-5 bg-navy-800 text-white border-navy-800 overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-1.5 bg-gold-500" />
        <p className="font-700 text-xs text-gold-400 uppercase tracking-widest">Contagem regressiva</p>
        <p className="font-display font-800 text-3xl uppercase">{daysToGo > 0 ? `Faltam ${daysToGo} dias` : 'É hoje'}</p>
        <p className="font-600 mt-1 text-white/85 text-sm">{TOURNAMENT.hosts.join(' · ')}</p>
        <div className="mt-2 flex gap-2 text-sm font-700 text-white/90">
          <span>48 seleções</span><span className="text-white/40">·</span><span>12 grupos</span><span className="text-white/40">·</span><span>104 jogos</span>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Shortcut icon="calendar" label="Calendário" onClick={() => nav('/copa/jogos')} color="var(--color-sky-fest)" />
        <Shortcut icon="bulb" label="Quiz da Copa" onClick={() => nav('/copa/quiz')} color="var(--color-gold-500)" />
      </div>

      <section>
        <h2 className="font-display font-800 text-xl mb-3 uppercase tracking-wide">Os 12 grupos</h2>
        <div className="grid grid-cols-2 gap-3">
          {GROUPS.map((g) => (
            <Card key={g.id} onClick={() => nav(`/copa/grupo/${g.id}`)} className="p-3">
              <div className="flex items-center justify-between">
                <span className="font-display font-800 text-lg uppercase">Grupo {g.id}</span>
                <Icon name="forward" size={16} className="text-brand-500" />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {g.teams.map((c) => <TeamBadge key={c} code={c} size="sm" />)}
              </div>
            </Card>
          ))}
        </div>
      </section>
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
