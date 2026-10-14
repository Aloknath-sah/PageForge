import type { PageConfig } from './page-schema';

import {
  CURRENT_SCHEMA_VERSION,
} from './page-migrations';

export const samplePage: PageConfig = {
  schemaVersion:
    CURRENT_SCHEMA_VERSION,

  seo: {
    title:
      'PageForge — Build Beautiful Landing Pages',

    description:
      'Design, customize, and publish beautiful landing pages without writing frontend code.',
  },

  theme: {
    primaryColor: '#2563eb',

    backgroundColor: '#ffffff',

    textColor: '#111827',

    fontFamily: 'Inter',

    borderRadius: 'medium',
  },

  sections: [
    {
      id: 'hero-1',

      type: 'hero',

      enabled: true,

      props: {
        title:
          'Create stunning landing pages faster',

        description:
          'Design, customize, and publish beautiful pages in minutes with PageForge.',

        primaryCtaText:
          'Get Started Free',

        primaryCtaUrl:
          '/auth/sign-up',

        imageUrl:
          '/images/pageforge-hero.png',
      },
    },

    {
      id: 'features-1',

      type: 'features',

      enabled: true,

      props: {
        title:
          'Everything you need to launch',

        description:
          'A simple toolkit for building, polishing, and publishing your next landing page.',

        items: [
          {
            id: 'feature-1',

            title:
              'Automate',

            description:
              'Build a polished page with reusable sections and editable content.',
          },

          {
            id: 'feature-2',

            title:
              'Collaborate',

            description:
              'Keep your pages organized in one personal dashboard.',
          },

          {
            id: 'feature-3',

            title:
              'Measure',

            description:
              'Preview changes and publish when your page is ready.',
          },
        ],
      },
    },

    {
      id: 'faq-1',

      type: 'faq',

      enabled: true,

      props: {
        title:
          'Frequently asked questions',

        items: [
          {
            id: 'faq-item-1',

            question:
              'What is PageForge?',

            answer:
              'PageForge is a visual page builder for creating and editing landing pages.',
          },

          {
            id: 'faq-item-2',

            question:
              'Can I customize my page?',

            answer:
              'Yes. You can edit section content directly from the settings panel.',
          },

          {
            id: 'faq-item-3',

            question:
              'Can I reorder sections?',

            answer:
              'Yes. Sections can be reordered directly from the section list.',
          },
        ],
      },
    },

    {
      id: 'team-1',

      type: 'team',

      enabled: true,

      props: {
        title:
          'Meet the team',

        description:
          'A sample team section you can personalize for your own brand.',

        items: [
          {
            id: 'team-member-1',

            name:
              'Alex Morgan',

            role:
              'Co-Founder',

            bio:
              'Builds the product and helps shape the company vision.',

            avatarUrl:
              '/images/team-alex.svg',
          },

          {
            id: 'team-member-2',

            name:
              'Jamie Lee',

            role:
              'Product Designer',

            bio:
              'Creates thoughtful experiences for every customer.',

            avatarUrl:
              '/images/team-jamie.svg',
          },

          {
            id: 'team-member-3',

            name:
              'Taylor Smith',

            role:
              'Engineer',

            bio:
              'Turns product ideas into reliable software.',

            avatarUrl:
              '/images/team-taylor.svg',
          },
        ],
      },
    },

    {
      id: 'testimonials-1',

      type: 'testimonials',

      enabled: true,

      props: {
        title:
          'Loved by teams',

        items: [
          {
            id: 'testimonial-1',

            name:
              'Sarah Johnson',

            role:
              'Product Manager',

            quote:
              'PageForge helped us get a polished landing page online in much less time.',

            avatarUrl:
              '/images/testimonial-sarah.svg',
          },
        ],
      },
    },

    {
      id: 'cta-1',

      type: 'cta',

      enabled: true,

      props: {
        title:
          'Ready to build your landing page?',

        description:
          'Bring your idea to life with a page you can customize and publish.',

        buttonText:
          'Create Your Page',

        buttonUrl:
          '/auth/sign-up',
      },
    },
  ],
};