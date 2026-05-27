import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../lib/store';
import { TEAMS } from '../../data/worldcup2026';
import { Button } from '../../components/ui';
import { Icon } from '../../components/icons';
import { Avatar, AVATAR_COLORS, TeamBadge, Jersey } from '../../components/team';
import { burstConfetti } from '../../lib/confetti';
import { tapHaptic, popSound } from '../../lib/haptics';
import { backendSignUp } from '../../lib/supabase';

const NAME_IDEAS = ['CraqueDoBairro', 'ReiDasTrocas', 'Furacao10', 'Estrelinha', 'GoleadorBR'];

export default function Onboarding() {
  const createProfile = useStore((s) => s.createProfile);
  const refreshProfile = useStore((s) => s.refreshProfile);
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [slug, setSlug] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_COLORS[0]);
  const [favTeam, setFavTeam] = useState('BRA');
  const [recovery, setRecovery] = useState('');

  const totalSteps = 6;

  async function finishCreate() {
    const { recoveryCode } = await createProfile({ slug, avatar, favTeam, pin });
    setRecovery(recoveryCode);
    await backendSignUp(slug, pin).catch(() => {});
    burstConfetti();
    popSound();
    setStep(5);
  }

  return (
    <div className="mx-auto min-h-[100svh] max-w-md px-5 pb-8 pt-6 safe-top flex flex-col">
      {step < 5 && (
        <div className="flex gap-1.5 mb-6">
          {Array.from({ length: totalSteps - 1 }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand-500' : 'bg-brand-100'}`} />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }} className="flex-1 flex flex-col">

          {step === 0 && <Welcome onNext={() => setStep(1)} />}

          {step === 1 && (
            <Step title="Como te chamam?" hint="Escolha um apelido divertido. Nada de nome completo, combinado?">
              <input autoFocus value={slug} onChange={(e) => setSlug(e.target.value.slice(0, 18))} placeholder="seu apelido"
                className="w-full rounded-xl border-2 border-line bg-paper px-5 py-4 text-xl font-700 outline-none focus:border-brand-400" />
              <div className="mt-3 flex flex-wrap gap-2">
                {NAME_IDEAS.map((n) => (
                  <button key={n} onClick={() => { tapHaptic('light'); setSlug(n); }}
                    className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-600 text-brand-700 border border-brand-100">{n}</button>
                ))}
              </div>
              <Spacer />
              <Button full size="lg" disabled={slug.trim().length < 3} onClick={() => setStep(2)}>Continuar</Button>
            </Step>
          )}

          {step === 2 && (
            <Step title="Crie um PIN secreto" hint="6 números que só você sabe. É como você entra no app.">
              <PinPad value={pin.length < 6 ? pin : pin2} onChange={(v) => (pin.length < 6 ? setPin(v) : setPin2(v))}
                label={pin.length < 6 ? 'Digite seu PIN' : 'Confirme seu PIN'} />
              {pin.length === 6 && pin2.length === 6 && pin !== pin2 && (
                <p className="text-center font-700 text-[var(--color-magenta)] mt-2">Os PINs não bateram, tente de novo.</p>
              )}
              <Spacer />
              <Button full size="lg" disabled={!(pin.length === 6 && pin2.length === 6 && pin === pin2)} onClick={() => setStep(3)}>Continuar</Button>
              {(pin.length === 6 || pin2.length > 0) && (
                <button className="mt-2 font-600 text-ink-soft" onClick={() => { setPin(''); setPin2(''); }}>Apagar e recomeçar</button>
              )}
            </Step>
          )}

          {step === 3 && (
            <Step title="Escolha sua cor" hint="A camisa que representa você no Figurama.">
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_COLORS.map((c) => (
                  <motion.button key={c} whileTap={{ scale: 0.85 }} onClick={() => { tapHaptic('pop'); setAvatar(c); }}
                    className={`grid aspect-square place-items-center rounded-2xl border-2 ${avatar === c ? 'border-brand-500 scale-105' : 'border-line'}`}>
                    <Avatar color={c} size={48} />
                  </motion.button>
                ))}
              </div>
              <Spacer />
              <Button full size="lg" onClick={() => setStep(4)}>Continuar</Button>
            </Step>
          )}

          {step === 4 && (
            <Step title="Pra quem você torce?" hint="Vamos deixar o app com a cor do seu time.">
              <div className="grid grid-cols-3 gap-2 max-h-[46vh] overflow-y-auto no-scrollbar pr-1">
                {TEAMS.map((t) => (
                  <motion.button key={t.code} whileTap={{ scale: 0.9 }} onClick={() => { tapHaptic('light'); setFavTeam(t.code); }}
                    className={`flex flex-col items-center gap-1.5 rounded-xl py-2.5 border-2 ${favTeam === t.code ? 'border-brand-500 bg-brand-50' : 'border-line bg-paper'}`}>
                    <TeamBadge code={t.code} size="sm" />
                    <span className="text-[10px] font-700 leading-none text-center px-1">{t.name}</span>
                  </motion.button>
                ))}
              </div>
              <Spacer />
              <Button full size="lg" onClick={finishCreate}>Começar a trocar</Button>
            </Step>
          )}

          {step === 5 && <RecoveryStep code={recovery} onNext={() => setStep(6)} />}
          {step === 6 && <Tutorial onDone={async () => { await refreshProfile(); nav('/', { replace: true }); }} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}
        className="grid h-24 w-24 place-items-center rounded-3xl bg-brand-500 shadow-[var(--shadow-raised)]">
        <Jersey color="#d29a26" size={56} />
      </motion.div>
      <h1 className="font-display font-800 text-5xl text-brand-600 mt-5 uppercase tracking-wide">Figurama</h1>
      <p className="mt-3 text-lg text-ink-soft font-600 max-w-xs">
        Marque suas figurinhas da <b className="text-ink">Copa 2026</b>, ache trocas perfeitas e complete seu álbum.
      </p>
      <div className="mt-8 w-full">
        <Button full size="lg" onClick={onNext}>Bora começar</Button>
        <p className="mt-3 text-sm text-ink-soft font-600">Sem e-mail e sem senha complicada. É rapidinho.</p>
      </div>
    </div>
  );
}

function RecoveryStep({ code, onNext }: { code: string; onNext: () => void }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex-1 flex flex-col">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gold-100 text-gold-600 mb-2"><Icon name="lock" size={30} /></div>
      <h1 className="font-display font-800 text-3xl text-center uppercase tracking-wide">Guarde seu código</h1>
      <p className="text-center text-ink-soft font-600 mt-2 px-2">
        Se esquecer seu PIN, é com este código que você volta pra sua conta. <b className="text-ink">Peça pra um adulto guardar.</b>
      </p>
      <div className="my-6 rounded-[var(--radius-card)] border-2 border-dashed border-brand-400 bg-brand-50 py-6 text-center">
        <span className="font-display font-800 text-3xl tracking-[0.2em] text-brand-700 select-text tnum">{code}</span>
      </div>
      <label className="flex items-center gap-3 rounded-xl bg-paper border-2 border-line p-4">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="h-6 w-6 accent-[var(--color-brand-500)]" />
        <span className="font-600">Já anotei meu código em um lugar seguro</span>
      </label>
      <Spacer />
      <Button full size="lg" disabled={!saved} onClick={onNext}>Entendi, continuar</Button>
    </div>
  );
}

function Tutorial({ onDone }: { onDone: () => void }) {
  const tips: { icon: Parameters<typeof Icon>[0]['name']; t: string }[] = [
    { icon: 'check', t: 'Toque numa figurinha para dizer que você TEM.' },
    { icon: 'plus', t: 'Segure (ou use o +) para marcar REPETIDAS.' },
    { icon: 'album', t: 'O que sobrar é o que ainda FALTA pra você.' },
    { icon: 'swap', t: 'O app acha quem pode trocar com você.' },
  ];
  return (
    <div className="flex-1 flex flex-col">
      <h1 className="font-display font-800 text-3xl text-center mb-1 uppercase tracking-wide">Como funciona</h1>
      <p className="text-center text-ink-soft font-600 mb-5">É super fácil, olha só:</p>
      <div className="space-y-3">
        {tips.map((tip, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}
            className="flex items-center gap-4 rounded-[var(--radius-card)] bg-paper border-2 border-line p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600 shrink-0"><Icon name={tip.icon} size={20} /></span>
            <span className="font-600">{tip.t}</span>
          </motion.div>
        ))}
      </div>
      <Spacer />
      <Button full size="lg" onClick={() => { burstConfetti(); onDone(); }}>Tô pronto</Button>
    </div>
  );
}

