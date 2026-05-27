import { useParams, useNavigate } from 'react-router-dom';
import { GROUPS, FIXTURES, getTeam, getTeamColor, type GroupId } from '../../data/worldcup2026';
import { Card } from '../../components/ui';
import { Icon } from '../../components/icons';
import { TeamBadge } from '../../components/team';

export default function GroupView() {
  const { id = 'A' } = useParams();
  const nav = useNavigate();
  const group = GROUPS.find((g) => g.id === (id as GroupId));
  if (!group) return null;
  const fixtures = FIXTURES.filter((f) => f.group === id);

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button onClick={() => nav('/copa')} className="grid h-10 w-10 place-items-center rounded-lg bg-paper border-2 border-line"><Icon name="back" size={20} /></button>
        <h1 className="font-display font-800 text-3xl uppercase tracking-wide">Grupo {id}</h1>
      </header>

      <section className="space-y-2">
        {group.teams.map((code) => {
          const t = getTeam(code)!;
          return (
            <Card key={code} onClick={() => nav(`/copa/time/${code}`)} className="overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                <div className="w-1 self-stretch rounded-full" style={{ background: getTeamColor(code) }} />
                <TeamBadge code={code} />
                <div className="flex-1">
                  <p className="font-display font-800 uppercase leading-tight">{t.name}</p>
                  <p className="text-xs font-600 text-ink-soft">{t.nickname ?? t.confed}{t.titles > 0 ? ` · ${t.titles}× campeã` : ''}</p>
                </div>
                <Icon name="forward" size={16} className="text-brand-500" />
              </div>
            </Card>
          );
        })}
      </section>

      <section>
        <h2 className="font-display font-800 text-xl mb-2 uppercase tracking-wide">Jogos do grupo</h2>
        <div className="space-y-2">
          {fixtures.map((f, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-paper border-2 border-line px-3 py-2.5">
              <TeamBadge code={f.home} size="sm" />
              <span className="font-700 text-sm flex-1">{getTeam(f.home)!.name}</span>
              <span className="text-[11px] font-700 text-ink-soft">R{f.matchday}</span>
              <span className="font-700 text-sm flex-1 text-right">{getTeam(f.away)!.name}</span>
              <TeamBadge code={f.away} size="sm" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
