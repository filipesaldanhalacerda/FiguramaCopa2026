/**
 * Checklist do álbum Panini Copa 2026 — 980 figurinhas.
 * Estrutura espelhando o álbum físico para a criança marcar olhando a página:
 *   - Seção "Especiais" (intro, mascotes, troféu, sedes): nº 1–20
 *   - 48 seleções × 20 figurinhas (escudo + foto do time + 18 jogadores): nº 21–980
 *
 * Gerado proceduralmente a partir de TEAMS. A numeração é estável (não muda
 * entre versões enquanto a lista de times não mudar). Nomes de jogadores são
 * provisórios — a escalação oficial sai em junho/2026.
 *
 * Para sincronizar com a numeração EXATA da Panini, ajuste SPECIALS_COUNT e a
 * ordem de TEAMS conforme o álbum oficial. Versão do checklist: v1.
 */
import { TEAMS, type GroupId } from './worldcup2026';

export const CHECKLIST_VERSION = 'v1';
export const SPECIALS_COUNT = 20;
export const PER_TEAM = 20; // 1 escudo + 1 foto do time + 18 jogadores
export const TOTAL = SPECIALS_COUNT + TEAMS.length * PER_TEAM; // 20 + 960 = 980

export type StickerType = 'special' | 'badge' | 'team_photo' | 'player';

export interface Sticker {
  /** número oficial no álbum (1..980) */
  id: number;
  /** código curto, ex: "BRA-07" ou "ESP-01" */
  code: string;
  /** chave da seção: 'especiais' ou o código do time */
  section: string;
  type: StickerType;
  label: string;
  /** nome do jogador identificado (só quando é um craque real) → habilita foto */
  person?: string;
  /** time dono da figurinha (undefined nas especiais) */
  teamCode?: string;
  flag?: string;
  group?: GroupId;
  /** figurinhas raras/brilhantes (escudos e especiais), só visual */
  shiny: boolean;
}

export interface AlbumSection {
  key: string;
  title: string;
  flag?: string;
  group?: GroupId;
  /** intervalo [start, end] de números no álbum */
  range: [number, number];
  count: number;
}

const SPECIAL_LABELS = [
  'Logo da Copa 2026', 'Troféu da Copa', 'Mascote — EUA', 'Mascote — México',
  'Mascote — Canadá', 'Bola Oficial', 'Pôster do Torneio', 'Cidade-sede',
  'Cidade-sede', 'Cidade-sede', 'Estádio da Final', 'Estádio da Abertura',
  'Momento Histórico', 'Momento Histórico', 'Lenda da Copa', 'Lenda da Copa',
  'Lenda da Copa', 'Brasão FIFA', 'Fan Festival', 'Página de Abertura',
];

function buildStickers(): Sticker[] {
  const list: Sticker[] = [];
  let n = 0;

  // Seção especiais
  for (let i = 0; i < SPECIALS_COUNT; i++) {
    n++;
    list.push({
      id: n,
      code: `ESP-${String(i + 1).padStart(2, '0')}`,
      section: 'especiais',
      type: 'special',
      label: SPECIAL_LABELS[i] ?? `Especial ${i + 1}`,
      shiny: true,
    });
  }

  // Times (ordem A–L conforme TEAMS)
  for (const team of TEAMS) {
    for (let i = 0; i < PER_TEAM; i++) {
      n++;
      const slot = i + 1;
      let type: StickerType;
      let label: string;
      let person: string | undefined;
      if (slot === 1) {
        type = 'badge';
        label = `Escudo • ${team.name}`;
      } else if (slot === 2) {
        type = 'team_photo';
        label = `Foto do time • ${team.name}`;
      } else {
        type = 'player';
        const playerIdx = slot - 3; // 0..17
        const craque = team.craques[playerIdx];
        label = craque ?? `Jogador ${playerIdx + 1}`;
        person = craque; // só quando identificado → habilita foto da Wikipédia
      }
      list.push({
        id: n,
        code: `${team.code}-${String(slot).padStart(2, '0')}`,
        section: team.code,
        type,
        label,
        person,
        teamCode: team.code,
        flag: team.flag,
        group: team.group,
        shiny: type === 'badge',
      });
    }
  }

  return list;
}

export const STICKERS: Sticker[] = buildStickers();

const stickerById = new Map(STICKERS.map((s) => [s.id, s]));
export const getSticker = (id: number): Sticker | undefined => stickerById.get(id);

export const SECTIONS: AlbumSection[] = (() => {
  const sections: AlbumSection[] = [
    { key: 'especiais', title: 'Especiais', range: [1, SPECIALS_COUNT], count: SPECIALS_COUNT },
  ];
  for (const team of TEAMS) {
    const teamStickers = STICKERS.filter((s) => s.section === team.code);
    const ids = teamStickers.map((s) => s.id);
    sections.push({
      key: team.code,
      title: team.name,
      flag: team.flag,
      group: team.group,
      range: [Math.min(...ids), Math.max(...ids)],
      count: teamStickers.length,
    });
  }
  return sections;
})();

export const stickersOfSection = (key: string): Sticker[] =>
  STICKERS.filter((s) => s.section === key);
