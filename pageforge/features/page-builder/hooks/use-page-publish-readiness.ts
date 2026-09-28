'use client';

import { useMemo } from 'react';

import { usePageEditorStore } from '../providers/page-editor-provider';

import { validatePageConfig } from '../domain/page-validation';

export type PublishReadiness = {
  isReady: boolean;
  status: 'ready' | 'blocked';
  errorCount: number;
  errors: ReturnType<typeof validatePageConfig>['errors'];
};

export function usePagePublishReadiness(): PublishReadiness {
  const config = usePageEditorStore(
    (state) => state.config,
  );

  const validationResult = useMemo(
    () => validatePageConfig(config),
    [config],
  );

  const errorCount = validationResult.errors.length;

  return {
    isReady: validationResult.valid,
    status: validationResult.valid
      ? 'ready'
      : 'blocked',
    errorCount,
    errors: validationResult.errors,
  };
}