function Step({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col">
      <h1 className="font-display font-800 text-3xl uppercase tracking-wide">{title}</h1>
      {hint && <p className="text-ink-soft font-600 mt-1 mb-5">{hint}</p>}
      {children}
    </div>
  );
}

function Spacer() { return <div className="flex-1 min-h-6" />; }

function PinPad({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const press = (d: string) => {
    tapHaptic('light');
    if (d === 'del') onChange(value.slice(0, -1));
    else if (value.length < 6) onChange(value + d);
  };
  return (
    <div>
      <p className="text-center font-600 text-ink-soft mb-3">{label}</p>
      <div className="flex justify-center gap-3 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`h-5 w-5 rounded-full border-2 ${i < value.length ? 'bg-brand-500 border-brand-500' : 'border-brand-200'}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <PadKey key={d} onClick={() => press(d)}>{d}</PadKey>)}
        <div />
        <PadKey onClick={() => press('0')}>0</PadKey>
        <PadKey onClick={() => press('del')}><Icon name="back" size={22} /></PadKey>
      </div>
    </div>
  );
}

function PadKey({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={onClick}
      className="grid h-16 place-items-center rounded-xl bg-paper border-2 border-line text-2xl font-800 tnum active:bg-brand-50">
      {children}
    </motion.button>
  );
}
