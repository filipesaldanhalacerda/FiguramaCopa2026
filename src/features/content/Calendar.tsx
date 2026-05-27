import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FIXTURES, GROUPS, getTeam, TOURNAMENT } from '../../data/worldcup2026';
import { Chip } from '../../components/ui';
import { Icon } from '../../components/icons';
import { TeamBadge } from '../../components/team';

export default function Calendar() {
  const nav = useNavigate();
  const [group, setGroup] = useState<string>('all');
  const [round, setRound] = useState<number>(0);

  const list = FIXTURES.filter(
    (f) => (group === 'all' || f.group === group) && (round === 0 || f.matchday === round),
  );
  const op = TOURNAMENT.opener;

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav('/copa')} className="grid h-10 w-10 place-items-center rounded-lg bg-paper border-2 border-line"><Icon name="back" size={20} /></button>
        <div>
          <h1 className="font-display font-800 text-3xl leading-none uppercase tracking-wide">Calendário</h1>
          <p className="text-sm font-600 text-ink-soft mt-0.5 flex items-center gap-1">
            Abertura: <TeamBadge code={op.home} size="sm" /> x <TeamBadge code={op.away} size="sm" />
          </p>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <Chip active={round === 0} onClick={() => setRound(0)}>Todas rodadas</Chip>
        {[1, 2, 3].map((r) => <Chip key={r} active={round === r} onClick={() => setRound(r)}>Rodada {r}</Chip>)}
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <Chip active={group === 'all'} onClick={() => setGroup('all')} color="var(--color-sky-fest)">Todos grupos</Chip>
        {GROUPS.map((g) => <Chip key={g.id} active={group === g.id} onClick={() => setGroup(g.id)} color="var(--color-sky-fest)">Grupo {g.id}</Chip>)}
      </div>

      <div className="space-y-2">
        {list.map((f, i) => (
          <div key={i} className="flex items-center rounded-lg bg-paper border-2 border-line px-3 py-3">
            <button onClick={() => nav(`/copa/time/${f.home}`)} className="flex flex-1 items-center justify-end gap-2 font-700">
              {getTeam(f.home)!.name}<TeamBadge code={f.home} size="sm" />
            </button>
            <div className="px-3 text-center">
              <div className="font-display font-800 text-ink-soft text-sm">VS</div>
              <div className="text-[10px] font-600 text-ink-soft">G{f.group} · R{f.matchday}</div>
            </div>
            <button onClick={() => nav(`/copa/time/${f.away}`)} className="flex flex-1 items-center gap-2 font-700">
              <TeamBadge code={f.away} size="sm" />{getTeam(f.away)!.name}
            </button>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-ink-soft">Datas e horários oficiais confirmados perto da Copa.</p>
    </div>
  );
}
