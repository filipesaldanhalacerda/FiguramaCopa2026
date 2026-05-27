import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import TabBar from './TabBar';
import Notifier from './Notifier';

export default function AppShell() {
  const loc = useLocation();
  return (
    <div className="mx-auto min-h-[100svh] max-w-md">
      <Notifier />
      <main className="px-4 pb-28 pt-6 safe-top">
        <AnimatePresence mode="wait">
          <motion.div
            key={loc.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <TabBar />
    </div>
  );
}
