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
  onAddDupe: () => void;
}

/**
 * "Espaço" de figurinha estilo álbum. Vazio = recuado/tracejado com número.
 * Colado = relevo na cor da seleção (foil dourado nos especiais/escudos).
 * Tap = tem/falta. Botão "+" (sempre visível quando tem) e segurar = repetidas.
 */
export default function StickerCell({ sticker, count, batch, onTap, onLongPress, onAddDupe }: Props) {
  const timer = useRef<number | null>(null);
  const longFired = useRef(false);

  const have = count >= 1;
  const dupes = count >= 2 ? count - 1 : 0; // repetidas = extras para trocar
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

  // número oficial: dentro de um time mostramos a posição (1..20); nas especiais o código.
  const isSpecial = sticker.type === 'special';
  const num = sticker.slot != null ? String(sticker.slot) : sticker.code;
  const numPx = num.length <= 2 ? 28 : num.length === 3 ? 21 : 16;

  function addDupe(e: React.PointerEvent | React.MouseEvent) {
    e.stopPropagation();
    tapHaptic('pop');
    popSound();
    onAddDupe();
  }

  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onPointerDown={start}
      onPointerUp={end}
      onPointerLeave={end}
      onClick={click}
      aria-label={`Figurinha ${sticker.code}, ${sticker.label}. ${have ? (dupes ? `tem, ${dupes} repetidas` : 'tem') : 'falta'}`}
      className={slotClass}
      style={{ ['--tc' as string]: tc }}
    >
      {isSpecial ? (
        <span className="absolute inset-0 flex flex-col items-center justify-center px-1 text-center"
          style={{ color: have ? '#3a2a06' : '#9aa3b2' }}>
          <span className="font-display font-800 tnum leading-none" style={{ fontSize: 13 }}>{sticker.code}</span>
          <span className="mt-0.5 text-[8.5px] font-700 leading-tight line-clamp-2">{sticker.label}</span>
        </span>
      ) : have ? (
        <span className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: ink }}>
          <span className="font-display font-800 leading-none tnum drop-shadow-sm" style={{ fontSize: numPx }}>{num}</span>
        </span>
      ) : (
        <span className="absolute inset-0 flex flex-col items-center justify-center text-[#9aa3b2]">
          <span className="font-display font-700 leading-none tnum" style={{ fontSize: numPx }}>{num}</span>
        </span>
      )}

      {/* check de "tem" */}
      {have && (
        <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-white/90 text-brand-600 shadow">
          <Icon name="check" size={13} strokeWidth={3} />
        </span>
      )}

      {/* selo de repetidas (extras para trocar) */}
      {dupes > 0 && (
        <span className="absolute left-1 top-1 grid h-5 min-w-6 place-items-center rounded-full bg-gold-500 px-1 text-[11px] font-800 text-navy-900 shadow tnum">
          ×{dupes}
        </span>
      )}

      {/* botão "+" sempre visível quando tem: soma uma repetida com um toque */}
      {have && (
        <span
          role="button"
          aria-label="Adicionar uma repetida"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={addDupe}
          className="absolute bottom-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-white text-brand-600 shadow ring-1 ring-black/10 active:scale-90"
        >
          <Icon name="plus" size={15} strokeWidth={3} />
        </span>
      )}
    </motion.button>
  );
}
