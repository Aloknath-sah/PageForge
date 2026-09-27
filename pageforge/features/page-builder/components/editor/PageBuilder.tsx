"use client";

import SectionList from "./SectionList";
import EditablePreview from "./EditablePreview";
import SectionSettings from "./SectionSettings";

import { usePageEditorStore } from "../../providers/page-editor-provider";

type PageBuilderProps = {
  pageId: string;
};

export default function PageBuilder({
  pageId,
}: PageBuilderProps) {
  const isDirty = usePageEditorStore(
    (state) => state.isDirty,
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-100">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5">
        <div>
          <h1 className="text-lg font-semibold text-gray-950">
            PageForge
          </h1>

          <p className="text-xs text-gray-500">
            Editing page: {pageId}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-medium",
              isDirty
                ? "bg-amber-50 text-amber-700"
                : "bg-green-50 text-green-700",
            ].join(" ")}
          >
            {isDirty
              ? "Draft changes"
              : "All changes saved"}
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <SectionList />

        <main className="min-w-0 flex-1 overflow-auto">
          <EditablePreview />
        </main>

        <SectionSettings />
      </div>
    </div>
  );
}