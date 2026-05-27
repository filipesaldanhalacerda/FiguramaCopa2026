import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../../lib/store';
import { STICKERS } from '../../data/stickers';
import { Chip, Button, Sheet } from '../../components/ui';
import { tapHaptic } from '../../lib/haptics';

export default function MyList() {
  const profile = useStore((s) => s.profile)!;
  const counts = useStore((s) => s.counts);
  const nav = useNavigate();
  const [tab, setTab] = useState<'dupe' | 'missing'>('dupe');
  const [tv, setTv] = useState(false);
  const [share, setShare] = useState(false);

  const dupes = useMemo(() => STICKERS.filter((s) => (counts[s.id] ?? 0) >= 2), [counts]);
  const missing = useMemo(() => STICKERS.filter((s) => (counts[s.id] ?? 0) === 0), [counts]);
  const list = tab === 'dupe' ? dupes : missing;

  const url = `${location.origin}/u/${profile.slug}`;

  async function doShare() {
    const text = `Minhas figurinhas da Copa 2026 no Figurama! 🔁\nRepetidas: ${dupes.length} · Faltam: ${missing.length}\n${url}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Figurama', text, url }); return; } catch { /* cancelado */ }
    }
    setShare(true);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav('/trocar')} className="grid h-10 w-10 place-items-center rounded-2xl bg-paper border-2 border-line text-xl">←</button>
        <div className="flex-1">
          <h1 className="font-display font-800 text-2xl leading-none">Minha lista 📋</h1>
          <p className="text-sm font-700 text-ink-soft">Mostre pra trocar com qualquer pessoa!</p>
        </div>
      </header>

      <div className="flex gap-2">
        <Chip active={tab === 'dupe'} onClick={() => setTab('dupe')} color="var(--color-dupe)">🔁 Repetidas ({dupes.length})</Chip>
        <Chip active={tab === 'missing'} onClick={() => setTab('missing')} color="var(--color-ink-soft)">❌ Faltam ({missing.length})</Chip>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="soft" onClick={() => { tapHaptic('pop'); setTv(true); }}>📺 Tela cheia</Button>
        <Button variant="primary" onClick={doShare}>🔗 Compartilhar</Button>
      </div>

      {/* lista compacta de números */}
      <NumberCloud list={list} color={tab === 'dupe' ? 'var(--color-dupe)' : 'var(--color-ink-soft)'} counts={counts} showDupe={tab === 'dupe'} />

      {/* modo TV */}
      <Sheet open={tv} onClose={() => setTv(false)} title={tab === 'dupe' ? '🔁 Minhas repetidas' : '❌ Me faltam'}>
        <div className="flex flex-wrap gap-2 justify-center pb-4">
          {list.map((s) => (
            <span key={s.id} className="font-display font-800 text-3xl px-1" style={{ color: tab === 'dupe' ? 'var(--color-dupe)' : 'var(--color-ink)' }}>
              {s.id}{tab === 'dupe' && (counts[s.id] ?? 0) > 2 ? <sub className="text-base">x{(counts[s.id] ?? 0) - 1}</sub> : ''}
            </span>
          ))}
          {list.length === 0 && <p className="text-ink-soft font-700">Nada aqui ainda 🙂</p>}
        </div>
      </Sheet>

      {/* compartilhar / QR */}
      <Sheet open={share} onClose={() => setShare(false)} title="Compartilhar minha lista">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-3xl bg-white p-4 border-2 border-line">
            <QRCodeSVG value={url} size={180} fgColor="#1a1330" />
          </div>
          <p className="text-center font-700 text-ink-soft text-sm">Aponte a câmera pra ver minha lista, ou copie o link:</p>
          <div className="flex w-full gap-2">
            <input readOnly value={url} className="flex-1 rounded-2xl border-2 border-line bg-paper px-3 py-3 font-600 text-sm" />
            <Button onClick={() => { navigator.clipboard?.writeText(url); tapHaptic('success'); }}>Copiar</Button>
          </div>
          <p className="text-center text-xs text-ink-soft">Sua lista pública mostra só apelido, avatar e números — nada de dados pessoais.</p>
        </div>
      </Sheet>
    </div>
  );
}

function NumberCloud({ list, color, counts, showDupe }: {
  list: { id: number; label: string }[]; color: string; counts: Record<number, number>; showDupe: boolean;
}) {
  if (list.length === 0) {
    return <p className="text-center text-ink-soft font-700 py-8">Nada aqui ainda — marque suas figurinhas no álbum! 🙂</p>;
  }
  return (
    <div className="rounded-[var(--radius-sticker)] bg-paper border-2 border-line p-4">
      <div className="flex flex-wrap gap-2">
        {list.map((s) => {
          const extra = showDupe ? (counts[s.id] ?? 0) - 1 : 0;
          return (
            <span key={s.id} className="rounded-xl border-2 px-3 py-1.5 font-800" style={{ borderColor: color, color }}>
              {s.id}{extra > 1 ? ` x${extra}` : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
}
