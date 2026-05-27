import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { kvGet, loadCollection } from '../../lib/db';
import type { Profile } from '../../lib/store';
import { STICKERS, getSticker } from '../../data/stickers';
import { getTeam } from '../../data/worldcup2026';
import { isBackendEnabled, supabase } from '../../lib/supabase';
import { Button } from '../../components/ui';
import { Icon } from '../../components/icons';
import { Avatar, TeamBadge } from '../../components/team';

interface PublicData {
  name: string; avatar: string; favTeam: string;
  dupes: { id: number; n: number }[];
  missing: number[];
}

export default function PublicList() {
  const { slug = '' } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<PublicData | null | 'loading' | 'notfound'>('loading');

  useEffect(() => {
    (async () => {
      if (isBackendEnabled && supabase) {
        try {
          const { data: rows } = await supabase.rpc('public_list', { p_slug: slug });
          if (rows) { setData(rows as unknown as PublicData); return; }
        } catch { /* fallback local */ }
      }
      const profile = await kvGet<Profile>('profile');
      if (profile && profile.slug === slug.toLowerCase()) {
        const col = await loadCollection();
        const dupes: { id: number; n: number }[] = [];
        const missing: number[] = [];
        for (const s of STICKERS) {
          const c = col.get(s.id) ?? 0;
          if (c >= 2) dupes.push({ id: s.id, n: c - 1 });
          else if (c === 0) missing.push(s.id);
        }
        setData({ name: profile.displayName, avatar: profile.avatar, favTeam: profile.favTeam, dupes, missing });
      } else {
        setData('notfound');
      }
    })();
  }, [slug]);

  if (data === 'loading') return <Centered><p className="font-display font-700 text-xl text-ink-soft">Carregando…</p></Centered>;

  if (data === 'notfound' || !data || typeof data === 'string') {
    return (
      <Centered>
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-400 mb-3"><Icon name="search" size={32} /></div>
        <h1 className="font-display font-800 text-2xl uppercase tracking-wide">Lista não encontrada</h1>
        <p className="text-ink-soft font-600 mt-2 max-w-xs">
          A lista de {slug} fica no aparelho de quem compartilhou. Baixe o Figurama e monte a sua.
        </p>
        <div className="mt-6"><Button size="lg" onClick={() => nav('/')}>Abrir o Figurama</Button></div>
      </Centered>
    );
  }

  const fav = getTeam(data.favTeam);
  return (
    <div className="mx-auto min-h-[100svh] max-w-md px-5 py-8 safe-top">
      <header className="flex items-center gap-3 mb-5">
        <Avatar avatar={data.avatar} size={56} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-800 text-2xl leading-none uppercase tracking-wide">{data.name}</h1>
            {fav && <TeamBadge code={fav.code} size="sm" />}
          </div>
          <p className="font-600 text-ink-soft">Figurinhas da Copa 2026</p>
        </div>
      </header>

      <Block title="Tenho repetidas (pra trocar)" color="var(--color-dupe)"
        items={data.dupes.map((d) => `${getSticker(d.id)?.code ?? d.id}${d.n > 1 ? ` x${d.n}` : ''}`)} />
      <Block title="Me faltam" color="var(--color-ink-soft)"
        items={data.missing.map((id) => getSticker(id)?.code ?? String(id))} />

      <div className="mt-8 rounded-[var(--radius-card)] bg-brand-500 p-5 text-center text-white">
        <p className="font-display font-800 text-xl uppercase tracking-wide">Tem figurinhas?</p>
        <p className="font-600 mt-1 opacity-95">Baixe o Figurama e troque com {data.name}.</p>
        <div className="mt-3"><Button variant="gold" size="lg" onClick={() => nav('/')}>Abrir o app</Button></div>
      </div>
    </div>
  );
}

function Block({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <section className="mb-5">
      <h2 className="font-display font-800 text-lg mb-2 uppercase tracking-wide">{title} <span className="text-ink-soft tnum">({items.length})</span></h2>
      {items.length === 0 ? (
        <p className="text-ink-soft font-600">nenhuma</p>
      ) : (
        <div className="flex flex-wrap gap-2 rounded-[var(--radius-card)] bg-paper border-2 border-line p-4">
          {items.map((it, i) => (
            <span key={i} className="rounded-md border-2 px-2.5 py-1 font-700 tnum" style={{ borderColor: color, color }}>{it}</span>
          ))}
        </div>
      )}
    </section>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex min-h-[100svh] max-w-md flex-col items-center justify-center px-6 text-center">{children}</div>;
}
