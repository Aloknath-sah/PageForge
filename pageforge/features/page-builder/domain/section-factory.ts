import type {
  PageSection,
  SectionType,
} from './page-schema';

import {
  createDefaultSection as createSectionFromRegistry,
} from '../registry/section-registry';

export function createDefaultSection(
  type: SectionType,
): PageSection {
  return createSectionFromRegistry(
    type,
  );
}