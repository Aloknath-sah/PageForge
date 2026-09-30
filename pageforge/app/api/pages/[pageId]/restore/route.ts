import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{
    pageId: string;
  }>;
};

type RestoreRequestBody = {
  version: number;
};

export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  const { pageId } = await params;

  if (!pageId) {
    return NextResponse.json(
      {
        error: 'Page ID is required.',
      },
      {
        status: 400,
      },
    );
  }

  let body: RestoreRequestBody;

  try {
    body = (await request.json()) as RestoreRequestBody;
  } catch {
    return NextResponse.json(
      {
        error: 'Invalid request body.',
      },
      {
        status: 400,
      },
    );
  }

  if (
    !Number.isInteger(body.version) ||
    body.version < 1
  ) {
    return NextResponse.json(
      {
        error: 'A valid version is required.',
      },
      {
        status: 400,
      },
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      {
        error: 'Authentication required.',
      },
      {
        status: 401,
      },
    );
  }

  const { data: page, error: pageError } =
    await supabase
      .from('pages')
      .select('id, user_id, published_config')
      .eq('id', pageId)
      .eq('user_id', user.id)
      .maybeSingle();

  if (pageError) {
    return NextResponse.json(
      {
        error: pageError.message,
      },
      {
        status: 500,
      },
    );
  }

  if (!page) {
    return NextResponse.json(
      {
        error: 'Page not found.',
      },
      {
        status: 404,
      },
    );
  }

  const {
    data: version,
    error: versionError,
  } = await supabase
    .from('page_versions')
    .select(`
      id,
      page_id,
      version,
      config,
      created_at
    `)
    .eq('page_id', pageId)
    .eq('version', body.version)
    .maybeSingle();

  if (versionError) {
    return NextResponse.json(
      {
        error: versionError.message,
      },
      {
        status: 500,
      },
    );
  }

  if (!version) {
    return NextResponse.json(
      {
        error: 'Version not found.',
      },
      {
        status: 404,
      },
    );
  }

  const { error: updateError } =
    await supabase
      .from('pages')
      .update({
        draft_config: version.config,
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', pageId)
      .eq('user_id', user.id);

  if (updateError) {
    return NextResponse.json(
      {
        error: updateError.message,
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json({
    pageId,
    restoredVersion: version.version,
    config: version.config,
  });
}