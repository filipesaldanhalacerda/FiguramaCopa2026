import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUIZ } from '../../data/worldcup2026';
import { Button } from '../../components/ui';
import { burstConfetti } from '../../lib/confetti';
import { tapHaptic, popSound } from '../../lib/haptics';
import { useStore } from '../../lib/store';
import { motion } from 'framer-motion';

export default function Quiz() {
  const nav = useNavigate();
  const unlock = useStore((s) => s.unlock);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUIZ[i];

  function pick(idx: number) {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === q.answer) { setScore((s) => s + 1); popSound(); tapHaptic('success'); }
    else tapHaptic('pop');
  }

  function next() {
    if (i + 1 >= QUIZ.length) {
      setDone(true);
      if (score + (picked === q.answer ? 0 : 0) >= QUIZ.length - 2) unlock('quiz-master');
      burstConfetti();
    } else {
      setI(i + 1);
      setPicked(null);
    }
  }

  if (done) {
    return (
      <div className="text-center pt-10">
        <div className="text-7xl mb-3">{score >= 6 ? '🏆' : score >= 4 ? '🌟' : '⚽'}</div>
        <h1 className="font-display font-800 text-3xl">Você acertou {score} de {QUIZ.length}!</h1>
        <p className="text-ink-soft font-700 mt-2">
          {score >= 6 ? 'Craque da Copa! 🤩' : score >= 4 ? 'Mandou bem! 👏' : 'Bora aprender mais na aba Copa! 📚'}
        </p>
        <div className="mt-8 space-y-3 px-2">
          <Button full size="lg" onClick={() => { setI(0); setScore(0); setPicked(null); setDone(false); }}>Jogar de novo 🔁</Button>
          <Button full variant="soft" onClick={() => nav('/copa')}>Voltar pra Copa</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button onClick={() => nav('/copa')} className="grid h-10 w-10 place-items-center rounded-2xl bg-paper border-2 border-line text-xl">←</button>
        <div className="flex-1">
          <p className="font-700 text-ink-soft text-sm">Pergunta {i + 1} de {QUIZ.length}</p>
          <div className="mt-1 h-2 rounded-full bg-brand-100 overflow-hidden">
            <div className="h-full bg-[var(--color-magenta)] transition-all" style={{ width: `${((i + 1) / QUIZ.length) * 100}%` }} />
          </div>
        </div>
      </header>

      <h1 className="font-display font-800 text-2xl">{q.q}</h1>

      <div className="space-y-3">
        {q.options.map((opt, idx) => {
          const isAnswer = idx === q.answer;
          const show = picked !== null;
          const state = !show ? '' : isAnswer ? 'correct' : idx === picked ? 'wrong' : '';
          return (
            <motion.button key={idx} whileTap={{ scale: 0.97 }} onClick={() => pick(idx)}
              className={`w-full rounded-[var(--radius-sticker)] border-2 px-5 py-4 text-left font-700 text-lg transition-colors ${
                state === 'correct' ? 'bg-[var(--color-have)]/15 border-[var(--color-have)]'
                : state === 'wrong' ? 'bg-[var(--color-magenta)]/12 border-[var(--color-magenta)]'
                : 'bg-paper border-line'
              }`}>
              {opt} {state === 'correct' && '✅'} {state === 'wrong' && '❌'}
            </motion.button>
          );
        })}
      </div>

      {picked !== null && (
        <Button full size="lg" onClick={next}>{i + 1 >= QUIZ.length ? 'Ver resultado 🎉' : 'Próxima →'}</Button>
      )}
    </div>
  );
}
