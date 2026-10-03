import type {
  CtaProps,
  FaqProps,
  FeatureItem,
  FeaturesProps,
  HeroProps,
  PageConfig,
  PageSection,
  TeamProps,
  TestimonialItem,
  TestimonialsProps,
} from './page-schema';

export const CURRENT_PAGE_SCHEMA_VERSION = 1;

export type PageConfigValidationError = {
  path: string;
  message: string;
};

export type PageConfigValidationResult =
  | {
      success: true;
      data: PageConfig;
      errors: [];
    }
  | {
      success: false;
      data: null;
      errors: PageConfigValidationError[];
    };

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isString(
  value: unknown,
): value is string {
  return typeof value === 'string';
}

function isOptionalString(
  value: unknown,
): boolean {
  return value === undefined || isString(value);
}

function addError(
  errors: PageConfigValidationError[],
  path: string,
  message: string,
) {
  errors.push({
    path,
    message,
  });
}

function validateFeatureItem(
  value: unknown,
  path: string,
  errors: PageConfigValidationError[],
): value is FeatureItem {
  if (!isRecord(value)) {
    addError(errors, path, 'Expected a feature item object.');
    return false;
  }

  let valid = true;

  if (!isString(value.id)) {
    addError(errors, `${path}.id`, 'Expected a string id.');
    valid = false;
  }

  if (!isString(value.title)) {
    addError(errors, `${path}.title`, 'Expected a string title.');
    valid = false;
  }

  if (!isString(value.description)) {
    addError(
      errors,
      `${path}.description`,
      'Expected a string description.',
    );
    valid = false;
  }

  if (!isOptionalString(value.icon)) {
    addError(errors, `${path}.icon`, 'Expected a string when provided.');
    valid = false;
  }

  return valid;
}

function validateTestimonialItem(
  value: unknown,
  path: string,
  errors: PageConfigValidationError[],
): value is TestimonialItem {
  if (!isRecord(value)) {
    addError(
      errors,
      path,
      'Expected a testimonial item object.',
    );
    return false;
  }

  let valid = true;

  if (!isString(value.id)) {
    addError(errors, `${path}.id`, 'Expected a string id.');
    valid = false;
  }

  if (!isString(value.name)) {
    addError(errors, `${path}.name`, 'Expected a string name.');
    valid = false;
  }

  if (!isOptionalString(value.role)) {
    addError(errors, `${path}.role`, 'Expected a string when provided.');
    valid = false;
  }

  if (!isString(value.quote)) {
    addError(errors, `${path}.quote`, 'Expected a string quote.');
    valid = false;
  }

  if (!isOptionalString(value.avatarUrl)) {
    addError(
      errors,
      `${path}.avatarUrl`,
      'Expected a string when provided.',
    );
    valid = false;
  }

  return valid;
}

function validateCollection(
  value: unknown,
  path: string,
  validateItem: (
    item: unknown,
    itemPath: string,
    errors: PageConfigValidationError[],
  ) => boolean,
  errors: PageConfigValidationError[],
): boolean {
  if (!Array.isArray(value)) {
    addError(errors, path, 'Expected an array.');
    return false;
  }

  let valid = true;

  value.forEach((item, index) => {
    if (
      !validateItem(
        item,
        `${path}[${index}]`,
        errors,
      )
    ) {
      valid = false;
    }
  });

  return valid;
}

function validateHeroProps(
  value: unknown,
  path: string,
  errors: PageConfigValidationError[],
): value is HeroProps {
  if (!isRecord(value)) {
    addError(errors, path, 'Expected hero props object.');
    return false;
  }

  let valid = true;

  for (const key of [
    'title',
    'description',
    'primaryCtaText',
    'primaryCtaUrl',
  ]) {
    if (!isString(value[key])) {
      addError(
        errors,
        `${path}.${key}`,
        'Expected a string.',
      );
      valid = false;
    }
  }

  if (!isOptionalString(value.imageUrl)) {
    addError(
      errors,
      `${path}.imageUrl`,
      'Expected a string when provided.',
    );
    valid = false;
  }

  return valid;
}

