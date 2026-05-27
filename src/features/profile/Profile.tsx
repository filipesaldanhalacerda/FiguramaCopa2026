import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, statsFromCounts } from '../../lib/store';
import { getTeam } from '../../data/worldcup2026';
import { TOTAL } from '../../data/stickers';
import { Card, Button, Sheet } from '../../components/ui';

const ACHIEVEMENTS: Record<string, { emoji: string; label: string }> = {
  'first-trade': { emoji: '🤝', label: 'Primeira troca' },
  'quiz-master': { emoji: '🧠', label: 'Craque no quiz' },
  'half': { emoji: '🏅', label: 'Metade do álbum' },
  'complete': { emoji: '👑', label: 'Álbum completo' },
};

export default function Profile() {
  const profile = useStore((s) => s.profile)!;
  const counts = useStore((s) => s.counts);
  const settings = useStore((s) => s.settings);
  const setSetting = useStore((s) => s.setSetting);
  const resetAll = useStore((s) => s.resetAll);
  const nav = useNavigate();
  const [parents, setParents] = useState(false);
  const stats = useMemo(() => statsFromCounts(counts), [counts]);
  const fav = getTeam(profile.favTeam);

  // conquistas dinâmicas de progresso
  const dynamic: string[] = [];
  if (stats.percent >= 50) dynamic.push('half');
  if (stats.have >= TOTAL) dynamic.push('complete');
  const unlocked = new Set([...settings.achievements, ...dynamic]);

  return (
    <div className="space-y-5">
      {/* cabeçalho do perfil */}
      <Card className="p-5 text-center bg-gradient-to-br from-brand-50 to-paper">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-100 text-5xl">{profile.avatar}</div>
        <h1 className="font-display font-800 text-2xl mt-2">{profile.displayName}</h1>
        <p className="font-700 text-ink-soft">Torce pra {fav?.name} {fav?.flag}</p>
      </Card>

      {/* stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <StatCard n={stats.have} label="figurinhas" />
        <StatCard n={stats.dupes} label="repetidas" />
        <StatCard n={`${stats.percent}%`} label="completo" />
      </div>

      <Button full variant="sky" onClick={() => nav('/chat')}>💬 Minhas conversas</Button>

      {/* conquistas */}
      <section>
        <h2 className="font-display font-800 text-xl mb-2">Conquistas 🏅</h2>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(ACHIEVEMENTS).map(([id, a]) => {
            const got = unlocked.has(id);
            return (
              <div key={id} className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 ${got ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10' : 'border-line bg-paper opacity-50'}`}>
                <span className="text-3xl grayscale-0" style={{ filter: got ? 'none' : 'grayscale(1)' }}>{a.emoji}</span>
                <span className="text-[10px] font-700 text-center leading-tight">{a.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* configurações */}
      <section className="space-y-2">
        <h2 className="font-display font-800 text-xl mb-1">Configurações</h2>
        <ToggleRow label="🔊 Sons do app" value={settings.soundOn} onChange={(v) => setSetting('soundOn', v)} />
        <Card onClick={() => setParents(true)} className="p-4 flex items-center justify-between">
          <span className="font-700">👨‍👩‍👧 Espaço dos pais</span><span className="text-brand-500 font-700">→</span>
        </Card>
      </section>

      <button onClick={() => { if (confirm('Isso apaga sua conta e sua coleção deste aparelho. Continuar?')) resetAll(); }}
        className="w-full py-3 font-700 text-[var(--color-magenta)]">
        Apagar minha conta deste aparelho
      </button>

      <Sheet open={parents} onClose={() => setParents(false)} title="Espaço dos pais 👨‍👩‍👧">
        <div className="space-y-3 font-600 text-ink-soft">
          <p>O <b>Figurama</b> foi feito pensando na segurança das crianças:</p>
          <Bullet>✅ Sem e-mail, telefone, foto ou nome real. Só um apelido e um PIN.</Bullet>
          <Bullet>✅ O chat tem respostas prontas, filtro de palavras e bloqueio de dados pessoais.</Bullet>
          <Bullet>✅ Botões de denunciar e bloquear sempre visíveis.</Bullet>
          <Bullet>✅ Recomendamos combinar as trocas em lugares seguros e com um adulto por perto.</Bullet>
          <Bullet>✅ Os dados ficam no aparelho; nada de propaganda ou compras dentro do app.</Bullet>
        </div>
      </Sheet>
    </div>
  );
}

function StatCard({ n, label }: { n: number | string; label: string }) {
  return (
    <div className="rounded-2xl bg-paper border-2 border-line py-3">
      <div className="font-display font-800 text-2xl text-brand-600">{n}</div>
      <div className="text-[11px] font-700 text-ink-soft uppercase">{label}</div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Card className="p-4 flex items-center justify-between" onClick={() => onChange(!value)}>
      <span className="font-700">{label}</span>
      <span className={`relative h-7 w-12 rounded-full transition-colors ${value ? 'bg-[var(--color-have)]' : 'bg-line'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${value ? 'left-6' : 'left-1'}`} />
      </span>
    </Card>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}
