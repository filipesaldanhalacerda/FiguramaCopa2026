import { useParams, useNavigate } from 'react-router-dom';
import { getTeam, FIXTURES } from '../../data/worldcup2026';
import { SECTIONS } from '../../data/stickers';
import { useStore } from '../../lib/store';
import { Card, Button } from '../../components/ui';
import PlayerPhoto from '../../components/PlayerPhoto';

export default function TeamView() {
  const { code = '' } = useParams();
  const nav = useNavigate();
  const t = getTeam(code);
  const counts = useStore((s) => s.counts);
  if (!t) return null;

  const section = SECTIONS.find((s) => s.key === code);
  const have = section
    ? Array.from({ length: section.count }, (_, i) => section.range[0] + i).filter((id) => (counts[id] ?? 0) >= 1).length
    : 0;
  const fixtures = FIXTURES.filter((f) => f.home === code || f.away === code);

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button onClick={() => nav(-1)} className="grid h-10 w-10 place-items-center rounded-2xl bg-paper border-2 border-line text-xl">←</button>
        <span className="text-5xl">{t.flag}</span>
        <div>
          <h1 className="font-display font-800 text-3xl leading-none">{t.name}</h1>
          <p className="font-700 text-ink-soft">Grupo {t.group} · {t.confed}</p>
        </div>
      </header>

      {(t.nickname || t.titles > 0) && (
        <div className="flex flex-wrap gap-2">
          {t.nickname && <span className="rounded-full bg-brand-100 px-3 py-1.5 font-700 text-sm text-brand-700">"{t.nickname}"</span>}
          {t.titles > 0 && <span className="rounded-full bg-[var(--color-gold)]/30 px-3 py-1.5 font-800 text-sm text-brand-800">{t.titles}× campeã do mundo 🏆</span>}
        </div>
      )}

      {/* progresso do álbum deste time */}
      <Card className="p-4 flex items-center justify-between bg-gradient-to-br from-brand-50 to-paper">
        <div>
          <p className="font-display font-800">Figurinhas deste time</p>
          <p className="text-sm font-700 text-ink-soft">{have} de {section?.count ?? 20} no seu álbum</p>
        </div>
        <Button onClick={() => nav(`/album/${code}`)}>Marcar 📒</Button>
      </Card>

      {/* curiosidades */}
      <section>
        <h2 className="font-display font-800 text-xl mb-2">Curiosidades 💡</h2>
        <div className="space-y-2">
          {t.curiosidades.map((c, i) => (
            <div key={i} className="rounded-2xl bg-paper border-2 border-line px-4 py-3 font-700">⭐ {c}</div>
          ))}
        </div>
      </section>

      {/* craques */}
      <section>
        <h2 className="font-display font-800 text-xl mb-1">Craques 🌟</h2>
        <p className="text-xs font-700 text-ink-soft mb-2">Provisório — a escalação oficial sai em junho.</p>
        <div className="grid grid-cols-3 gap-3">
          {t.craques.map((p) => (
            <div key={p} className="rounded-2xl border-2 border-line bg-paper overflow-hidden">
              <div className="aspect-square">
                <PlayerPhoto name={p} flag={t.flag} rounded="rounded-none" />
              </div>
              <p className="truncate px-2 py-1.5 text-center font-700 text-xs">{p}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-ink-soft">Fotos: Wikipédia / Wikimedia Commons (licença livre).</p>
      </section>

      {/* jogos */}
      <section>
        <h2 className="font-display font-800 text-xl mb-2">Jogos na fase de grupos</h2>
        <div className="space-y-2">
          {fixtures.map((f, i) => {
            const opp = getTeam(f.home === code ? f.away : f.home)!;
            return (
              <div key={i} className="flex items-center gap-3 rounded-2xl bg-paper border-2 border-line px-4 py-2.5 font-700">
                <span className="text-xs font-800 text-ink-soft">Rodada {f.matchday}</span>
                <span className="ml-auto flex items-center gap-2">vs {opp.name}<span className="text-xl">{opp.flag}</span></span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
