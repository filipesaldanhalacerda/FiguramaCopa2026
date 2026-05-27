/** Primitivos de UI do Figurama — cara de adesivo, lúdicos e acessíveis. */
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { tapHaptic } from '../lib/haptics';
import { Icon, type IconName } from './icons';

type Variant = 'primary' | 'ghost' | 'soft' | 'sky' | 'magenta' | 'navy' | 'gold';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white shadow-[var(--shadow-card)]',
  navy: 'bg-navy-800 text-white shadow-[var(--shadow-card)]',
  gold: 'bg-gold-500 text-navy-900 shadow-[var(--shadow-card)]',
  sky: 'bg-[var(--color-sky-fest)] text-white shadow-[var(--shadow-card)]',
  magenta: 'bg-[var(--color-magenta)] text-white shadow-[var(--shadow-card)]',
  soft: 'bg-brand-100 text-brand-700',
  ghost: 'bg-transparent text-ink-soft',
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  full?: boolean;
  size?: 'md' | 'lg';
}

export function Button({
  variant = 'primary', full, size = 'md', className = '', onClick, children, ...rest
}: BtnProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={(e) => {
        tapHaptic('light');
        onClick?.(e);
      }}
      className={`font-display font-700 rounded-[var(--radius-sticker)] inline-flex items-center justify-center gap-2 transition-colors active:brightness-95 disabled:opacity-50 ${
        size === 'lg' ? 'text-lg px-7 py-4 min-h-[56px]' : 'text-base px-5 py-3 min-h-[48px]'
      } ${full ? 'w-full' : ''} ${variants[variant]} ${className}`}
      {...(rest as object)}
    >
      {children}
    </motion.button>
  );
}

export function Card({
  children, className = '', onClick, as = 'div',
}: { children: ReactNode; className?: string; onClick?: () => void; as?: 'div' | 'button' }) {
  const base =
    'bg-paper rounded-[var(--radius-sticker)] border-2 border-line shadow-[0_2px_0_rgba(26,19,48,0.06),0_8px_20px_-12px_rgba(26,19,48,0.18)]';
  if (as === 'button' || onClick) {
    return (
      <motion.button whileTap={{ scale: 0.98 }} onClick={onClick} className={`${base} text-left w-full ${className}`}>
        {children}
      </motion.button>
    );
  }
  return <div className={`${base} ${className}`}>{children}</div>;
}

export function ProgressRing({
  percent, size = 120, stroke = 12, children,
}: { percent: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, percent) / 100) * c;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-brand-100)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-brand-500)"
          strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Chip({
  active, children, onClick, color,
}: { active?: boolean; children: ReactNode; onClick?: () => void; color?: string }) {
  return (
    <button
      onClick={() => { tapHaptic('light'); onClick?.(); }}
      className={`font-700 text-sm rounded-full px-4 py-2 whitespace-nowrap transition-all border-2 ${
        active
          ? 'text-white border-transparent'
          : 'bg-paper text-ink-soft border-line'
      }`}
      style={active ? { backgroundColor: color ?? 'var(--color-brand-500)' } : undefined}
    >
      {children}
    </button>
  );
}

export function Pill({ children, color = 'var(--color-brand-500)' }: { children: ReactNode; color?: string }) {
  return (
    <span className="font-800 text-xs rounded-full px-2.5 py-1 text-white" style={{ backgroundColor: color }}>
      {children}
    </span>
  );
}

/** Bottom sheet acessível com backdrop. */
export function Sheet({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 bg-cream rounded-t-[2rem] border-t-2 border-line p-5 safe-bottom max-h-[85vh] overflow-y-auto"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            role="dialog" aria-modal="true"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
            {title && <h2 className="text-2xl font-800 mb-3">{title}</h2>}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function EmptyState({ icon, title, hint }: { icon: IconName; title: string; hint?: string }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-400">
        <Icon name={icon} size={32} />
      </div>
      <p className="font-display font-800 text-xl uppercase tracking-wide">{title}</p>
      {hint && <p className="text-ink-soft mt-1 font-600">{hint}</p>}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-1">
      <h2 className="font-display font-800 text-xl">{children}</h2>
      {action}
    </div>
  );
}
