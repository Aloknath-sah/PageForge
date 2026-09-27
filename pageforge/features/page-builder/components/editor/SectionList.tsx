"use client";

import { usePageEditorStore } from "../../providers/page-editor-provider";

export default function SectionList() {
  const sections = usePageEditorStore(
    (state) => state.config.sections,
  );

  const selectedSectionId =
    usePageEditorStore(
      (state) => state.selectedSectionId,
    );

  const selectSection =
    usePageEditorStore(
      (state) => state.selectSection,
    );

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-4">
        <h2 className="text-sm font-semibold text-gray-900">
          Sections
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Select a section to edit it.
        </p>
      </div>

      <div className="space-y-1 p-3">
        {sections.map((section) => {
          const selected =
            section.id === selectedSectionId;

          return (
            <button
              key={section.id}
              type="button"
              aria-pressed={selected}
              onClick={() =>
                selectSection(section.id)
              }
              className={[
                "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition",
                selected
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              <span className="capitalize">
                {section.type}
              </span>

              <span
                className={[
                  "h-2 w-2 rounded-full",
                  section.enabled
                    ? "bg-green-500"
                    : "bg-gray-300",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>
    </aside>
  );
}