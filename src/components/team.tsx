/** Identidade visual de times e avatares — bandeiras oficiais + avatares-logo. */
import { useState, type ReactNode } from 'react';
import { getTeamColor, getFlagUrl, readableOn } from '../data/worldcup2026';

/* ----------------------------- AVATARES (logos) ---------------------------- */

export const AVATARS: { id: string; color: string; num?: string }[] = [
  { id: 'ball', color: '#0b7a4b' },
  { id: 'trophy', color: '#d29a26' },
  { id: 'jersey', color: '#1f72d6' },
  { id: 'shield', color: '#c40b1e' },
  { id: 'star', color: '#ec6a1a' },
  { id: 'medal', color: '#0a8fb0' },
  { id: 'flag', color: '#0a6b3f' },
  { id: 'n10', color: '#16203f', num: '10' },
  { id: 'n9', color: '#6d3fb0', num: '9' },
  { id: 'n7', color: '#b81226', num: '7' },
  { id: 'n1', color: '#c41276', num: '1' },
  { id: 'n23', color: '#d6336c', num: '23' },
];
export const AVATAR_IDS = AVATARS.map((a) => a.id);
const AVATAR_MAP = new Map(AVATARS.map((a) => [a.id, a]));

// Cada logo é uma silhueta CHEIA em `fg` (branco); detalhes internos usam `bg`
// (cor do círculo) para "recortar" e ficarem nítidos no tamanho pequeno.
const LOGOS: Record<string, (fg: string, bg: string) => ReactNode> = {
  // bola de futebol
  ball: (fg, bg) => <><circle cx="12" cy="12" r="9" fill={fg} /><path d="M12 8l3 2.2-1.15 3.6h-3.7L9 10.2z" fill={bg} /><g stroke={bg} strokeWidth="1.8" strokeLinecap="round"><path d="M12 8V4.4" /><path d="M9 10.2 5.6 9.1" /><path d="M15 10.2 18.4 9.1" /><path d="M10.15 13.8 8 16.8" /><path d="M13.85 13.8 16 16.8" /></g></>,
  // taça
  trophy: (fg) => <><path d="M6.5 4h11v3.2a5.5 5.5 0 0 1-11 0z" fill={fg} /><path d="M11 11.5h2V16h3.2v2.4H7.8V16H11z" fill={fg} /><path d="M6.6 5H4.3v1.3a3.3 3.3 0 0 0 3.3 3.3M17.4 5h2.3v1.3a3.3 3.3 0 0 1-3.3 3.3" stroke={fg} strokeWidth="1.9" fill="none" strokeLinecap="round" /></>,
  // camisa
  jersey: (fg) => <path d="M9 4.5 4 8l2 5 2.6-1.2V20h6.8v-8.2L18 13l2-5-5-3.5c-.8 1.7-5.2 1.7-6 0z" fill={fg} />,
  // escudo (com estrela vazada — cara de brasão de seleção)
  shield: (fg, bg) => <><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z" fill={fg} /><path d="M12 8.1l1.05 2.15 2.35.3-1.7 1.6.45 2.3L12 15.6l-2.15 1.05.45-2.3-1.7-1.6 2.35-.3z" fill={bg} /></>,
  // bandeira de escanteio
  flag: (fg) => <><path d="M6 21V3.4" stroke={fg} strokeWidth="2.2" strokeLinecap="round" /><path d="M6 4.4h12.8l-3.4 4 3.4 4H6z" fill={fg} /></>,
  // medalha (com estrela vazada)
  medal: (fg, bg) => <><path d="M9 9.4 6.3 3M15 9.4 17.7 3" stroke={fg} strokeWidth="2.1" strokeLinecap="round" /><circle cx="12" cy="14.6" r="5.3" fill={fg} /><path d="M12 11.7l.95 1.95 2.15.25-1.6 1.5.42 2.1L12 16.55l-1.92 1 .42-2.1-1.6-1.5 2.15-.25z" fill={bg} /></>,
  // estrela (craque)
  star: (fg) => <path d="M12 3l2.6 5.3 5.8.85-4.2 4.05 1 5.8L12 16.85 6.8 19l1-5.8L3.6 9.15l5.8-.85z" fill={fg} />,
};

function fallbackId(seed: string): string {
  let h = 0;
  for (const ch of seed ?? 'x') h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_IDS[h % AVATAR_IDS.length];
}

function Logo({ id, fg, bg, size }: { id: string; fg: string; bg: string; size: number }) {
  const render = LOGOS[id] ?? LOGOS.ball;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinejoin="round" aria-hidden="true">
      {render(fg, bg)}
    </svg>
  );
}

/** Avatar = círculo com a logo (ícone) OU o número de camisa escolhido. */
export function Avatar({ avatar, size = 44 }: { avatar: string; size?: number }) {
  const def = AVATAR_MAP.get(avatar) ?? AVATAR_MAP.get(fallbackId(avatar))!;
  const fg = readableOn(def.color);
  return (
    <div className="grid place-items-center rounded-full shrink-0 ring-1 ring-black/5"
      style={{ width: size, height: size, background: def.color }}>
      {def.num ? (
        <span className="font-display font-800 tnum leading-none"
          style={{ color: fg, fontSize: Math.round(size * (def.num.length > 1 ? 0.46 : 0.56)) }}>
          {def.num}
        </span>
      ) : (
        <Logo id={def.id} fg={fg} bg={def.color} size={Math.round(size * 0.64)} />
      )}
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
