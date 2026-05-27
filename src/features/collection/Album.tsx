import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, statsFromCounts } from '../../lib/store';
import { SECTIONS, getSticker } from '../../data/stickers';
import { GROUPS } from '../../data/worldcup2026';
import { Card } from '../../components/ui';

export default function Album() {
  const counts = useStore((s) => s.counts);
  const stats = useMemo(() => statsFromCounts(counts), [counts]);
  const nav = useNavigate();
  const [jump, setJump] = useState('');

  function goToNumber(e: React.FormEvent) {
    e.preventDefault();
    const id = Number(jump);
    const s = getSticker(id);
    if (s) nav(`/album/${s.section}`);
    setJump('');
  }

  const sectionProgress = (key: string) => {
    const meta = SECTIONS.find((x) => x.key === key)!;
    let have = 0;
    for (let id = meta.range[0]; id <= meta.range[1]; id++) if ((counts[id] ?? 0) >= 1) have++;
    return { have, total: meta.count, done: have === meta.count };
  };

  const especiais = SECTIONS.find((s) => s.key === 'especiais')!;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display font-800 text-3xl">Meu Álbum 📒</h1>
        <div className="mt-3 flex items-center justify-between text-sm font-700">
          <span className="text-brand-700">{stats.have} / {stats.have + stats.missing} figurinhas 🔥</span>
          <span className="text-ink-soft">{stats.percent}%</span>
        </div>
        <div className="mt-1 h-3 rounded-full bg-brand-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all" style={{ width: `${stats.percent}%` }} />
        </div>
      </header>

      {/* ir para número */}
      <form onSubmit={goToNumber} className="flex gap-2">
        <input
          value={jump} onChange={(e) => setJump(e.target.value.replace(/\D/g, ''))}
          inputMode="numeric" placeholder="Pular para o número…"
          className="flex-1 rounded-2xl border-2 border-line bg-paper px-4 py-3 font-700 outline-none focus:border-brand-400"
        />
        <button className="rounded-2xl bg-brand-500 px-5 font-800 text-white">Ir</button>
      </form>

      {/* especiais */}
      <SectionCard
        title="✨ Especiais" subtitle="Mascotes, troféu e sedes"
        progress={sectionProgress('especiais')}
        onClick={() => nav('/album/especiais')}
        big
      />

      {/* por grupo */}
      {GROUPS.map((g) => (
        <section key={g.id}>
          <h2 className="font-display font-800 text-lg mb-2 text-ink-soft">Grupo {g.id}</h2>
          <div className="grid grid-cols-2 gap-3">
            {g.teams.map((code) => {
              const meta = SECTIONS.find((s) => s.key === code)!;
              const p = sectionProgress(code);
              return (
                <Card key={code} onClick={() => nav(`/album/${code}`)} className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{meta.flag}</span>
                    <span className="font-display font-800 leading-tight text-sm flex-1">{meta.title}</span>
                    {p.done && <span className="text-[var(--color-have)]">✅</span>}
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-brand-100 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${(p.have / p.total) * 100}%` }} />
                  </div>
                  <p className="mt-1 text-xs font-700 text-ink-soft">{p.have}/{p.total}</p>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      <p className="text-center text-xs text-ink-soft pt-2">
        Álbum oficial: {especiais.count} especiais + 48 seleções = 980 figurinhas
      </p>
    </div>
  );
}

function SectionCard({ title, subtitle, progress, onClick, big }: {
  title: string; subtitle: string; progress: { have: number; total: number; done: boolean }; onClick: () => void; big?: boolean;
}) {
  return (
    <Card onClick={onClick} className={`p-4 ${big ? 'bg-gradient-to-br from-[var(--color-gold)]/20 to-paper' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display font-800 text-lg">{title}</p>
          <p className="text-sm text-ink-soft font-600">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="font-800 text-brand-600">{progress.have}/{progress.total}</p>
          {progress.done && <span className="text-[var(--color-have)] text-sm font-700">completa ✅</span>}
        </div>
      </div>
    </Card>
  );
}
