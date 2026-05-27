import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, type MessageRow, type PeerRow } from '../../lib/db';
import { getTeam } from '../../data/worldcup2026';
import { sendMessage, QUICK_REPLIES } from '../../lib/chat';
import { checkMessage } from '../../lib/safety';
import { Sheet, Button } from '../../components/ui';
import { Icon } from '../../components/icons';
import { Avatar, TeamBadge } from '../../components/team';
import { motion } from 'framer-motion';
import { isBackendEnabled } from '../../lib/supabase';
import {
  getUid, loadChatPeer, loadMessages, sendChatMessage, subscribeMessages,
  blockUser, reportUser, markRead, type ChatMsg, type ChatPeer,
} from '../../lib/backend';

export default function ChatRoom() {
  return isBackendEnabled ? <BackendRoom /> : <LocalRoom />;
}

/* ----------------------------- CHAT REAL --------------------------------- */

function BackendRoom() {
  const { peerId: chatId = '' } = useParams();
  const nav = useNavigate();
  const [peer, setPeer] = useState<ChatPeer | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [text, setText] = useState('');
  const [warn, setWarn] = useState('');
  const [menu, setMenu] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const myUid = getUid();

  useEffect(() => {
    loadChatPeer(chatId).then(setPeer);
    loadMessages(chatId).then(setMsgs);
    markRead(chatId);
    const unsub = subscribeMessages(chatId, (m) => {
      setMsgs((cur) => (cur.some((x) => x.id === m.id) ? cur : [...cur, m]));
      markRead(chatId); // estou com a conversa aberta → já fica lida
    });
    return unsub;
  }, [chatId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length]);

  async function send(body: string, isQuick = false) {
    const res = checkMessage(body);
    if (!res.ok) { setWarn(res.reason); return; }
    setWarn(''); setText('');
    await sendChatMessage(chatId, res.text, isQuick);
  }

  async function block() {
    if (peer) await blockUser(peer.id);
    nav('/chat');
  }
  async function report() {
    if (peer) await reportUser(peer.id, chatId);
    setMenu(false);
    alert('Obrigado! Nossa equipe vai dar uma olhada.');
  }

  const t = peer ? getTeam(peer.favTeam) : undefined;
  // há uma proposta sem resposta ainda? (para mostrar Aceitar/Recusar a quem recebeu)
  const tradePending = msgs.some((m) => m.body.startsWith('Proposta de troca'))
    && !msgs.some((m) => m.body.startsWith('Troca aceita') || m.body.startsWith('Troca recusada'));

  return (
    <Shell
      peerName={peer?.name} peerAvatar={peer?.avatar} flag={t?.code}
      onBack={() => nav('/chat')} onMenu={() => setMenu(true)}
      warn={warn} text={text} setText={setText} onSend={send}
      bubbles={msgs.map((m) => ({ key: m.id, mine: m.sender_id === myUid, body: m.body }))}
      endRef={endRef} menu={menu} setMenu={setMenu} onBlock={block} onReport={report} peerName2={peer?.name}
      tradePending={tradePending}
      onRespondTrade={(accept) => send(accept ? 'Troca aceita! Vamos combinar a entrega.' : 'Troca recusada, fica pra próxima.')}
    />
  );
}

/* ----------------------------- CHAT LOCAL (demo) ------------------------- */

