"use client";

import type { MouseEvent } from "react";

import { useSortable } from "@dnd-kit/react/sortable";

import type { PageSection } from "../../domain/page-schema";

import { usePageEditorStore } from "../../providers/page-editor-provider";

type SortableSectionItemProps = {
  section: PageSection;
  index: number;
};

function formatSectionName(
  type: PageSection["type"],
) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function SortableSectionItem({
  section,
  index,
}: SortableSectionItemProps) {
  const selectedSectionId =
    usePageEditorStore(
      (state) => state.selectedSectionId,
    );

  const selectSection =
    usePageEditorStore(
      (state) => state.selectSection,
    );

  const setSectionEnabled =
    usePageEditorStore(
      (state) => state.setSectionEnabled,
    );

  const duplicateSection =
    usePageEditorStore(
      (state) => state.duplicateSection,
    );

  const deleteSection =
    usePageEditorStore(
      (state) => state.deleteSection,
    );

  const sortable = useSortable({
    id: section.id,
    index,
    type: "page-section",
    group: "page-sections",
  });

  const selected =
    section.id === selectedSectionId;

  const handleSelect = () => {
    selectSection(section.id);
  };

  const handleToggle = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    setSectionEnabled(
      section.id,
      !section.enabled,
    );
  };

  const handleDuplicate = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    duplicateSection(section.id);
  };

  const handleDelete = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    deleteSection(section.id);
  };

  return (
    <div
      ref={sortable.ref}
      className={[
        "group rounded-lg border bg-white transition",
        selected
          ? "border-blue-500 shadow-sm"
          : "border-gray-200 hover:border-gray-300",
        sortable.isDragging
          ? "opacity-50"
          : "",
      ].join(" ")}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            handleSelect();
          }
        }}
        className="flex min-h-12 items-center gap-2 px-2"
        aria-label={`Select ${formatSectionName(
          section.type,
        )} section`}
      >
        <button
          ref={sortable.handleRef}
          type="button"
          aria-label={`Drag ${formatSectionName(
            section.type,
          )}`}
          className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <span
            aria-hidden="true"
            className="text-lg leading-none"
          >
            ⋮⋮
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {formatSectionName(section.type)}
          </p>

          <p className="text-xs text-gray-400">
            Section {index + 1}
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          aria-label={
            section.enabled
              ? `Hide ${formatSectionName(
                  section.type,
                )}`
              : `Show ${formatSectionName(
                  section.type,
                )}`
          }
          className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          {section.enabled
            ? "Hide"
            : "Show"}
        </button>

        <button
          type="button"
          onClick={handleDuplicate}
          aria-label={`Duplicate ${formatSectionName(
            section.type,
          )}`}
          className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          Copy
        </button>

        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Delete ${formatSectionName(
            section.type,
          )}`}
          className="rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}