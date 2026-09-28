import type { PageConfig } from './page-schema';

export const CURRENT_SCHEMA_VERSION = 3;

type PageMigration = (
  config: PageConfig,
) => PageConfig;

const migrateV1ToV2: PageMigration = (
  config,
) => {
  return {
    ...config,

    schemaVersion: 2,
  };
};

const migrateV2ToV3: PageMigration = (
  config,
) => {
  /*
   * Version 3 introduces the Team section.
   *
   * Existing pages do not need any data
   * transformation because Team is additive.
   */
  return {
    ...config,

    schemaVersion: 3,
  };
};

const MIGRATIONS: Record<
  number,
  PageMigration
> = {
  1: migrateV1ToV2,

  2: migrateV2ToV3,
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

  let migratedConfig =
    structuredClone(config);

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
      migration(
        migratedConfig,
      );
  }

  return migratedConfig;
}