function LocalRoom() {
  const { peerId = '' } = useParams();
  const nav = useNavigate();
  const [peer, setPeer] = useState<PeerRow | null>(null);
  const [msgs, setMsgs] = useState<MessageRow[]>([]);
  const [text, setText] = useState('');
  const [warn, setWarn] = useState('');
  const [menu, setMenu] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(async () => {
    setMsgs(await db.messages.where('chatId').equals(peerId).sortBy('at'));
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
    setWarn(''); setText('');
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
    <Shell
      peerName={peer?.name} peerAvatar={peer?.avatar} flag={t?.code}
      onBack={() => nav('/chat')} onMenu={() => setMenu(true)}
      warn={warn} text={text} setText={setText} onSend={send}
      bubbles={msgs.map((m) => ({ key: m.id ?? m.at, mine: m.sender === 'me', body: m.body }))}
      endRef={endRef} menu={menu} setMenu={setMenu}
      onBlock={block} onReport={() => { setMenu(false); alert('Obrigado! Nossa equipe vai dar uma olhada.'); }} peerName2={peer?.name}
    />
  );
}

/* ----------------------------- UI compartilhada -------------------------- */

interface Bub { key: string | number; mine: boolean; body: string }

function Shell({ peerName, peerAvatar, flag, onBack, onMenu, warn, text, setText, onSend, bubbles, endRef, menu, setMenu, onBlock, onReport, peerName2, tradePending, onRespondTrade }: {
  peerName?: string; peerAvatar?: string; flag?: string; onBack: () => void; onMenu: () => void;
  warn: string; text: string; setText: (v: string) => void; onSend: (b: string, q?: boolean) => void;
  bubbles: Bub[]; endRef: React.RefObject<HTMLDivElement | null>;
  menu: boolean; setMenu: (v: boolean) => void; onBlock: () => void; onReport: () => void; peerName2?: string;
  tradePending?: boolean; onRespondTrade?: (accept: boolean) => void;
}) {
  return (
    <div className="mx-auto flex min-h-[100svh] max-w-md flex-col bg-page">
      <header className="sticky top-0 z-20 flex items-center gap-3 bg-navy-800 text-white px-4 py-3 safe-top">
        <button onClick={onBack} aria-label="Voltar"><Icon name="back" size={22} /></button>
        {peerAvatar && <Avatar avatar={peerAvatar} size={36} />}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-display font-800 leading-none uppercase">{peerName ?? 'Conversa'}</p>
            {flag && <TeamBadge code={flag} size="sm" />}
          </div>
          <p className="text-[11px] font-600 text-white/60">parceiro de troca</p>
        </div>
        <button onClick={onMenu} aria-label="Opções"><Icon name="dots" size={22} /></button>
      </header>

      <div className="mx-4 mt-3 flex items-start gap-2 rounded-lg bg-gold-100 px-3 py-2.5 text-xs font-600 text-navy-800">
        <span className="text-gold-600 mt-0.5"><Icon name="shield" size={16} /></span>
        Combine a troca em um lugar seguro e com um adulto por perto. Nunca passe endereço, telefone ou senha.
      </div>

      <div className="flex-1 space-y-2 px-4 py-4">
        {bubbles.map((b) => (
          <Bubble key={b.key} mine={b.mine} body={b.body}
            onRespond={!b.mine && tradePending ? onRespondTrade : undefined} />
        ))}
        {bubbles.length === 0 && <p className="text-center text-ink-soft font-600 py-8">Mande um oi para combinar a troca.</p>}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 bg-paper border-t-2 border-line px-3 pt-2 pb-3 safe-bottom">
        {warn && <p className="px-1 pb-2 text-sm font-700 text-[var(--color-magenta)]">{warn}</p>}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {QUICK_REPLIES.map((q) => (
            <button key={q} onClick={() => onSend(q, true)}
              className="whitespace-nowrap rounded-full bg-brand-50 px-3 py-2 text-sm font-600 text-brand-700 border border-brand-100">{q}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSend(text); }} className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva uma mensagem…"
            className="flex-1 rounded-full border-2 border-line bg-page px-4 py-3 font-600 outline-none focus:border-brand-400" />
          <button className="grid h-12 w-12 place-items-center rounded-full bg-brand-500 text-white" aria-label="Enviar"><Icon name="send" size={20} /></button>
        </form>
      </div>

      <Sheet open={menu} onClose={() => setMenu(false)} title="Segurança">
        <div className="space-y-3">
          <Button full variant="soft" onClick={onReport}><Icon name="flag" size={18} /> Denunciar conversa</Button>
          <Button full variant="magenta" onClick={onBlock}><Icon name="close" size={18} /> Bloquear {peerName2}</Button>
          <p className="text-center text-sm text-ink-soft font-600 pt-1">Bloquear remove esta conversa e impede novas mensagens.</p>
        </div>
      </Sheet>
    </div>
  );
}

function Bubble({ mine, body, onRespond }: { mine: boolean; body: string; onRespond?: (accept: boolean) => void }) {
  // proposta de troca
  if (body.startsWith('Proposta de troca')) {
    return (
      <div className="mx-auto my-2 max-w-[90%] rounded-xl border-2 border-dashed border-brand-400 bg-brand-50 px-4 py-3">
        <p className="whitespace-pre-line font-600 text-sm text-brand-800 tnum">{body}</p>
        {onRespond && (
          <div className="mt-3 flex gap-2">
            <Button className="flex-1" onClick={() => onRespond(true)}><Icon name="check" size={16} strokeWidth={3} /> Aceitar</Button>
            <Button variant="soft" className="flex-1" onClick={() => onRespond(false)}>Recusar</Button>
          </div>
        )}
      </div>
    );
  }
  // resposta: aceita
  if (body.startsWith('Troca aceita')) {
    return (
      <div className="mx-auto my-2 max-w-[90%] flex items-center gap-2 rounded-xl bg-[var(--color-have)]/12 border-2 border-[var(--color-have)] px-4 py-2.5">
        <span className="text-[var(--color-have)]"><Icon name="check" size={18} strokeWidth={3} /></span>
        <p className="font-700 text-sm text-[var(--color-have)]">{body}</p>
      </div>
    );
  }
  // resposta: recusada
  if (body.startsWith('Troca recusada')) {
    return (
      <div className="mx-auto my-2 max-w-[90%] rounded-xl bg-ink-soft/10 border-2 border-line px-4 py-2.5 text-center">
        <p className="font-700 text-sm text-ink-soft">{body}</p>
      </div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 font-600 ${mine ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-paper border-2 border-line rounded-bl-sm'}`}>{body}</div>
    </motion.div>
  );
}
