/** Identidade visual de times e avatares — sem emojis, no tema da Copa. */
import { getTeamColor, readableOn } from '../data/worldcup2026';

/** Cores de "kit" para avatares (o usuário escolhe uma). */
export const AVATAR_COLORS = [
  '#0b7a4b', '#1b2a55', '#c40b1e', '#d29a26', '#1f72d6', '#ec6a1a',
  '#6d3fb0', '#0a8fb0', '#b81226', '#2a2a2a', '#0a6b3f', '#c41276',
];

/** Camisa de futebol estilizada. */
export function Jersey({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M18 8 L9 13 L12.5 24 L17 21.5 V41 H31 V21.5 L35.5 24 L39 13 L30 8 C28.5 11.5 19.5 11.5 18 8 Z"
        fill={color}
      />
    </svg>
  );
}

/** Avatar = círculo com a camisa na cor escolhida. */
export function Avatar({ color, size = 44 }: { color: string; size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-full shrink-0"
      style={{ width: size, height: size, background: color }}
    >
      <Jersey color={readableOn(color)} size={size * 0.62} />
    </div>
  );
}

/** Badge com o código FIFA do time (ex.: BRA), na cor da seleção. */
export function TeamBadge({
  code, size = 'md',
}: { code: string; size?: 'sm' | 'md' | 'lg' }) {
  const color = getTeamColor(code);
  const dims = {
    sm: 'text-[11px] px-1.5 py-0.5 min-w-9',
    md: 'text-sm px-2 py-1 min-w-11',
    lg: 'text-lg px-2.5 py-1 min-w-14',
  }[size];
  return (
    <span
      className={`inline-grid place-items-center rounded-md font-display font-700 tracking-wide tnum ${dims}`}
      style={{ background: color, color: readableOn(color) }}
    >
      {code}
    </span>
  );
}
