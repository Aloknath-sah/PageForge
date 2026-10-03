import { notFound, redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { createPageRepository } from '@/lib/pages/page-repository';

import { PageEditorProvider } from '@/features/page-builder/providers/page-editor-provider';
import PageBuilder from '@/features/page-builder/components/editor/PageBuilder';

type EditorPageProps = {
  params: Promise<{
    pageId: string;
  }>;
};

export default async function EditorPage({
  params,
}: EditorPageProps) {
  const { pageId } = await params;

  const supabase = await createClient();

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const repository = createPageRepository(supabase);

  const page = await repository.getById(pageId);

  if (!page) {
    notFound();
  }

  // Make sure users can only edit their own pages.
  if (page.user_id !== user.id) {
    notFound();
  }

  return (
    <PageEditorProvider
      initialConfig={page.draft_config}
    >
      <PageBuilder pageId={page.id} />
    </PageEditorProvider>
  );
}