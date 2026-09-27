import type {
  CtaProps,
  FaqProps,
  FeaturesProps,
  HeroProps,
  TestimonialsProps,
} from './page-schema';

export type StringKeys<T> = {
  [K in keyof T]-?: T[K] extends
    | string
    | undefined
    ? K
    : never;
}[keyof T];

type ArrayKeys<T> = {
  [K in keyof T]-?: T[K] extends
    readonly unknown[]
    ? K
    : never;
}[keyof T];

type ArrayItem<
  T,
  K extends keyof T,
> = T[K] extends readonly (
  infer U
)[]
  ? U
  : never;

export type ScalarPropertyType =
  | 'text'
  | 'textarea'
  | 'url';

export type CollectionItemField<TItem> = {
  key: StringKeys<TItem>;
  label: string;
  type: Exclude<
    ScalarPropertyType,
    never
  >;
  placeholder?: string;
  required?: boolean;
};

export type ScalarPropertyField<TProps> =
  {
    key: StringKeys<TProps>;
    label: string;
    type: ScalarPropertyType;
    placeholder?: string;
    description?: string;
  };

export type CollectionPropertyField<TProps> =
  {
    key: ArrayKeys<TProps>;
    label: string;
    type: 'collection';
    itemLabel: string;

    summaryField?: StringKeys<
      ArrayItem<
        TProps,
        ArrayKeys<TProps>
      >
    >;

    minItems?: number;

    maxItems?: number;

    fields: CollectionItemField<
      ArrayItem<
        TProps,
        ArrayKeys<TProps>
      >
    >[];

    createItem: () => ArrayItem<
      TProps,
      ArrayKeys<TProps>
    >;
  };

export type PropertyField<TProps> =
  | ScalarPropertyField<TProps>
  | CollectionPropertyField<TProps>;

export type SectionPropertyDefinition<TProps> =
  {
    label: string;

    description?: string;

    fields: PropertyField<TProps>[];
  };

type SectionPropertyDefinitionMap = {
  hero: SectionPropertyDefinition<HeroProps>;

  features: SectionPropertyDefinition<FeaturesProps>;

  faq: SectionPropertyDefinition<FaqProps>;

  testimonials: SectionPropertyDefinition<TestimonialsProps>;

  cta: SectionPropertyDefinition<CtaProps>;
};

export const sectionPropertyDefinitions = {
  hero: {
    label: 'Hero',

    description:
      'Introduce your product and primary call to action.',

    fields: [
      {
        key: 'title',
        label: 'Title',
        type: 'text',
        placeholder:
          'Build something amazing',
      },

      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder:
          'Explain what your product does.',
      },

      {
        key: 'primaryCtaText',
        label: 'CTA Text',
        type: 'text',
        placeholder:
          'Get Started',
      },

      {
        key: 'primaryCtaUrl',
        label: 'CTA URL',
        type: 'url',
        placeholder:
          'https://example.com',
      },
    ],
  },

  features: {
    label: 'Features',

    description:
      'Highlight the benefits of your product.',

    fields: [
      {
        key: 'title',
        label: 'Title',
        type: 'text',
        placeholder:
          'Everything you need',
      },

      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder:
          'Describe the feature set.',
      },

      {
        key: 'items',
        label: 'Features',
        type: 'collection',

        itemLabel: 'Feature',

        summaryField: 'title',

        minItems: 1,

        maxItems: 6,

        createItem: () => ({
          id: crypto.randomUUID(),
          title: 'New Feature',
          description:
            'Describe this feature.',
          icon: '',
        }),

        fields: [
          {
            key: 'title',
            label: 'Title',
            type: 'text',
            placeholder:
              'Feature title',
            required: true,
          },

          {
            key: 'description',
            label: 'Description',
            type: 'textarea',
            placeholder:
              'Feature description',
            required: true,
          },

          {
            key: 'icon',
            label: 'Icon',
            type: 'text',
            placeholder:
              'Optional icon',
          },
        ],
      },
    ],
  },

  faq: {
    label: 'FAQ',

    description:
      'Answer common questions about your product.',

    fields: [
      {
        key: 'title',
        label: 'Title',
        type: 'text',
        placeholder:
          'Frequently asked questions',
      },

      {
        key: 'items',
        label: 'Questions',
        type: 'collection',

        itemLabel: 'Question',

        summaryField: 'question',

        minItems: 1,

        maxItems: 10,

        createItem: () => ({
          id: crypto.randomUUID(),
          question:
            'New question',
          answer:
            'Provide an answer.',
        }),

        fields: [
          {
            key: 'question',
            label: 'Question',
            type: 'text',
            placeholder:
              'What would you like to know?',
            required: true,
          },

          {
            key: 'answer',
            label: 'Answer',
            type: 'textarea',
            placeholder:
              'Provide a helpful answer.',
            required: true,
          },
        ],
      },
    ],
  },

  testimonials: {
    label: 'Testimonials',

    description:
      'Show customer feedback and social proof.',

    fields: [
      {
        key: 'title',
        label: 'Title',
        type: 'text',
        placeholder:
          'What our customers say',
      },

      {
        key: 'items',
        label: 'Testimonials',
        type: 'collection',

        itemLabel: 'Testimonial',

        summaryField: 'name',

        minItems: 1,

        maxItems: 6,

        createItem: () => ({
          id: crypto.randomUUID(),
          name: 'New Customer',
          role: 'Role',
          quote:
            'Customer feedback goes here.',
          avatarUrl: '',
        }),

        fields: [
          {
            key: 'name',
            label: 'Name',
            type: 'text',
            placeholder:
              'Customer name',
            required: true,
          },

          {
            key: 'role',
            label: 'Role',
            type: 'text',
            placeholder:
              'Customer role',
          },

          {
            key: 'quote',
            label: 'Quote',
            type: 'textarea',
            placeholder:
              'Customer feedback',
            required: true,
          },
        ],
      },
    ],
  },

  cta: {
    label: 'CTA',

    description:
      'Finish the page with a strong call to action.',

    fields: [
      {
        key: 'title',
        label: 'Title',
        type: 'text',
        placeholder:
          'Ready to get started?',
      },

      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder:
          'Tell visitors what to do next.',
      },

      {
        key: 'buttonText',
        label: 'Button Text',
        type: 'text',
        placeholder:
          'Get Started',
      },

      {
        key: 'buttonUrl',
        label: 'Button URL',
        type: 'url',
        placeholder:
          'https://example.com',
      },
    ],
  },
} satisfies SectionPropertyDefinitionMap;

export function getSectionPropertyDefinition(
  type: keyof SectionPropertyDefinitionMap,
) {
  return sectionPropertyDefinitions[type];
}