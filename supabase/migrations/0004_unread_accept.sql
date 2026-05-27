-- ============================================================================
-- Figurama — não-lidas (badge) + base para aceitar/recusar troca.
-- Rode no SQL Editor do Supabase.
-- ============================================================================

-- Marca de leitura por conversa/usuário.
create table if not exists chat_reads (
  chat_id      uuid references chats(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete cascade,
  last_read_at timestamptz default now(),
  primary key (chat_id, user_id)
);
alter table chat_reads enable row level security;
do $$ begin
  create policy chat_reads_rw on chat_reads for all
    using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Marca uma conversa como lida (ao abrir o chat).
create or replace function mark_read(p_chat uuid)
returns void language sql security definer set search_path = public as $$
  insert into chat_reads(chat_id, user_id, last_read_at) values (p_chat, auth.uid(), now())
  on conflict (chat_id, user_id) do update set last_read_at = now();
$$;

-- Total de mensagens não lidas (de outros) em todas as minhas conversas.
create or replace function unread_total()
returns int language sql security definer set search_path = public as $$
  select coalesce(count(*), 0)::int
  from messages m
  join chats c on c.id = m.chat_id
  where auth.uid() in (c.user_a, c.user_b)
    and m.sender_id <> auth.uid()
    and m.created_at > coalesce(
      (select last_read_at from chat_reads r where r.chat_id = m.chat_id and r.user_id = auth.uid()),
      to_timestamp(0));
$$;

-- Minhas conversas agora também trazem o nº de não-lidas por conversa.
create or replace function my_chats()
returns table (chat_id uuid, other_id uuid, other_slug text, other_name text,
  other_avatar text, other_fav_team text, last_body text, last_at timestamptz, unread int)
language sql security definer set search_path = public as $$
  select c.id,
    case when c.user_a = auth.uid() then c.user_b else c.user_a end,
    p.slug, p.display_name, p.avatar, p.fav_team,
    (select m.body from messages m where m.chat_id = c.id order by m.created_at desc limit 1),
    (select m.created_at from messages m where m.chat_id = c.id order by m.created_at desc limit 1),
    (select count(*) from messages m where m.chat_id = c.id and m.sender_id <> auth.uid()
       and m.created_at > coalesce(
         (select last_read_at from chat_reads r where r.chat_id = c.id and r.user_id = auth.uid()),
         to_timestamp(0)))::int
  from chats c
  join profiles p on p.id = (case when c.user_a = auth.uid() then c.user_b else c.user_a end)
  where auth.uid() in (c.user_a, c.user_b)
  order by 8 desc nulls last;
$$;

grant execute on function mark_read(uuid), unread_total(), my_chats() to authenticated;
