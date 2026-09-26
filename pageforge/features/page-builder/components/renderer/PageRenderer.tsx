import type { PageConfig, PageSection } from "../../domain/page-schema";
import { sectionRegistry } from "../../registry/section-registry";

type PageRendererProps = {
  config: PageConfig;
};

function renderSection(section: PageSection) {
  if (!section.enabled) {
    return null;
  }

  const Component = sectionRegistry[section.type];

  return (
    <Component
      props={section.props}
    />
  );
}

export default function PageRenderer({
  config,
}: PageRendererProps) {
  return (
    <main
      style={{
        backgroundColor: config.theme.backgroundColor,
        color: config.theme.textColor,
        fontFamily: config.theme.fontFamily,
      }}
    >
      {config.sections.map((section) => (
        <div key={section.id}>
          {renderSection(section)}
        </div>
      ))}
    </main>
  );
}