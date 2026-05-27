import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, type MessageRow, type PeerRow } from '../../lib/db';
import { getTeam } from '../../data/worldcup2026';
import { sendMessage, QUICK_REPLIES } from '../../lib/chat';
import { checkMessage } from '../../lib/safety';
import { Sheet, Button } from '../../components/ui';
import { motion } from 'framer-motion';

export default function ChatRoom() {
  const { peerId = '' } = useParams();
  const nav = useNavigate();
  const [peer, setPeer] = useState<PeerRow | null>(null);
  const [msgs, setMsgs] = useState<MessageRow[]>([]);
  const [text, setText] = useState('');
  const [warn, setWarn] = useState('');
  const [menu, setMenu] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(async () => {
    const m = await db.messages.where('chatId').equals(peerId).sortBy('at');
    setMsgs(m);
    await db.chats.update(peerId, { unread: 0 });
  }, [peerId]);

  useEffect(() => {
    db.peers.get(peerId).then((p) => setPeer(p ?? null));
    reload();
    const onUpdate = () => reload();
    window.addEventListener('chat:update', onUpdate);
    return () => window.removeEventListener('chat:update', onUpdate);
  }, [peerId, reload]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length]);

  async function send(body: string, isQuick = false) {
    const res = checkMessage(body);
    if (!res.ok) { setWarn(res.reason); return; }
    setWarn('');
    setText('');
    await sendMessage(peerId, res.text, isQuick);
    await reload();
  }

  async function block() {
    await db.chats.delete(peerId);
    await db.messages.where('chatId').equals(peerId).delete();
    nav('/chat');
  }

  const t = peer ? getTeam(peer.favTeam) : undefined;

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-md flex-col">
      {/* header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 bg-cream/95 backdrop-blur px-4 py-3 safe-top border-b-2 border-line">
        <button onClick={() => nav('/chat')} className="text-xl">←</button>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 text-xl">{peer?.avatar ?? '🙂'}</div>
        <div className="flex-1">
          <p className="font-display font-800 leading-none">{peer?.name ?? 'Conversa'} {t?.flag}</p>
          <p className="text-[11px] font-700 text-ink-soft">parceiro de troca</p>
        </div>
        <button onClick={() => setMenu(true)} className="text-2xl leading-none">⋯</button>
      </header>

      {/* aviso de segurança */}
      <div className="mx-4 mt-3 rounded-2xl bg-[var(--color-gold)]/20 px-4 py-2.5 text-xs font-700 text-brand-800">
        🛡️ Combine a troca num lugar seguro e com um adulto por perto. Nunca passe endereço, telefone ou senha.
      </div>

      {/* mensagens */}
      <div className="flex-1 space-y-2 px-4 py-4">
        {msgs.map((m) => <Bubble key={m.id} m={m} />)}
        {msgs.length === 0 && (
          <p className="text-center text-ink-soft font-700 py-8">Mande um oi pra combinar a troca! 👋</p>
        )}
        <div ref={endRef} />
      </div>

      {/* chips + input */}
      <div className="sticky bottom-0 bg-cream/95 backdrop-blur border-t-2 border-line px-3 pt-2 pb-3 safe-bottom">
        {warn && <p className="px-1 pb-2 text-sm font-700 text-[var(--color-magenta)]">{warn}</p>}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {QUICK_REPLIES.map((q) => (
            <button key={q} onClick={() => send(q, true)}
              className="whitespace-nowrap rounded-full bg-brand-100 px-3 py-2 text-sm font-700 text-brand-700">
              {q}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex gap-2">
          <input
            value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva uma mensagem…"
            className="flex-1 rounded-full border-2 border-line bg-paper px-4 py-3 font-600 outline-none focus:border-brand-400"
          />
          <button className="grid h-12 w-12 place-items-center rounded-full bg-brand-500 text-white text-xl">➤</button>
        </form>
      </div>

      {/* menu segurança */}
      <Sheet open={menu} onClose={() => setMenu(false)} title="Segurança">
        <div className="space-y-3">
          <Button full variant="soft" onClick={() => { setMenu(false); alert('Obrigado! Nossa equipe vai dar uma olhada. 🙏'); }}>
            🚩 Denunciar conversa
          </Button>
          <Button full variant="magenta" onClick={block}>🚫 Bloquear {peer?.name}</Button>
          <p className="text-center text-sm text-ink-soft font-600 pt-1">
            Bloquear remove esta conversa e impede novas mensagens.
          </p>
        </div>
      </Sheet>
    </div>
  );
}

function Bubble({ m }: { m: MessageRow }) {
  const mine = m.sender === 'me';
  const isTrade = m.body.startsWith('🤝 Proposta de troca');
  if (isTrade) {
    return (
      <div className="mx-auto my-2 max-w-[88%] rounded-2xl border-2 border-dashed border-brand-400 bg-brand-50 px-4 py-3">
        <p className="whitespace-pre-line font-700 text-sm text-brand-800">{m.body}</p>
      </div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 font-600 ${
        mine ? 'bg-brand-500 text-white rounded-br-md' : 'bg-paper border-2 border-line rounded-bl-md'
      }`}>
        {m.body}
      </div>
    </motion.div>
  );
}
