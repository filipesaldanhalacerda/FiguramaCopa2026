import { motion } from 'framer-motion';
import { useRef } from 'react';
import type { Sticker } from '../../data/stickers';
import { getTeamColor, readableOn } from '../../data/worldcup2026';
import { tapHaptic, popSound } from '../../lib/haptics';
import { Icon } from '../../components/icons';

interface Props {
  sticker: Sticker;
  count: number;
  batch: boolean;
  onTap: () => void;
  onLongPress: () => void;
}

/**
 * "Espaço" de figurinha estilo álbum. Vazio = recuado/tracejado com número.
 * Colado = relevo na cor da seleção (foil dourado nos especiais/escudos).
 * Tap = tem/falta. Segurar = repetidas. Modo batch: tap soma +1.
 */
export default function StickerCell({ sticker, count, batch, onTap, onLongPress }: Props) {
  const timer = useRef<number | null>(null);
  const longFired = useRef(false);

  const have = count >= 1;
  const dupes = count >= 2 ? count - 1 : 0;
  const tc = sticker.type === 'special' ? '#d29a26' : getTeamColor(sticker.teamCode);
  const ink = sticker.shiny ? '#3a2a06' : readableOn(tc);

  const start = () => {
    longFired.current = false;
    timer.current = window.setTimeout(() => {
      longFired.current = true;
      tapHaptic('pop');
      onLongPress();
    }, 450);
  };
  const end = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const click = () => {
    if (longFired.current) return;
    if (have || batch) popSound();
    tapHaptic('light');
    onTap();
  };

  const slotClass = have ? (sticker.shiny ? 'slot slot--foil' : 'slot slot--filled') : 'slot slot--empty';

  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onPointerDown={start}
      onPointerUp={end}
      onPointerLeave={end}
      onClick={click}
      aria-label={`Figurinha ${sticker.id}, ${sticker.label}. ${have ? (dupes ? `tem, ${dupes} repetidas` : 'tem') : 'falta'}`}
      className={slotClass}
      style={{ ['--tc' as string]: tc }}
    >
      {have ? (
        <span className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: ink }}>
          <span className="font-display font-800 text-[28px] leading-none tnum drop-shadow-sm">{sticker.id}</span>
        </span>
      ) : (
        <span className="absolute inset-0 flex flex-col items-center justify-center text-[#9aa3b2]">
          <span className="font-display font-700 text-[24px] leading-none tnum">{sticker.id}</span>
        </span>
      )}

      {/* check de "tem" */}
      {have && (
        <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-white/90 text-brand-600 shadow">
          <Icon name="check" size={13} strokeWidth={3} />
        </span>
      )}
      {/* repetidas */}
      {dupes > 0 && (
        <span className="absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold-500 px-1 text-[11px] font-800 text-navy-900 shadow tnum">
          {dupes}
        </span>
      )}
    </motion.button>
  );
}
