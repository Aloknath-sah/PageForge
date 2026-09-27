import type { ComponentType } from 'react';

import HeroSection from '../components/sections/HeroSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import CtaSection from '../components/sections/CtaSection';

import type {
  CtaSection as CtaSectionModel,
  FeaturesSection as FeaturesSectionModel,
  HeroSection as HeroSectionModel,
  TestimonialsSection as TestimonialsSectionModel,
} from '../domain/page-schema';

export const sectionRegistry = {
  hero: HeroSection,
  features: FeaturesSection,
  testimonials: TestimonialsSection,
  cta: CtaSection,
} satisfies {
  hero: ComponentType<{ props: HeroSectionModel['props'] }>;
  features: ComponentType<{
    props: FeaturesSectionModel['props'];
  }>;
  testimonials: ComponentType<{
    props: TestimonialsSectionModel['props'];
  }>;
  cta: ComponentType<{ props: CtaSectionModel['props'] }>;
};
