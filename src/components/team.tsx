/** Identidade visual de times e avatares — bandeiras oficiais + avatares-logo. */
import { useState, type ReactNode } from 'react';
import { getTeamColor, getFlagUrl, readableOn } from '../data/worldcup2026';

/* ----------------------------- AVATARES (logos) ---------------------------- */

export const AVATARS: { id: string; color: string }[] = [
  { id: 'ball', color: '#0b7a4b' },
  { id: 'trophy', color: '#d29a26' },
  { id: 'star', color: '#1f72d6' },
  { id: 'shield', color: '#c40b1e' },
  { id: 'crown', color: '#0a8fb0' },
  { id: 'bolt', color: '#ec6a1a' },
  { id: 'flame', color: '#b81226' },
  { id: 'medal', color: '#6d3fb0' },
  { id: 'jersey', color: '#16203f' },
  { id: 'goal', color: '#c41276' },
  { id: 'rocket', color: '#0a6b3f' },
  { id: 'heart', color: '#d6336c' },
];
export const AVATAR_IDS = AVATARS.map((a) => a.id);
const AVATAR_MAP = new Map(AVATARS.map((a) => [a.id, a]));

const LOGOS: Record<string, ReactNode> = {
  ball: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.2l3 2.2-1.1 3.5h-3.8L9 9.4z" fill="currentColor" stroke="none" /><path d="M12 7.2V3.8M8.9 9.4 5.7 8.2M15.1 9.4 18.3 8.2M10.1 12.9 8 16.2M13.9 12.9 16 16.2" /></>,
  trophy: <><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" /><path d="M12 13v4M9 21h6M10 17h4" /></>,
  star: <path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8 6.8 19l1-5.8L3.6 9.1l5.8-.8z" fill="currentColor" stroke="none" />,
  shield: <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z" fill="currentColor" stroke="none" />,
  crown: <path d="M4 8l3.2 3.6L12 5l4.8 6.6L20 8l-1.8 11H5.8z" fill="currentColor" stroke="none" />,
  bolt: <path d="M13 3 5 13.5h5.2L9 21l9-10.5h-5.2z" fill="currentColor" stroke="none" />,
  flame: <path d="M12 3c.8 3.2 4.5 4.3 4.5 8.8a4.5 4.5 0 0 1-9 0c0-1.8.9-2.9 1.8-3.8.4 1.7 1.7 1.9 1.7 1.9.5-1.9-1-3.9-1-6.9z" fill="currentColor" stroke="none" />,
  medal: <><circle cx="12" cy="14.5" r="5" fill="currentColor" stroke="none" /><path d="M9 9.5 6.5 3h11L15 9.5" /></>,
  jersey: <path d="M9 4.5 4 8l2 5 2.6-1.2V20h6.8v-8.2L18 13l2-5-5-3.5c-.8 1.7-5.2 1.7-6 0z" fill="currentColor" stroke="none" />,
  goal: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /></>,
  rocket: <path d="M12 3c3 1.6 5 4.6 5 8.2L14.5 14h-5L7 11.2C7 7.6 9 4.6 12 3z M9.6 14.4 8 19l2-1.2 2 1.2-1.6-4.6z" fill="currentColor" stroke="none" />,
  heart: <path d="M12 20S4 14.6 4 9.4A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 8 2.4C20 14.6 12 20 12 20z" fill="currentColor" stroke="none" />,
};

function fallbackId(seed: string): string {
  let h = 0;
  for (const ch of seed ?? 'x') h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_IDS[h % AVATAR_IDS.length];
}

function Logo({ id, color, size }: { id: string; color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ color }}
      fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {LOGOS[id] ?? LOGOS.ball}
    </svg>
  );
}

/** Avatar = círculo com a logo escolhida (robusto a valores antigos). */
export function Avatar({ avatar, size = 44 }: { avatar: string; size?: number }) {
  const def = AVATAR_MAP.get(avatar) ?? AVATAR_MAP.get(fallbackId(avatar))!;
  const fg = readableOn(def.color);
  return (
    <div className="grid place-items-center rounded-full shrink-0 ring-1 ring-black/5"
      style={{ width: size, height: size, background: def.color }}>
      <Logo id={def.id} color={fg} size={Math.round(size * 0.58)} />
    </div>
  );
}

/** Camisa simples (usada na marca/splash). */
export function Jersey({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M18.5 7 L9 12 L12 23 L16.5 20.8 V41 H31.5 V20.8 L36 23 L39 12 L29.5 7 C29.5 10.2 18.5 10.2 18.5 7 Z" fill={color} />
    </svg>
  );
}

/* ------------------------------- BANDEIRAS -------------------------------- */

const SIZES = {
  sm: { w: 26, h: 18, px: 80 },
  md: { w: 34, h: 23, px: 80 },
  lg: { w: 52, h: 35, px: 160 },
} as const;

/** Bandeira oficial do país (flagcdn — domínio público). Fallback: sigla. */
export function Flag({ code, size = 'md' }: { code: string; size?: keyof typeof SIZES }) {
  const [failed, setFailed] = useState(false);
  const { w, h, px } = SIZES[size];
  const url = getFlagUrl(code, px as 80 | 160);

  if (failed || !url) {
    const color = getTeamColor(code);
    return (
      <span className="inline-grid place-items-center rounded font-display font-700 tnum shrink-0"
        style={{ width: w, height: h, background: color, color: readableOn(color), fontSize: h * 0.6 }}>
        {code}
      </span>
    );
  }
  return (
    <img src={url} alt={code} width={w} height={h} loading="lazy" onError={() => setFailed(true)}
      className="rounded object-cover shrink-0 ring-1 ring-black/10" style={{ width: w, height: h }} />
  );
}

/** Alias mantido por compatibilidade — mostra a bandeira. */
export const TeamBadge = Flag;
