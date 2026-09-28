import type { PageConfig } from '../domain/page-schema';

import {
  CURRENT_SCHEMA_VERSION,
  migratePageConfig,
} from '../domain/page-migrations';

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
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      'object' &&
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
    'number' ||
    !Number.isInteger(
      value.schemaVersion,
    ) ||
    value.schemaVersion < 1
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
      !isPageConfig(
        parsedValue,
      )
    ) {
      console.warn(
        `Ignoring invalid persisted PageForge config for "${pageId}".`,
      );

      return null;
    }

    const migratedConfig =
      migratePageConfig(
        parsedValue,
      );

    /*
     * Persist the migrated configuration
     * immediately so the same migration does
     * not need to run on every future load.
     */
    if (
      migratedConfig.schemaVersion !==
      parsedValue.schemaVersion
    ) {
      window.localStorage.setItem(
        getStorageKey(pageId),
        JSON.stringify(
          migratedConfig,
        ),
      );
    }

    return migratedConfig;
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
    const configToPersist =
      migratePageConfig(
        config,
      );

    /*
     * Defensive check: anything written to storage
     * must always be on the current schema version.
     */
    if (
      configToPersist.schemaVersion !==
      CURRENT_SCHEMA_VERSION
    ) {
      throw new Error(
        `Cannot persist PageConfig schema version ${configToPersist.schemaVersion}. Expected ${CURRENT_SCHEMA_VERSION}.`,
      );
    }

    window.localStorage.setItem(
      getStorageKey(pageId),
      JSON.stringify(
        configToPersist,
      ),
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