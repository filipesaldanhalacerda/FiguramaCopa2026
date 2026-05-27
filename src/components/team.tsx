/** Identidade visual de times e avatares — bandeiras oficiais + avatares-logo. */
import { useState, type ReactNode } from 'react';
import { getTeamColor, getFlagUrl, readableOn } from '../data/worldcup2026';

/* ----------------------------- AVATARES (logos) ---------------------------- */

export const AVATARS: { id: string; color: string }[] = [
  { id: 'ball', color: '#0b7a4b' },
  { id: 'trophy', color: '#d29a26' },
  { id: 'jersey', color: '#1f72d6' },
  { id: 'shield', color: '#c40b1e' },
  { id: 'boot', color: '#16203f' },
  { id: 'whistle', color: '#0a8fb0' },
  { id: 'goal', color: '#6d3fb0' },
  { id: 'flag', color: '#ec6a1a' },
  { id: 'medal', color: '#b81226' },
  { id: 'cone', color: '#c41276' },
  { id: 'card', color: '#0a6b3f' },
  { id: 'stopwatch', color: '#d6336c' },
];
export const AVATAR_IDS = AVATARS.map((a) => a.id);
const AVATAR_MAP = new Map(AVATARS.map((a) => [a.id, a]));

const LOGOS: Record<string, ReactNode> = {
  // bola de futebol
  ball: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.2l3 2.2-1.1 3.5h-3.8L9 9.4z" fill="currentColor" stroke="none" /><path d="M12 7.2V3.8M8.9 9.4 5.7 8.2M15.1 9.4 18.3 8.2M10.1 12.9 8 16.2M13.9 12.9 16 16.2" /></>,
  // taça
  trophy: <><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" /><path d="M12 13v4M9 21h6M10 17h4" /></>,
  // camisa
  jersey: <path d="M9 4.5 4 8l2 5 2.6-1.2V20h6.8v-8.2L18 13l2-5-5-3.5c-.8 1.7-5.2 1.7-6 0z" fill="currentColor" stroke="none" />,
  // escudo
  shield: <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z" fill="currentColor" stroke="none" />,
  // chuteira
  boot: <><path d="M3 13.8c0-2 1.3-3.5 3.4-4.2L10.6 8 12 11.4l6.6 1.2c1.5.3 2.4 1.3 2.4 2.8v1.2H3z" fill="currentColor" stroke="none" /><path d="M6 18v1.7M10 18v1.7M14 18v1.7M18 18v1.7" /></>,
  // apito
  whistle: <><rect x="6.5" y="9" width="12.5" height="7.5" rx="3.75" fill="currentColor" stroke="none" /><path d="M6.5 11.2H4a1.3 1.3 0 0 0 0 2.6h2.5z" fill="currentColor" stroke="none" /><path d="M9 5.5l1.6 3.2" /></>,
  // gol (trave + rede)
  goal: <><path d="M4 19V8h16v11" /><path d="M8 8v11M12 8v11M16 8v11M4 12h16M4 16h16" /></>,
  // bandeira de escanteio
  flag: <><path d="M6 21V3.5" /><path d="M6 4.5h12.6l-3.3 4 3.3 4H6z" fill="currentColor" stroke="none" /></>,
  // medalha
  medal: <><circle cx="12" cy="14.5" r="5" fill="currentColor" stroke="none" /><path d="M9 9.5 6.5 3h11L15 9.5" /></>,
  // cone de treino
  cone: <><path d="M12 4 7.5 18h9z" fill="currentColor" stroke="none" /><path d="M5 19.2h14" /></>,
  // cartão do juiz
  card: <rect x="8.5" y="4.5" width="8" height="13" rx="1.5" transform="rotate(14 12.5 11)" fill="currentColor" stroke="none" />,
  // cronômetro
  stopwatch: <><circle cx="12" cy="13.5" r="6.5" /><path d="M12 13.5V9.5M9.5 3.5h5M18.2 7.4l1.3-1.3" /></>,
};

function fallbackId(seed: string): string {
  let h = 0;
  for (const ch of seed ?? 'x') h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_IDS[h % AVATAR_IDS.length];
}

function Logo({ id, color, size }: { id: string; color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ color }}
      fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      <Logo id={def.id} color={fg} size={Math.round(size * 0.64)} />
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
