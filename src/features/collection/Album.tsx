import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, statsFromCounts } from '../../lib/store';
import { SECTIONS, getSticker } from '../../data/stickers';
import { GROUPS, getTeamColor } from '../../data/worldcup2026';
import { Card } from '../../components/ui';
import { Icon } from '../../components/icons';
import { TeamBadge } from '../../components/team';

export default function Album() {
  const counts = useStore((s) => s.counts);
  const stats = useMemo(() => statsFromCounts(counts), [counts]);
  const nav = useNavigate();
  const [jump, setJump] = useState('');

  function goToNumber(e: React.FormEvent) {
    e.preventDefault();
    const s = getSticker(Number(jump));
    if (s) nav(`/album/${s.section}`);
    setJump('');
  }

  const sectionProgress = (key: string) => {
    const meta = SECTIONS.find((x) => x.key === key)!;
    let have = 0;
    for (let id = meta.range[0]; id <= meta.range[1]; id++) if ((counts[id] ?? 0) >= 1) have++;
    return { have, total: meta.count, done: have === meta.count };
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="font-600 text-ink-soft uppercase tracking-widest text-xs">Coleção oficial · 980 figurinhas</p>
        <h1 className="font-display font-800 text-3xl uppercase tracking-wide">Meu Álbum</h1>
        <div className="mt-3 flex items-center justify-between text-sm font-700">
          <span className="text-brand-700 tnum">{stats.have} / {stats.have + stats.missing} coladas</span>
          <span className="text-ink-soft tnum">{stats.percent}%</span>
        </div>
        <div className="mt-1 h-2.5 rounded-full bg-brand-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all" style={{ width: `${stats.percent}%` }} />
        </div>
      </header>

      <form onSubmit={goToNumber} className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border-2 border-line bg-paper px-3">
          <Icon name="search" size={18} className="text-ink-soft" />
          <input
            value={jump} onChange={(e) => setJump(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric" placeholder="Ir para o número…"
            className="flex-1 bg-transparent py-3 font-600 outline-none tnum"
          />
        </div>
        <button className="rounded-xl bg-brand-500 px-5 font-700 text-white">Ir</button>
      </form>

      {/* especiais */}
      <Card onClick={() => nav('/album/especiais')} className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg slot--foil"><Icon name="star" size={20} className="text-[#5a4205]" /></span>
          <div>
            <p className="font-display font-800 text-lg uppercase tracking-wide">Especiais</p>
            <p className="text-sm text-ink-soft font-600">Mascotes, troféu e sedes</p>
          </div>
        </div>
        <SectionStat p={sectionProgress('especiais')} />
      </Card>

      {/* por grupo */}
      {GROUPS.map((g) => (
        <section key={g.id}>
          <h2 className="font-display font-800 text-base mb-2 text-ink-soft uppercase tracking-widest">Grupo {g.id}</h2>
          <div className="grid grid-cols-2 gap-3">
            {g.teams.map((code) => {
              const meta = SECTIONS.find((s) => s.key === code)!;
              const p = sectionProgress(code);
              return (
                <Card key={code} onClick={() => nav(`/album/${code}`)} className="overflow-hidden">
                  <div className="h-1.5" style={{ background: getTeamColor(code) }} />
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <TeamBadge code={code} size="sm" />
                      <span className="font-display font-700 leading-tight text-sm flex-1 uppercase truncate">{meta.title}</span>
                      {p.done && <Icon name="check" size={16} className="text-brand-500" strokeWidth={3} />}
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(p.have / p.total) * 100}%`, background: getTeamColor(code) }} />
                    </div>
                    <p className="mt-1 text-xs font-700 text-ink-soft tnum">{p.have}/{p.total}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function SectionStat({ p }: { p: { have: number; total: number; done: boolean } }) {
  return (
    <div className="text-right">
      <p className="font-display font-800 text-brand-600 tnum">{p.have}/{p.total}</p>
      {p.done && <span className="text-brand-500 text-xs font-700 uppercase">completa</span>}
    </div>
  );
}
