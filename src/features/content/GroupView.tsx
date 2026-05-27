import { useParams, useNavigate } from 'react-router-dom';
import { GROUPS, FIXTURES, getTeam, type GroupId } from '../../data/worldcup2026';
import { Card } from '../../components/ui';

export default function GroupView() {
  const { id = 'A' } = useParams();
  const nav = useNavigate();
  const group = GROUPS.find((g) => g.id === (id as GroupId));
  if (!group) return null;
  const fixtures = FIXTURES.filter((f) => f.group === id);

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button onClick={() => nav('/copa')} className="grid h-10 w-10 place-items-center rounded-2xl bg-paper border-2 border-line text-xl">←</button>
        <h1 className="font-display font-800 text-3xl">Grupo {id}</h1>
      </header>

      <section className="space-y-2">
        {group.teams.map((code) => {
          const t = getTeam(code)!;
          return (
            <Card key={code} onClick={() => nav(`/copa/time/${code}`)} className="p-3 flex items-center gap-3">
              <span className="text-3xl">{t.flag}</span>
              <div className="flex-1">
                <p className="font-display font-800">{t.name}</p>
                <p className="text-xs font-700 text-ink-soft">{t.nickname ?? t.confed}{t.titles > 0 ? ` · ${t.titles}× campeã 🏆` : ''}</p>
              </div>
              <span className="text-brand-500 font-700 text-sm">ver →</span>
            </Card>
          );
        })}
      </section>

      <section>
        <h2 className="font-display font-800 text-xl mb-2">Jogos do grupo</h2>
        <div className="space-y-2">
          {fixtures.map((f, i) => {
            const h = getTeam(f.home)!, a = getTeam(f.away)!;
            return (
              <div key={i} className="flex items-center justify-between rounded-2xl bg-paper border-2 border-line px-4 py-2.5">
                <span className="flex items-center gap-2 font-700 flex-1"><span className="text-xl">{h.flag}</span>{h.name}</span>
                <span className="text-xs font-800 text-ink-soft px-2">R{f.matchday}</span>
                <span className="flex items-center gap-2 font-700 flex-1 justify-end">{a.name}<span className="text-xl">{a.flag}</span></span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
