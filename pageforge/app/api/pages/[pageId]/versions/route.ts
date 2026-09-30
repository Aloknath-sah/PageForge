import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{
    pageId: string;
  }>;
};

export async function GET(
  _request: Request,
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
      .select('id')
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
    data: versions,
    error: versionsError,
  } = await supabase
    .from('page_versions')
    .select(`
      id,
      page_id,
      version,
      created_at,
      created_by
    `)
    .eq('page_id', pageId)
    .order('version', {
      ascending: false,
    });

  if (versionsError) {
    return NextResponse.json(
      {
        error: versionsError.message,
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json({
    versions: versions ?? [],
  });
}