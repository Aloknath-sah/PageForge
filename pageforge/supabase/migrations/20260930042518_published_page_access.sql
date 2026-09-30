-- ============================================================
-- Public published-page access
-- ============================================================

create or replace function public.get_published_page_by_slug(
  p_slug text
)
returns table (
  id uuid,
  slug text,
  published_config jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.slug,
    p.published_config
  from public.pages as p
  where
    p.slug = p_slug
    and p.status = 'published'::public.page_status
    and p.published_config is not null
  limit 1;
$$;

-- Do not leave broad function execution privileges.
revoke execute
on function public.get_published_page_by_slug(text)
from public;

grant execute
on function public.get_published_page_by_slug(text)
to anon;

grant execute
on function public.get_published_page_by_slug(text)
to authenticated;