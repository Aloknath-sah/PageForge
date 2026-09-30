'use client';

import { useEffect, useState } from 'react';

type PageVersion = {
  id: string;
  page_id: string;
  version: number;
  created_at: string;
  created_by: string;
};

type VersionHistoryPanelProps = {
  pageId: string;
  open: boolean;
  onClose: () => void;
  restoreVersion: (
    version: number,
  ) => Promise<boolean>;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function VersionHistoryPanel({
  pageId,
  open,
  onClose,
  restoreVersion,
}: VersionHistoryPanelProps) {
  const [versions, setVersions] =
    useState<PageVersion[]>([]);

  const [restoringVersion, setRestoringVersion] =
    useState<number | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadVersions() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/pages/${pageId}/versions`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );

        const body = await response.json();

        if (!response.ok) {
          throw new Error(
            body?.error ??
              'Unable to load version history.',
          );
        }

        if (!cancelled) {
          setVersions(
            Array.isArray(body?.versions)
              ? body.versions
              : [],
          );
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load version history.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadVersions();

    return () => {
      cancelled = true;
    };
  }, [pageId, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close version history"
        onClick={onClose}
        className="absolute inset-0 bg-black/20"
      />

      <aside
        aria-label="Version history"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-950">
              Version history
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Published snapshots for this page.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close version history"
            className="rounded-md px-2 py-1 text-lg leading-none text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {isLoading && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              Loading version history...
            </div>
          )}

          {!isLoading && error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {!isLoading &&
            !error &&
            versions.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center">
                <p className="text-sm font-medium text-gray-700">
                  No published versions yet.
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Publish the page to create the first
                  version.
                </p>
              </div>
            )}

          {!isLoading &&
            !error &&
            versions.length > 0 && (
              <div className="space-y-3">
                {versions.map((version, index) => {
                  const latest = index === 0;

                  return (
                    <div
                      key={version.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900">
                              Version {version.version}
                            </h3>

                            {latest && (
                              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                                Latest
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-gray-500">
                            {formatDate(
                              version.created_at,
                            )}
                          </p>

                          {!latest && (
                            <button
                              type="button"
                              disabled={
                                restoringVersion !== null
                              }
                              onClick={async () => {
                                const confirmed =
                                  window.confirm(
                                    `Restore Version ${version.version} as the current draft? Your current draft changes will be replaced.`,
                                  );

                                if (!confirmed) {
                                  return;
                                }

                                setRestoringVersion(
                                  version.version,
                                );

                                try {
                                  const success =
                                    await restoreVersion(
                                      version.version,
                                    );

                                  if (success) {
                                    onClose();
                                  }
                                } finally {
                                  setRestoringVersion(
                                    null,
                                  );
                                }
                              }}
                              className="mt-3 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {restoringVersion ===
                              version.version
                                ? 'Restoring...'
                                : 'Restore'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </aside>
    </div>
  );
}