'use client';

import { useState } from 'react';

import { DragDropProvider } from '@dnd-kit/react';

import { isSortable } from '@dnd-kit/react/sortable';

import { usePageEditorStore } from '../../providers/page-editor-provider';

import SortableSectionItem from './SortedSectionItem';

import type { SectionType } from '../../domain/page-schema';

const SECTION_OPTIONS: Array<{
  type: SectionType;
  label: string;
}> = [
  {
    type: 'hero',
    label: 'Hero',
  },

  {
    type: 'features',
    label: 'Features',
  },

  {
    type: 'faq',
    label: 'FAQ',
  },

  {
    type: 'testimonials',
    label: 'Testimonials',
  },

  {
    type: 'cta',
    label: 'CTA',
  },
];

export default function SectionList() {
  const [
    showAddMenu,
    setShowAddMenu,
  ] = useState(false);

  const sections =
    usePageEditorStore(
      (state) =>
        state.config.sections,
    );

  const addSection =
    usePageEditorStore(
      (state) =>
        state.addSection,
    );

  const reorderSections =
    usePageEditorStore(
      (state) =>
        state.reorderSections,
    );

  const handleAddSection = (
    type: SectionType,
  ) => {
    addSection(type);

    setShowAddMenu(false);
  };

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-4">
        <h2 className="text-sm font-semibold text-gray-900">
          Sections
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Drag to reorder your page.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <DragDropProvider
          onDragEnd={(event) => {
            if (event.canceled) {
              return;
            }

            const { source } =
              event.operation;

            if (
              !isSortable(source)
            ) {
              return;
            }

            const {
              initialIndex,
              index,
            } = source;

            if (
              initialIndex === index
            ) {
              return;
            }

            reorderSections(
              initialIndex,
              index,
            );
          }}
        >
          <div className="space-y-2">
            {sections.map(
              (
                section,
                index,
              ) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  index={index}
                />
              ),
            )}
          </div>
        </DragDropProvider>
      </div>

      <div className="relative border-t border-gray-200 p-3">
        {showAddMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
            <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              Add section
            </p>

            <div className="mt-1 space-y-1">
              {SECTION_OPTIONS.map(
                (option) => (
                  <button
                    key={
                      option.type
                    }
                    type="button"
                    onClick={() =>
                      handleAddSection(
                        option.type,
                      )
                    }
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {option.label}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setShowAddMenu(
              (current) =>
                !current,
            )
          }
          className="w-full rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
        >
          + Add Section
        </button>
      </div>
    </aside>
  );
}