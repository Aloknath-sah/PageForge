type PublicPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicPage({ params }: PublicPageProps) {
  const { slug } = await params;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Public Landing Page</h1>

      <p className="mt-2 text-gray-600">Slug: {slug}</p>
    </main>
  );
}
