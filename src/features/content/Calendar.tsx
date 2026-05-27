import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FIXTURES, GROUPS, getTeam, TOURNAMENT } from '../../data/worldcup2026';
import { Chip } from '../../components/ui';

export default function Calendar() {
  const nav = useNavigate();
  const [group, setGroup] = useState<string>('all');
  const [round, setRound] = useState<number>(0);

  const list = FIXTURES.filter(
    (f) => (group === 'all' || f.group === group) && (round === 0 || f.matchday === round),
  );

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav('/copa')} className="grid h-10 w-10 place-items-center rounded-2xl bg-paper border-2 border-line text-xl">←</button>
        <div>
          <h1 className="font-display font-800 text-3xl leading-none">Calendário 📅</h1>
          <p className="text-sm font-700 text-ink-soft">Abertura: {getTeam(TOURNAMENT.opener.home)?.flag} {getTeam(TOURNAMENT.opener.home)?.name} x {getTeam(TOURNAMENT.opener.away)?.name} {getTeam(TOURNAMENT.opener.away)?.flag}</p>
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
        {list.map((f, i) => {
          const h = getTeam(f.home)!, a = getTeam(f.away)!;
          return (
            <div key={i} className="flex items-center rounded-2xl bg-paper border-2 border-line px-3 py-3">
              <button onClick={() => nav(`/copa/time/${f.home}`)} className="flex flex-1 items-center justify-end gap-2 font-700">
                {h.name}<span className="text-2xl">{h.flag}</span>
              </button>
              <div className="px-3 text-center">
                <div className="font-display font-800 text-brand-600 text-sm">VS</div>
                <div className="text-[10px] font-700 text-ink-soft">G{f.group} · R{f.matchday}</div>
              </div>
              <button onClick={() => nav(`/copa/time/${f.away}`)} className="flex flex-1 items-center gap-2 font-700">
                <span className="text-2xl">{a.flag}</span>{a.name}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-ink-soft">Datas e horários oficiais confirmados perto da Copa.</p>
    </div>
  );
}
