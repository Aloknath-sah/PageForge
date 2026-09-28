import type { ComponentType } from 'react';

import HeroSection from '../components/sections/HeroSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import FaqSection from '../components/sections/FaqSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import CtaSection from '../components/sections/CtaSection';

import type {
  CtaProps,
  FeaturesProps,
  FaqProps,
  HeroProps,
  SectionType,
  TestimonialsProps,
} from '../domain/page-schema';

type SectionComponentProps =
  | {
      type: 'hero';
      props: HeroProps;
    }
  | {
      type: 'features';
      props: FeaturesProps;
    }
  | {
      type: 'faq';
      props: FaqProps;
    }
  | {
      type: 'testimonials';
      props: TestimonialsProps;
    }
  | {
      type: 'cta';
      props: CtaProps;
    };

type SectionRegistryEntry =
  | {
      type: 'hero';
      label: string;
      component: ComponentType<{
        props: HeroProps;
      }>;
    }
  | {
      type: 'features';
      label: string;
      component: ComponentType<{
        props: FeaturesProps;
      }>;
    }
  | {
      type: 'faq';
      label: string;
      component: ComponentType<{
        props: FaqProps;
      }>;
    }
  | {
      type: 'testimonials';
      label: string;
      component: ComponentType<{
        props: TestimonialsProps;
      }>;
    }
  | {
      type: 'cta';
      label: string;
      component: ComponentType<{
        props: CtaProps;
      }>;
    };

type SectionRegistry = {
  [K in SectionType]: Extract<
    SectionRegistryEntry,
    { type: K }
  >;
};

export const sectionRegistry = {
  hero: {
    type: 'hero',
    label: 'Hero',
    component: HeroSection,
  },

  features: {
    type: 'features',
    label: 'Features',
    component: FeaturesSection,
  },

  faq: {
    type: 'faq',
    label: 'FAQ',
    component: FaqSection,
  },

  testimonials: {
    type: 'testimonials',
    label: 'Testimonials',
    component: TestimonialsSection,
  },

  cta: {
    type: 'cta',
    label: 'CTA',
    component: CtaSection,
  },
} satisfies SectionRegistry;

export function getSectionDefinition(
  type: SectionType,
) {
  return sectionRegistry[type];
}

export function getSectionLabel(
  type: SectionType,
) {
  return sectionRegistry[type].label;
}

export function getSectionComponent(
  type: SectionType,
) {
  return sectionRegistry[type]
    .component;
}