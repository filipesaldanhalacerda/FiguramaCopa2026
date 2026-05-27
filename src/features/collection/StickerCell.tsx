import { motion } from 'framer-motion';
import { useRef } from 'react';
import type { Sticker } from '../../data/stickers';
import { tapHaptic, popSound } from '../../lib/haptics';

interface Props {
  sticker: Sticker;
  count: number;
  batch: boolean;
  onTap: () => void;
  onLongPress: () => void;
}

/**
 * Célula de figurinha. Tap = tem/falta. Segurar = abre repetidas.
 * No modo "bater rápido" (batch), tap incrementa a contagem.
 */
export default function StickerCell({ sticker, count, batch, onTap, onLongPress }: Props) {
  const timer = useRef<number | null>(null);
  const longFired = useRef(false);

  const have = count >= 1;
  const dupes = count >= 2 ? count - 1 : 0;

  const start = () => {
    longFired.current = false;
    timer.current = window.setTimeout(() => {
      longFired.current = true;
      tapHaptic('pop');
      onLongPress();
    }, 450);
  };
  const end = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
  };
  const click = () => {
    if (longFired.current) return;
    if (have || batch) popSound();
    tapHaptic('light');
    onTap();
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onPointerDown={start}
      onPointerUp={end}
      onPointerLeave={end}
      onClick={click}
      aria-label={`Figurinha ${sticker.id} ${sticker.label}. ${have ? (dupes ? `tenho, ${dupes} repetidas` : 'tenho') : 'falta'}`}
      className={`relative grid aspect-[3/4] place-items-center rounded-2xl border-2 transition-colors ${
        have
          ? 'bg-[var(--color-have)]/12 border-[var(--color-have)]'
          : 'border-dashed border-[var(--color-missing)] bg-paper'
      }`}
    >
      {/* número grande */}
      <span className={`font-display font-800 text-2xl leading-none ${have ? 'text-[var(--color-have)]' : 'text-ink-soft/60'}`}>
        {sticker.id}
      </span>
      <span className="absolute bottom-1 left-1 right-1 truncate text-center text-[9px] font-700 text-ink-soft/70">
        {sticker.label}
      </span>

      {/* estado: tem */}
      {have && (
        <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-[var(--color-have)] text-white text-sm shadow">
          ✓
        </span>
      )}
      {/* repetidas */}
      {dupes > 0 && (
        <span className="absolute -left-1.5 -top-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-[var(--color-dupe)] px-1 text-white text-xs font-800 shadow">
          x{dupes}
        </span>
      )}
      {/* brilho de raridade */}
      {sticker.shiny && (
        <span className="absolute right-1 top-1 text-xs">✨</span>
      )}
    </motion.button>
  );
}
