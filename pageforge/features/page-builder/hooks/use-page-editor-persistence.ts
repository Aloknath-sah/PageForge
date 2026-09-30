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

export function usePageEditorPersistence(
  pageId: string,
) {
  const config = usePageEditorStore(
    (state) => state.config,
  );

  const hydrateConfig = usePageEditorStore(
    (state) => state.hydrateConfig,
  );

  const markSaved = usePageEditorStore(
    (state) => state.markSaved,
  );

  const [hydratedPageId, setHydratedPageId] =
    useState<string | null>(null);

  const [saveError, setSaveError] =
    useState<string | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isPublishing, setIsPublishing] =
    useState(false);

  const isHydrated =
    hydratedPageId === pageId;

  useEffect(() => {
    let cancelled = false;

    async function loadDraft() {
      setHydratedPageId(null);
      setSaveError(null);

      try {
        const response = await fetch(
          `/api/pages/${pageId}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );

        if (!response.ok) {
          throw new Error(
            'Unable to load page from server.',
          );
        }

        const body = await response.json();

        if (
          cancelled ||
          !body?.page?.draft_config
        ) {
          return;
        }

        hydrateConfig(
          body.page.draft_config,
        );
      } catch {
        /*
         * Preserve the existing local fallback.
         */
        const persistedConfig =
          loadPageConfig(pageId);

        if (
          !cancelled &&
          persistedConfig
        ) {
          hydrateConfig(
            persistedConfig,
          );
        }
      } finally {
        if (!cancelled) {
          setHydratedPageId(pageId);
        }
      }
    }

    loadDraft();

    return () => {
      cancelled = true;
    };
  }, [
    pageId,
    hydrateConfig,
  ]);

  const save = useCallback(async () => {
    if (!isHydrated || isSaving) {
      return false;
    }

    setIsSaving(true);
    setSaveError(null);

    /*
     * Keep local persistence as a fallback/cache.
     */
    try {
      savePageConfig(
        pageId,
        config,
      );
    } catch {
      /*
       * Local storage failure should not stop
       * the server persistence attempt.
       */
    }

    try {
      const response = await fetch(
        `/api/pages/${pageId}/draft`,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            config,
          }),
        },
      );

      const body =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          body?.error ??
            'Unable to save draft.',
        );
      }

      markSaved();

      return true;
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Unable to save draft.',
      );

      return false;
    } finally {
      setIsSaving(false);
    }
  }, [
    pageId,
    config,
    isHydrated,
    isSaving,
    markSaved,
  ]);

  const publish = useCallback(async () => {
    if (
      !isHydrated ||
      isPublishing
    ) {
      return false;
    }

    setIsPublishing(true);
    setSaveError(null);

    try {
      /*
       * Publish the current editor configuration.
       *
       * The server is responsible for:
       * - authentication
       * - ownership checks
       * - publish validation
       * - updating published_config
       * - creating the version snapshot
       */
      const response = await fetch(
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

      const body =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          body?.error ??
            'Unable to publish page.',
        );
      }

      /*
       * Publishing also makes the current
       * editor configuration persisted.
       */
      try {
        savePageConfig(
          pageId,
          config,
        );
      } catch {
        /*
         * Local persistence is only a fallback.
         * Server publish already succeeded.
         */
      }

      markSaved();

      return true;
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Unable to publish page.',
      );

      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [
    pageId,
    config,
    isHydrated,
    isPublishing,
    markSaved,
  ]);

  const restoreVersion = useCallback(
  async (version: number) => {
    if (!isHydrated || isSaving || isPublishing) {
      return false;
    }

    setSaveError(null);

    try {
      const response = await fetch(
        `/api/pages/${pageId}/restore`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version,
          }),
        },
      );

      const body = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          body?.error ??
            'Unable to restore this version.',
        );
      }

      if (!body?.config) {
        throw new Error(
          'Restored version did not contain a page configuration.',
        );
      }

      hydrateConfig(body.config);
      markSaved();

      try {
        savePageConfig(
          pageId,
          body.config,
        );
      } catch {
        /* local fallback only */
      }

      return true;
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Unable to restore this version.',
      );

      return false;
    }
  },
  [
    pageId,
    isHydrated,
    isSaving,
    isPublishing,
    hydrateConfig,
    markSaved,
  ],
);

  return {
    isHydrated,
    isSaving,
    isPublishing,
    save,
    publish,
    restoreVersion,
    saveError,
  };
}