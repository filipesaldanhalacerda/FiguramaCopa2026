# ⚽ Figurama — Trocas de figurinhas da Copa 2026

PWA mobile-first para **crianças e adolescentes** marcarem suas figurinhas do álbum
Panini da Copa do Mundo 2026, acharem **trocas automáticas** e completarem o álbum.
Feito para ser **fácil, divertido e seguro**, com uma stack de **custo zero**.

## ✨ O que tem

- **Onboarding em ~10s** — apelido + PIN de 6 dígitos, **sem e-mail** (anti-burocracia, melhor para LGPD de menores). Gera um **código de recuperação**.
- **Meu Álbum** — marque `tem` (toque), `repetidas` (segurar / `📦 bater rápido`) e veja o que `falta`. Progresso por seleção e do álbum inteiro, com confete ao completar páginas. Offline-first (IndexedDB).
- **Trocar** — **match automático**: "Fulano tem 5 que você precisa e quer 3 que você tem". Inclui descoberta unidirecional ("eles têm o que te falta") para a tela já nascer cheia.
- **Minha lista** — modo para trocar com quem **não tem o app**: tela limpa de repetidas/faltantes, **modo tela cheia**, **link público** (`/u/apelido`) e **QR code**.
- **Chat seguro** — respostas rápidas, **filtro de palavrões**, **bloqueio de dados pessoais** (telefone/endereço/redes), denunciar/bloquear, banner de segurança, sem mídia.
- **Copa 2026** — 12 grupos (A–L), 48 seleções (curiosidades + craques), calendário e **quiz**.
- **Espaço dos pais** e conquistas.

## 🧱 Stack (custo zero)

| Camada | Tecnologia |
|---|---|
| App | Vite + React + TypeScript + Tailwind v4 |
| PWA | vite-plugin-pwa (instalável, offline) |
| Estado/local | Zustand + Dexie (IndexedDB) |
| Animação | Framer Motion + confete em canvas |
| Backend (opcional) | Supabase free (Postgres + Auth + Realtime + RLS) |
| Hosting | **Cloudflare Pages** (banda ilimitada, uso comercial OK) |

> O app **funciona 100% sem backend** (modo local com parceiros de demonstração).
> Ative o Supabase para auth real, sync entre aparelhos, match com gente de verdade e chat realtime.

## 🚀 Rodar localmente

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/ (verifica tipos com tsc)
npm run preview  # serve o build (testar PWA/instalação)
```

## ☁️ Deploy grátis (Cloudflare Pages)

1. Suba o repositório no GitHub.
2. Cloudflare Pages → *Connect to Git* → este repo.
3. Build command: `npm run build` · Output: `dist`.
4. (Opcional) Variáveis: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
5. Deploy automático a cada push.

## 🗄️ Ativar o backend (opcional)

1. Crie um projeto no [Supabase](https://supabase.com) (free).
2. SQL Editor → cole e rode [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
3. Authentication → Providers → **desative "Confirm email"** (o login usa e-mail sintético interno).
4. Copie `.env.example` → `.env.local` e preencha URL + anon key.
5. Mantenha o projeto ativo: configure os secrets `SUPABASE_URL` e `SUPABASE_ANON_KEY` no GitHub
   (a Action [`keepalive.yml`](.github/workflows/keepalive.yml) faz um ping 2x/semana).

### Como funciona o login sem e-mail
Usamos `apelido@appcopa2026.local` como e-mail interno (nunca exibido) e o **PIN de 6 dígitos**
como senha do Supabase Auth — assim ganhamos JWT + RLS de graça sem coletar nenhum dado pessoal de menor.

## ⚠️ Dados a validar antes de publicar

- **Composição dos grupos** (`src/data/worldcup2026.ts`): confira na FIFA.com (vagas de repescagem).
- **Escalações** dos jogadores: oficiais saem em junho/2026 — os craques atuais são provisórios.
- **Checklist de figurinhas** (`src/data/stickers.ts`): gerado proceduralmente (980). Ajuste a ordem/contagem
  conforme a numeração **oficial Panini** para casar 100% com o álbum físico.
- **Sem imagens** das figurinhas Panini nem fotos de jogadores (direitos): usamos bandeiras, números e fatos.

## 📁 Estrutura

```
src/
  data/        worldcup2026.ts, stickers.ts   (grupos, jogos, checklist 980)
  lib/         store, db (Dexie), match, chat, safety, haptics, confetti, supabase, demo
  components/  ui.tsx, TabBar, AppShell
  features/    auth, home, collection, match, chat, content, profile, share
supabase/migrations/0001_init.sql              (tabelas, RLS, RPC match + lista pública)
.github/workflows/keepalive.yml
```
