'use client';

import { useCallback, useEffect, useState } from 'react';

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

  const hydrateConfig =
    usePageEditorStore(
      (state) => state.hydrateConfig,
    );

  const markSaved =
    usePageEditorStore(
      (state) => state.markSaved,
    );

  const [isHydrated, setIsHydrated] =
    useState(false);

  const [saveError, setSaveError] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    setIsHydrated(false);
    setSaveError(null);

    const persistedConfig =
      loadPageConfig(pageId);

    if (persistedConfig) {
      hydrateConfig(
        persistedConfig,
      );
    }

    setIsHydrated(true);
  }, [
    pageId,
    hydrateConfig,
  ]);

  const save = useCallback(() => {
    try {
      savePageConfig(
        pageId,
        config,
      );

      markSaved();
      setSaveError(null);
    } catch {
      setSaveError(
        'Unable to save this page locally.',
      );
    }
  }, [
    pageId,
    config,
    markSaved,
  ]);

  return {
    isHydrated,
    save,
    saveError,
  };
}