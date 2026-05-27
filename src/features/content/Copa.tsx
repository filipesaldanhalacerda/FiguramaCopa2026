import { useNavigate } from 'react-router-dom';
import { GROUPS, TOURNAMENT, getTeam } from '../../data/worldcup2026';
import { Card } from '../../components/ui';
import { motion } from 'framer-motion';

export default function Copa() {
  const nav = useNavigate();
  const daysToGo = Math.max(
    0,
    Math.ceil((new Date(TOURNAMENT.start).getTime() - Date.now()) / 86400000),
  );

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display font-800 text-3xl">Copa 2026 🏆</h1>
        <p className="text-ink-soft font-600">Tudo sobre os grupos, seleções e jogos.</p>
      </header>

      {/* faixa sobre a copa */}
      <Card className="p-4 bg-gradient-to-br from-brand-500 to-brand-600 text-white border-brand-600">
        <p className="font-800 text-sm opacity-90">CONTAGEM REGRESSIVA</p>
        <p className="font-display font-800 text-3xl">{daysToGo > 0 ? `Faltam ${daysToGo} dias!` : 'É hoje! ⚽'}</p>
        <p className="font-600 mt-1 opacity-95">{TOURNAMENT.hosts.join(' · ')}</p>
        <div className="mt-2 flex gap-3 text-sm font-700">
          <span>48 seleções</span><span>·</span><span>12 grupos</span><span>·</span><span>104 jogos</span>
        </div>
      </Card>

      {/* atalhos */}
      <div className="grid grid-cols-2 gap-3">
        <Shortcut emoji="📅" label="Calendário" onClick={() => nav('/copa/jogos')} />
        <Shortcut emoji="🧠" label="Quiz da Copa" onClick={() => nav('/copa/quiz')} color="var(--color-magenta)" />
      </div>

      {/* grupos */}
      <section>
        <h2 className="font-display font-800 text-xl mb-3">Os 12 grupos</h2>
        <div className="grid grid-cols-2 gap-3">
          {GROUPS.map((g) => (
            <Card key={g.id} onClick={() => nav(`/copa/grupo/${g.id}`)} className="p-3">
              <div className="flex items-center justify-between">
                <span className="font-display font-800 text-lg">Grupo {g.id}</span>
                <span className="text-sm font-700 text-brand-500">ver →</span>
              </div>
              <div className="mt-2 flex gap-1.5">
                {g.teams.map((c) => (
                  <span key={c} className="text-2xl" title={getTeam(c)?.name}>{getTeam(c)?.flag}</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function Shortcut({ emoji, label, onClick, color = 'var(--color-sky-fest)' }: {
  emoji: string; label: string; onClick: () => void; color?: string;
}) {
  return (
    <motion.button whileTap={{ scale: 0.96 }} onClick={onClick}
      className="rounded-[var(--radius-sticker)] p-4 text-white text-left shadow-[var(--shadow-sticker)]"
      style={{ backgroundColor: color }}>
      <div className="text-3xl">{emoji}</div>
      <div className="font-display font-800 text-lg mt-1">{label}</div>
    </motion.button>
  );
}
