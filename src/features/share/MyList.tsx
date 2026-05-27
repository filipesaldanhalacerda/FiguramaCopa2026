import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../../lib/store';
import { STICKERS, SECTIONS } from '../../data/stickers';
import { Chip, Button, Sheet, Card, EmptyState } from '../../components/ui';
import { Icon } from '../../components/icons';
import { TeamBadge } from '../../components/team';
import { tapHaptic } from '../../lib/haptics';

interface Group { key: string; title: string; items: { id: number; code: string; extra: number }[]; total: number }

export default function MyList() {
  const profile = useStore((s) => s.profile)!;
  const counts = useStore((s) => s.counts);
  const nav = useNavigate();
  const [tab, setTab] = useState<'dupe' | 'missing'>('dupe');
  const [tv, setTv] = useState(false);
  const [share, setShare] = useState(false);

  // agrupa por seção (na ordem do álbum), só seções com itens no filtro atual
  const groups = useMemo<Group[]>(() => {
    const want = (c: number) => (tab === 'dupe' ? c >= 2 : c === 0);
    const out: Group[] = [];
    for (const sec of SECTIONS) {
      const items = STICKERS
        .filter((s) => s.section === sec.key && want(counts[s.id] ?? 0))
        .map((s) => ({ id: s.id, code: s.code, extra: Math.max(0, (counts[s.id] ?? 0) - 1) }));
      if (items.length) out.push({ key: sec.key, title: sec.title, items, total: items.reduce((a, i) => a + (tab === 'dupe' ? i.extra : 1), 0) });
    }
    return out;
  }, [counts, tab]);

  const totalDupes = useMemo(() => Object.values(counts).reduce((a, c) => a + (c >= 2 ? c - 1 : 0), 0), [counts]);
  const distinctDupes = useMemo(() => Object.values(counts).filter((c) => c >= 2).length, [counts]);
  const totalMissing = STICKERS.length - Object.values(counts).filter((c) => c >= 1).length;

  const url = `${location.origin}/u/${profile.slug}`;

  function shareText() {
    const dupeGroups = SECTIONS.map((sec) => {
      const items = STICKERS.filter((s) => s.section === sec.key && (counts[s.id] ?? 0) >= 2)
        .map((s) => `${s.code}${(counts[s.id] ?? 0) > 2 ? ` x${(counts[s.id] ?? 0) - 1}` : ''}`);
      return items.length ? `${sec.title}: ${items.join(', ')}` : '';
    }).filter(Boolean);
    return `Tenho ${totalDupes} figurinhas repetidas pra trocar (Copa 2026)!\n\n${dupeGroups.join('\n')}\n\nVeja minha lista: ${url}`;
  }

  async function doShare() {
    const text = shareText();
    if (navigator.share) {
      try { await navigator.share({ title: 'Figurama', text, url }); return; } catch { /* cancelado */ }
    }
    setShare(true);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <button onClick={() => nav('/trocar')} className="grid h-10 w-10 place-items-center rounded-lg bg-paper border-2 border-line"><Icon name="back" size={20} /></button>
        <div className="flex-1">
          <h1 className="font-display font-800 text-2xl leading-none uppercase tracking-wide">Pra trocar</h1>
          <p className="text-sm font-600 text-ink-soft">Suas repetidas, organizadas por seleção.</p>
        </div>
      </header>

      {/* resumo */}
      <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-gold-100/70 to-paper">
        <div className="grid h-14 w-14 place-items-center rounded-xl bg-gold-500 text-navy-900">
          <Icon name="swap" size={26} />
        </div>
        <div className="flex-1">
          <p className="font-display font-800 text-3xl leading-none text-gold-600 tnum">{totalDupes}</p>
          <p className="font-600 text-ink-soft">repetidas pra trocar · {distinctDupes} diferentes</p>
        </div>
      </Card>

      <div className="flex gap-2">
        <Chip active={tab === 'dupe'} onClick={() => setTab('dupe')} color="var(--color-dupe)">Repetidas ({totalDupes})</Chip>
        <Chip active={tab === 'missing'} onClick={() => setTab('missing')} color="var(--color-ink-soft)">Faltam ({totalMissing})</Chip>
      </div>

      {tab === 'dupe' && totalDupes > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="soft" onClick={() => { tapHaptic('pop'); setTv(true); }}><Icon name="expand" size={18} /> Tela cheia</Button>
          <Button onClick={doShare}><Icon name="share" size={18} /> Compartilhar</Button>
        </div>
      )}

      {/* grupos por seleção */}
      {groups.length === 0 ? (
        tab === 'dupe'
          ? <EmptyState icon="swap" title="Sem repetidas ainda" hint="Marque suas repetidas no álbum (toque no + da figurinha) para vê-las aqui." />
          : <EmptyState icon="check" title="Você não está devendo nada!" hint="Nenhuma figurinha faltando — ou marque sua coleção no álbum." />
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <Card key={g.key} onClick={() => nav(`/album/${g.key}`)} className="p-3">
              <div className="flex items-center gap-2 mb-2">
                {g.key === 'especiais'
                  ? <span className="text-gold-500"><Icon name="star" size={18} /></span>
                  : <TeamBadge code={g.key} size="sm" />}
                <span className="font-display font-800 uppercase flex-1">{g.title}</span>
                <span className="rounded-full px-2 py-0.5 text-xs font-800 tnum text-white"
                  style={{ background: tab === 'dupe' ? 'var(--color-dupe)' : 'var(--color-ink-soft)' }}>
                  {tab === 'dupe' ? `${g.total} pra trocar` : `faltam ${g.items.length}`}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((it) => (
                  <span key={it.id} className="rounded-md border px-2 py-0.5 text-sm font-700 tnum"
                    style={{ borderColor: tab === 'dupe' ? 'var(--color-dupe)' : 'var(--color-line)', color: tab === 'dupe' ? 'var(--color-dupe)' : 'var(--color-ink-soft)' }}>
                    {it.code}{tab === 'dupe' && it.extra > 1 ? ` ×${it.extra}` : ''}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* tela cheia (mostrar pra um amigo) */}
      <Sheet open={tv} onClose={() => setTv(false)} title="Minhas repetidas">
        <div className="space-y-4 pb-4">
          {groups.map((g) => (
            <div key={g.key}>
              <div className="flex items-center gap-2 mb-1">
                {g.key === 'especiais' ? <Icon name="star" size={16} className="text-gold-500" /> : <TeamBadge code={g.key} size="sm" />}
                <span className="font-700 uppercase text-sm text-ink-soft">{g.title}</span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {g.items.map((it) => (
                  <span key={it.id} className="font-display font-800 text-2xl text-dupe tnum" style={{ color: 'var(--color-dupe)' }}>
                    {it.code}{it.extra > 1 ? <sub className="text-sm">×{it.extra}</sub> : ''}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {groups.length === 0 && <p className="text-ink-soft font-600">Nada aqui ainda.</p>}
        </div>
      </Sheet>

      {/* compartilhar / QR */}
      <Sheet open={share} onClose={() => setShare(false)} title="Compartilhar minha lista">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl bg-white p-4 border-2 border-line"><QRCodeSVG value={url} size={180} fgColor="#0e1730" /></div>
          <p className="text-center font-600 text-ink-soft text-sm">Aponte a câmera para ver minha lista, ou copie o link:</p>
          <div className="flex w-full gap-2">
            <input readOnly value={url} className="flex-1 rounded-lg border-2 border-line bg-page px-3 py-3 font-600 text-sm" />
            <Button onClick={() => { navigator.clipboard?.writeText(shareText()); tapHaptic('success'); }}>Copiar</Button>
          </div>
          <p className="text-center text-xs text-ink-soft">Sua lista pública mostra só apelido, avatar e números — nada de dados pessoais.</p>
        </div>
      </Sheet>
    </div>
  );
}
