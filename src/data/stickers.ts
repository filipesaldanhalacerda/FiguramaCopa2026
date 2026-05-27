/**
 * Checklist do álbum Panini Copa 2026 — 980 figurinhas, com a NUMERAÇÃO OFICIAL.
 * Fonte da estrutura: checklist público da coleção (numeração = dado factual).
 *
 *   - Abertura foil (9): "00" (logo Panini) + FWC1..FWC8 (emblema, mascotes,
 *     slogan, bola, sedes Canadá/México/EUA).
 *   - FIFA Museum (11): FWC9..FWC19 (seleções campeãs do mundo).
 *   - 48 seleções × 20: código por time "MEX1".."MEX20" — escudo (foil),
 *     18 jogadores e foto do time. Times na ordem dos grupos A–L.
 *
 * `id` (1..980) é a chave interna estável (coleção/IndexedDB/match).
 * `code` é o número OFICIAL mostrado ao usuário (ex.: "MEX5", "FWC9", "00").
 */
import { TEAMS, type GroupId } from './worldcup2026';

export const CHECKLIST_VERSION = 'v2-oficial';
export const SPECIALS_COUNT = 20; // 9 abertura + 11 FIFA Museum
export const PER_TEAM = 20;       // escudo + 18 jogadores + foto do time
export const TOTAL = SPECIALS_COUNT + TEAMS.length * PER_TEAM; // 980

export type StickerType = 'special' | 'badge' | 'team_photo' | 'player';

export interface Sticker {
  /** chave interna sequencial (1..980) */
  id: number;
  /** número OFICIAL do álbum, mostrado ao usuário (ex.: "MEX5", "FWC9", "00") */
  code: string;
  /** posição na página do time (1..20); ausente nas especiais */
  slot?: number;
  /** seção: 'especiais' ou o código do time */
  section: string;
  type: StickerType;
  label: string;
  /** jogador identificado (craque) — apenas quando conhecido */
  person?: string;
  teamCode?: string;
  group?: GroupId;
  /** acabamento foil (escudos e abertura) */
  shiny: boolean;
}

export interface AlbumSection {
  key: string;
  title: string;
  group?: GroupId;
  range: [number, number];
  count: number;
}

// --- seção de abertura + FIFA Museum (20 figurinhas) ---
interface SpecialDef { code: string; label: string }
const SPECIALS: SpecialDef[] = [
  { code: '00', label: 'Logo Panini' },
  { code: 'FWC1', label: 'Emblema Oficial' },
  { code: 'FWC2', label: 'Emblema Oficial' },
  { code: 'FWC3', label: 'Mascotes Oficiais' },
  { code: 'FWC4', label: 'Slogan Oficial' },
  { code: 'FWC5', label: 'Bola Oficial' },
  { code: 'FWC6', label: 'Sedes — Canadá' },
  { code: 'FWC7', label: 'Sedes — México' },
  { code: 'FWC8', label: 'Sedes — EUA' },
  ...Array.from({ length: 11 }, (_, i) => ({ code: `FWC${9 + i}`, label: 'FIFA Museum' })),
];

function buildStickers(): Sticker[] {
  const list: Sticker[] = [];
  let id = 0;

  for (const sp of SPECIALS) {
    id++;
    list.push({ id, code: sp.code, section: 'especiais', type: 'special', label: sp.label, shiny: true });
  }

  for (const team of TEAMS) {
    for (let slot = 1; slot <= PER_TEAM; slot++) {
      id++;
      let type: StickerType;
      let label: string;
      let person: string | undefined;
      if (slot === 1) {
        type = 'badge';
        label = `Escudo • ${team.name}`;
      } else if (slot === PER_TEAM) {
        type = 'team_photo';
        label = `Foto do time • ${team.name}`;
      } else {
        type = 'player';
        const idx = slot - 2; // 0..17
        person = team.craques[idx];
        label = person ?? `Jogador ${idx + 1}`;
      }
      list.push({
        id,
        code: `${team.code}${slot}`,
        slot,
        section: team.code,
        type,
        label,
        person,
        teamCode: team.code,
        group: team.group,
        shiny: type === 'badge',
      });
    }
  }
  return list;
}

export const STICKERS: Sticker[] = buildStickers();

const byId = new Map(STICKERS.map((s) => [s.id, s]));
export const getSticker = (id: number): Sticker | undefined => byId.get(id);

const byCode = new Map(STICKERS.map((s) => [s.code.replace(/\s/g, '').toUpperCase(), s]));
/** Busca uma figurinha pelo número oficial digitado (ex.: "mex5", "FWC9", "00"). */
export const findByCode = (q: string): Sticker | undefined =>
  byCode.get(q.replace(/\s/g, '').toUpperCase());

export const SECTIONS: AlbumSection[] = (() => {
  const sections: AlbumSection[] = [
    { key: 'especiais', title: 'Especiais', range: [1, SPECIALS_COUNT], count: SPECIALS_COUNT },
  ];
  for (const team of TEAMS) {
    const ids = STICKERS.filter((s) => s.section === team.code).map((s) => s.id);
    sections.push({
      key: team.code,
      title: team.name,
      group: team.group,
      range: [Math.min(...ids), Math.max(...ids)],
      count: ids.length,
    });
  }
  return sections;
})();

export const stickersOfSection = (key: string): Sticker[] =>
  STICKERS.filter((s) => s.section === key);
