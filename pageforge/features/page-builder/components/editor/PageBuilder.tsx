'use client';

import SectionList from './SectionList';
import EditablePreview from './EditablePreview';
import SectionSettings from './SectionSettings';

import { usePageEditorStore } from '../../providers/page-editor-provider';

import { useEditorHistoryShortcuts } from '../../hooks/use-editor-history-shortcuts';

import { usePageEditorPersistence } from '../../hooks/use-page-editor-persistence';

type PageBuilderProps = {
  pageId: string;
};

export default function PageBuilder({
  pageId,
}: PageBuilderProps) {
  const isDirty = usePageEditorStore(
    (state) => state.isDirty,
  );

  const canUndo = usePageEditorStore(
    (state) =>
      state.past.length > 0,
  );

  const canRedo = usePageEditorStore(
    (state) =>
      state.future.length > 0,
  );

  const undo = usePageEditorStore(
    (state) => state.undo,
  );

  const redo = usePageEditorStore(
    (state) => state.redo,
  );

  const {
    isHydrated,
    save,
    saveError,
  } = usePageEditorPersistence(
    pageId,
  );

  useEditorHistoryShortcuts({
    undo,
    redo,
  });

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
          <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1">
            <button
              type="button"
              onClick={undo}
              disabled={
                !canUndo ||
                !isHydrated
              }
              title="Undo (Ctrl/Cmd + Z)"
              aria-label="Undo last change"
              className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ↶
            </button>

            <button
              type="button"
              onClick={redo}
              disabled={
                !canRedo ||
                !isHydrated
              }
              title="Redo (Ctrl/Cmd + Shift + Z)"
              aria-label="Redo last undone change"
              className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ↷
            </button>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={
              !isDirty ||
              !isHydrated
            }
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            Save
          </button>

          <span
            className={[
              'rounded-full px-3 py-1 text-xs font-medium',
              isDirty
                ? 'bg-amber-50 text-amber-700'
                : 'bg-green-50 text-green-700',
            ].join(' ')}
          >
            {!isHydrated
              ? 'Loading saved page'
              : isDirty
                ? 'Draft changes'
                : 'All changes saved'}
          </span>
        </div>
      </header>

      {saveError && (
        <div
          className="border-b border-red-200 bg-red-50 px-5 py-2 text-xs text-red-700"
          role="alert"
        >
          {saveError}
        </div>
      )}

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