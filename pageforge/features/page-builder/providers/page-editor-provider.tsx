'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

import { useStore } from 'zustand';

import {
  createPageEditorStore,
  type PageEditorState,
} from '../store/page-editor-store';

import type { PageConfig } from '../domain/page-schema';

type PageEditorStore = ReturnType<typeof createPageEditorStore>;

const PageEditorStoreContext = createContext<PageEditorStore | null>(null);

type PageEditorProviderProps = {
  initialConfig: PageConfig;
  children: ReactNode;
};

export function PageEditorProvider({
  initialConfig,
  children,
}: PageEditorProviderProps) {
  const [store] = useState(() => createPageEditorStore(initialConfig));

  return (
    <PageEditorStoreContext.Provider value={store}>
      {children}
    </PageEditorStoreContext.Provider>
  );
}

export function usePageEditorStore<T>(
  selector: (state: PageEditorState) => T,
): T {
  const store = useContext(PageEditorStoreContext);

  if (!store) {
    throw new Error(
      'usePageEditorStore must be used inside PageEditorProvider',
    );
  }

  return useStore(store, selector);
}
