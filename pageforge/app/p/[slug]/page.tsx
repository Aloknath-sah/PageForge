import { notFound } from 'next/navigation';

import { createPageRepository } from '@/lib/pages/page-repository';
import { createClient } from '@/lib/supabase/server';

import PageRenderer from '@/features/page-builder/components/renderer/PageRenderer';
import { validatePageConfig } from '@/features/page-builder/domain/page-runtime-validation';

type PublishedPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublishedPage({
  params,
}: PublishedPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const repository = createPageRepository(
    supabase,
  );

  const page =
    await repository.getPublishedBySlug(
      slug,
    );

  if (!page) {
    notFound();
  }

  const validationResult =
    validatePageConfig(
      page.published_config,
    );

  if (!validationResult.success) {
    const firstError =
      validationResult.errors[0];

    throw new Error(
      `Invalid published page configuration for "${slug}" at ${firstError?.path ?? 'unknown path'}: ${firstError?.message ?? 'unknown validation error'}`,
    );
  }

  return (
    <PageRenderer
      config={validationResult.data}
    />
  );
}
