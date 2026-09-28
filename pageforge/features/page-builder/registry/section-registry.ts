import type { ComponentType } from 'react';

import HeroSection from '../components/sections/HeroSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import FaqSection from '../components/sections/FaqSection';
import TeamSection from '../components/sections/TeamSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import CtaSection from '../components/sections/CtaSection';

import type {
  
  CtaSection as CtaSectionModel,
 
  FeaturesSection as FeaturesSectionModel,
 
  FaqSection as FaqSectionModel,
  
  HeroSection as HeroSectionModel,
  PageSection,
  SectionType,
  
  TeamSection as TeamSectionModel,
  
  TestimonialsSection as TestimonialsSectionModel,
} from '../domain/page-schema';

import {
  sectionPropertyDefinitions,
  type SectionPropertyDefinition,
} from '../domain/section-properties';

type SectionPropsFor<
  T extends SectionType,
> = Extract<
  PageSection,
  { type: T }
>['props'];

type SectionModelFor<
  T extends SectionType,
> = Extract<
  PageSection,
  { type: T }
>;

type SectionModule<
  T extends SectionType,
> = {
  type: T;

  component: ComponentType<{
    props: SectionPropsFor<T>;
  }>;

  propertyDefinition: SectionPropertyDefinition<
    SectionPropsFor<T>
  >;

  createDefault: () => SectionModelFor<T>;
};

type SectionModuleRegistry = {
  [K in SectionType]: SectionModule<K>;
};

export const sectionRegistry = {
  hero: {
    type: 'hero',

    component: HeroSection,

    propertyDefinition:
      sectionPropertyDefinitions.hero,

    createDefault:
      (): HeroSectionModel => ({
        id: crypto.randomUUID(),

        type: 'hero',

        enabled: true,

        props: {
          title:
            'Build something amazing',

          description:
            'Tell your visitors what makes your product different.',

          primaryCtaText:
            'Get Started',

          primaryCtaUrl: '#',
        },
      }),
  },

  features: {
    type: 'features',

    component: FeaturesSection,

    propertyDefinition:
      sectionPropertyDefinitions.features,

    createDefault:
      (): FeaturesSectionModel => ({
        id: crypto.randomUUID(),

        type: 'features',

        enabled: true,

        props: {
          title:
            'Everything you need',

          description:
            'Highlight the most important benefits of your product.',

          items: [
            {
              id: crypto.randomUUID(),

              title:
                'Feature One',

              description:
                'Describe the first benefit of your product.',
            },

            {
              id: crypto.randomUUID(),

              title:
                'Feature Two',

              description:
                'Describe the second benefit of your product.',
            },

            {
              id: crypto.randomUUID(),

              title:
                'Feature Three',

              description:
                'Describe the third benefit of your product.',
            },
          ],
        },
      }),
  },

  faq: {
    type: 'faq',

    component: FaqSection,

    propertyDefinition:
      sectionPropertyDefinitions.faq,

    createDefault:
      (): FaqSectionModel => ({
        id: crypto.randomUUID(),

        type: 'faq',

        enabled: true,

        props: {
          title:
            'Frequently asked questions',

          items: [
            {
              id: crypto.randomUUID(),

              question:
                'What is PageForge?',

              answer:
                'PageForge is a visual page builder for creating and editing landing pages.',
            },

            {
              id: crypto.randomUUID(),

              question:
                'Can I customize my page?',

              answer:
                'Yes. You can edit section content directly from the settings panel.',
            },
          ],
        },
      }),
  },

  team: {
    type: 'team',

    component: TeamSection,

    propertyDefinition:
      sectionPropertyDefinitions.team,

    createDefault:
      (): TeamSectionModel => ({
        id: crypto.randomUUID(),

        type: 'team',

        enabled: true,

        props: {
          title:
            'Meet the team',

          description:
            'Introduce the people building your product.',

          items: [
            {
              id: crypto.randomUUID(),

              name:
                'Alex Morgan',

              role:
                'Co-Founder',

              bio:
                'Builds the product and helps shape the company vision.',
            },

            {
              id: crypto.randomUUID(),

              name:
                'Jamie Lee',

              role:
                'Product Designer',

              bio:
                'Creates thoughtful experiences for every customer.',
            },

            {
              id: crypto.randomUUID(),

              name:
                'Taylor Smith',

              role:
                'Engineer',

              bio:
                'Turns product ideas into reliable software.',
            },
          ],
        },
      }),
  },

  testimonials: {
    type: 'testimonials',

    component:
      TestimonialsSection,

    propertyDefinition:
      sectionPropertyDefinitions.testimonials,

    createDefault:
      (): TestimonialsSectionModel => ({
        id: crypto.randomUUID(),

        type: 'testimonials',

        enabled: true,

        props: {
          title:
            'What our customers say',

          items: [
            {
              id: crypto.randomUUID(),

              name:
                'John Doe',

              role:
                'Founder',

              quote:
                'This product made our workflow dramatically simpler.',
            },
          ],
        },
      }),
  },

  cta: {
    type: 'cta',

    component: CtaSection,

    propertyDefinition:
      sectionPropertyDefinitions.cta,

    createDefault:
      (): CtaSectionModel => ({
        id: crypto.randomUUID(),

        type: 'cta',

        enabled: true,

        props: {
          title:
            'Ready to get started?',

          description:
            'Create your first landing page today.',

          buttonText:
            'Get Started',

          buttonUrl: '#',
        },
      }),
  },
} satisfies SectionModuleRegistry;

export function getSectionModule(
  type: SectionType,
) {
  return sectionRegistry[type];
}

export function getSectionLabel(
  type: SectionType,
) {
  return sectionRegistry[
    type
  ].propertyDefinition.label;
}

export function getSectionComponent(
  type: SectionType,
) {
  return sectionRegistry[
    type
  ].component;
}

export function getSectionPropertyDefinition(
  type: SectionType,
) {
  return sectionRegistry[
    type
  ].propertyDefinition;
}

export function createDefaultSection(
  type: SectionType,
): PageSection {
  return sectionRegistry[
    type
  ].createDefault();
}