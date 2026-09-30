-- ============================================================
-- PageForge
-- Initial database schema
-- ============================================================

-- ------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------

create extension if not exists pgcrypto;


-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------

create type public.page_status as enum (
  'draft',
  'published'
);


-- ------------------------------------------------------------
-- Helper function: updated_at
-- ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ------------------------------------------------------------
-- pages
-- ------------------------------------------------------------

create table public.pages (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null,

  slug text not null,

  status public.page_status not null default 'draft',

  draft_config jsonb not null,

  published_config jsonb,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  published_at timestamptz,

  constraint pages_name_not_blank
    check (length(trim(name)) > 0),

  constraint pages_slug_not_blank
    check (length(trim(slug)) > 0),

  constraint pages_slug_format
    check (
      slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    ),

  constraint pages_published_state_consistent
    check (
      (
        status = 'published'
        and published_config is not null
        and published_at is not null
      )
      or
      (
        status = 'draft'
        and true
      )
    )
);


-- ------------------------------------------------------------
-- Unique slug
-- ------------------------------------------------------------

create unique index pages_slug_unique_idx
on public.pages (slug);


-- ------------------------------------------------------------
-- Useful page lookup indexes
-- ------------------------------------------------------------

create index pages_user_id_idx
on public.pages (user_id);

create index pages_user_updated_at_idx
on public.pages (user_id, updated_at desc);


-- ------------------------------------------------------------
-- updated_at trigger
-- ------------------------------------------------------------

create trigger pages_set_updated_at
before update on public.pages
for each row
execute function public.set_updated_at();


-- ------------------------------------------------------------
-- page_versions
-- ------------------------------------------------------------

create table public.page_versions (
  id uuid primary key default gen_random_uuid(),

  page_id uuid not null
    references public.pages(id)
    on delete cascade,

  version integer not null,

  config jsonb not null,

  created_at timestamptz not null default now(),

  created_by uuid not null
    references auth.users(id)
    on delete restrict,

  constraint page_versions_version_positive
    check (version > 0),

  constraint page_versions_unique_version
    unique (page_id, version)
);


-- ------------------------------------------------------------
-- Version lookup indexes
-- ------------------------------------------------------------

create index page_versions_page_id_idx
on public.page_versions (page_id);

create index page_versions_created_at_idx
on public.page_versions (page_id, created_at desc);


-- ------------------------------------------------------------
-- templates
-- ------------------------------------------------------------

create table public.templates (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  description text not null default '',

  thumbnail text,

  config jsonb not null,

  created_at timestamptz not null default now(),

  constraint templates_name_not_blank
    check (length(trim(name)) > 0)
);


-- ------------------------------------------------------------
-- Template lookup
-- ------------------------------------------------------------

create index templates_created_at_idx
on public.templates (created_at desc);


-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.pages enable row level security;

alter table public.page_versions enable row level security;

alter table public.templates enable row level security;


-- ============================================================
-- pages policies
-- ============================================================

create policy "Users can view their own pages"
on public.pages
for select
to authenticated
using (
  auth.uid() = user_id
);


create policy "Users can create their own pages"
on public.pages
for insert
to authenticated
with check (
  auth.uid() = user_id
);


create policy "Users can update their own pages"
on public.pages
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);


create policy "Users can delete their own pages"
on public.pages
for delete
to authenticated
using (
  auth.uid() = user_id
);


-- ============================================================
-- page_versions policies
-- ============================================================

create policy "Users can view versions of their own pages"
on public.page_versions
for select
to authenticated
using (
  exists (
    select 1
    from public.pages
    where pages.id = page_versions.page_id
      and pages.user_id = auth.uid()
  )
);


create policy "Users can create versions for their own pages"
on public.page_versions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.pages
    where pages.id = page_versions.page_id
      and pages.user_id = auth.uid()
  )
  and created_by = auth.uid()
);


-- ============================================================
-- templates policies
-- ============================================================

create policy "Authenticated users can view templates"
on public.templates
for select
to authenticated
using (
  true
);