-- ============================================================================
-- Figurama — schema inicial (Supabase / Postgres)
-- Cole no SQL Editor do Supabase ou rode via `supabase db push`.
-- Inclui: tabelas, RLS, RPC de match e de lista pública, seed das figurinhas
-- e a tabela de heartbeat usada pelo keep-alive (evita pausa do free tier).
-- ============================================================================

-- ---------------------------------------------------------------- PERFIS ----
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  slug          text unique not null,
  display_name  text not null,
  avatar        text not null default '🦊',
  fav_team      text not null default 'BRA',
  city_region   text,                      -- opcional, sem endereço exato
  recovery_hash text,                       -- hash do código de recuperação
  share_token   text unique default encode(gen_random_bytes(8), 'hex'),
  created_at    timestamptz default now()
);

-- ----------------------------------------------------------- FIGURINHAS -----
-- Referência (read-only para usuários). Metadados detalhados vivem no app.
create table if not exists stickers (
  id         int primary key,              -- 1..980
  team_code  text,
  type       text,
  player_name text,
  page       int
);
insert into stickers (id)
select g from generate_series(1, 980) as g
on conflict (id) do nothing;

-- ------------------------------------------------------------- COLEÇÃO ------
-- count: 1 = tem, 2+ = repetida (quantidade total). "Falta" = ausência de linha.
create table if not exists user_stickers (
  user_id    uuid not null references auth.users(id) on delete cascade,
  sticker_id int  not null references stickers(id),
  count      int  not null check (count >= 1),
  updated_at timestamptz default now(),
  primary key (user_id, sticker_id)
);
create index if not exists idx_user_stickers_sticker on user_stickers(sticker_id);
create index if not exists idx_user_stickers_user_count on user_stickers(user_id, count);

-- --------------------------------------------------------------- CHAT -------
create table if not exists chats (
  id      uuid primary key default gen_random_uuid(),
  user_a  uuid not null references auth.users(id) on delete cascade,
  user_b  uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_a, user_b)
);

create table if not exists messages (
  id         bigint generated always as identity primary key,
  chat_id    uuid not null references chats(id) on delete cascade,
  sender_id  uuid not null references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) <= 280),
  is_quick   boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_messages_chat on messages(chat_id, created_at);

create table if not exists blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  primary key (blocker_id, blocked_id)
);

create table if not exists reports (
  id          bigint generated always as identity primary key,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_id uuid,
  chat_id     uuid,
  reason      text,
  created_at  timestamptz default now()
);

-- ---------------------------------------------------------- HEARTBEAT -------
create table if not exists heartbeat (id int primary key, at timestamptz);

-- =============================================================== RLS =========
alter table profiles      enable row level security;
alter table stickers      enable row level security;
alter table user_stickers enable row level security;
alter table chats         enable row level security;
alter table messages      enable row level security;
alter table blocks        enable row level security;
alter table reports       enable row level security;

-- Perfis: leitura pública (apelido/avatar são públicos por design); só o dono edita.
create policy "profiles_read"   on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- Figurinhas: leitura para todos, sem escrita.
create policy "stickers_read" on stickers for select using (true);

-- Coleção: só o dono lê/escreve. (O match lê via RPC SECURITY DEFINER.)
create policy "us_all" on user_stickers for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Chats: só participantes.
create policy "chats_rw" on chats for all
  using (auth.uid() in (user_a, user_b)) with check (auth.uid() in (user_a, user_b));

-- Mensagens: visíveis a quem está no chat; envio só pelo próprio remetente
-- e desde que não haja bloqueio entre as partes. Imutáveis (sem update/delete).
create policy "msg_read" on messages for select using (
  exists (select 1 from chats c where c.id = chat_id and auth.uid() in (c.user_a, c.user_b))
);
create policy "msg_insert" on messages for insert with check (
  sender_id = auth.uid()
  and exists (select 1 from chats c where c.id = chat_id and auth.uid() in (c.user_a, c.user_b))
  and not exists (
    select 1 from chats c
    join blocks b on (b.blocker_id, b.blocked_id) in ((c.user_a, c.user_b), (c.user_b, c.user_a))
    where c.id = chat_id
  )
);

create policy "blocks_rw"  on blocks  for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);
create policy "reports_ins" on reports for insert with check (auth.uid() = reporter_id);

-- ===================================================== RPC: MATCH ============
-- Parceiros ordenados por troca equilibrada. SECURITY DEFINER: lê coleções
-- alheias só aqui dentro e devolve agregados (preserva a RLS restritiva).
create or replace function match_partners(p_limit int default 30)
returns table (
  partner_id   uuid,
  partner_slug text,
  avatar       text,
  fav_team     text,
  city_region  text,
  i_get        int,   -- ele tem repetida e a mim falta
  i_give       int,   -- eu tenho repetida e a ele falta
  balance      int
)
language sql security definer set search_path = public as $$
  with me as (select auth.uid() as uid),
  my_dupes   as (select sticker_id from user_stickers, me where user_id = uid and count >= 2),
  my_haves   as (select sticker_id from user_stickers, me where user_id = uid and count >= 1),
  partners as (
    select p.id, p.slug, p.avatar, p.fav_team, p.city_region
    from profiles p, me
    where p.id <> uid
      and p.id not in (select blocked_id from blocks where blocker_id = uid)
  )
  select
    pt.id, pt.slug, pt.avatar, pt.fav_team, pt.city_region,
    -- ele tem repetida (>=2) e eu não tenho (não está em my_haves)
    coalesce((select count(*)::int from user_stickers us
      where us.user_id = pt.id and us.count >= 2
        and us.sticker_id not in (select sticker_id from my_haves)), 0) as i_get,
    -- eu tenho repetida e ele não tem
    coalesce((select count(*)::int from my_dupes d
      where d.sticker_id not in (select sticker_id from user_stickers us2 where us2.user_id = pt.id)), 0) as i_give,
    0 as balance
  from partners pt
$$;

-- Wrapper que filtra trocas reais e ordena por equilíbrio (balance = min lado).
create or replace function match_partners_ranked(p_limit int default 30)
returns table (partner_id uuid, partner_slug text, avatar text, fav_team text, i_get int, i_give int, balance int)
language sql security definer set search_path = public as $$
  select partner_id, partner_slug, avatar, fav_team, i_get, i_give, least(i_get, i_give) as balance
  from match_partners(p_limit)
  where least(i_get, i_give) > 0
  order by least(i_get, i_give) desc, (i_get + i_give) desc
  limit p_limit
$$;

-- ============================================== RPC: LISTA PÚBLICA ===========
-- Página pública read-only por slug: só apelido, avatar, time e números.
create or replace function public_list(p_slug text)
returns jsonb
language sql security definer set search_path = public as $$
  with p as (select * from profiles where slug = lower(p_slug))
  select case when (select count(*) from p) = 0 then null else
    jsonb_build_object(
      'name',    (select display_name from p),
      'avatar',  (select avatar from p),
      'favTeam', (select fav_team from p),
      'dupes',   coalesce((select jsonb_agg(jsonb_build_object('id', sticker_id, 'n', count - 1) order by sticker_id)
                           from user_stickers where user_id = (select id from p) and count >= 2), '[]'::jsonb),
      'missing', coalesce((select jsonb_agg(s.id order by s.id) from stickers s
                           where not exists (select 1 from user_stickers us
                             where us.user_id = (select id from p) and us.sticker_id = s.id and us.count >= 1)), '[]'::jsonb)
    )
  end
$$;
grant execute on function public_list(text) to anon, authenticated;
grant execute on function match_partners(int), match_partners_ranked(int) to authenticated;
