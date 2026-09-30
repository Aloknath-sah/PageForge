import { NextResponse } from 'next/server';

import { createClient } from '../../../../lib/supabase/server';

type RouteContext = {
  params: Promise<{
    pageId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const { pageId } = await context.params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error: 'Authentication required.',
      },
      {
        status: 401,
      },
    );
  }

  const { data, error } = await supabase
    .from('pages')
    .select(`
      id,
      user_id,
      name,
      slug,
      status,
      draft_config,
      published_config,
      created_at,
      updated_at,
      published_at
    `)
    .eq('id', pageId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      {
        error: 'Unable to load page.',
      },
      {
        status: 500,
      },
    );
  }

  if (!data) {
    return NextResponse.json(
      {
        error: 'Page not found.',
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    page: data,
  });
}