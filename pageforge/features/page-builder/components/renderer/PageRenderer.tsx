import type {
  ComponentType,
  ReactNode,
} from 'react';

import type {
  PageConfig,
  PageSection,
} from '../../domain/page-schema';

import {
  getSectionComponent,
} from '../../registry/section-registry';

type PageRendererProps = {
  config: PageConfig;

  sectionWrapper?: (
    section: PageSection,
    content: ReactNode,
  ) => ReactNode;
};

function renderSection(
  section: PageSection,
): ReactNode {
  if (!section.enabled) {
    return null;
  }

  const Component =
    getSectionComponent(
      section.type,
    ) as unknown as ComponentType<{
      props: PageSection['props'];
    }>;

  return (
    <Component
      props={section.props}
    />
  );
}

export default function PageRenderer({
  config,
  sectionWrapper,
}: PageRendererProps) {
  return (
    <main
      style={{
        backgroundColor:
          config.theme.backgroundColor,

        color:
          config.theme.textColor,

        fontFamily:
          config.theme.fontFamily,
      }}
    >
      {config.sections.map(
        (section) => {
          const content =
            renderSection(
              section,
            );

          if (!content) {
            return null;
          }

          return (
            <div
              key={section.id}
            >
              {sectionWrapper
                ? sectionWrapper(
                    section,
                    content,
                  )
                : content}
            </div>
          );
        },
      )}
    </main>
  );
}