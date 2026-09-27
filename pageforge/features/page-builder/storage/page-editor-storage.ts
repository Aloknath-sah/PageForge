import type { PageConfig } from '../domain/page-schema';

const STORAGE_PREFIX =
  'pageforge:page-editor';

function getStorageKey(
  pageId: string,
): string {
  return `${STORAGE_PREFIX}:${encodeURIComponent(
    pageId,
  )}`;
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null
  );
}

function isPageConfig(
  value: unknown,
): value is PageConfig {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.schemaVersion !==
    'number'
  ) {
    return false;
  }

  if (
    !Array.isArray(
      value.sections,
    )
  ) {
    return false;
  }

  if (
    !isRecord(value.theme) ||
    !isRecord(value.seo)
  ) {
    return false;
  }

  return true;
}

export function loadPageConfig(
  pageId: string,
): PageConfig | null {
  if (
    typeof window ===
    'undefined'
  ) {
    return null;
  }

  try {
    const rawValue =
      window.localStorage.getItem(
        getStorageKey(pageId),
      );

    if (!rawValue) {
      return null;
    }

    const parsedValue: unknown =
      JSON.parse(rawValue);

    if (
      !isPageConfig(parsedValue)
    ) {
      console.warn(
        `Ignoring invalid persisted PageForge config for "${pageId}".`,
      );

      return null;
    }

    return parsedValue;
  } catch (error) {
    console.error(
      `Failed to load PageForge config for "${pageId}".`,
      error,
    );

    return null;
  }
}

export function savePageConfig(
  pageId: string,
  config: PageConfig,
): void {
  if (
    typeof window ===
    'undefined'
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      getStorageKey(pageId),
      JSON.stringify(config),
    );
  } catch (error) {
    console.error(
      `Failed to save PageForge config for "${pageId}".`,
      error,
    );

    throw error;
  }
}

export function removePageConfig(
  pageId: string,
): void {
  if (
    typeof window ===
    'undefined'
  ) {
    return;
  }

  try {
    window.localStorage.removeItem(
      getStorageKey(pageId),
    );
  } catch (error) {
    console.error(
      `Failed to remove PageForge config for "${pageId}".`,
      error,
    );

    throw error;
  }
}