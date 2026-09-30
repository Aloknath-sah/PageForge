'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  loadPageConfig,
  savePageConfig,
} from '../storage/page-editor-storage';

import { usePageEditorStore } from '../providers/page-editor-provider';

import { createClient } from '../../../lib/supabase/client';

import {
  createPageRepository,
} from '../../../lib/pages/page-repository';

function isUuid(
  value: string,
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function usePageEditorPersistence(
  pageId: string,
) {
  const config =
    usePageEditorStore(
      (state) => state.config,
    );

  const hydrateConfig =
    usePageEditorStore(
      (state) =>
        state.hydrateConfig,
    );

  const markSaved =
    usePageEditorStore(
      (state) => state.markSaved,
    );

  const [
    hydratedPageId,
    setHydratedPageId,
  ] =
    useState<string | null>(
      null,
    );

  const isHydrated =
    hydratedPageId === pageId;

  const [
    saveError,
    setSaveError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    isPublishing,
    setIsPublishing,
  ] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      setHydratedPageId(null);
      setSaveError(null);

      // Preserve existing local-storage
      // behavior for legacy/non-UUID pages.
      const localConfig =
        loadPageConfig(pageId);

      try {
        if (isUuid(pageId)) {
          const supabase =
            createClient();

          const {
            data: {
              user,
            },
          } =
            await supabase.auth.getUser();

          if (user) {
            const repository =
              createPageRepository(
                supabase,
              );

            const remotePage =
              await repository.getById(
                pageId,
              );

            if (
              remotePage &&
              remotePage.draft_config
            ) {
              if (!cancelled) {
                hydrateConfig(
                  remotePage.draft_config,
                );

                savePageConfig(
                  pageId,
                  remotePage.draft_config,
                );
              }

              return;
            }
          }
        }

        // Fallback to the existing local
        // persistence mechanism.
        if (
          localConfig &&
          !cancelled
        ) {
          hydrateConfig(
            localConfig,
          );
        }
      } catch (error) {
        console.error(
          'Unable to hydrate page from Supabase:',
          error,
        );

        // Preserve local data when
        // cloud hydration fails.
        if (
          localConfig &&
          !cancelled
        ) {
          hydrateConfig(
            localConfig,
          );
        }

        if (!cancelled) {
          setSaveError(
            'Unable to load the cloud draft. Using the local draft.',
          );
        }
      } finally {
        if (!cancelled) {
          setHydratedPageId(
            pageId,
          );
        }
      }
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, [
    pageId,
    hydrateConfig,
  ]);

  const save =
    useCallback(
      async (): Promise<boolean> => {
        try {
          // Always keep the existing local
          // persistence behavior.
          savePageConfig(
            pageId,
            config,
          );

          if (isUuid(pageId)) {
            const supabase =
              createClient();

            const {
              data: {
                user,
              },
            } =
              await supabase.auth.getUser();

            if (!user) {
              throw new Error(
                'Your session has expired.',
              );
            }

            const repository =
              createPageRepository(
                supabase,
              );

            await repository.updateDraft({
              pageId,
              config,
            });
          }

          markSaved();

          setSaveError(null);

          return true;
        } catch (error) {
          console.error(
            'Unable to save page:',
            error,
          );

          setSaveError(
            error instanceof Error
              ? error.message
              : 'Unable to save this page.',
          );

          return false;
        }
      },
      [
        pageId,
        config,
        markSaved,
      ],
    );

  const publish =
    useCallback(
      async (): Promise<boolean> => {
        if (!isUuid(pageId)) {
          setSaveError(
            'Only database-backed pages can be published.',
          );

          return false;
        }

        try {
          setIsPublishing(true);
          setSaveError(null);

          const response =
            await fetch(
              `/api/pages/${pageId}/publish`,
              {
                method: 'POST',
                headers: {
                  'Content-Type':
                    'application/json',
                },
                body: JSON.stringify({
                  config,
                }),
              },
            );

          const result =
            (await response.json()) as {
              error?: string;
            };

          if (!response.ok) {
            throw new Error(
              result.error ||
                'Unable to publish page.',
            );
          }

          // Keep the existing local
          // persistence mirror in sync.
          savePageConfig(
            pageId,
            config,
          );

          markSaved();

          return true;
        } catch (error) {
          console.error(
            'Unable to publish page:',
            error,
          );

          setSaveError(
            error instanceof Error
              ? error.message
              : 'Unable to publish page.',
          );

          return false;
        } finally {
          setIsPublishing(false);
        }
      },
      [
        pageId,
        config,
        markSaved,
      ],
    );

  return {
    isHydrated,
    save,
    publish,
    isPublishing,
    saveError,
  };
}