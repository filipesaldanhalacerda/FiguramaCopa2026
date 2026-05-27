import { useParams, useNavigate } from 'react-router-dom';
import { getTeam, getTeamColor, readableOn, FIXTURES } from '../../data/worldcup2026';
import { SECTIONS } from '../../data/stickers';
import { useStore } from '../../lib/store';
import { Card, Button } from '../../components/ui';
import { Icon } from '../../components/icons';
import { TeamBadge } from '../../components/team';

export default function TeamView() {
  const { code = '' } = useParams();
  const nav = useNavigate();
  const t = getTeam(code);
  const counts = useStore((s) => s.counts);
  if (!t) return null;

  const color = getTeamColor(code);
  const ink = readableOn(color);
  const section = SECTIONS.find((s) => s.key === code);
  const have = section
    ? Array.from({ length: section.count }, (_, i) => section.range[0] + i).filter((id) => (counts[id] ?? 0) >= 1).length
    : 0;
  const fixtures = FIXTURES.filter((f) => f.home === code || f.away === code);

  return (
    <div className="-mx-4 -mt-4">
      {/* faixa do time */}
      <header className="px-4 pt-5 pb-5 safe-top" style={{ background: color, color: ink }}>
        <button onClick={() => nav(-1)} className="grid h-9 w-9 place-items-center rounded-lg bg-black/15 mb-3"><Icon name="back" size={20} /></button>
        <div className="flex items-center gap-3">
          <TeamBadge code={code} size="lg" />
          <div>
            <h1 className="font-display font-800 text-3xl leading-none uppercase tracking-wide">{t.name}</h1>
            <p className="font-600 opacity-90 mt-1">Grupo {t.group} · {t.confed}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {t.nickname && <span className="rounded-full bg-black/15 px-3 py-1 font-600 text-sm">{t.nickname}</span>}
          {t.titles > 0 && <span className="rounded-full bg-black/15 px-3 py-1 font-700 text-sm">{t.titles}× campeã do mundo</span>}
        </div>
      </header>

      <div className="px-4 pt-4 space-y-5">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="font-display font-800 uppercase">Figurinhas deste time</p>
            <p className="text-sm font-600 text-ink-soft tnum">{have} de {section?.count ?? 20} no seu álbum</p>
          </div>
          <Button onClick={() => nav(`/album/${code}`)}><Icon name="album" size={18} /> Marcar</Button>
        </Card>

        <section>
          <h2 className="font-display font-800 text-xl mb-2 uppercase tracking-wide">Curiosidades</h2>
          <div className="space-y-2">
            {t.curiosidades.map((c, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-paper border-2 border-line px-4 py-3 font-600">
                <span className="text-gold-500 mt-0.5"><Icon name="star" size={16} /></span>{c}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display font-800 text-xl mb-1 uppercase tracking-wide">Craques</h2>
          <p className="text-xs font-600 text-ink-soft mb-2">Provisório — a escalação oficial sai em junho.</p>
          <div className="flex flex-wrap gap-2">
            {t.craques.map((p) => (
              <span key={p} className="rounded-full border-2 border-line bg-paper px-3 py-1.5 font-600 text-sm">{p}</span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display font-800 text-xl mb-2 uppercase tracking-wide">Jogos na fase de grupos</h2>
          <div className="space-y-2">
            {fixtures.map((f, i) => {
              const oppCode = f.home === code ? f.away : f.home;
              const opp = getTeam(oppCode)!;
              return (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-paper border-2 border-line px-4 py-2.5 font-600">
                  <span className="text-xs font-700 text-ink-soft">Rodada {f.matchday}</span>
                  <span className="ml-auto flex items-center gap-2">vs {opp.name}<TeamBadge code={oppCode} size="sm" /></span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