function validateFeaturesProps(
  value: unknown,
  path: string,
  errors: PageConfigValidationError[],
): value is FeaturesProps {
  if (!isRecord(value)) {
    addError(errors, path, 'Expected features props object.');
    return false;
  }

  let valid = true;

  if (!isString(value.title)) {
    addError(errors, `${path}.title`, 'Expected a string title.');
    valid = false;
  }

  if (!isOptionalString(value.description)) {
    addError(
      errors,
      `${path}.description`,
      'Expected a string when provided.',
    );
    valid = false;
  }

  if (
    !validateCollection(
      value.items,
      `${path}.items`,
      validateFeatureItem,
      errors,
    )
  ) {
    valid = false;
  }

  return valid;
}

function validateFaqProps(
  value: unknown,
  path: string,
  errors: PageConfigValidationError[],
): value is FaqProps {
  if (!isRecord(value)) {
    addError(errors, path, 'Expected FAQ props object.');
    return false;
  }

  let valid = true;

  if (!isString(value.title)) {
    addError(errors, `${path}.title`, 'Expected a string title.');
    valid = false;
  }

  if (!Array.isArray(value.items)) {
    addError(errors, `${path}.items`, 'Expected an array.');
    return false;
  }

  value.items.forEach((item, index) => {
    const itemPath = `${path}.items[${index}]`;

    if (!isRecord(item)) {
      addError(
        errors,
        itemPath,
        'Expected an FAQ item object.',
      );
      valid = false;
      return;
    }

    if (!isString(item.id)) {
      addError(errors, `${itemPath}.id`, 'Expected a string id.');
      valid = false;
    }

    if (!isString(item.question)) {
      addError(
        errors,
        `${itemPath}.question`,
        'Expected a string question.',
      );
      valid = false;
    }

    if (!isString(item.answer)) {
      addError(
        errors,
        `${itemPath}.answer`,
        'Expected a string answer.',
      );
      valid = false;
    }
  });

  return valid;
}

function validateTeamProps(
  value: unknown,
  path: string,
  errors: PageConfigValidationError[],
): value is TeamProps {
  if (!isRecord(value)) {
    addError(errors, path, 'Expected team props object.');
    return false;
  }

  let valid = true;

  if (!isString(value.title)) {
    addError(errors, `${path}.title`, 'Expected a string title.');
    valid = false;
  }

  if (!isOptionalString(value.description)) {
    addError(
      errors,
      `${path}.description`,
      'Expected a string when provided.',
    );
    valid = false;
  }

  if (!Array.isArray(value.items)) {
    addError(errors, `${path}.items`, 'Expected an array.');
    return false;
  }

  value.items.forEach((item, index) => {
    const itemPath = `${path}.items[${index}]`;

    if (!isRecord(item)) {
      addError(
        errors,
        itemPath,
        'Expected a team member item object.',
      );
      valid = false;
      return;
    }

    if (!isString(item.id)) {
      addError(errors, `${itemPath}.id`, 'Expected a string id.');
      valid = false;
    }

    for (const key of ['name', 'role', 'bio']) {
      if (!isString(item[key])) {
        addError(
          errors,
          `${itemPath}.${key}`,
          'Expected a string.',
        );
        valid = false;
      }
    }

    if (!isOptionalString(item.avatarUrl)) {
      addError(
        errors,
        `${itemPath}.avatarUrl`,
        'Expected a string when provided.',
      );
      valid = false;
    }
  });

  return valid;
}

function validateTestimonialsProps(
  value: unknown,
  path: string,
  errors: PageConfigValidationError[],
): value is TestimonialsProps {
  if (!isRecord(value)) {
    addError(
      errors,
      path,
      'Expected testimonials props object.',
    );
    return false;
  }

  let valid = true;

  if (!isString(value.title)) {
    addError(errors, `${path}.title`, 'Expected a string title.');
    valid = false;
  }

  if (
    !validateCollection(
      value.items,
      `${path}.items`,
      validateTestimonialItem,
      errors,
    )
  ) {
    valid = false;
  }

  return valid;
}

function validateCtaProps(
  value: unknown,
  path: string,
  errors: PageConfigValidationError[],
): value is CtaProps {
  if (!isRecord(value)) {
    addError(errors, path, 'Expected CTA props object.');
    return false;
  }

  let valid = true;

  for (const key of [
    'title',
    'buttonText',
    'buttonUrl',
  ]) {
    if (!isString(value[key])) {
      addError(
        errors,
        `${path}.${key}`,
        'Expected a string.',
      );
      valid = false;
    }
  }

  if (!isOptionalString(value.description)) {
    addError(
      errors,
      `${path}.description`,
      'Expected a string when provided.',
    );
    valid = false;
  }

  return valid;
}

