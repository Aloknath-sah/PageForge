begin;

select plan(8);

-- ------------------------------------------------------------
-- Test users
-- ------------------------------------------------------------

select tests.create_supabase_user('pageforge-user-a@test.com');
select tests.create_supabase_user('pageforge-user-b@test.com');

-- ------------------------------------------------------------
-- Test data
-- ------------------------------------------------------------

insert into public.pages (
  user_id,
  name,
  slug,
  status,
  draft_config
)
values
(
  tests.get_supabase_uid('pageforge-user-a@test.com'),
  'User A Page',
  'user-a-page',
  'draft',
  '{}'::jsonb
),
(
  tests.get_supabase_uid('pageforge-user-b@test.com'),
  'User B Page',
  'user-b-page',
  'draft',
  '{}'::jsonb
);

-- ------------------------------------------------------------
-- User A context
-- ------------------------------------------------------------

select tests.authenticate_as('pageforge-user-a@test.com');

-- Test 1:
-- User A should only see User A's page.
select results_eq(
  $$
    select count(*)
    from public.pages
  $$,
  $$ values (1::bigint) $$,
  'User A can only see their own page'
);

-- Test 2:
-- User A can update their own page.
select lives_ok(
  $$
    update public.pages
    set name = 'User A Updated Page'
    where slug = 'user-a-page'
  $$,
  'User A can update their own page'
);

-- Test 3:
-- User A must not be able to update User B's page.
select results_eq(
  $$
    update public.pages
    set name = 'Hacked Page'
    where slug = 'user-b-page'
    returning id
  $$,
  $$ values $$,
  'User A cannot update User B page'
);

-- Test 4:
-- User A must not be able to delete User B's page.
select results_eq(
  $$
    delete from public.pages
    where slug = 'user-b-page'
    returning id
  $$,
  $$ values $$,
  'User A cannot delete User B page'
);

-- ------------------------------------------------------------
-- User B context
-- ------------------------------------------------------------

select tests.authenticate_as('pageforge-user-b@test.com');

-- Test 5:
-- User B should only see User B's page.
select results_eq(
  $$
    select count(*)
    from public.pages
  $$,
  $$ values (1::bigint) $$,
  'User B can only see their own page'
);

-- Test 6:
-- User B cannot update User A's page.
select results_eq(
  $$
    update public.pages
    set name = 'Another Hacked Page'
    where slug = 'user-a-page'
    returning id
  $$,
  $$ values $$,
  'User B cannot update User A page'
);

-- ------------------------------------------------------------
-- Anonymous context
-- ------------------------------------------------------------

select set_config(
  'request.jwt.claims',
  '{"role":"anon"}',
  true
);

select set_config(
  'request.jwt.claim.role',
  'anon',
  true
);

-- Test 7:
-- Anonymous users must not see pages.
select results_eq(
  $$
    select count(*)
    from public.pages
  $$,
  $$ values (0::bigint) $$,
  'Anonymous users cannot read pages'
);

-- Test 8:
-- Anonymous users must not be able to create pages.
select throws_ok(
  $$
    insert into public.pages (
      user_id,
      name,
      slug,
      status,
      draft_config
    )
    values (
      gen_random_uuid(),
      'Anonymous Page',
      'anonymous-page',
      'draft',
      '{}'::jsonb
    )
  $$,
  null,
  null,
  'Anonymous users cannot create pages'
);

select * from finish();

rollback;