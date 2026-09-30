import {
  NextResponse,
} from 'next/server';

import { createClient } from '../../../../../lib/supabase/server';

import {
  createPageRepository,
} from '../../../../../lib/pages/page-repository';

import {
  isPageConfigPublishable,
} from '../../../../../features/page-builder/domain/page-validation';

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      pageId: string;
    }>;
  },
) {
  try {
    const {
      pageId,
    } = await context.params;

    const body =
      (await request.json()) as {
        config?: unknown;
      };

    if (!body.config) {
      return NextResponse.json(
        {
          error:
            'Page configuration is required.',
        },
        {
          status: 400,
        },
      );
    }

    const config =
      body.config;

    if (
      !isPageConfigPublishable(
        config as never,
      )
    ) {
      return NextResponse.json(
        {
          error:
            'This page is not ready to publish. Fix the validation errors first.',
        },
        {
          status: 400,
        },
      );
    }

    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            'You must be signed in to publish a page.',
        },
        {
          status: 401,
        },
      );
    }

    const repository =
      createPageRepository(
        supabase,
      );

    const existingPage =
      await repository.getById(
        pageId,
      );

    if (!existingPage) {
      return NextResponse.json(
        {
          error:
            'Page not found.',
        },
        {
          status: 404,
        },
      );
    }

    const publishedPage =
      await repository.publish({
        pageId,
        config: config as never,
      });

    return NextResponse.json({
      success: true,
      page: {
        id: publishedPage.id,
        status:
          publishedPage.status,
        published_at:
          publishedPage.published_at,
      },
    });
  } catch (error) {
    console.error(
      'Publish route error:',
      error,
    );

    return NextResponse.json(
      {
        error:
          'Unable to publish page.',
      },
      {
        status: 500,
      },
    );
  }
}