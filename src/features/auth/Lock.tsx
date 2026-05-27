import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../lib/store';
import { Avatar } from '../../components/team';
import { Icon } from '../../components/icons';
import { tapHaptic } from '../../lib/haptics';

export default function Lock() {
  const profile = useStore((s) => s.profile)!;
  const unlockSession = useStore((s) => s.unlockSession);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length !== 6) return;
    let alive = true;
    unlockSession(pin).then((ok) => {
      if (!alive) return;
      if (!ok) { setError(true); tapHaptic('pop'); setTimeout(() => { setPin(''); setError(false); }, 700); }
    });
    return () => { alive = false; };
  }, [pin, unlockSession]);

  const press = (d: string) => {
    tapHaptic('light');
    if (d === 'del') setPin((p) => p.slice(0, -1));
    else setPin((p) => (p.length < 6 ? p + d : p));
  };

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-md flex-col items-center px-6 pt-16 safe-top">
      <Avatar avatar={profile.avatar} size={84} />
      <h1 className="font-display font-800 text-3xl mt-4 uppercase tracking-wide">Oi de novo,</h1>
      <p className="font-display font-800 text-2xl text-brand-600 uppercase">{profile.displayName}</p>
      <p className="text-ink-soft font-600 mt-2">Digite seu PIN para entrar</p>

      <motion.div animate={error ? { x: [0, -10, 10, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}
        className="flex justify-center gap-3 my-7">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`h-5 w-5 rounded-full border-2 ${
            error ? 'border-[var(--color-magenta)]' : i < pin.length ? 'bg-brand-500 border-brand-500' : 'border-brand-200'
          }`} />
        ))}
      </motion.div>
      {error && <p className="font-700 text-[var(--color-magenta)] -mt-3 mb-2">PIN incorreto, tente de novo.</p>}

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <Key key={d} onClick={() => press(d)}>{d}</Key>)}
        <div />
        <Key onClick={() => press('0')}>0</Key>
        <Key onClick={() => press('del')}><Icon name="back" size={22} /></Key>
      </div>
    </div>
  );
}

function Key({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={onClick}
      className="grid h-16 place-items-center rounded-xl bg-paper border-2 border-line text-2xl font-800 tnum active:bg-brand-50">
      {children}
    </motion.button>
  );
}
