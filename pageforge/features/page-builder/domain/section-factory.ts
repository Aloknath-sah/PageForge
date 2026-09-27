import type { PageSection, SectionType } from './page-schema';

export function createDefaultSection(type: SectionType): PageSection {
  const id = crypto.randomUUID();

  switch (type) {
    case 'hero':
      return {
        id,
        type: 'hero',
        enabled: true,
        props: {
          title: 'Build something amazing',
          description: 'Tell your visitors what makes your product different.',
          primaryCtaText: 'Get Started',
          primaryCtaUrl: '#',
        },
      };

    case 'features':
      return {
        id,
        type: 'features',
        enabled: true,
        props: {
          title: 'Everything you need',
          description: 'Highlight the most important benefits of your product.',
          items: [
            {
              id: crypto.randomUUID(),
              title: 'Feature One',
              description: 'Describe the first benefit of your product.',
            },
            {
              id: crypto.randomUUID(),
              title: 'Feature Two',
              description: 'Describe the second benefit of your product.',
            },
            {
              id: crypto.randomUUID(),
              title: 'Feature Three',
              description: 'Describe the third benefit of your product.',
            },
          ],
        },
      };

    case 'testimonials':
      return {
        id,
        type: 'testimonials',
        enabled: true,
        props: {
          title: 'What our customers say',
          items: [
            {
              id: crypto.randomUUID(),
              name: 'John Doe',
              role: 'Founder',
              quote: 'This product made our workflow dramatically simpler.',
            },
          ],
        },
      };

    case 'cta':
      return {
        id,
        type: 'cta',
        enabled: true,
        props: {
          title: 'Ready to get started?',
          description: 'Create your first landing page today.',
          buttonText: 'Get Started',
          buttonUrl: '#',
        },
      };
  }
}
