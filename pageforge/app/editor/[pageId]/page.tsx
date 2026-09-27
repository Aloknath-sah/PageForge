import { PageEditorProvider } from "@/features/page-builder/providers/page-editor-provider";
import PageBuilder from "@/features/page-builder/components/editor/PageBuilder";

import { samplePage } from "@/features/page-builder/domain/sample-page";

type EditorPageProps = {
  params: Promise<{
    pageId: string;
  }>;
};

export default async function EditorPage({
  params,
}: EditorPageProps) {
  const { pageId } = await params;

  return (
    <PageEditorProvider
      initialConfig={samplePage}
    >
      <PageBuilder pageId={pageId} />
    </PageEditorProvider>
  );
}