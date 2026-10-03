import { memo, type ComponentType, type ReactNode } from 'react';

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

type RenderedSectionProps = {
  section: PageSection;
};

/**
 * Keeps the section boundary stable when the parent PageRenderer re-renders.
 *
 * The editor store preserves object identity for sections that were not
 * changed, so React.memo lets those sections skip work during unrelated edits.
 */
const RenderedSection = memo(function RenderedSection({
  section,
}: RenderedSectionProps) {
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
});

RenderedSection.displayName = 'RenderedSection';

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
          if (!section.enabled) {
            return null;
          }

          const content = (
            <RenderedSection
              key={section.id}
              section={section}
            />
          );

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
