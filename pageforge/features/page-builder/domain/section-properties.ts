import type {
  CtaProps,
  FeaturesProps,
  HeroProps,
  TestimonialsProps,
  SectionType,
} from "./page-schema";

type StringKeys<T> = {
  [K in keyof T]-?: T[K] extends
    | string
    | undefined
    ? K
    : never;
}[keyof T];

export type PropertyFieldType =
  | "text"
  | "textarea"
  | "url";

type PropertyField<TProps> = {
  key: StringKeys<TProps>;
  label: string;
  type: PropertyFieldType;
  placeholder?: string;
  description?: string;
};

export type SectionPropertyDefinition<
  TProps,
> = {
  label: string;
  description?: string;
  fields: PropertyField<TProps>[];
  
};

type SectionPropertyDefinitionMap = {
  hero: SectionPropertyDefinition<HeroProps>;
  features: SectionPropertyDefinition<FeaturesProps>;
  testimonials: SectionPropertyDefinition<TestimonialsProps>;
  cta: SectionPropertyDefinition<CtaProps>;
};

export const sectionPropertyDefinitions =
  {
    hero: {
      label: "Hero",
      description:
        "Introduce your product and primary call to action.",
      fields: [
        {
          key: "title",
          label: "Title",
          type: "text",
          placeholder:
            "Build something amazing",
        },
        {
          key: "description",
          label: "Description",
          type: "textarea",
          placeholder:
            "Explain what your product does.",
        },
        {
          key: "primaryCtaText",
          label: "CTA Text",
          type: "text",
          placeholder: "Get Started",
        },
        {
          key: "primaryCtaUrl",
          label: "CTA URL",
          type: "url",
          placeholder: "https://example.com",
        },
       
{
  key: "subtitle",
  label: "Subtitle",
  type: "text",
  placeholder: "Trusted by modern teams",
}
      ],
    },

    features: {
      label: "Features",
      description:
        "Highlight the benefits of your product.",
      fields: [
        {
          key: "title",
          label: "Title",
          type: "text",
          placeholder:
            "Everything you need",
        },
        {
          key: "description",
          label: "Description",
          type: "textarea",
          placeholder:
            "Describe the feature set.",
        },
      ],
    },

    testimonials: {
      label: "Testimonials",
      description:
        "Show customer feedback and social proof.",
      fields: [
        {
          key: "title",
          label: "Title",
          type: "text",
          placeholder:
            "What our customers say",
        },
      ],
    },

    cta: {
      label: "CTA",
      description:
        "Finish the page with a strong call to action.",
      fields: [
        {
          key: "title",
          label: "Title",
          type: "text",
          placeholder:
            "Ready to get started?",
        },
        {
          key: "description",
          label: "Description",
          type: "textarea",
          placeholder:
            "Tell visitors what to do next.",
        },
        {
          key: "buttonText",
          label: "Button Text",
          type: "text",
          placeholder: "Get Started",
        },
        {
          key: "buttonUrl",
          label: "Button URL",
          type: "url",
          placeholder: "https://example.com",
        },
      ],
    },
  } satisfies SectionPropertyDefinitionMap;

export function getSectionPropertyDefinition(
  type: SectionType,
) {
  return sectionPropertyDefinitions[type];
}