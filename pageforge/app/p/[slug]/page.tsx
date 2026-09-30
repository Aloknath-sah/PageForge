import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { createClient } from '../../../lib/supabase/server';

import {
  createPageRepository,
} from '../../../lib/pages/page-repository';

import PageRenderer from '../../../features/page-builder/components/renderer/PageRenderer';

type PublicPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic =
  'force-dynamic';

export async function generateMetadata(
  {
    params,
  }: PublicPageProps,
): Promise<Metadata> {
  const {
    slug,
  } = await params;

  const supabase =
    await createClient();

  const repository =
    createPageRepository(
      supabase,
    );

  const page =
    await repository.getPublishedBySlug(
      slug,
    );

  if (!page) {
    return {
      title: 'Page not found | PageForge',
    };
  }

  const config =
    page.published_config;

  return {
    title:
      config.seo.title,
    description:
      config.seo.description,
    ...(config.seo.ogImageUrl
      ? {
          openGraph: {
            images: [
              config.seo.ogImageUrl,
            ],
          },
        }
      : {}),
  };
}

export default async function PublicPage(
  {
    params,
  }: PublicPageProps,
) {
  const {
    slug,
  } = await params;

  const supabase =
    await createClient();

  const repository =
    createPageRepository(
      supabase,
    );

  const page =
    await repository.getPublishedBySlug(
      slug,
    );

  if (!page) {
    notFound();
  }

  return (
    <PageRenderer
      config={
        page.published_config
      }
    />
  );
}
