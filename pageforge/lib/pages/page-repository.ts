import type { SupabaseClient } from '@supabase/supabase-js';

import type { PageConfig } from '../../features/page-builder/domain/page-schema';

export type PageStatus =
  | 'draft'
  | 'published';

export type PageRecord = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  status: PageStatus;
  draft_config: PageConfig;
  published_config: PageConfig | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type CreatePageInput = {
  userId: string;
  name: string;
  slug: string;
  config: PageConfig;
};

export type UpdateDraftInput = {
  pageId: string;
  config: PageConfig;
};

export type UpdatePageMetadataInput = {
  pageId: string;
  name?: string;
  slug?: string;
};

export type PublishPageInput = {
  pageId: string;
  config: PageConfig;
};

export type PublishedPageRecord = {
  id: string;
  slug: string;
  published_config: PageConfig;
};

export class PageRepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name =
      'PageRepositoryError';
  }
}

export function createPageRepository(
  supabase: SupabaseClient,
) {
  async function getById(
    pageId: string,
  ): Promise<PageRecord | null> {
    const {
      data,
      error,
    } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .maybeSingle();

    if (error) {
      throw new PageRepositoryError(
        'Unable to load page.',
        error,
      );
    }

    return data as PageRecord | null;
  }

  async function getBySlug(
    slug: string,
  ): Promise<PageRecord | null> {
    const {
      data,
      error,
    } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      throw new PageRepositoryError(
        'Unable to load page by slug.',
        error,
      );
    }

    return data as PageRecord | null;
  }

  async function listVersions(
  pageId: string,
): Promise<
  Array<{
    id: string;
    page_id: string;
    version: number;
    config: PageConfig;
    created_at: string;
    created_by: string | null;
  }>
> {
  const {
    data,
    error,
  } = await supabase
    .from('page_versions')
    .select(
      `
        id,
        page_id,
        version,
        config,
        created_at,
        created_by
      `,
    )
    .eq(
      'page_id',
      pageId,
    )
    .order(
      'version',
      {
        ascending: false,
      },
    );

  if (error) {
    throw new PageRepositoryError(
      'Unable to load page versions.',
      error,
    );
  }

  return (data ?? []) as Array<{
    id: string;
    page_id: string;
    version: number;
    config: PageConfig;
    created_at: string;
    created_by: string | null;
  }>;
}

  async function listByUser(
    userId: string,
  ): Promise<PageRecord[]> {
    const {
      data,
      error,
    } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', {
        ascending: false,
      });

    if (error) {
      throw new PageRepositoryError(
        'Unable to load pages.',
        error,
      );
    }

    return (data ?? []) as PageRecord[];
  }

  async function create(
    input: CreatePageInput,
  ): Promise<PageRecord> {
    const {
      data,
      error,
    } = await supabase
      .from('pages')
      .insert({
        user_id: input.userId,
        name: input.name,
        slug: input.slug,
        status: 'draft',
        draft_config: input.config,
        published_config: null,
      })
      .select('*')
      .single();

    if (error) {
      throw new PageRepositoryError(
        'Unable to create page.',
        error,
      );
    }

    return data as PageRecord;
  }

  async function updateDraft(
    input: UpdateDraftInput,
  ): Promise<PageRecord> {
    const {
      data,
      error,
    } = await supabase
      .from('pages')
      .update({
        draft_config: input.config,
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.pageId)
      .select('*')
      .single();

    if (error) {
      throw new PageRepositoryError(
        'Unable to save page draft.',
        error,
      );
    }

    return data as PageRecord;
  }

async function publish(
  input: PublishPageInput,
): Promise<{
  pageId: string;
  version: number;
  publishedAt: string;
}> {
  const {
    data,
    error,
  } = await supabase
    .rpc('publish_page', {
      p_page_id:
        input.pageId,
      p_config:
        input.config,
    })
    .single();

  if (error) {
    throw new PageRepositoryError(
      'Unable to publish page.',
      error,
    );
  }

  type PublishPageResult = {
  page_id: string;
  version: number;
  published_at: string;
};

const publishedPage = data as PublishPageResult | null;

if (!publishedPage) {
  throw new PageRepositoryError(
    'Unable to publish page.',
    new Error('Publish RPC returned no data.'),
  );
}

return {
  pageId: publishedPage.page_id,
  version: publishedPage.version,
  publishedAt: publishedPage.published_at,
};
}

async function getPublishedBySlug(
  slug: string,
): Promise<PublishedPageRecord | null> {
  const {
    data,
    error,
  } = await supabase
    .rpc(
      'get_published_page_by_slug',
      {
        p_slug: slug,
      },
    )
    .maybeSingle();

  if (error) {
    throw new PageRepositoryError(
      'Unable to load published page.',
      error,
    );
  }

  return data as PublishedPageRecord | null;
}

  async function updateMetadata(
    input: UpdatePageMetadataInput,
  ): Promise<PageRecord> {
    const updates: Record<
      string,
      unknown
    > = {
      updated_at:
        new Date().toISOString(),
    };

    if (
      input.name !== undefined
    ) {
      updates.name = input.name;
    }

    if (
      input.slug !== undefined
    ) {
      updates.slug = input.slug;
    }

    const {
      data,
      error,
    } = await supabase
      .from('pages')
      .update(updates)
      .eq('id', input.pageId)
      .select('*')
      .single();

    if (error) {
      throw new PageRepositoryError(
        'Unable to update page metadata.',
        error,
      );
    }

    return data as PageRecord;
  }

  return {
    getById,
    getBySlug,
    getPublishedBySlug,
    listByUser,
    listVersions,
    create,
    updateDraft,
    updateMetadata,
    publish
  };
}

export type PageRepository =
  ReturnType<
    typeof createPageRepository
  >;