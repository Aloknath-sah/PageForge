'use client';

import type { MouseEvent } from 'react';

import PageRenderer from '../renderer/PageRenderer';

import { usePageEditorStore } from '../../providers/page-editor-provider';

export default function EditablePreview() {
  const config = usePageEditorStore((state) => state.config);

  const selectedSectionId = usePageEditorStore(
    (state) => state.selectedSectionId,
  );

  const selectSection = usePageEditorStore((state) => state.selectSection);

  return (
    <div className="min-h-full bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-xl bg-white shadow-sm">
        <PageRenderer
          config={config}
          sectionWrapper={(section, content) => {
            const selected = section.id === selectedSectionId;

            const handleClick = (event: MouseEvent<HTMLDivElement>) => {
              event.preventDefault();
              event.stopPropagation();

              selectSection(section.id);
            };

            return (
              <div
                key={section.id}
                onClick={handleClick}
                className={[
                  'relative cursor-pointer outline-none transition',
                  selected
                    ? 'z-10 ring-2 ring-inset ring-blue-500'
                    : 'ring-1 ring-transparent hover:ring-blue-300',
                ].join(' ')}
              >
                {selected && (
                  <div className="absolute left-3 top-3 z-20 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white shadow-sm">
                    {section.type}
                  </div>
                )}

                {content}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
