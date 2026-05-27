/**
 * Parceiros de demonstração (seed local) — fazem o match funcionar mesmo
 * offline / sem backend. Quando o Supabase estiver ligado, sync.ts baixa
 * parceiros reais e estes podem ser ocultados. Determinístico (seed fixa).
 */
import { db, type PeerRow } from './db';
import { STICKERS } from '../data/stickers';
import { TEAMS } from '../data/worldcup2026';

const NAMES = [
  'Téo', 'Lara', 'Caco', 'Bia', 'Nando', 'Manu', 'Rivaldinho',
  'Duda', 'Léo', 'Maju', 'Pipoca', 'Zezé',
];
// cores de "kit" para os avatares (sem emojis)
const AVATARS = [
  '#0b7a4b', '#1b2a55', '#c40b1e', '#d29a26', '#1f72d6', '#ec6a1a',
  '#6d3fb0', '#0a8fb0', '#b81226', '#2a2a2a', '#0a6b3f', '#c41276',
];
const CITIES = ['São Paulo', 'Rio', 'BH', 'Curitiba', 'Recife', 'Salvador'];

// PRNG determinístico (mulberry32)
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makePeerCollection(rand: () => number): Record<number, number> {
  const col: Record<number, number> = {};
  for (const s of STICKERS) {
    const r = rand();
    // ~62% tem a figurinha; dessas ~28% é repetida (conta 2-4)
    if (r < 0.62) {
      col[s.id] = r < 0.18 ? 2 + ((rand() * 3) | 0) : 1;
    }
  }
  return col;
}

export function buildDemoPeers(): PeerRow[] {
  return NAMES.map((name, i) => {
    const rand = rng(1000 + i * 97);
    const team = TEAMS[(rand() * TEAMS.length) | 0];
    return {
      id: `demo-${i}`,
      name,
      avatar: AVATARS[i % AVATARS.length],
      favTeam: team.code,
      city: CITIES[(rand() * CITIES.length) | 0],
      collection: makePeerCollection(rand),
      demo: true,
    };
  });
}

export async function ensureDemoSeed(): Promise<void> {
  const count = await db.peers.count();
  if (count > 0) return;
  await db.peers.bulkPut(buildDemoPeers());
}
