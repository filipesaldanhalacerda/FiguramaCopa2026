-- ============================================================================
-- Figurama — Etapa 2/3: match real + chat. Rode no SQL Editor do Supabase.
-- Adiciona funções seguras (SECURITY DEFINER) que devolvem só o necessário,
-- e habilita o tempo real na tabela de mensagens.
-- ============================================================================

-- Quais figurinhas dão troca entre MIM e um parceiro (detalhe p/ montar a troca).
--  get  = ele tem repetida (>=2) e a mim falta (não tenho)
--  give = eu tenho repetida (>=2) e a ele falta
create or replace function trade_stickers(p_partner uuid)
returns jsonb
language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'get', coalesce((
      select jsonb_agg(us.sticker_id order by us.sticker_id)
      from user_stickers us
      where us.user_id = p_partner and us.count >= 2
        and not exists (select 1 from user_stickers mine
                        where mine.user_id = auth.uid() and mine.sticker_id = us.sticker_id and mine.count >= 1)
    ), '[]'::jsonb),
    'give', coalesce((
      select jsonb_agg(mine.sticker_id order by mine.sticker_id)
      from user_stickers mine
      where mine.user_id = auth.uid() and mine.count >= 2
        and not exists (select 1 from user_stickers us2
                        where us2.user_id = p_partner and us2.sticker_id = mine.sticker_id and us2.count >= 1)
    ), '[]'::jsonb)
  );
$$;

-- Acha ou cria o chat (1 por par, ordem normalizada para não duplicar).
create or replace function get_or_create_chat(p_other uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare a uuid; b uuid; cid uuid;
begin
  if auth.uid() is null then raise exception 'auth required'; end if;
  a := least(auth.uid(), p_other);
  b := greatest(auth.uid(), p_other);
  select id into cid from chats where user_a = a and user_b = b;
  if cid is null then
    insert into chats(user_a, user_b) values (a, b) returning id into cid;
  end if;
  return cid;
end $$;

-- Minhas conversas (com o perfil do outro + última mensagem).
create or replace function my_chats()
returns table (
  chat_id uuid, other_id uuid, other_slug text, other_name text,
  other_avatar text, other_fav_team text, last_body text, last_at timestamptz
)
language sql security definer set search_path = public as $$
  select c.id,
    case when c.user_a = auth.uid() then c.user_b else c.user_a end as other_id,
    p.slug, p.display_name, p.avatar, p.fav_team,
    (select m.body from messages m where m.chat_id = c.id order by m.created_at desc limit 1),
    (select m.created_at from messages m where m.chat_id = c.id order by m.created_at desc limit 1)
  from chats c
  join profiles p on p.id = (case when c.user_a = auth.uid() then c.user_b else c.user_a end)
  where auth.uid() in (c.user_a, c.user_b)
  order by 8 desc nulls last;
$$;

grant execute on function trade_stickers(uuid), get_or_create_chat(uuid), my_chats() to authenticated;

-- Tempo real nas mensagens (para o chat atualizar na hora).
alter publication supabase_realtime add table messages;
