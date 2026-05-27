import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, statsFromCounts } from '../../lib/store';
import { SECTIONS, findByCode, type AlbumSection } from '../../data/stickers';
import { GROUPS, getTeamColor, getTeam } from '../../data/worldcup2026';
import { Card, Chip } from '../../components/ui';
import { Icon } from '../../components/icons';
import { TeamBadge } from '../../components/team';

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

type SecStat = { have: number; total: number; done: boolean; dupes: number };
type Filter = 'all' | 'todo' | 'done' | 'dupes';

export default function Album() {
  const counts = useStore((s) => s.counts);
  const stats = useMemo(() => statsFromCounts(counts), [counts]);
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const sectionStats = useMemo(() => {
    const map = new Map<string, SecStat>();
    for (const sec of SECTIONS) {
      let have = 0, dupes = 0;
      for (let id = sec.range[0]; id <= sec.range[1]; id++) {
        const c = counts[id] ?? 0;
        if (c >= 1) have++;
        if (c >= 2) dupes += c - 1;
      }
      map.set(sec.key, { have, total: sec.count, done: have === sec.count, dupes });
    }
    return map;
  }, [counts]);

  const match = (key: string) => {
    const st = sectionStats.get(key)!;
    if (filter === 'todo') return !st.done;
    if (filter === 'done') return st.done;
    if (filter === 'dupes') return st.dupes > 0;
    return true;
  };

  // busca instantânea por nome do país, sigla ou código oficial
  const results = useMemo<AlbumSection[]>(() => {
    const raw = q.trim();
    if (!raw) return [];
    const term = norm(raw).replace(/[0-9]/g, '').trim() || norm(raw);
    const seen = new Set<string>();
    const out: AlbumSection[] = [];
    const push = (key: string) => {
      if (seen.has(key)) return;
      seen.add(key);
      const s = SECTIONS.find((x) => x.key === key);
      if (s) out.push(s);
    };
    const direct = findByCode(raw);
    if (direct) push(direct.section);
    for (const s of SECTIONS) {
      if (out.length >= 8) break;
      if (norm(s.title).includes(term) || s.key.toLowerCase().includes(term)) push(s.key);
    }
    return out;
  }, [q]);

  function go(key: string) { setQ(''); nav(`/album/${key}`); }

  const especiais = sectionStats.get('especiais')!;
  const visibleGroups = GROUPS
    .map((g) => ({ id: g.id, teams: g.teams.filter(match) }))
    .filter((g) => g.teams.length > 0);
  const nothing = !match('especiais') && visibleGroups.length === 0;

  return (
    <div className="space-y-5">
      <header>
        <p className="font-600 text-ink-soft uppercase tracking-widest text-xs">Coleção oficial · 980 figurinhas</p>
        <h1 className="font-display font-800 text-3xl uppercase tracking-wide">Meu Álbum</h1>
      </header>

      {/* resumo da coleção */}
      <Card className="p-4">
        <div className="flex items-end justify-between">
          <span className="font-700 text-brand-700 tnum">{stats.have} de 980 coladas</span>
          <span className="font-display font-800 text-2xl text-brand-600 tnum leading-none">{stats.percent}%</span>
        </div>
        <div className="mt-2 h-3 rounded-full bg-brand-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all" style={{ width: `${stats.percent}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Mini n={stats.have} label="tenho" color="var(--color-have)" />
          <Mini n={stats.dupes} label="repetidas" color="var(--color-dupe)" />
          <Mini n={stats.missing} label="faltam" color="var(--color-ink-soft)" />
        </div>
      </Card>

      {/* busca */}
      <div>
        <div className="flex items-center gap-2 rounded-xl border-2 border-line bg-paper px-3 focus-within:border-brand-400">
          <Icon name="search" size={18} className="text-ink-soft" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value.slice(0, 20))}
            onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) go(results[0].key); }}
            placeholder="Buscar seleção (ex.: Brasil)"
            className="flex-1 bg-transparent py-3 font-600 outline-none"
          />
          {q && <button onClick={() => setQ('')} aria-label="Limpar busca" className="text-ink-soft"><Icon name="close" size={18} /></button>}
        </div>
        {results.length > 0 && (
          <div className="mt-2 overflow-hidden rounded-xl border-2 border-line bg-paper">
            {results.map((s) => (
              <button key={s.key} onClick={() => go(s.key)}
                className="flex w-full items-center gap-3 border-b border-line px-3 py-2.5 text-left last:border-0 active:bg-brand-50">
                {s.key === 'especiais'
                  ? <span className="grid h-[18px] w-[26px] place-items-center text-gold-500"><Icon name="star" size={18} /></span>
                  : <TeamBadge code={s.key} size="sm" />}
                <span className="font-700 flex-1">{s.title}</span>
                <span className="text-xs font-600 text-ink-soft tnum">{s.count}</span>
                <Icon name="forward" size={16} className="text-ink-soft" />
              </button>
            ))}
          </div>
        )}
        {q.trim() && results.length === 0 && (
          <p className="mt-2 px-1 text-sm font-600 text-ink-soft">Nada encontrado. Tente o nome do país (ex.: Brasil) ou o código (ex.: MEX5).</p>
        )}
      </div>

      {/* filtros */}
      {!q && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mt-1">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>Tudo</Chip>
          <Chip active={filter === 'todo'} onClick={() => setFilter('todo')} color="var(--color-ink-soft)">Faltando</Chip>
          <Chip active={filter === 'done'} onClick={() => setFilter('done')} color="var(--color-have)">Completos</Chip>
          <Chip active={filter === 'dupes'} onClick={() => setFilter('dupes')} color="var(--color-dupe)">Com repetidas</Chip>
        </div>
      )}

      {!q && (
        <>
          {/* especiais */}
          {match('especiais') && (
            <Card onClick={() => nav('/album/especiais')} className="overflow-hidden">
              <div className="h-1.5 bg-gold-500" />
              <div className="p-3 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg slot--foil"><Icon name="star" size={18} className="text-[#5a4205]" /></span>
                <div className="flex-1">
                  <p className="font-display font-800 uppercase tracking-wide">Especiais</p>
                  <p className="text-xs text-ink-soft font-600">Abertura e FIFA Museum</p>
                </div>
                <SecMeta st={especiais} />
              </div>
            </Card>
          )}

          {/* grupos */}
          {visibleGroups.map((g) => (
            <section key={g.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-navy-800 text-white font-display font-800 text-sm">{g.id}</span>
                <h2 className="font-display font-800 text-base text-ink-soft uppercase tracking-widest">Grupo {g.id}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {g.teams.map((code) => <TeamCard key={code} code={code} st={sectionStats.get(code)!} onClick={() => nav(`/album/${code}`)} />)}
              </div>
            </section>
          ))}

          {nothing && (
            <div className="text-center py-10">
              <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-400"><Icon name="album" size={32} /></div>
              <p className="font-display font-800 text-lg uppercase">Nada por aqui</p>
              <p className="text-ink-soft font-600 mt-1">Nenhuma seleção neste filtro.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Mini({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div className="rounded-lg bg-page py-2">
      <div className="font-display font-800 text-lg tnum" style={{ color }}>{n}</div>
      <div className="text-[10px] font-700 text-ink-soft uppercase">{label}</div>
    </div>
  );
}

function SecMeta({ st }: { st: SecStat }) {
  return (
    <div className="text-right">
      <p className="font-display font-800 text-brand-600 tnum">{st.have}/{st.total}</p>
      {st.done
        ? <span className="text-brand-500 text-xs font-700 uppercase">completa</span>
        : st.dupes > 0 ? <span className="text-gold-600 text-xs font-700 tnum">{st.dupes} pra trocar</span> : null}
    </div>
  );
}

function TeamCard({ code, st, onClick }: { code: string; st: SecStat; onClick: () => void }) {
  const color = getTeamColor(code);
  const pct = (st.have / st.total) * 100;
  return (
    <Card onClick={onClick} className="overflow-hidden">
      <div className="h-1.5" style={{ background: color }} />
      <div className="p-3">
        <div className="flex items-center gap-2">
          <TeamBadge code={code} size="sm" />
          <span className="font-display font-700 text-sm flex-1 uppercase truncate">{teamName(code)}</span>
          {st.done
            ? <span className="text-gold-500"><Icon name="medal" size={18} /></span>
            : st.dupes > 0
              ? <span className="rounded-full bg-gold-500 px-1.5 text-[11px] font-800 text-navy-900 tnum">×{st.dupes}</span>
              : null}
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        </div>
        <div className="mt-1 flex items-center justify-between text-xs font-700">
          <span className="text-ink-soft tnum">{st.have}/{st.total}</span>
          {st.done
            ? <span className="text-brand-600 uppercase">completo</span>
            : st.dupes > 0 ? <span className="text-gold-600 tnum">{st.dupes} pra trocar</span> : null}
        </div>
      </div>
    </Card>
  );
}

const teamName = (code: string) => getTeam(code)?.name ?? code;
