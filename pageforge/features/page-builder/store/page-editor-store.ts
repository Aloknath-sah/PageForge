import { createStore } from 'zustand/vanilla';

import type {
  PageConfig,
  PageSection,
  SectionType,
} from '../domain/page-schema';

import { createDefaultSection } from '../domain/section-factory';

type PropsFor<
  T extends SectionType,
> = Extract<
  PageSection,
  { type: T }
>['props'];

export type PageEditorState = {
  config: PageConfig;

  savedConfig: PageConfig;

  selectedSectionId:
    | string
    | null;

  isDirty: boolean;

  past: PageConfig[];

  future: PageConfig[];

  selectSection: (
    sectionId: string | null,
  ) => void;

  addSection: (
    type: SectionType,
  ) => void;

  deleteSection: (
    sectionId: string,
  ) => void;

  duplicateSection: (
    sectionId: string,
  ) => void;

  reorderSections: (
    fromIndex: number,
    toIndex: number,
  ) => void;

  updateSectionProps: <
    T extends SectionType,
  >(
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
    item: Record<
      string,
      unknown
    >,
  ) => void;

  updateCollectionItem: (
    sectionId: string,
    collectionKey: string,
    itemId: string,
    patch: Record<
      string,
      unknown
    >,
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

  beginHistoryTransaction: () => void;

  endHistoryTransaction: () => void;

  hydrateConfig: (
    config: PageConfig,
  ) => void;

  markSaved: () => void;

  undo: () => void;

  redo: () => void;
};

const MAX_HISTORY_ENTRIES = 50;

function cloneConfig(
  config: PageConfig,
): PageConfig {
  return structuredClone(
    config,
  );
}

function configsEqual(
  first: PageConfig,
  second: PageConfig,
): boolean {
  return (
    JSON.stringify(first) ===
    JSON.stringify(second)
  );
}

function getDirtyState(
  config: PageConfig,
  savedConfig: PageConfig,
): boolean {
  return !configsEqual(
    config,
    savedConfig,
  );
}

function pushHistory(
  history: PageConfig[],
  config: PageConfig,
): PageConfig[] {
  return [
    ...history,
    cloneConfig(config),
  ].slice(
    -MAX_HISTORY_ENTRIES,
  );
}

function moveItem<T>(
  items: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  if (
    fromIndex ===
      toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >=
      items.length ||
    toIndex >=
      items.length
  ) {
    return items;
  }

  const nextItems = [
    ...items,
  ];

  const [
    movedItem,
  ] = nextItems.splice(
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
  selectedSectionId:
    | string
    | null,
  config: PageConfig,
): string | null {
  if (
    selectedSectionId &&
    config.sections.some(
      (section) =>
        section.id ===
        selectedSectionId,
    )
  ) {
    return selectedSectionId;
  }

  return (
    config.sections[0]?.id ??
    null
  );
}

function duplicateSectionWithFreshIds(
  section: PageSection,
): PageSection {
  const duplicatedSection =
    structuredClone(section);

  duplicatedSection.id =
    crypto.randomUUID();

  const props =
    duplicatedSection.props as Record<
      string,
      unknown
    >;

  for (const [
    key,
    value,
  ] of Object.entries(props)) {
    if (
      !Array.isArray(value)
    ) {
      continue;
    }

    const collectionItems =
      value.filter(
        (item) =>
          item &&
          typeof item ===
            'object' &&
          'id' in item &&
          typeof (
            item as Record<
              string,
              unknown
            >
          ).id === 'string',
      );

    if (
      collectionItems.length !==
      value.length
    ) {
      continue;
    }

    props[key] =
      value.map(
        (item) => ({
          ...(item as Record<
            string,
            unknown
          >),

          id: crypto.randomUUID(),
        }),
      );
  }

  return duplicatedSection;
}

export const createPageEditorStore =
  (
    initialConfig: PageConfig,
  ) => {
    let activeHistoryTransaction:
      | PageConfig
      | null = null;

    let historyTransactionChanged =
      false;

    function clearHistoryTransaction() {
      activeHistoryTransaction =
        null;

      historyTransactionChanged =
        false;
    }

    function commitConfigChange(
      state: PageEditorState,
      nextConfig: PageConfig,
    ) {
      const historyBase =
        activeHistoryTransaction ??
        state.config;

      clearHistoryTransaction();

      return {
        config: nextConfig,

        past: pushHistory(
          state.past,
          historyBase,
        ),

        future: [],

        // Every committed config change is a known dirty transition.
        // Avoid serializing the entire PageConfig on every editor update.
        isDirty: true,
      };
    }

    function applyConfigChange(
      state: PageEditorState,
      nextConfig: PageConfig,
    ) {
      if (
        activeHistoryTransaction
      ) {
        historyTransactionChanged =
          true;

        return {
          config: nextConfig,

          future: [],

          // The transaction has changed the draft, so it is dirty.
          // Equality against the saved snapshot is deferred to the
          // transaction boundary instead of happening on every keystroke.
          isDirty: true,
        };
      }

      return commitConfigChange(
        state,
        nextConfig,
      );
    }

    return createStore<PageEditorState>()(
      (set) => ({
        config:
          cloneConfig(
            initialConfig,
          ),

        savedConfig:
          cloneConfig(
            initialConfig,
          ),

        selectedSectionId:
          initialConfig.sections[0]
            ?.id ?? null,

        isDirty: false,

        past: [],

        future: [],

        selectSection: (
          sectionId,
        ) => {
          set({
            selectedSectionId:
              sectionId,
          });
        },

        addSection: (
          type,
        ) => {
          set(
            (state) => {
              const newSection =
                createDefaultSection(
                  type,
                );

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

              const nextConfig: PageConfig =
                {
                  ...state.config,

                  sections:
                    nextSections,
                };

              return {
                ...commitConfigChange(
                  state,
                  nextConfig,
                ),

                selectedSectionId:
                  newSection.id,
              };
            },
          );
        },

        deleteSection: (
          sectionId,
        ) => {
          set(
            (state) => {
              const currentSections =
                state.config.sections;

              const deletedIndex =
                currentSections.findIndex(
                  (section) =>
                    section.id ===
                    sectionId,
                );

              if (
                deletedIndex ===
                -1
              ) {
                return state;
              }

              const nextSections =
                currentSections.filter(
                  (section) =>
                    section.id !==
                    sectionId,
                );

              const nextConfig: PageConfig =
                {
                  ...state.config,

                  sections:
                    nextSections,
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
                      nextSections.length -
                        1,
                    )
                  ];

                nextSelectedId =
                  replacement?.id ??
                  null;
              }

              return {
                ...commitConfigChange(
                  state,
                  nextConfig,
                ),

                selectedSectionId:
                  nextSelectedId,
              };
            },
          );
        },

        duplicateSection: (
          sectionId,
        ) => {
          set(
            (state) => {
              const sourceIndex =
                state.config.sections.findIndex(
                  (section) =>
                    section.id ===
                    sectionId,
                );

              if (
                sourceIndex ===
                -1
              ) {
                return state;
              }

              const sourceSection =
                state.config
                  .sections[
                  sourceIndex
                ];

              const duplicatedSection =
                duplicateSectionWithFreshIds(
                  sourceSection,
                );

              const nextSections = [
                ...state.config.sections,
              ];

              nextSections.splice(
                sourceIndex + 1,
                0,
                duplicatedSection,
              );

              const nextConfig: PageConfig =
                {
                  ...state.config,

                  sections:
                    nextSections,
                };

              return {
                ...commitConfigChange(
                  state,
                  nextConfig,
                ),

                selectedSectionId:
                  duplicatedSection.id,
              };
            },
          );
        },

        reorderSections: (
          fromIndex,
          toIndex,
        ) => {
          set(
            (state) => {
              const nextSections =
                moveItem(
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

              const nextConfig: PageConfig =
                {
                  ...state.config,

                  sections:
                    nextSections,
                };

              return commitConfigChange(
                state,
                nextConfig,
              );
            },
          );
        },

        updateSectionProps: (
          sectionId,
          type,
          patch,
        ) => {
          set(
            (state) => {
              const targetSection =
                state.config.sections.find(
                  (section) =>
                    section.id ===
                      sectionId &&
                    section.type ===
                      type,
                );

              if (
                !targetSection
              ) {
                return state;
              }

              const hasChanges =
                Object.entries(
                  patch,
                ).some(
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

              if (
                !hasChanges
              ) {
                return state;
              }

              const nextConfig: PageConfig =
                {
                  ...state.config,

                  sections:
                    state.config.sections.map(
                      (section) => {
                        if (
                          section.id !==
                            sectionId ||
                          section.type !==
                            type
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

              return applyConfigChange(
                state,
                nextConfig,
              );
            },
          );
        },

        setSectionEnabled: (
          sectionId,
          enabled,
        ) => {
          set(
            (state) => {
              const targetSection =
                state.config.sections.find(
                  (section) =>
                    section.id ===
                    sectionId,
                );

              if (
                !targetSection
              ) {
                return state;
              }

              if (
                targetSection.enabled ===
                enabled
              ) {
                return state;
              }

              const nextConfig: PageConfig =
                {
                  ...state.config,

                  sections:
                    state.config.sections.map(
                      (section) =>
                        section.id ===
                        sectionId
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
            },
          );
        },

        updateSectionField: (sectionId, field, value) => {
  set((state) => {
    const targetSection = state.config.sections.find(
      (section) => section.id === sectionId,
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

    return {
      config: {
        ...state.config,

        sections: state.config.sections.map((section) =>
          section.id === sectionId
            ? ({
                ...section,
                props: {
                  ...section.props,
                  [field]: value,
                },
              } as PageSection)
            : section,
        ),
      },

      isDirty: true,
    };
  });
},

        addCollectionItem: (
          sectionId,
          collectionKey,
          item,
        ) => {
          set(
            (state) => {
              const targetSection =
                state.config.sections.find(
                  (section) =>
                    section.id ===
                    sectionId,
                );

              if (
                !targetSection
              ) {
                return state;
              }

              const currentValue =
                targetSection.props[
                  collectionKey as keyof typeof targetSection.props
                ];

              if (
                !Array.isArray(
                  currentValue,
                )
              ) {
                return state;
              }

              const nextConfig: PageConfig =
                {
                  ...state.config,

                  sections:
                    state.config.sections.map(
                      (section) => {
                        if (
                          section.id !==
                          sectionId
                        ) {
                          return section;
                        }

                        return {
                          ...section,

                          props: {
                            ...section.props,

                            [collectionKey]:
                              [
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
            },
          );
        },

        updateCollectionItem: (
          sectionId,
          collectionKey,
          itemId,
          patch,
        ) => {
          set(
            (state) => {
              const targetSection =
                state.config.sections.find(
                  (section) =>
                    section.id ===
                    sectionId,
                );

              if (
                !targetSection
              ) {
                return state;
              }

              const currentValue =
                targetSection.props[
                  collectionKey as keyof typeof targetSection.props
                ];

              if (
                !Array.isArray(
                  currentValue,
                )
              ) {
                return state;
              }

              let changed = false;

              const nextItems =
                currentValue.map(
                  (item) => {
                    if (
                      !item ||
                      typeof item !==
                        'object' ||
                      !('id' in item) ||
                      item.id !==
                        itemId
                    ) {
                      return item;
                    }

                    const hasChanges =
                      Object.entries(
                        patch,
                      ).some(
                        (
                          [
                            key,
                            value,
                          ],
                        ) =>
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

                    if (
                      !hasChanges
                    ) {
                      return item;
                    }

                    changed = true;

                    return {
                      ...item,
                      ...patch,
                    };
                  },
                );

              if (
                !changed
              ) {
                return state;
              }

              const nextConfig: PageConfig =
                {
                  ...state.config,

                  sections:
                    state.config.sections.map(
                      (section) => {
                        if (
                          section.id !==
                          sectionId
                        ) {
                          return section;
                        }

                        return {
                          ...section,

                          props: {
                            ...section.props,

                            [collectionKey]:
                              nextItems,
                          },
                        } as PageSection;
                      },
                    ),
                };

              return applyConfigChange(
                state,
                nextConfig,
              );
            },
          );
        },

        removeCollectionItem: (
          sectionId,
          collectionKey,
          itemId,
        ) => {
          set(
            (state) => {
              const targetSection =
                state.config.sections.find(
                  (section) =>
                    section.id ===
                    sectionId,
                );

              if (
                !targetSection
              ) {
                return state;
              }

              const currentValue =
                targetSection.props[
                  collectionKey as keyof typeof targetSection.props
                ];

              if (
                !Array.isArray(
                  currentValue,
                )
              ) {
                return state;
              }

              const nextItems =
                currentValue.filter(
                  (item) =>
                    !(
                      item &&
                      typeof item ===
                        'object' &&
                      'id' in item &&
                      item.id ===
                        itemId
                    ),
                );

              if (
                nextItems.length ===
                currentValue.length
              ) {
                return state;
              }

              const nextConfig: PageConfig =
                {
                  ...state.config,

                  sections:
                    state.config.sections.map(
                      (section) => {
                        if (
                          section.id !==
                          sectionId
                        ) {
                          return section;
                        }

                        return {
                          ...section,

                          props: {
                            ...section.props,

                            [collectionKey]:
                              nextItems,
                          },
                        } as PageSection;
                      },
                    ),
                };

              return commitConfigChange(
                state,
                nextConfig,
              );
            },
          );
        },

        reorderCollectionItems: (
          sectionId,
          collectionKey,
          fromIndex,
          toIndex,
        ) => {
          set(
            (state) => {
              if (
                fromIndex ===
                  toIndex ||
                fromIndex < 0 ||
                toIndex < 0
              ) {
                return state;
              }

              const targetSection =
                state.config.sections.find(
                  (section) =>
                    section.id ===
                    sectionId,
                );

              if (
                !targetSection
              ) {
                return state;
              }

              const currentValue =
                targetSection.props[
                  collectionKey as keyof typeof targetSection.props
                ];

              if (
                !Array.isArray(
                  currentValue,
                ) ||
                fromIndex >=
                  currentValue.length ||
                toIndex >=
                  currentValue.length
              ) {
                return state;
              }

              const nextItems =
                moveItem(
                  currentValue,
                  fromIndex,
                  toIndex,
                );

              if (
                nextItems ===
                currentValue
              ) {
                return state;
              }

              const nextConfig: PageConfig =
                {
                  ...state.config,

                  sections:
                    state.config.sections.map(
                      (section) => {
                        if (
                          section.id !==
                          sectionId
                        ) {
                          return section;
                        }

                        return {
                          ...section,

                          props: {
                            ...section.props,

                            [collectionKey]:
                              nextItems,
                          },
                        } as PageSection;
                      },
                    ),
                };

              return commitConfigChange(
                state,
                nextConfig,
              );
            },
          );
        },

        beginHistoryTransaction:
          () => {
            set(
              (state) => {
                if (
                  activeHistoryTransaction
                ) {
                  return state;
                }

                activeHistoryTransaction =
                  cloneConfig(
                    state.config,
                  );

                historyTransactionChanged =
                  false;

                return state;
              },
            );
          },

        endHistoryTransaction:
          () => {
            set(
              (state) => {
                if (
                  !activeHistoryTransaction
                ) {
                  return state;
                }

                if (
                  !historyTransactionChanged ||
                  configsEqual(
                    state.config,
                    activeHistoryTransaction,
                  )
                ) {
                  clearHistoryTransaction();

                  return {
                    isDirty:
                      getDirtyState(
                        state.config,
                        state.savedConfig,
                      ),
                  };
                }

                const historyBase =
                  activeHistoryTransaction;

                clearHistoryTransaction();

                return {
                  past: pushHistory(
                    state.past,
                    historyBase,
                  ),

                  future: [],

                  isDirty:
                    getDirtyState(
                      state.config,
                      state.savedConfig,
                    ),
                };
              },
            );
          },

        hydrateConfig: (
          config,
        ) => {
          set(
            (state) => {
              const nextConfig =
                cloneConfig(
                  config,
                );

              clearHistoryTransaction();

              return {
                config:
                  nextConfig,

                savedConfig:
                  cloneConfig(
                    nextConfig,
                  ),

                past: [],

                future: [],

                isDirty: false,

                selectedSectionId:
                  resolveSelectedSectionId(
                    state.selectedSectionId,
                    nextConfig,
                  ),
              };
            },
          );
        },

        markSaved: () => {
          set(
            (state) => {
              const savedConfig =
                cloneConfig(
                  state.config,
                );

              return {
                savedConfig,

                isDirty: false,
              };
            },
          );
        },

        undo: () => {
          set(
            (state) => {
              if (
                activeHistoryTransaction &&
                historyTransactionChanged
              ) {
                const transactionBase =
                  activeHistoryTransaction;

                const currentConfig =
                  state.config;

                clearHistoryTransaction();

                return {
                  config:
                    transactionBase,

                  past:
                    state.past,

                  future: [
                    ...state.future,
                    cloneConfig(
                      currentConfig,
                    ),
                  ].slice(
                    -MAX_HISTORY_ENTRIES,
                  ),

                  selectedSectionId:
                    resolveSelectedSectionId(
                      state.selectedSectionId,
                      transactionBase,
                    ),

                  isDirty:
                    getDirtyState(
                      transactionBase,
                      state.savedConfig,
                    ),
                };
              }

              clearHistoryTransaction();

              if (
                state.past.length ===
                0
              ) {
                return state;
              }

              const previousConfig =
                state.past[
                  state.past.length -
                    1
                ];

              const nextPast =
                state.past.slice(
                  0,
                  -1,
                );

              const nextFuture = [
                ...state.future,
                cloneConfig(
                  state.config,
                ),
              ].slice(
                -MAX_HISTORY_ENTRIES,
              );

              return {
                config:
                  previousConfig,

                past:
                  nextPast,

                future:
                  nextFuture,

                selectedSectionId:
                  resolveSelectedSectionId(
                    state.selectedSectionId,
                    previousConfig,
                  ),

                isDirty:
                  getDirtyState(
                    previousConfig,
                    state.savedConfig,
                  ),
              };
            },
          );
        },

        redo: () => {
          set(
            (state) => {
              clearHistoryTransaction();

              if (
                state.future.length ===
                0
              ) {
                return state;
              }

              const nextConfig =
                state.future[
                  state.future.length -
                    1
                ];

              const nextFuture =
                state.future.slice(
                  0,
                  -1,
                );

              const nextPast = [
                ...state.past,
                cloneConfig(
                  state.config,
                ),
              ].slice(
                -MAX_HISTORY_ENTRIES,
              );

              return {
                config:
                  nextConfig,

                past:
                  nextPast,

                future:
                  nextFuture,

                selectedSectionId:
                  resolveSelectedSectionId(
                    state.selectedSectionId,
                    nextConfig,
                  ),

                isDirty:
                  getDirtyState(
                    nextConfig,
                    state.savedConfig,
                  ),
              };
            },
          );
        },
      }),
    );
  };