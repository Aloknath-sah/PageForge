import type { PageConfig } from './page-schema';

export const CURRENT_SCHEMA_VERSION = 2;

type PageMigration = (
  config: PageConfig,
) => PageConfig;

const migrateV1ToV2: PageMigration = (
  config,
) => {
  /*
   * Version 2 introduced the FAQ section and
   * expanded the section registry, but existing
   * pages do not need new content inserted.
   *
   * This migration therefore preserves all existing
   * page content and only advances the schema
   * version.
   */
  return {
    ...config,
    schemaVersion: 2,
  };
};

const MIGRATIONS: Record<
  number,
  PageMigration
> = {
  1: migrateV1ToV2,
};

export function migratePageConfig(
  config: PageConfig,
): PageConfig {
  if (
    config.schemaVersion >
    CURRENT_SCHEMA_VERSION
  ) {
    throw new Error(
      `PageConfig schema version ${config.schemaVersion} is newer than the supported version ${CURRENT_SCHEMA_VERSION}.`,
    );
  }

  let migratedConfig = structuredClone(
    config,
  );

  while (
    migratedConfig.schemaVersion <
    CURRENT_SCHEMA_VERSION
  ) {
    const migration =
      MIGRATIONS[
        migratedConfig.schemaVersion
      ];

    if (!migration) {
      throw new Error(
        `No migration exists for PageConfig schema version ${migratedConfig.schemaVersion}.`,
      );
    }

    migratedConfig =
      migration(migratedConfig);
  }

  return migratedConfig;
}