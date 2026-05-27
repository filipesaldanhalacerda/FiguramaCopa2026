/**
 * Busca a foto de um jogador na Wikipédia (Wikimedia Commons — licença livre).
 * NÃO usamos fotos de agências/clubes/Panini (protegidas). Só imagens livres,
 * carregadas em tempo de execução e com cache (memória + IndexedDB) para não
 * refazer a chamada. Retorna a URL da miniatura ou null se não houver.
 */
import { kvGet, kvSet } from './db';

const mem = new Map<string, string | null>();

const base = (lang: 'pt' | 'en') =>
  `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=320`;

function firstThumb(data: unknown): string | null {
  const pages = (data as { query?: { pages?: Record<string, { thumbnail?: { source?: string } }> } })?.query?.pages ?? {};
  for (const key of Object.keys(pages)) {
    const src = pages[key]?.thumbnail?.source;
    if (src) return src;
  }
  return null;
}

async function get(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return firstThumb(await res.json());
  } catch {
    return null; // offline ou bloqueado — segue sem foto
  }
}

// Tenta: título exato (PT→EN) e, se falhar, busca textual (PT→EN).
async function lookup(lang: 'pt' | 'en', name: string): Promise<string | null> {
  const byTitle = await get(`${base(lang)}&redirects=1&titles=${encodeURIComponent(name)}`);
  if (byTitle) return byTitle;
  return get(`${base(lang)}&generator=search&gsrlimit=1&gsrsearch=${encodeURIComponent(name + ' futebolista')}`);
}

export async function getPlayerPhoto(name: string): Promise<string | null> {
  if (mem.has(name)) return mem.get(name)!;

  const cacheKey = `photo:${name}`;
  const cached = await kvGet<{ url: string | null }>(cacheKey);
  if (cached) {
    mem.set(name, cached.url);
    return cached.url;
  }

  const url = (await lookup('pt', name)) ?? (await lookup('en', name));
  mem.set(name, url);
  await kvSet(cacheKey, { url });
  return url;
}
