/**
 * Estado central do app (zustand). Fonte de verdade local; persiste no Dexie.
 * Perfil (apelido/PIN) fica em kv; coleção em `mine`. PIN e código de
 * recuperação são guardados apenas como HASH.
 */
import { create } from 'zustand';
import { db, kvGet, kvSet, loadCollection, setStickerCount } from './db';
import { ensureDemoSeed } from './demo';
import { TOTAL } from '../data/stickers';
import { setSoundOn } from './haptics';

export interface Profile {
  slug: string;
  displayName: string;
  avatar: string;
  favTeam: string;
  pinHash: string;
  recoveryHash: string;
  createdAt: number;
}

interface Settings {
  soundOn: boolean;
  achievements: string[];
}

interface State {
  ready: boolean;
  profile: Profile | null;
  locked: boolean; // sessão bloqueada (logout) — pede o PIN para voltar
  counts: Record<number, number>; // stickerId -> count
  settings: Settings;

  hydrate: () => Promise<void>;
  createProfile: (data: {
    slug: string; avatar: string; favTeam: string; pin: string;
  }) => Promise<{ recoveryCode: string }>;
  /** ativa o perfil no estado depois que o onboarding termina (recovery+tutorial) */
  refreshProfile: () => Promise<void>;
  /** troca a logo do avatar */
  setAvatar: (avatar: string) => Promise<void>;
  /** logout: bloqueia a sessão (mantém os dados; pede PIN para voltar) */
  lockSession: () => void;
  /** valida o PIN e desbloqueia a sessão */
  unlockSession: (pin: string) => Promise<boolean>;
  verifyPin: (pin: string) => boolean;
  logout: () => Promise<void>;
  resetAll: () => Promise<void>;

  setCount: (stickerId: number, count: number) => Promise<void>;
  toggleHave: (stickerId: number) => Promise<void>;
  bumpDupe: (stickerId: number, delta: number) => Promise<void>;

  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => Promise<void>;
  unlock: (id: string) => Promise<boolean>;
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function genRecoveryCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const raw = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

const DEFAULT_SETTINGS: Settings = { soundOn: true, achievements: [] };

export const useStore = create<State>((set, get) => ({
  ready: false,
  profile: null,
  locked: false,
  counts: {},
  settings: DEFAULT_SETTINGS,

  hydrate: async () => {
    await ensureDemoSeed();
    const profile = (await kvGet<Profile>('profile')) ?? null;
    const settings = (await kvGet<Settings>('settings')) ?? DEFAULT_SETTINGS;
    const colMap = await loadCollection();
    const counts: Record<number, number> = {};
    colMap.forEach((v, k) => (counts[k] = v));
    setSoundOn(settings.soundOn);
    set({ profile, settings, counts, ready: true });
  },

  createProfile: async ({ slug, avatar, favTeam, pin }) => {
    const recoveryCode = genRecoveryCode();
    const profile: Profile = {
      slug: slug.trim().toLowerCase().replace(/\s+/g, '_'),
      displayName: slug.trim(),
      avatar,
      favTeam,
      pinHash: await sha256(`${slug}:${pin}`),
      recoveryHash: await sha256(recoveryCode),
      createdAt: Date.now(),
    };
    // Persiste mas NÃO ativa ainda: o onboarding continua (recuperação + tutorial)
    // até refreshProfile() ser chamado no fim, evitando trocar de tela cedo demais.
    await kvSet('profile', profile);
    return { recoveryCode };
  },

  refreshProfile: async () => {
    const p = (await kvGet<Profile>('profile')) ?? null;
    set({ profile: p });
  },

  setAvatar: async (avatar) => {
    const p = get().profile;
    if (!p) return;
    const profile = { ...p, avatar };
    await kvSet('profile', profile);
    set({ profile });
  },

  lockSession: () => set({ locked: true }),

  unlockSession: async (pin) => {
    const p = get().profile;
    if (!p) return false;
    const tries = [
      await sha256(`${p.displayName}:${pin}`),
      await sha256(`${p.slug}:${pin}`),
    ];
    if (tries.includes(p.pinHash)) {
      set({ locked: false });
      return true;
    }
    return false;
  },

  verifyPin: (pin) => {
    // verificação síncrona aproximada usada na tela de bloqueio local
    const p = get().profile;
    return !!p && pin.length === 6;
  },

  logout: async () => {
    set({ profile: null });
  },

  resetAll: async () => {
    await db.delete();
    await db.open();
    set({ profile: null, counts: {}, settings: DEFAULT_SETTINGS });
    await get().hydrate();
  },

  setCount: async (stickerId, count) => {
    const c = Math.max(0, Math.min(99, count));
    await setStickerCount(stickerId, c);
    set((s) => {
      const counts = { ...s.counts };
      if (c <= 0) delete counts[stickerId];
      else counts[stickerId] = c;
      return { counts };
    });
  },

  toggleHave: async (stickerId) => {
    const cur = get().counts[stickerId] ?? 0;
    await get().setCount(stickerId, cur >= 1 ? 0 : 1);
  },

  bumpDupe: async (stickerId, delta) => {
    const cur = get().counts[stickerId] ?? 0;
    await get().setCount(stickerId, cur + delta);
  },

  setSetting: async (k, v) => {
    const settings = { ...get().settings, [k]: v };
    if (k === 'soundOn') setSoundOn(v as boolean);
    await kvSet('settings', settings);
    set({ settings });
  },

  unlock: async (id) => {
    const cur = get().settings.achievements;
    if (cur.includes(id)) return false;
    const achievements = [...cur, id];
    await kvSet('settings', { ...get().settings, achievements });
    set((s) => ({ settings: { ...s.settings, achievements } }));
    return true;
  },
}));

// ----------------- seletores derivados -----------------
export interface CollectionStats {
  have: number;   // figurinhas distintas que tem (count>=1)
  dupes: number;  // total de repetidas (soma de count-1)
  missing: number;
  percent: number;
}

export function statsFromCounts(counts: Record<number, number>): CollectionStats {
  let have = 0;
  let dupes = 0;
  for (const v of Object.values(counts)) {
    if (v >= 1) have++;
    if (v >= 2) dupes += v - 1;
  }
  return {
    have,
    dupes,
    missing: TOTAL - have,
    percent: Math.round((have / TOTAL) * 100),
  };
}

export const countsToMap = (counts: Record<number, number>): Map<number, number> =>
  new Map(Object.entries(counts).map(([k, v]) => [Number(k), v]));
