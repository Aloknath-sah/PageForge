import type { PageConfig } from './page-schema';

import { sectionPropertyDefinitions } from './section-properties';

type ValidationScalarField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url';
  required?: boolean;
};

type ValidationCollectionField = {
  key: string;
  label: string;
  type: 'collection';
  itemLabel?: string;
  fields: ValidationScalarField[];
  minItems?: number;
  maxItems?: number;
};

type ValidationPropertyField =
  | ValidationScalarField
  | ValidationCollectionField;

type ValidationSectionDefinition = {
  fields: ValidationPropertyField[];
};

export type PageValidationErrorCode =
  | 'no_enabled_sections'
  | 'missing_section_definition'
  | 'required_field'
  | 'invalid_collection'
  | 'collection_min_items'
  | 'collection_max_items'
  | 'invalid_collection_item';

export type PageValidationError = {
  code: PageValidationErrorCode;

  path: string;

  message: string;

  sectionId?: string;

  collectionKey?: string;

  itemId?: string;

  fieldKey?: string;
};

export type PageValidationResult = {
  valid: boolean;

  errors: PageValidationError[];

  errorsBySection: Record<string, PageValidationError[]>;
};

function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function addError(
  errors: PageValidationError[],
  error: PageValidationError,
): void {
  errors.push(error);
}

function buildSectionPath(sectionId: string): string {
  return `sections.${sectionId}`;
}

function buildFieldPath(
  sectionId: string,
  fieldKey: string,
): string {
  return `${buildSectionPath(sectionId)}.props.${fieldKey}`;
}

function buildCollectionItemFieldPath(
  sectionId: string,
  collectionKey: string,
  itemId: string,
  fieldKey: string,
): string {
  return `${buildSectionPath(
    sectionId,
  )}.props.${collectionKey}.${itemId}.${fieldKey}`;
}

function validateScalarField(
  sectionId: string,
  props: Record<string, unknown>,
  field: ValidationScalarField,
  errors: PageValidationError[],
): void {
  if (!field.required) {
    return;
  }

  const value = props[field.key];

  if (isNonEmptyString(value)) {
    return;
  }

  addError(errors, {
    code: 'required_field',

    path: buildFieldPath(sectionId, field.key),

    message: `${field.label} is required.`,

    sectionId,

    fieldKey: field.key,
  });
}

function validateCollectionField(
  sectionId: string,
  props: Record<string, unknown>,
  field: ValidationCollectionField,
  errors: PageValidationError[],
): void {
  const value = props[field.key];

  if (!Array.isArray(value)) {
    addError(errors, {
      code: 'invalid_collection',

      path: buildFieldPath(sectionId, field.key),

      message: `${field.label} must be a collection.`,

      sectionId,

      collectionKey: field.key,
    });

    return;
  }

  if (
    typeof field.minItems === 'number' &&
    value.length < field.minItems
  ) {
    addError(errors, {
      code: 'collection_min_items',

      path: buildFieldPath(sectionId, field.key),

      message: `${field.label} must contain at least ${field.minItems} item${
        field.minItems === 1 ? '' : 's'
      }.`,

      sectionId,

      collectionKey: field.key,
    });
  }

  if (
    typeof field.maxItems === 'number' &&
    value.length > field.maxItems
  ) {
    addError(errors, {
      code: 'collection_max_items',

      path: buildFieldPath(sectionId, field.key),

      message: `${field.label} cannot contain more than ${field.maxItems} item${
        field.maxItems === 1 ? '' : 's'
      }.`,

      sectionId,

      collectionKey: field.key,
    });
  }

  value.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      addError(errors, {
        code: 'invalid_collection_item',

        path: `${buildFieldPath(
          sectionId,
          field.key,
        )}.${index}`,

        message: `${field.itemLabel ?? field.label} item ${
          index + 1
        } is invalid.`,

        sectionId,

        collectionKey: field.key,
      });

      return;
    }

    const itemRecord = item as Record<string, unknown>;

    const rawItemId = itemRecord.id;

    const itemId =
      typeof rawItemId === 'string' && rawItemId.length > 0
        ? rawItemId
        : String(index);

    for (const itemField of field.fields) {
      if (!itemField.required) {
        continue;
      }

      const itemValue = itemRecord[itemField.key];

      if (isNonEmptyString(itemValue)) {
        continue;
      }

      addError(errors, {
        code: 'required_field',

        path: buildCollectionItemFieldPath(
          sectionId,
          field.key,
          itemId,
          itemField.key,
        ),

        message: `${itemField.label} is required.`,

        sectionId,

        collectionKey: field.key,

        itemId,

        fieldKey: itemField.key,
      });
    }
  });
}

function validateSection(
  section: PageConfig['sections'][number],
  errors: PageValidationError[],
): void {
  const rawDefinition =
    sectionPropertyDefinitions[
      section.type as keyof typeof sectionPropertyDefinitions
    ];

  if (!rawDefinition) {
    addError(errors, {
      code: 'missing_section_definition',

      path: buildSectionPath(section.id),

      message: `No property definition exists for section type "${section.type}".`,

      sectionId: section.id,
    });

    return;
  }

  const definition =
    rawDefinition as unknown as ValidationSectionDefinition;

  const props =
    section.props as unknown as Record<string, unknown>;

  for (const field of definition.fields) {
    if (field.type === 'collection') {
      validateCollectionField(
        section.id,
        props,
        field,
        errors,
      );

      continue;
    }

    validateScalarField(
      section.id,
      props,
      field,
      errors,
    );
  }
}

export function validatePageConfig(
  config: PageConfig,
): PageValidationResult {
  const errors: PageValidationError[] = [];

  const enabledSections = config.sections.filter(
    (section) => section.enabled,
  );

  if (enabledSections.length === 0) {
    addError(errors, {
      code: 'no_enabled_sections',

      path: 'sections',

      message: 'The page must contain at least one enabled section.',
    });
  }

  for (const section of enabledSections) {
    validateSection(section, errors);
  }

  const errorsBySection: Record<
    string,
    PageValidationError[]
  > = {};

  for (const error of errors) {
    if (!error.sectionId) {
      continue;
    }

    const sectionErrors =
      errorsBySection[error.sectionId] ?? [];

    sectionErrors.push(error);

    errorsBySection[error.sectionId] = sectionErrors;
  }

  return {
    valid: errors.length === 0,

    errors,

    errorsBySection,
  };
}

export function isPageConfigPublishable(
  config: PageConfig,
): boolean {
  return validatePageConfig(config).valid;
}