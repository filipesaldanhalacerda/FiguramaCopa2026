import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { SECTIONS, stickersOfSection, type Sticker } from '../../data/stickers';
import { getTeam, getTeamColor, readableOn } from '../../data/worldcup2026';
import { Chip, Sheet, Button } from '../../components/ui';
import { Icon } from '../../components/icons';
import StickerCell from './StickerCell';
import { burstConfetti } from '../../lib/confetti';
import { tapHaptic } from '../../lib/haptics';

type Filter = 'all' | 'missing' | 'have' | 'dupe';

export default function SectionView() {
  const { section = 'especiais' } = useParams();
  const nav = useNavigate();
  const counts = useStore((s) => s.counts);
  const setCount = useStore((s) => s.setCount);
  const toggleHave = useStore((s) => s.toggleHave);
  const unlock = useStore((s) => s.unlock);

  const [filter, setFilter] = useState<Filter>('all');
  const [batch, setBatch] = useState(false);
  const [editing, setEditing] = useState<Sticker | null>(null);

  const meta = SECTIONS.find((s) => s.key === section);
  const team = section !== 'especiais' ? getTeam(section) : undefined;
  const all = useMemo(() => stickersOfSection(section), [section]);

  const headerColor = section === 'especiais' ? '#d29a26' : getTeamColor(section);
  const headerInk = readableOn(headerColor);

  const haveCount = all.filter((s) => (counts[s.id] ?? 0) >= 1).length;
  const done = haveCount === all.length && all.length > 0;
  const pct = Math.round((haveCount / all.length) * 100);

  const list = all.filter((s) => {
    const c = counts[s.id] ?? 0;
    if (filter === 'missing') return c === 0;
    if (filter === 'have') return c >= 1;
    if (filter === 'dupe') return c >= 2;
    return true;
  });

  async function handleTap(s: Sticker) {
    const prevHave = haveCount;
    if (batch) await setCount(s.id, (counts[s.id] ?? 0) + 1);
    else await toggleHave(s.id);
    const nowHave = all.filter((x) => (x.id === s.id ? true : (counts[x.id] ?? 0) >= 1)).length;
    if (prevHave < all.length && nowHave === all.length) {
      burstConfetti();
      tapHaptic('success');
      if (team) unlock(`page-${team.code}`);
    }
  }

  return (
    <div className="-mx-4 -mt-4">
      {/* cabeçalho estilo página de álbum */}
      <header className="px-4 pt-5 pb-4 safe-top" style={{ background: headerColor, color: headerInk }}>
        <div className="flex items-center gap-3">
          <button onClick={() => nav('/album')} className="grid h-9 w-9 place-items-center rounded-lg bg-black/15">
            <Icon name="back" size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-800 text-2xl leading-none truncate uppercase tracking-wide">{meta?.title}</h1>
            <p className="text-sm font-600 opacity-90 mt-0.5">
              {team ? `Grupo ${team.group} · ${team.confed}` : 'Mascotes, troféu e sedes'}
            </p>
          </div>
          <span className="font-display font-800 text-3xl tnum">{section === 'especiais' ? 'FWC' : section}</span>
        </div>

        {/* progresso */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-700 mb-1 uppercase tracking-wide">
            <span>{done ? 'Página completa' : `${haveCount} de ${all.length}`}</span>
            <span className="tnum">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-black/20 overflow-hidden">
            <div className="h-full rounded-full bg-white/90 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </header>

      {/* controles */}
      <div className="px-4 pt-4 pb-2 bg-album">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>Tudo</Chip>
          <Chip active={filter === 'missing'} onClick={() => setFilter('missing')} color="var(--color-ink-soft)">Faltam</Chip>
          <Chip active={filter === 'have'} onClick={() => setFilter('have')} color="var(--color-have)">Tenho</Chip>
          <Chip active={filter === 'dupe'} onClick={() => setFilter('dupe')} color="var(--color-dupe)">Repetidas</Chip>
          <div className="ml-auto" />
          <Chip active={batch} onClick={() => setBatch((b) => !b)} color="var(--color-flame)">Bater rápido</Chip>
        </div>
        {batch && (
          <p className="mt-2 flex items-center gap-2 rounded-lg bg-[var(--color-flame)]/10 px-3 py-2 text-sm font-600 text-[var(--color-flame)]">
            <Icon name="stack" size={16} /> Modo pacote: cada toque soma +1.
          </p>
        )}
      </div>

      {/* grade de espaços */}
      <div className="album-page px-4 pb-28 pt-2 min-h-[60vh]">
        <div className="grid grid-cols-4 gap-2.5">
          {list.map((s) => (
            <StickerCell
              key={s.id}
              sticker={s}
              count={counts[s.id] ?? 0}
              batch={batch}
              onTap={() => handleTap(s)}
              onLongPress={() => setEditing(s)}
            />
          ))}
        </div>
        {list.length === 0 && <p className="text-center text-ink-soft font-600 py-10">Nada por aqui com esse filtro.</p>}
      </div>

      {/* stepper de repetidas */}
      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing ? `Figurinha nº ${editing.id}` : ''}>
        {editing && (
          <StepperSheet
            sticker={editing}
            count={counts[editing.id] ?? 0}
            onSet={(c) => setCount(editing.id, c)}
            onClose={() => setEditing(null)}
          />
        )}
      </Sheet>
    </div>
  );
}

function StepperSheet({ sticker, count, onSet, onClose }: {
  sticker: Sticker; count: number; onSet: (c: number) => void; onClose: () => void;
}) {
  const dupes = count >= 2 ? count - 1 : 0;
  return (
    <div>
      <p className="font-600 text-ink-soft mb-4">{sticker.label}</p>
      <div className="flex items-center justify-center gap-6">
        <Button variant="soft" onClick={() => onSet(Math.max(0, count - 1))} aria-label="menos"><Icon name="minus" size={22} /></Button>
        <div className="text-center min-w-24">
          <div className="font-display font-800 text-5xl text-brand-600 tnum">{count}</div>
          <div className="text-sm font-600 text-ink-soft">
            {count === 0 ? 'falta' : dupes > 0 ? `tem · ${dupes} repetida${dupes > 1 ? 's' : ''}` : 'tem 1'}
          </div>
        </div>
        <Button variant="soft" onClick={() => onSet(count + 1)} aria-label="mais"><Icon name="plus" size={22} /></Button>
      </div>
      <div className="mt-6"><Button full size="lg" onClick={onClose}>Pronto</Button></div>
    </div>
  );
}
