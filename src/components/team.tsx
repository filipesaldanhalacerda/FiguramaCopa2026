/** Identidade visual de times e avatares — bandeiras oficiais + avatares de camisa. */
import { useState } from 'react';
import { getTeamColor, getFlagUrl, readableOn } from '../data/worldcup2026';

/** Cores de "kit" para avatares (o usuário escolhe uma). */
export const AVATAR_COLORS = [
  '#0b7a4b', '#1b2a55', '#c40b1e', '#d29a26', '#1f72d6', '#ec6a1a',
  '#6d3fb0', '#0a8fb0', '#b81226', '#2a2a2a', '#0a6b3f', '#c41276',
];

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
      <span
        className="inline-grid place-items-center rounded font-display font-700 tnum shrink-0"
        style={{ width: w, height: h, background: color, color: readableOn(color), fontSize: h * 0.6 }}
      >
        {code}
      </span>
    );
  }
  return (
    <img
      src={url}
      alt={code}
      width={w}
      height={h}
      loading="lazy"
      onError={() => setFailed(true)}
      className="rounded object-cover shrink-0 ring-1 ring-black/10"
      style={{ width: w, height: h }}
    />
  );
}

/** Alias mantido por compatibilidade — agora mostra a bandeira. */
export const TeamBadge = Flag;

/** Garante uma cor válida; valores antigos (emoji) viram uma cor consistente. */
export function safeColor(c: string | undefined): string {
  if (c && /^#[0-9a-fA-F]{6}$/.test(c)) return c;
  let h = 0;
  for (const ch of c ?? 'x') h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/** Camisa de futebol estilizada (corpo, mangas e gola). */
export function Jersey({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" fill="none">
      <path
        d="M18.5 7 L9 12 L12 23 L16.5 20.8 V41 H31.5 V20.8 L36 23 L39 12 L29.5 7
           C29.5 10.2 18.5 10.2 18.5 7 Z"
        fill={color}
      />
      {/* gola */}
      <path d="M19 7.4 C21 10.4 27 10.4 29 7.4" stroke={color} strokeWidth="0" />
      <path d="M20.2 8.2 C22 10.6 26 10.6 27.8 8.2" stroke="rgba(0,0,0,0.18)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Avatar = círculo com a camisa na cor escolhida (robusto a valores antigos). */
export function Avatar({ color, size = 44 }: { color: string; size?: number }) {
  const col = safeColor(color);
  return (
    <div
      className="grid place-items-center rounded-full shrink-0 ring-1 ring-black/5"
      style={{ width: size, height: size, background: col }}
    >
      <Jersey color={readableOn(col)} size={size * 0.64} />
    </div>
  );
}
