import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, statsFromCounts } from '../../lib/store';
import { getTeam } from '../../data/worldcup2026';
import { TOTAL } from '../../data/stickers';
import { Card, Button, Sheet } from '../../components/ui';
import { Icon, type IconName } from '../../components/icons';
import { Avatar, TeamBadge } from '../../components/team';

const ACHIEVEMENTS: Record<string, { icon: IconName; label: string }> = {
  'first-trade': { icon: 'swap', label: 'Primeira troca' },
  'quiz-master': { icon: 'bulb', label: 'Craque no quiz' },
  half: { icon: 'medal', label: 'Metade do álbum' },
  complete: { icon: 'trophy', label: 'Álbum completo' },
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

  const dynamic: string[] = [];
  if (stats.percent >= 50) dynamic.push('half');
  if (stats.have >= TOTAL) dynamic.push('complete');
  const unlocked = new Set([...settings.achievements, ...dynamic]);

  return (
    <div className="space-y-5">
      <Card className="p-5 flex items-center gap-4">
        <Avatar color={profile.avatar} size={68} />
        <div className="flex-1">
          <h1 className="font-display font-800 text-2xl uppercase tracking-wide leading-none">{profile.displayName}</h1>
          <div className="mt-2 flex items-center gap-2 text-ink-soft font-600 text-sm">
            Torce para {fav?.name} {fav && <TeamBadge code={fav.code} size="sm" />}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3 text-center">
        <StatCard n={stats.have} label="figurinhas" />
        <StatCard n={stats.dupes} label="repetidas" />
        <StatCard n={`${stats.percent}%`} label="completo" />
      </div>

      <Button full variant="navy" onClick={() => nav('/chat')}><Icon name="chat" size={18} /> Minhas conversas</Button>

      <section>
        <h2 className="font-display font-800 text-xl mb-2 uppercase tracking-wide">Conquistas</h2>
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(ACHIEVEMENTS).map(([id, a]) => {
            const got = unlocked.has(id);
            return (
              <div key={id} className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 ${got ? 'border-gold-400 bg-gold-100/60 text-gold-600' : 'border-line bg-paper text-ink-soft/40'}`}>
                <Icon name={a.icon} size={26} />
                <span className="text-[10px] font-700 text-center leading-tight text-ink-soft">{a.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-display font-800 text-xl mb-1 uppercase tracking-wide">Configurações</h2>
        <ToggleRow icon={settings.soundOn ? 'sound' : 'mute'} label="Sons do app" value={settings.soundOn} onChange={(v) => setSetting('soundOn', v)} />
        <Card onClick={() => setParents(true)} className="p-4 flex items-center justify-between">
          <span className="flex items-center gap-2 font-700"><Icon name="shield" size={18} className="text-brand-500" /> Espaço dos pais</span>
          <Icon name="forward" size={18} className="text-ink-soft" />
        </Card>
      </section>

      <button onClick={() => { if (confirm('Isso apaga sua conta e sua coleção deste aparelho. Continuar?')) resetAll(); }}
        className="w-full py-3 font-700 text-[var(--color-magenta)]">
        Apagar minha conta deste aparelho
      </button>

      <Sheet open={parents} onClose={() => setParents(false)} title="Espaço dos pais">
        <div className="space-y-2.5 font-600 text-ink-soft">
          <p>O <b>Figurama</b> foi feito pensando na segurança das crianças:</p>
          <Bullet>Sem e-mail, telefone, foto ou nome real. Só um apelido e um PIN.</Bullet>
          <Bullet>O chat tem respostas prontas, filtro de palavras e bloqueio de dados pessoais.</Bullet>
          <Bullet>Botões de denunciar e bloquear sempre visíveis.</Bullet>
          <Bullet>Recomendamos combinar as trocas em lugares seguros e com um adulto por perto.</Bullet>
          <Bullet>Os dados ficam no aparelho; sem propaganda ou compras dentro do app.</Bullet>
        </div>
      </Sheet>
    </div>
  );
}

function StatCard({ n, label }: { n: number | string; label: string }) {
  return (
    <div className="rounded-xl bg-paper border-2 border-line py-3">
      <div className="font-display font-800 text-2xl text-brand-600 tnum">{n}</div>
      <div className="text-[11px] font-700 text-ink-soft uppercase">{label}</div>
    </div>
  );
}

function ToggleRow({ icon, label, value, onChange }: { icon: IconName; label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Card className="p-4 flex items-center justify-between" onClick={() => onChange(!value)}>
      <span className="flex items-center gap-2 font-700"><Icon name={icon} size={18} className="text-brand-500" /> {label}</span>
      <span className={`relative h-7 w-12 rounded-full transition-colors ${value ? 'bg-[var(--color-have)]' : 'bg-line'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${value ? 'left-6' : 'left-1'}`} />
      </span>
    </Card>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2">
      <span className="text-brand-500 mt-0.5 shrink-0"><Icon name="check" size={16} strokeWidth={3} /></span>{children}
    </p>
  );
}
