'use client';

import { useEffect } from 'react';

type EditorHistoryActions = {
  undo: () => void;
  redo: () => void;
};

export function useEditorHistoryShortcuts({
  undo,
  redo,
}: EditorHistoryActions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      const modifierPressed =
        event.ctrlKey || event.metaKey;

      if (!modifierPressed || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();

      const isUndo =
        key === 'z' && !event.shiftKey;

      const isRedoWithShift =
        key === 'z' && event.shiftKey;

      const isRedoWithY =
        key === 'y' && !event.shiftKey;

      if (isUndo) {
        event.preventDefault();
        undo();
        return;
      }

      if (
        isRedoWithShift ||
        isRedoWithY
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [undo, redo]);
}