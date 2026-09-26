import type { PageConfig } from "./page-schema";

export const samplePage: PageConfig = {
  schemaVersion: 1,

  seo: {
    title: "Acme AI — Automate Your Workflow",
    description:
      "Automate repetitive business workflows with Acme AI.",
  },

  theme: {
    primaryColor: "#2563eb",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    fontFamily: "Inter",
    borderRadius: "medium",
  },

  sections: [
    {
      id: "hero-1",
      type: "hero",
      enabled: true,
      props: {
        title: "Build your business faster",
        description:
          "Build faster workflows without repetitive manual work.",
        primaryCtaText: "Get Started",
        primaryCtaUrl: "/signup",
      },
    },

    {
      id: "features-1",
      type: "features",
      enabled: true,
      props: {
        title: "Everything you need",
        description:
          "Powerful tools to automate your daily workflow.",
        items: [
          {
            id: "feature-1",
            title: "Automate",
            description:
              "Automate repetitive tasks and workflows.",
          },
          {
            id: "feature-2",
            title: "Collaborate",
            description:
              "Work together from a single workspace.",
          },
          {
            id: "feature-3",
            title: "Measure",
            description:
              "Understand how your workflows perform.",
          },
        ],
      },
    },

    {
      id: "testimonials-1",
      type: "testimonials",
      enabled: true,
      props: {
        title: "Loved by teams",
        items: [
          {
            id: "testimonial-1",
            name: "Sarah Johnson",
            role: "Product Manager",
            quote:
              "We reduced repetitive work significantly.",
          },
        ],
      },
    },

    {
      id: "cta-1",
      type: "cta",
      enabled: true,
      props: {
        title: "Ready to get started?",
        description:
          "Create your first landing page in minutes.",
        buttonText: "Create Your Page",
        buttonUrl: "/signup",
      },
    },
  ],
};