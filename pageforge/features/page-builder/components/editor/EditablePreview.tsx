// features/page-builder/components/editor/EditablePreview.tsx

'use client';

import {
  memo,
  type ComponentType,
  type MouseEvent,
} from 'react';

import { useShallow } from 'zustand/react/shallow';

import type { PageSection } from '../../domain/page-schema';

import { getSectionComponent } from '../../registry/section-registry';

import {
  usePageEditorStore,
} from '../../providers/page-editor-provider';

type EditableSectionProps = {
  sectionId: string;
};

const EditableSection = memo(
  function EditableSection({
    sectionId,
  }: EditableSectionProps) {
    const section =
      usePageEditorStore(
        (state) =>
          state.config.sections.find(
            (candidate) =>
              candidate.id ===
              sectionId,
          ) ?? null,
      );

    const isSelected =
      usePageEditorStore(
        (state) =>
          state.selectedSectionId ===
          sectionId,
      );

    const selectSection =
      usePageEditorStore(
        (state) =>
          state.selectSection,
      );

    if (
      !section ||
      !section.enabled
    ) {
      return null;
    }

    const Component =
      getSectionComponent(
        section.type,
      ) as unknown as ComponentType<{
        props: PageSection['props'];
      }>;

    const handleClick = (
      event: MouseEvent<HTMLDivElement>,
    ) => {
      event.preventDefault();
      event.stopPropagation();

      selectSection(
        section.id,
      );
    };

    return (
      <div
        onClick={handleClick}
        className={[
          'relative cursor-pointer outline-none transition',
          isSelected
            ? 'z-10 ring-2 ring-inset ring-blue-500'
            : 'ring-1 ring-transparent hover:ring-blue-300',
        ].join(' ')}
      >
        {isSelected && (
          <div className="absolute left-3 top-3 z-20 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white shadow-sm">
            {section.type}
          </div>
        )}

        <Component
          props={section.props}
        />
      </div>
    );
  },
);

EditableSection.displayName =
  'EditableSection';

export default function EditablePreview() {
  const theme =
    usePageEditorStore(
      (state) =>
        state.config.theme,
    );

  const sectionIds =
    usePageEditorStore(
      useShallow((state) =>
        state.config.sections.map(
          (section) =>
            section.id,
        ),
      ),
    );

  return (
    <div className="min-h-full bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-xl bg-white shadow-sm">
        <main
          style={{
            backgroundColor:
              theme.backgroundColor,
            color: theme.textColor,
            fontFamily:
              theme.fontFamily,
          }}
        >
          {sectionIds.map(
            (sectionId) => (
              <EditableSection
                key={sectionId}
                sectionId={sectionId}
              />
            ),
          )}
        </main>
      </div>
    </div>
  );
}