function validateSection(
  value: unknown,
  path: string,
  errors: PageConfigValidationError[],
): value is PageSection {
  if (!isRecord(value)) {
    addError(errors, path, 'Expected a section object.');
    return false;
  }

  let valid = true;

  if (!isString(value.id)) {
    addError(errors, `${path}.id`, 'Expected a string id.');
    valid = false;
  }

  if (typeof value.enabled !== 'boolean') {
    addError(
      errors,
      `${path}.enabled`,
      'Expected a boolean enabled value.',
    );
    valid = false;
  }

  if (!isString(value.type)) {
    addError(
      errors,
      `${path}.type`,
      'Expected a string section type.',
    );
    return false;
  }

  const propsPath = `${path}.props`;

  switch (value.type) {
    case 'hero':
      if (!validateHeroProps(value.props, propsPath, errors)) {
        valid = false;
      }
      break;

    case 'features':
      if (!validateFeaturesProps(value.props, propsPath, errors)) {
        valid = false;
      }
      break;

    case 'faq':
      if (!validateFaqProps(value.props, propsPath, errors)) {
        valid = false;
      }
      break;

    case 'team':
      if (!validateTeamProps(value.props, propsPath, errors)) {
        valid = false;
      }
      break;

    case 'testimonials':
      if (
        !validateTestimonialsProps(
          value.props,
          propsPath,
          errors,
        )
      ) {
        valid = false;
      }
      break;

    case 'cta':
      if (!validateCtaProps(value.props, propsPath, errors)) {
        valid = false;
      }
      break;

    default:
      addError(
        errors,
        `${path}.type`,
        `Unsupported section type "${value.type}".`,
      );
      valid = false;
  }

  return valid;
}

export function validatePageConfig(
  value: unknown,
): PageConfigValidationResult {
  const errors: PageConfigValidationError[] = [];

  if (!isRecord(value)) {
    return {
      success: false,
      data: null,
      errors: [
        {
          path: '',
          message: 'Expected a page configuration object.',
        },
      ],
    };
  }

  if (
    typeof value.schemaVersion !== 'number' ||
    !Number.isInteger(value.schemaVersion) ||
    value.schemaVersion < 1
  ) {
    addError(
      errors,
      'schemaVersion',
      'Expected a positive integer schema version.',
    );
  }

  if (
    typeof value.schemaVersion === 'number' &&
    value.schemaVersion !== CURRENT_PAGE_SCHEMA_VERSION
  ) {
    addError(
      errors,
      'schemaVersion',
      `Unsupported schema version ${value.schemaVersion}.`,
    );
  }

  if (!isRecord(value.seo)) {
    addError(errors, 'seo', 'Expected an SEO object.');
  } else {
    if (!isString(value.seo.title)) {
      addError(errors, 'seo.title', 'Expected a string title.');
    }

    if (!isString(value.seo.description)) {
      addError(
        errors,
        'seo.description',
        'Expected a string description.',
      );
    }

    if (!isOptionalString(value.seo.ogImageUrl)) {
      addError(
        errors,
        'seo.ogImageUrl',
        'Expected a string when provided.',
      );
    }
  }

  if (!isRecord(value.theme)) {
    addError(errors, 'theme', 'Expected a theme object.');
  } else {
    for (const key of [
      'primaryColor',
      'backgroundColor',
      'textColor',
      'fontFamily',
    ]) {
      if (!isString(value.theme[key])) {
        addError(
          errors,
          `theme.${key}`,
          'Expected a string.',
        );
      }
    }

    if (
      value.theme.borderRadius !== 'none' &&
      value.theme.borderRadius !== 'small' &&
      value.theme.borderRadius !== 'medium' &&
      value.theme.borderRadius !== 'large'
    ) {
      addError(
        errors,
        'theme.borderRadius',
        'Expected one of none, small, medium, or large.',
      );
    }
  }

  if (!Array.isArray(value.sections)) {
    addError(errors, 'sections', 'Expected an array.');
  } else {
    value.sections.forEach((section, index) => {
      validateSection(
        section,
        `sections[${index}]`,
        errors,
      );
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      data: null,
      errors,
    };
  }

  return {
    success: true,
    data: value as unknown as PageConfig,
    errors: [],
  };
}

export function isPageConfig(
  value: unknown,
): value is PageConfig {
  return validatePageConfig(value).success;
}
