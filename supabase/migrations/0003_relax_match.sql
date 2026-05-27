-- ============================================================================
-- Figurama — match unidirecional: mostra parceiros com troca em QUALQUER
-- direção (antes exigia troca mútua, o que escondia usuários quando só um
-- lado tinha repetida). Rode no SQL Editor.
-- ============================================================================
create or replace function match_partners_ranked(p_limit int default 30)
returns table (partner_id uuid, partner_slug text, avatar text, fav_team text, i_get int, i_give int, balance int)
language sql security definer set search_path = public as $$
  select partner_id, partner_slug, avatar, fav_team, i_get, i_give, least(i_get, i_give) as balance
  from match_partners(p_limit)
  where greatest(i_get, i_give) > 0
  order by least(i_get, i_give) desc, (i_get + i_give) desc
  limit p_limit
$$;
grant execute on function match_partners_ranked(int) to authenticated;
