-- ============================================================
-- Atomic publish + version creation
-- ============================================================

create or replace function public.publish_page(
  p_page_id uuid,
  p_config jsonb
)
returns table (
  page_id uuid,
  version integer,
  published_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_published_at timestamptz;
  v_next_version integer;
  v_page_id uuid;
begin
  v_user_id := (select auth.uid());

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  /*
   * Serialize publishes for the same page.
   *
   * This prevents two concurrent publishes from
   * calculating the same next version number.
   */
  perform pg_advisory_xact_lock(
    hashtextextended(
      p_page_id::text,
      0
    )
  );

  /*
   * Determine the next version.
   */
  select
    coalesce(
      max(pv.version),
      0
    ) + 1
  into v_next_version
  from public.page_versions as pv
  where pv.page_id = p_page_id;

  v_published_at := now();

  /*
   * Publish the current configuration.
   *
   * RLS still applies because this function
   * runs as the authenticated caller.
   */
  update public.pages
  set
    draft_config = p_config,
    published_config = p_config,
    status = 'published'::public.page_status,
    published_at = v_published_at,
    updated_at = v_published_at
  where
    id = p_page_id
    and user_id = v_user_id
  returning id
  into v_page_id;

  if v_page_id is null then
    raise exception 'Page not found or access denied';
  end if;

  /*
   * Create immutable version snapshot.
   */
  insert into public.page_versions (
    page_id,
    version,
    config,
    created_by
  )
  values (
    v_page_id,
    v_next_version,
    p_config,
    v_user_id
  );

  return query
  select
    v_page_id,
    v_next_version,
    v_published_at;
end;
$$;

-- Function execution should only be available
-- to authenticated users.
revoke execute
on function public.publish_page(uuid, jsonb)
from public;

grant execute
on function public.publish_page(uuid, jsonb)
to authenticated;