import type { PageConfig } from './page-schema';

import { CURRENT_SCHEMA_VERSION } from './page-migrations';

export const samplePage: PageConfig = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  seo: {
    title: 'PageForge — Build Your Business Faster',
    description: 'Create, customize, and publish beautiful landing pages with PageForge.',
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
        title: 'Build your business faster',
        description: 'Build faster workflows without repetitive manual work.',
        primaryCtaText: 'Get Started',
        primaryCtaUrl: '/auth/sign-up',
        imageUrl: '/images/pageforge-hero.png',
      },
    },
    {
      id: 'features-1',
      type: 'features',
      enabled: true,
      props: {
        title: 'Everything you need',
        description: 'Powerful tools to create, customize, and publish your landing pages.',
        items: [
          {
            id: 'feature-1',
            title: 'Visual editor',
            description: 'Customize sections and content with an easy-to-use visual editor.',
            icon: '✦',
          },
          {
            id: 'feature-2',
            title: 'Reusable sections',
            description: 'Build pages from flexible sections and arrange them to fit your needs.',
            icon: '▦',
          },
          {
            id: 'feature-3',
            title: 'Fast publishing',
            description: 'Publish your work and share it through a public page URL.',
            icon: '⚡',
          },
        ],
      },
    },
    {
      id: 'faq-1',
      type: 'faq',
      enabled: true,
      props: {
        title: 'Frequently asked questions',
        items: [
          {
            id: 'faq-item-1',
            question: 'What is PageForge?',
            answer: 'PageForge is a visual page builder for creating and editing landing pages.',
          },
          {
            id: 'faq-item-2',
            question: 'Can I customize my page?',
            answer: 'Yes. You can edit section content directly from the settings panel.',
          },
          {
            id: 'faq-item-3',
            question: 'Can I reorder sections?',
            answer: 'Yes. Sections can be reordered directly from the section list.',
          },
        ],
      },
    },
    {
      id: 'team-1',
      type: 'team',
      enabled: true,
      props: {
        title: 'Meet the team',
        description: 'The people behind PageForge.',
        items: [
          {
            id: 'team-member-1',
            name: 'Alex Morgan',
            role: 'Co-Founder',
            bio: 'Builds the product and helps shape the company vision.',
            avatarUrl: '/images/team-alex.svg',
          },
          {
            id: 'team-member-2',
            name: 'Jamie Lee',
            role: 'Product Designer',
            bio: 'Creates thoughtful experiences for every customer.',
            avatarUrl: '/images/team-jamie.svg',
          },
          {
            id: 'team-member-3',
            name: 'Taylor Smith',
            role: 'Engineer',
            bio: 'Turns product ideas into reliable software.',
            avatarUrl: '/images/team-taylor.svg',
          },
        ],
      },
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      enabled: true,
      props: {
        title: 'Loved by teams',
        items: [
          {
            id: 'testimonial-1',
            name: 'Sarah Johnson',
            role: 'Product Manager',
            quote: 'We reduced repetitive work significantly.',
            avatarUrl: '/images/testimonial-sarah.svg',
          },
        ],
      },
    },
    {
      id: 'cta-1',
      type: 'cta',
      enabled: true,
      props: {
        title: 'Ready to get started?',
        description: 'Create your first landing page in minutes.',
        buttonText: 'Create Your Page',
        buttonUrl: '/auth/sign-up',
      },
    },
  ],
};
