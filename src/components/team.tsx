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
