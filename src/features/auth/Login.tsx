import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../lib/store';
import { Button } from '../../components/ui';
import { Icon } from '../../components/icons';
import { Jersey } from '../../components/team';
import { tapHaptic } from '../../lib/haptics';

export default function Login({ onBack }: { onBack: () => void }) {
  const login = useStore((s) => s.login);
  const [slug, setSlug] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const press = (d: string) => {
    tapHaptic('light');
    if (d === 'del') setPin((p) => p.slice(0, -1));
    else setPin((p) => (p.length < 6 ? p + d : p));
  };

  async function submit() {
    if (slug.trim().length < 3 || pin.length !== 6) return;
    setBusy(true);
    setErr('');
    const { error } = await login(slug, pin);
    setBusy(false);
    if (error) { setErr(error); setPin(''); tapHaptic('pop'); }
    // sucesso: o store define o profile e o App troca de tela sozinho
  }

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-md flex-col px-6 pt-8 pb-8 safe-top">
      <button onClick={onBack} className="self-start mb-4 flex items-center gap-1 font-700 text-ink-soft">
        <Icon name="back" size={20} /> Voltar
      </button>

      <div className="flex flex-col items-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-500">
          <Jersey color="#d29a26" size={38} />
        </div>
        <h1 className="font-display font-800 text-3xl mt-3 uppercase tracking-wide">Entrar</h1>
        <p className="text-ink-soft font-600 mt-1">Use o apelido e o PIN da sua conta.</p>
      </div>

      <div className="mt-6">
        <label className="text-sm font-700 text-ink-soft uppercase tracking-wide">Apelido</label>
        <input autoFocus value={slug} onChange={(e) => { setSlug(e.target.value.slice(0, 18)); setErr(''); }}
          placeholder="seu apelido"
          className="mt-1 w-full rounded-xl border-2 border-line bg-paper px-5 py-3.5 text-lg font-700 outline-none focus:border-brand-400" />
      </div>

      <p className="text-center font-600 text-ink-soft mt-5 mb-2">PIN</p>
      <div className="flex justify-center gap-3 mb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`h-5 w-5 rounded-full border-2 ${i < pin.length ? 'bg-brand-500 border-brand-500' : 'border-brand-200'}`} />
        ))}
      </div>
      {err && <p className="text-center font-700 text-[var(--color-magenta)] mb-2">{err}</p>}

      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto w-full">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <Key key={d} onClick={() => press(d)}>{d}</Key>)}
        <div />
        <Key onClick={() => press('0')}>0</Key>
        <Key onClick={() => press('del')}><Icon name="back" size={22} /></Key>
      </div>

      <div className="mt-6">
        <Button full size="lg" disabled={busy || slug.trim().length < 3 || pin.length !== 6} onClick={submit}>
          {busy ? 'Entrando…' : 'Entrar'}
        </Button>
      </div>
    </div>
  );
}

function Key({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={onClick}
      className="grid h-14 place-items-center rounded-xl bg-paper border-2 border-line text-2xl font-800 tnum active:bg-brand-50">
      {children}
    </motion.button>
  );
}
