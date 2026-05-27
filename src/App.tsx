import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './lib/store';
import { Jersey } from './components/team';
import AppShell from './components/AppShell';
import Onboarding from './features/auth/Onboarding';
import Home from './features/home/Home';
import Album from './features/collection/Album';
import SectionView from './features/collection/SectionView';
import Match from './features/match/Match';
import MyList from './features/share/MyList';
import PublicList from './features/share/PublicList';
import ChatList from './features/chat/ChatList';
import ChatRoom from './features/chat/ChatRoom';
import Copa from './features/content/Copa';
import GroupView from './features/content/GroupView';
import TeamView from './features/content/TeamView';
import Calendar from './features/content/Calendar';
import Quiz from './features/content/Quiz';
import Profile from './features/profile/Profile';

export default function App() {
  const ready = useStore((s) => s.ready);
  const profile = useStore((s) => s.profile);
  const hydrate = useStore((s) => s.hydrate);

  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <BrowserRouter>
      <Routes>
        {/* página pública (sem login, sem tab bar) */}
        <Route path="/u/:slug" element={<PublicList />} />

        {!ready ? (
          <Route path="*" element={<Splash />} />
        ) : !profile ? (
          <Route path="*" element={<Onboarding />} />
        ) : (
          <>
            {/* chat em tela cheia */}
            <Route path="/chat/:peerId" element={<ChatRoom />} />
            {/* app com tab bar */}
            <Route element={<AppShell />}>
              <Route index element={<Home />} />
              <Route path="/album" element={<Album />} />
              <Route path="/album/:section" element={<SectionView />} />
              <Route path="/trocar" element={<Match />} />
              <Route path="/trocar/lista" element={<MyList />} />
              <Route path="/chat" element={<ChatList />} />
              <Route path="/copa" element={<Copa />} />
              <Route path="/copa/grupo/:id" element={<GroupView />} />
              <Route path="/copa/time/:code" element={<TeamView />} />
              <Route path="/copa/jogos" element={<Calendar />} />
              <Route path="/copa/quiz" element={<Quiz />} />
              <Route path="/eu" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

function Splash() {
  return (
    <div className="grid min-h-[100svh] place-items-center">
      <div className="text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-500 animate-[var(--animate-float)]">
          <Jersey color="#d29a26" size={48} />
        </div>
        <p className="font-display font-800 text-3xl text-brand-600 mt-3 uppercase tracking-wide">Figurama</p>
      </div>
    </div>
  );
}
