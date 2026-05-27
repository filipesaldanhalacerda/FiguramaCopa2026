/** Vibração tátil leve para ações-chave (quando o aparelho suportar). */
let soundOn = true;
export function setSoundOn(v: boolean) {
  soundOn = v;
}

export function tapHaptic(kind: 'light' | 'success' | 'pop' = 'light') {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  const map = { light: 8, pop: [10, 20, 10], success: [12, 30, 12, 30, 40] } as const;
  try {
    navigator.vibrate(map[kind] as number | number[]);
  } catch {
    /* ignora */
  }
}

let audioCtx: AudioContext | null = null;
/** "pop" curtinho e alegre (Web Audio, sem arquivos). */
export function popSound() {
  if (!soundOn || typeof window === 'undefined') return;
  try {
    audioCtx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(960, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    /* ignora */
  }
}
