import { createStore } from 'zustand/vanilla';

import type {
  PageConfig,
  PageSection,
  SectionType,
} from '../domain/page-schema';

import { createDefaultSection } from '../domain/section-factory';

type PropsFor<T extends SectionType> = Extract<
  PageSection,
  { type: T }
>['props'];

export type PageEditorState = {
  config: PageConfig;

  selectedSectionId: string | null;

  isDirty: boolean;

  past: PageConfig[];

  future: PageConfig[];

  selectSection: (sectionId: string | null) => void;

  addSection: (type: SectionType) => void;

  deleteSection: (sectionId: string) => void;

  duplicateSection: (sectionId: string) => void;

  reorderSections: (
    fromIndex: number,
    toIndex: number,
  ) => void;

  updateSectionProps: <T extends SectionType>(
    sectionId: string,
    type: T,
    patch: Partial<PropsFor<T>>,
  ) => void;

  setSectionEnabled: (
    sectionId: string,
    enabled: boolean,
  ) => void;

  updateSectionField: (
    sectionId: string,
    field: string,
    value: unknown,
  ) => void;

  addCollectionItem: (
    sectionId: string,
    collectionKey: string,
    item: Record<string, unknown>,
  ) => void;

  updateCollectionItem: (
    sectionId: string,
    collectionKey: string,
    itemId: string,
    patch: Record<string, unknown>,
  ) => void;

  removeCollectionItem: (
    sectionId: string,
    collectionKey: string,
    itemId: string,
  ) => void;

  reorderCollectionItems: (
    sectionId: string,
    collectionKey: string,
    fromIndex: number,
    toIndex: number,
  ) => void;

  undo: () => void;

  redo: () => void;
};

const MAX_HISTORY_ENTRIES = 50;

function cloneConfig(config: PageConfig): PageConfig {
  return structuredClone(config);
}

function pushHistory(
  history: PageConfig[],
  config: PageConfig,
): PageConfig[] {
  return [
    ...history,
    cloneConfig(config),
  ].slice(-MAX_HISTORY_ENTRIES);
}

function commitConfigChange(
  state: PageEditorState,
  nextConfig: PageConfig,
) {
  return {
    config: nextConfig,
    past: pushHistory(state.past, state.config),
    future: [],
    isDirty: true,
  };
}

function moveItem<T>(
  items: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }

  const nextItems = [...items];

  const [movedItem] = nextItems.splice(
    fromIndex,
    1,
  );

  nextItems.splice(
    toIndex,
    0,
    movedItem,
  );

  return nextItems;
}

function resolveSelectedSectionId(
  selectedSectionId: string | null,
  config: PageConfig,
): string | null {
  if (
    selectedSectionId &&
    config.sections.some(
      (section) => section.id === selectedSectionId,
    )
  ) {
    return selectedSectionId;
  }

  return config.sections[0]?.id ?? null;
}

