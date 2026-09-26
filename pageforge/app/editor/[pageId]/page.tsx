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
    <main className="p-8">
      <h1 className="text-2xl font-semibold">
        Editor
      </h1>

      <p className="mt-2 text-gray-600">
        Editing page: {pageId}
      </p>
    </main>
  );
}