import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { isBackendEnabled } from '../lib/supabase';
import { subscribeMyMessages, fetchProfileName } from '../lib/backend';
import { Icon } from './icons';
import { tapHaptic, popSound } from '../lib/haptics';

interface Toast { chatId: string; text: string; trade: boolean }

/** Avisa no topo, em tempo real, quando chega uma proposta/mensagem (app aberto). */
export default function Notifier() {
  const nav = useNavigate();
  const loc = useLocation();
  const locRef = useRef(loc.pathname);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => { locRef.current = loc.pathname; }, [loc.pathname]);

  useEffect(() => {
    if (!isBackendEnabled) return;
    const unsub = subscribeMyMessages(async (m) => {
      // já está dentro dessa conversa? só atualiza o badge, sem aviso
      window.dispatchEvent(new Event('figurama:unread'));
      if (locRef.current === `/chat/${m.chat_id}`) return;
      const name = await fetchProfileName(m.sender_id);
      const trade = m.body.startsWith('Proposta de troca');
      setToast({
        chatId: m.chat_id, trade,
        text: trade ? `${name} quer trocar figurinhas com você!` : `${name} te mandou uma mensagem`,
      });
      tapHaptic('pop'); popSound();
      const id = m.chat_id;
      setTimeout(() => setToast((t) => (t && t.chatId === id ? null : t)), 6000);
    });
    return unsub;
  }, []);

  return (
    <AnimatePresence>
      {toast && (
        <motion.button
          initial={{ y: -90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          onClick={() => { const c = toast.chatId; setToast(null); nav(`/chat/${c}`); }}
          className="fixed inset-x-0 top-0 z-50 mx-auto block w-full max-w-md px-3 pt-2 safe-top">
          <div className="flex items-center gap-3 rounded-2xl bg-navy-800 text-white px-4 py-3 shadow-[var(--shadow-raised)]">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500">
              <Icon name={toast.trade ? 'swap' : 'chat'} size={18} />
            </span>
            <p className="flex-1 text-left font-700 text-sm leading-tight">{toast.text}</p>
            <span className="text-xs font-700 text-gold-400 uppercase">Ver</span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