export const createPageEditorStore = (
  initialConfig: PageConfig,
) =>
  createStore<PageEditorState>()((set) => ({
    config: cloneConfig(initialConfig),

    selectedSectionId:
      initialConfig.sections[0]?.id ?? null,

    isDirty: false,

    past: [],

    future: [],

    selectSection: (sectionId) => {
      set({
        selectedSectionId: sectionId,
      });
    },

    addSection: (type) => {
      set((state) => {
        const newSection = createDefaultSection(type);

        const currentSections =
          state.config.sections;

        const selectedIndex =
          state.selectedSectionId
            ? currentSections.findIndex(
                (section) =>
                  section.id ===
                  state.selectedSectionId,
              )
            : -1;

        const insertIndex =
          selectedIndex >= 0
            ? selectedIndex + 1
            : currentSections.length;

        const nextSections = [
          ...currentSections,
        ];

        nextSections.splice(
          insertIndex,
          0,
          newSection,
        );

        const nextConfig: PageConfig = {
          ...state.config,

          sections: nextSections,
        };

        return {
          ...commitConfigChange(
            state,
            nextConfig,
          ),

          selectedSectionId:
            newSection.id,
        };
      });
    },

    deleteSection: (sectionId) => {
      set((state) => {
        const currentSections =
          state.config.sections;

        const deletedIndex =
          currentSections.findIndex(
            (section) =>
              section.id === sectionId,
          );

        if (deletedIndex === -1) {
          return state;
        }

        const nextSections =
          currentSections.filter(
            (section) =>
              section.id !== sectionId,
          );

        const nextConfig: PageConfig = {
          ...state.config,

          sections: nextSections,
        };

        let nextSelectedId =
          state.selectedSectionId;

        if (
          state.selectedSectionId ===
          sectionId
        ) {
          const replacement =
            nextSections[
              Math.min(
                deletedIndex,
                nextSections.length - 1,
              )
            ];

          nextSelectedId =
            replacement?.id ?? null;
        }

        return {
          ...commitConfigChange(
            state,
            nextConfig,
          ),

          selectedSectionId:
            nextSelectedId,
        };
      });
    },

    duplicateSection: (sectionId) => {
      set((state) => {
        const sourceIndex =
          state.config.sections.findIndex(
            (section) =>
              section.id === sectionId,
          );

        if (sourceIndex === -1) {
          return state;
        }

        const sourceSection =
          state.config.sections[sourceIndex];

        const duplicatedSection =
          cloneConfig({
            ...state.config,
            sections: [sourceSection],
          }).sections[0];

        duplicatedSection.id =
          crypto.randomUUID();

        if (
          duplicatedSection.type ===
          'features'
        ) {
          duplicatedSection.props.items =
            duplicatedSection.props.items.map(
              (item) => ({
                ...item,
                id: crypto.randomUUID(),
              }),
            );
        }

        if (
          duplicatedSection.type ===
          'testimonials'
        ) {
          duplicatedSection.props.items =
            duplicatedSection.props.items.map(
              (item) => ({
                ...item,
                id: crypto.randomUUID(),
              }),
            );
        }

        const nextSections = [
          ...state.config.sections,
        ];

        nextSections.splice(
          sourceIndex + 1,
          0,
          duplicatedSection,
        );

        const nextConfig: PageConfig = {
          ...state.config,

          sections: nextSections,
        };

        return {
          ...commitConfigChange(
            state,
            nextConfig,
          ),

          selectedSectionId:
            duplicatedSection.id,
        };
      });
    },

    reorderSections: (
      fromIndex,
      toIndex,
    ) => {
      set((state) => {
        const nextSections = moveItem(
          state.config.sections,
          fromIndex,
          toIndex,
        );

        if (
          nextSections ===
          state.config.sections
        ) {
          return state;
        }

        const nextConfig: PageConfig = {
          ...state.config,

          sections: nextSections,
        };

        return commitConfigChange(
          state,
          nextConfig,
        );
      });
    },

    updateSectionProps: (
      sectionId,
      type,
      patch,
    ) => {
      set((state) => {
        const targetSection =
          state.config.sections.find(
            (section) =>
              section.id === sectionId &&
              section.type === type,
          );

        if (!targetSection) {
          return state;
        }

        const hasChanges =
          Object.entries(patch).some(
            ([key, value]) =>
              !Object.is(
                (
                  targetSection.props as Record<
                    string,
                    unknown
                  >
                )[key],
                value,
              ),
          );

        if (!hasChanges) {
          return state;
        }

        const nextConfig: PageConfig = {
          ...state.config,

          sections:
            state.config.sections.map(
              (section) => {
                if (
                  section.id !== sectionId ||
                  section.type !== type
                ) {
                  return section;
                }

                return {
                  ...section,

                  props: {
                    ...section.props,
                    ...patch,
                  },
                } as PageSection;
              },
            ),
        };

        return commitConfigChange(
          state,
          nextConfig,
        );
      });
    },

    setSectionEnabled: (
      sectionId,
      enabled,
    ) => {
      set((state) => {
        const targetSection =
          state.config.sections.find(
            (section) =>
              section.id === sectionId,
          );

        if (!targetSection) {
          return state;
        }

        if (
          targetSection.enabled === enabled
        ) {
          return state;
        }

        const nextConfig: PageConfig = {
          ...state.config,

          sections:
            state.config.sections.map(
              (section) =>
                section.id === sectionId
                  ? {
                      ...section,
                      enabled,
                    }
                  : section,
            ),
        };

        return commitConfigChange(
          state,
          nextConfig,
        );
      });
    },

    updateSectionField: (
      sectionId,
      field,
      value,
    ) => {
      set((state) => {
        const targetSection =
          state.config.sections.find(
            (section) =>
              section.id === sectionId,
          );

        if (!targetSection) {
          return state;
        }

        if (
          !Object.prototype.hasOwnProperty.call(
            targetSection.props,
            field,
          )
        ) {
          return state;
        }

        const currentValue = (
          targetSection.props as Record<
            string,
            unknown
          >
        )[field];

        if (Object.is(currentValue, value)) {
          return state;
        }

        const nextConfig: PageConfig = {
          ...state.config,

          sections:
            state.config.sections.map(
              (section) =>
                section.id === sectionId
                  ? {
                      ...section,

                      props: {
                        ...section.props,

                        [field]: value,
                      },
                    }
                  : section,
            ),
        };

        return commitConfigChange(
          state,
          nextConfig,
        );
      });
    },

    addCollectionItem: (
      sectionId,
      collectionKey,
      item,
    ) => {
      set((state) => {
        const targetSection =
          state.config.sections.find(
            (section) =>
              section.id === sectionId,
          );

        if (!targetSection) {
          return state;
        }

        const currentValue =
          targetSection.props[
            collectionKey as keyof typeof targetSection.props
          ];

        if (!Array.isArray(currentValue)) {
          return state;
        }

        const nextConfig: PageConfig = {
          ...state.config,

          sections:
            state.config.sections.map(
              (section) => {
                if (
                  section.id !== sectionId
                ) {
                  return section;
                }

                return {
                  ...section,

                  props: {
                    ...section.props,

                    [collectionKey]: [
                      ...currentValue,
                      item,
                    ],
                  },
                } as PageSection;
              },
            ),
        };

        return commitConfigChange(
          state,
          nextConfig,
        );
      });
    },

    updateCollectionItem: (
      sectionId,
      collectionKey,
      itemId,
      patch,
    ) => {
      set((state) => {
        const targetSection =
          state.config.sections.find(
            (section) =>
              section.id === sectionId,
          );

        if (!targetSection) {
          return state;
        }

        const currentValue =
          targetSection.props[
            collectionKey as keyof typeof targetSection.props
          ];

        if (!Array.isArray(currentValue)) {
          return state;
        }

        let changed = false;

        const nextItems =
          currentValue.map((item) => {
            if (
              !item ||
              typeof item !== 'object' ||
              !('id' in item) ||
              item.id !== itemId
            ) {
              return item;
            }

            const hasChanges =
              Object.entries(patch).some(
                ([key, value]) =>
                  !Object.is(
                    (
                      item as Record<
                        string,
                        unknown
                      >
                    )[key],
                    value,
                  ),
              );

            if (!hasChanges) {
              return item;
            }

            changed = true;

            return {
              ...item,
              ...patch,
            };
          });

        if (!changed) {
          return state;
        }

        const nextConfig: PageConfig = {
          ...state.config,

          sections:
            state.config.sections.map(
              (section) => {
                if (
                  section.id !== sectionId
                ) {
                  return section;
                }

                return {
                  ...section,

                  props: {
                    ...section.props,

                    [collectionKey]: nextItems,
                  },
                } as PageSection;
              },
            ),
        };

        return commitConfigChange(
          state,
          nextConfig,
        );
      });
    },

    removeCollectionItem: (
      sectionId,
      collectionKey,
      itemId,
    ) => {
      set((state) => {
        const targetSection =
          state.config.sections.find(
            (section) =>
              section.id === sectionId,
          );

        if (!targetSection) {
          return state;
        }

        const currentValue =
          targetSection.props[
            collectionKey as keyof typeof targetSection.props
          ];

        if (!Array.isArray(currentValue)) {
          return state;
        }

        const nextItems =
          currentValue.filter(
            (item) =>
              !(
                item &&
                typeof item === 'object' &&
                'id' in item &&
                item.id === itemId
              ),
          );

        if (
          nextItems.length ===
          currentValue.length
        ) {
          return state;
        }

        const nextConfig: PageConfig = {
          ...state.config,

          sections:
            state.config.sections.map(
              (section) => {
                if (
                  section.id !== sectionId
                ) {
                  return section;
                }

                return {
                  ...section,

                  props: {
                    ...section.props,

                    [collectionKey]: nextItems,
                  },
                } as PageSection;
              },
            ),
        };

        return commitConfigChange(
          state,
          nextConfig,
        );
      });
    },

    reorderCollectionItems: (
      sectionId,
      collectionKey,
      fromIndex,
      toIndex,
    ) => {
      set((state) => {
        if (
          fromIndex === toIndex ||
          fromIndex < 0 ||
          toIndex < 0
        ) {
          return state;
        }

        const targetSection =
          state.config.sections.find(
            (section) =>
              section.id === sectionId,
          );

        if (!targetSection) {
          return state;
        }

        const currentValue =
          targetSection.props[
            collectionKey as keyof typeof targetSection.props
          ];

        if (
          !Array.isArray(currentValue) ||
          fromIndex >= currentValue.length ||
          toIndex >= currentValue.length
        ) {
          return state;
        }

        const nextItems = moveItem(
          currentValue,
          fromIndex,
          toIndex,
        );

        if (nextItems === currentValue) {
          return state;
        }

        const nextConfig: PageConfig = {
          ...state.config,

          sections:
            state.config.sections.map(
              (section) => {
                if (
                  section.id !== sectionId
                ) {
                  return section;
                }

                return {
                  ...section,

                  props: {
                    ...section.props,

                    [collectionKey]: nextItems,
                  },
                } as PageSection;
              },
            ),
        };

        return commitConfigChange(
          state,
          nextConfig,
        );
      });
    },

    undo: () => {
      set((state) => {
        if (state.past.length === 0) {
          return state;
        }

        const previousConfig =
          state.past[
            state.past.length - 1
          ];

        const nextPast =
          state.past.slice(0, -1);

        const nextFuture = [
          ...state.future,
          cloneConfig(state.config),
        ].slice(-MAX_HISTORY_ENTRIES);

        return {
          config: previousConfig,

          past: nextPast,

          future: nextFuture,

          selectedSectionId:
            resolveSelectedSectionId(
              state.selectedSectionId,
              previousConfig,
            ),

          isDirty:
            nextPast.length > 0,
        };
      });
    },

    redo: () => {
      set((state) => {
        if (state.future.length === 0) {
          return state;
        }

        const nextConfig =
          state.future[
            state.future.length - 1
          ];

        const nextFuture =
          state.future.slice(0, -1);

        const nextPast = [
          ...state.past,
          cloneConfig(state.config),
        ].slice(-MAX_HISTORY_ENTRIES);

        return {
          config: nextConfig,

          past: nextPast,

          future: nextFuture,

          selectedSectionId:
            resolveSelectedSectionId(
              state.selectedSectionId,
              nextConfig,
            ),

          isDirty:
            nextPast.length > 0,
        };
      });
    },
  }));