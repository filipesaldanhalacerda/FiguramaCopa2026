import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { SECTIONS, stickersOfSection, type Sticker } from '../../data/stickers';
import { getTeam } from '../../data/worldcup2026';
import { Chip, Sheet, Button } from '../../components/ui';
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

  const haveCount = all.filter((s) => (counts[s.id] ?? 0) >= 1).length;
  const done = haveCount === all.length && all.length > 0;

  const list = all.filter((s) => {
    const c = counts[s.id] ?? 0;
    if (filter === 'missing') return c === 0;
    if (filter === 'have') return c >= 1;
    if (filter === 'dupe') return c >= 2;
    return true;
  });

  async function handleTap(s: Sticker) {
    const prevHave = haveCount;
    if (batch) {
      await setCount(s.id, (counts[s.id] ?? 0) + 1);
    } else {
      await toggleHave(s.id);
    }
    // celebra ao completar a seção
    const nowHave = all.filter((x) => (x.id === s.id ? true : (counts[x.id] ?? 0) >= 1)).length;
    if (prevHave < all.length && nowHave === all.length) {
      burstConfetti();
      tapHaptic('success');
      if (team) unlock(`page-${team.code}`);
    }
  }

  return (
    <div>
      <header className="mb-3 flex items-center gap-3">
        <button onClick={() => nav('/album')} className="grid h-10 w-10 place-items-center rounded-2xl bg-paper border-2 border-line text-xl">←</button>
        <div className="flex items-center gap-2">
          <span className="text-3xl">{meta?.flag ?? '✨'}</span>
          <div>
            <h1 className="font-display font-800 text-2xl leading-none">{meta?.title}</h1>
            {team && <p className="text-sm font-700 text-ink-soft">Grupo {team.group} · {team.confed}</p>}
          </div>
        </div>
      </header>

      {/* progresso da seção */}
      <div className="mb-3">
        <div className="flex justify-between text-sm font-700 mb-1">
          <span className={done ? 'text-[var(--color-have)]' : 'text-ink-soft'}>
            {done ? '✅ Página completa!' : `${haveCount} de ${all.length}`}
          </span>
          <span className="text-ink-soft">{Math.round((haveCount / all.length) * 100)}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-brand-100 overflow-hidden">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(haveCount / all.length) * 100}%` }} />
        </div>
      </div>

      {/* filtros + batch */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-3">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')}>Tudo</Chip>
        <Chip active={filter === 'missing'} onClick={() => setFilter('missing')} color="var(--color-ink-soft)">Faltam</Chip>
        <Chip active={filter === 'have'} onClick={() => setFilter('have')} color="var(--color-have)">Tenho</Chip>
        <Chip active={filter === 'dupe'} onClick={() => setFilter('dupe')} color="var(--color-dupe)">Repetidas</Chip>
        <div className="ml-auto" />
        <Chip active={batch} onClick={() => setBatch((b) => !b)} color="var(--color-magenta)">📦 Bater rápido</Chip>
      </div>

      {batch && (
        <p className="mb-3 rounded-2xl bg-[var(--color-magenta)]/10 px-4 py-2 text-sm font-700 text-[var(--color-magenta)]">
          Modo pacote: cada toque soma +1. Ótimo pra marcar um pacote inteiro!
        </p>
      )}

      {/* grid */}
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
      {list.length === 0 && (
        <p className="text-center text-ink-soft font-700 py-8">Nada por aqui com esse filtro 🙂</p>
      )}

      {/* stepper de repetidas */}
      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing ? `Figurinha ${editing.id}` : ''}>
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
      <p className="font-700 text-ink-soft mb-1">{sticker.label}</p>
      <p className="font-700 mb-4">Quantas você tem dessa?</p>
      <div className="flex items-center justify-center gap-6">
        <Button variant="soft" size="lg" onClick={() => onSet(Math.max(0, count - 1))}>−</Button>
        <div className="text-center">
          <div className="font-display font-800 text-5xl text-brand-600">{count}</div>
          <div className="text-sm font-700 text-ink-soft">
            {count === 0 ? 'falta' : dupes > 0 ? `tenho · ${dupes} repetida${dupes > 1 ? 's' : ''}` : 'tenho 1'}
          </div>
        </div>
        <Button variant="soft" size="lg" onClick={() => onSet(count + 1)}>+</Button>
      </div>
      <div className="mt-6">
        <Button full size="lg" onClick={onClose}>Pronto ✅</Button>
      </div>
    </div>
  );
}
