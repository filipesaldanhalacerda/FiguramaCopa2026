import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tapHaptic } from '../lib/haptics';
import { db } from '../lib/db';
import { useEffect, useState } from 'react';

const TABS = [
  { to: '/', label: 'Início', icon: '🏠', end: true },
  { to: '/album', label: 'Álbum', icon: '📒' },
  { to: '/trocar', label: 'Trocar', icon: '🔁', center: true },
  { to: '/copa', label: 'Copa', icon: '🏆' },
  { to: '/eu', label: 'Eu', icon: '😎' },
] as const;

export default function TabBar() {
  const loc = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let alive = true;
    db.chats.toArray().then((cs) => {
      if (alive) setUnread(cs.reduce((a, c) => a + (c.unread || 0), 0));
    });
    return () => { alive = false; };
  }, [loc.pathname]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 safe-bottom pointer-events-none">
      <div className="mx-auto max-w-md px-3 pb-2 pointer-events-auto">
        <div className="relative grid grid-cols-5 items-end rounded-[1.75rem] bg-paper/95 backdrop-blur border-2 border-line shadow-[0_-2px_24px_-8px_rgba(26,19,48,0.25)] px-2 py-2">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={'end' in t ? t.end : false}
              onClick={() => tapHaptic('light')}
              className="relative flex flex-col items-center justify-end"
            >
              {({ isActive }) =>
                'center' in t && t.center ? (
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="-mt-8 grid h-16 w-16 place-items-center rounded-full bg-brand-500 text-white shadow-[0_8px_20px_-6px_rgba(240,78,12,0.7)] border-4 border-cream"
                    style={{ rotate: isActive ? 0 : 0 }}
                  >
                    <span className="text-2xl">{t.icon}</span>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-0.5 py-1">
                    <motion.span
                      animate={{ scale: isActive ? 1.2 : 1, y: isActive ? -2 : 0 }}
                      className="text-2xl relative"
                    >
                      {t.icon}
                      {t.to === '/eu' && unread > 0 && (
                        <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--color-magenta)] px-1 text-[10px] font-800 text-white">
                          {unread}
                        </span>
                      )}
                    </motion.span>
                    <span className={`text-[11px] font-700 ${isActive ? 'text-brand-600' : 'text-ink-soft'}`}>
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
