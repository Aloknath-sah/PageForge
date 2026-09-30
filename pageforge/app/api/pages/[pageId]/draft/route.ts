import { NextResponse } from 'next/server';

import { createClient } from '../../../../../lib/supabase/server';

type RouteContext = {
  params: Promise<{
    pageId: string;
  }>;
};

type DraftRequestBody = {
  config: unknown;
};

export async function PUT(
  request: Request,
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

  let body: DraftRequestBody;

  try {
    body = (await request.json()) as DraftRequestBody;
  } catch {
    return NextResponse.json(
      {
        error: 'Invalid JSON request body.',
      },
      {
        status: 400,
      },
    );
  }

  if (
    !body ||
    typeof body !== 'object' ||
    !('config' in body) ||
    body.config === null ||
    typeof body.config !== 'object'
  ) {
    return NextResponse.json(
      {
        error: 'A valid page config is required.',
      },
      {
        status: 400,
      },
    );
  }

  const { data, error } = await supabase
    .from('pages')
    .update({
      draft_config: body.config,
      updated_at: new Date().toISOString(),
    })
    .eq('id', pageId)
    .eq('user_id', user.id)
    .select(`
      id,
      name,
      slug,
      status,
      draft_config,
      updated_at
    `)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      {
        error: 'Unable to save draft.',
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