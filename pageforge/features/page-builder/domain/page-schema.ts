export const SECTION_TYPES = [
  "hero",
  "features",
  "testimonials",
  "cta",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export type HeroProps = {
  title: string;
  description: string;
  primaryCtaText: string;
  primaryCtaUrl: string;
  imageUrl?: string;
};

export type FeaturesProps = {
  title: string;
  description?: string;
  items: Array<{
    id: string;
    title: string;
    description: string;
    icon?: string;
  }>;
};

export type TestimonialsProps = {
  title: string;
  items: Array<{
    id: string;
    name: string;
    role?: string;
    quote: string;
    avatarUrl?: string;
  }>;
};

export type CtaProps = {
  title: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
};

type BaseSection<TType extends SectionType, TProps> = {
  id: string;
  type: TType;
  enabled: boolean;
  props: TProps;
};

export type HeroSection = BaseSection<"hero", HeroProps>;

export type FeaturesSection = BaseSection<
  "features",
  FeaturesProps
>;

export type TestimonialsSection = BaseSection<
  "testimonials",
  TestimonialsProps
>;

export type CtaSection = BaseSection<"cta", CtaProps>;

export type PageSection =
  | HeroSection
  | FeaturesSection
  | TestimonialsSection
  | CtaSection;

export type PageTheme = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: "none" | "small" | "medium" | "large";
};

export type PageSeo = {
  title: string;
  description: string;
  ogImageUrl?: string;
};

export type PageConfig = {
  schemaVersion: number;

  seo: PageSeo;

  theme: PageTheme;

  sections: PageSection[];
};