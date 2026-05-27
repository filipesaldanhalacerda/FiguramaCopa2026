import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tapHaptic } from '../lib/haptics';
import { db } from '../lib/db';
import { useEffect, useState } from 'react';
import { Icon, type IconName } from './icons';
import { isBackendEnabled } from '../lib/supabase';
import { unreadTotal } from '../lib/backend';

const TABS: { to: string; label: string; icon: IconName; end?: boolean; center?: boolean }[] = [
  { to: '/', label: 'Início', icon: 'home', end: true },
  { to: '/album', label: 'Álbum', icon: 'album' },
  { to: '/trocar', label: 'Trocar', icon: 'swap', center: true },
  { to: '/copa', label: 'Copa', icon: 'trophy' },
  { to: '/eu', label: 'Perfil', icon: 'user' },
];

export default function TabBar() {
  const loc = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let alive = true;
    if (isBackendEnabled) {
      unreadTotal().then((n) => { if (alive) setUnread(n); });
    } else {
      db.chats.toArray().then((cs) => { if (alive) setUnread(cs.reduce((a, c) => a + (c.unread || 0), 0)); });
    }
    return () => { alive = false; };
  }, [loc.pathname]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 safe-bottom pointer-events-none">
      <div className="mx-auto max-w-md px-3 pb-2 pointer-events-auto">
        <div className="relative grid grid-cols-5 items-end rounded-2xl bg-navy-800 text-white/70 shadow-[0_-2px_24px_-8px_rgba(14,23,48,0.5)] px-2 py-2">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end ?? false}
              onClick={() => tapHaptic('light')}
              className="relative flex flex-col items-center justify-end"
            >
              {({ isActive }) =>
                t.center ? (
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="-mt-8 grid h-15 w-15 place-items-center rounded-2xl bg-brand-500 text-white shadow-[0_8px_20px_-6px_rgba(11,122,75,0.8)] border-4 border-navy-800"
                    style={{ width: 60, height: 60 }}
                  >
                    <Icon name={t.icon} size={26} />
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-1 py-1">
                    <motion.span
                      animate={{ scale: isActive ? 1.06 : 1, y: isActive ? -1 : 0 }}
                      className={`relative ${isActive ? 'text-gold-400' : 'text-white/55'}`}
                    >
                      <Icon name={t.icon} size={24} />
                      {t.to === '/eu' && unread > 0 && (
                        <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-700 text-navy-900">
                          {unread}
                        </span>
                      )}
                    </motion.span>
                    <span className={`text-[11px] font-600 ${isActive ? 'text-white' : 'text-white/55'}`}>
                      {t.label}
                    </span>
                  </div>
                )
              }
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
