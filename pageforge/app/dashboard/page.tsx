import Link from 'next/link';
import { redirect } from 'next/navigation';

import LogoutButton from '../../features/auth/components/LogoutButton';

import { createClient } from '../../lib/supabase/server';

import {
  createPageRepository,
  type PageRecord,
} from '../../lib/pages/page-repository';

import { samplePage } from '../../features/page-builder/domain/sample-page';

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function createSlug() {
  return `untitled-${crypto.randomUUID().slice(0, 8)}`;
}

function getStatusLabel(status: 'draft' | 'published') {
  return status === 'published'
    ? 'Published'
    : 'Draft';
}

function getStatusClasses(status: 'draft' | 'published') {
  return status === 'published'
    ? 'bg-green-50 text-green-700'
    : 'bg-amber-50 text-amber-700';
}

export default async function DashboardPage() {
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

  let pages: PageRecord[] = [];

  try {
    pages = await repository.listByUser(user.id);
  } catch {
    pages = [];
  }

  async function createPage() {
    'use server';

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

    const page = await repository.create({
      userId: user.id,
      name: 'Untitled Page',
      slug: createSlug(),
      config: structuredClone(samplePage),
    });

    redirect(`/editor/${page.id}`);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <header className="flex flex-col gap-6 border-b border-gray-200 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              PageForge
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-950">
              Your Pages
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {user.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <LogoutButton />

            <form action={createPage}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                + Create Landing Page
              </button>
            </form>
          </div>
        </header>

        <section className="pt-8">
          {pages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto max-w-md">
                <h2 className="text-lg font-semibold text-gray-950">
                  No pages yet
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Create your first landing
                  page and start building it
                  visually with PageForge.
                </p>

                <form
                  action={createPage}
                  className="mt-6"
                >
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Create your first page
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {pages.map((page) => (
                <article
                  key={page.id}
                  className="flex min-h-[230px] flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-gray-950">
                        {page.name}
                      </h2>

                      <p className="mt-1 truncate text-sm text-gray-500">
                        /p/{page.slug}
                      </p>
                    </div>

                    <span
                      className={[
                        'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                        getStatusClasses(page.status),
                      ].join(' ')}
                    >
                      {getStatusLabel(page.status)}
                    </span>
                  </div>

                  <div className="mt-8 flex-1">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Last updated
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {formatUpdatedAt(page.updated_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <Link
                      href={`/editor/${page.id}`}
                      className="inline-flex flex-1 items-center justify-center rounded-lg bg-gray-950 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                      Edit
                    </Link>

                    {page.status === 'published' && (
                      <Link
                        href={`/p/${page.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        View
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}