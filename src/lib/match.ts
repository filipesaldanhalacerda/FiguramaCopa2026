/**
 * Motor de match (espelha a RPC `match_partners` do Postgres).
 * Para cada parceiro calcula:
 *   - iGet:  figurinhas que ELE tem repetidas (>=2) e que a MIM faltam (0)
 *   - iGive: figurinhas que EU tenho repetidas (>=2) e que a ELE faltam (0)
 * Ordena por troca equilibrada (menor lado primeiro) e depois por volume.
 */
import { getSticker, type Sticker } from '../data/stickers';
import type { PeerRow } from './db';

export interface MatchResult {
  peer: PeerRow;
  iGet: Sticker[];
  iGive: Sticker[];
  /** qualidade da troca: min(iGet, iGive) — quanto maior, mais equilibrada */
  balance: number;
  total: number;
}

export function computeMatches(
  mine: Map<number, number>,
  peers: PeerRow[],
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const peer of peers) {
    const iGet: Sticker[] = [];
    const iGive: Sticker[] = [];

    // o que ELE me dá: ele tem repetida e a mim falta
    for (const [idStr, cnt] of Object.entries(peer.collection)) {
      const id = Number(idStr);
      if (cnt >= 2 && (mine.get(id) ?? 0) === 0) {
        const s = getSticker(id);
        if (s) iGet.push(s);
      }
    }
    // o que EU dou: eu tenho repetida e a ele falta
    for (const [id, cnt] of mine.entries()) {
      if (cnt >= 2 && (peer.collection[id] ?? 0) === 0) {
        const s = getSticker(id);
        if (s) iGive.push(s);
      }
    }

    const balance = Math.min(iGet.length, iGive.length);
    if (balance === 0) continue;

    iGet.sort((a, b) => a.id - b.id);
    iGive.sort((a, b) => a.id - b.id);
    results.push({ peer, iGet, iGive, balance, total: iGet.length + iGive.length });
  }

  results.sort((a, b) => b.balance - a.balance || b.total - a.total);
  return results;
}

export function matchQuality(m: MatchResult): { label: string; stars: number; color: string } {
  if (m.balance >= 5) return { label: 'Troca perfeita', stars: 3, color: 'var(--color-gold)' };
  if (m.balance >= 3) return { label: 'Ótima troca', stars: 2, color: 'var(--color-sky-fest)' };
  return { label: 'Boa troca', stars: 1, color: 'var(--color-brand-500)' };
}

export interface TradeProposal {
  give: Sticker[]; // o que EU dou (das minhas repetidas)
  get: Sticker[];  // o que EU recebo
  size: number;    // troca justa N por N
  moreGet: number; // figurinhas extras que ele tem e me faltam
  moreGive: number; // minhas repetidas extras que ele precisa
}

/** Monta uma troca EQUILIBRADA (N por N), limitada para não virar um monte por 1. */
export function proposeTrade(m: MatchResult, max = 10): TradeProposal {
  const k = Math.min(m.iGet.length, m.iGive.length, max);
  return {
    give: m.iGive.slice(0, k),
    get: m.iGet.slice(0, k),
    size: k,
    moreGet: Math.max(0, m.iGet.length - k),
    moreGive: Math.max(0, m.iGive.length - k),
  };
}

export interface WishlistMatch {
  peer: PeerRow;
  iGet: Sticker[];
}

/**
 * Descoberta unidirecional: parceiros que TÊM repetidas do que a mim falta.
 * Mantém a tela de trocas viva mesmo para quem ainda não marcou repetidas.
 */
export function computeWishlist(
  mine: Map<number, number>,
  peers: PeerRow[],
): WishlistMatch[] {
  const out: WishlistMatch[] = [];
  for (const peer of peers) {
    const iGet: Sticker[] = [];
    for (const [idStr, cnt] of Object.entries(peer.collection)) {
      const id = Number(idStr);
      if (cnt >= 2 && (mine.get(id) ?? 0) === 0) {
        const s = getSticker(id);
        if (s) iGet.push(s);
      }
    }
    if (iGet.length) {
      iGet.sort((a, b) => a.id - b.id);
      out.push({ peer, iGet });
    }
  }
  out.sort((a, b) => b.iGet.length - a.iGet.length);
  return out;
}
