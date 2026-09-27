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

  selectSection: (sectionId: string | null) => void;

  addSection: (type: SectionType) => void;

  deleteSection: (sectionId: string) => void;

  duplicateSection: (sectionId: string) => void;

  reorderSections: (fromIndex: number, toIndex: number) => void;

  updateSectionProps: <T extends SectionType>(
    sectionId: string,
    type: T,
    patch: Partial<PropsFor<T>>,
  ) => void;

  setSectionEnabled: (sectionId: string, enabled: boolean) => void;

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
};

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
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

  const [movedItem] = nextItems.splice(fromIndex, 1);

  nextItems.splice(toIndex, 0, movedItem);

  return nextItems;
}

export const createPageEditorStore = (initialConfig: PageConfig) =>
  createStore<PageEditorState>()((set) => ({
    config: initialConfig,

    selectedSectionId: initialConfig.sections[0]?.id ?? null,

    isDirty: false,

    selectSection: (sectionId) => {
      set({
        selectedSectionId: sectionId,
      });
    },

    addSection: (type) => {
      set((state) => {
        const newSection = createDefaultSection(type);

        const currentSections = state.config.sections;

        const selectedIndex = state.selectedSectionId
          ? currentSections.findIndex(
              (section) => section.id === state.selectedSectionId,
            )
          : -1;

        const insertIndex =
          selectedIndex >= 0 ? selectedIndex + 1 : currentSections.length;

        const nextSections = [...currentSections];

        nextSections.splice(insertIndex, 0, newSection);

        return {
          config: {
            ...state.config,
            sections: nextSections,
          },

          selectedSectionId: newSection.id,

          isDirty: true,
        };
      });
    },

    deleteSection: (sectionId) => {
      set((state) => {
        const currentSections = state.config.sections;

        const deletedIndex = currentSections.findIndex(
          (section) => section.id === sectionId,
        );

        if (deletedIndex === -1) {
          return state;
        }

        const nextSections = currentSections.filter(
          (section) => section.id !== sectionId,
        );

        let nextSelectedId = state.selectedSectionId;

        if (state.selectedSectionId === sectionId) {
          const replacement =
            nextSections[Math.min(deletedIndex, nextSections.length - 1)];

          nextSelectedId = replacement?.id ?? null;
        }

        return {
          config: {
            ...state.config,
            sections: nextSections,
          },

          selectedSectionId: nextSelectedId,

          isDirty: true,
        };
      });
    },

    duplicateSection: (sectionId) => {
      set((state) => {
        const sourceIndex = state.config.sections.findIndex(
          (section) => section.id === sectionId,
        );

        if (sourceIndex === -1) {
          return state;
        }

        const sourceSection = state.config.sections[sourceIndex];

        const duplicatedSection = structuredClone(sourceSection);

        duplicatedSection.id = crypto.randomUUID();

        if (duplicatedSection.type === 'features') {
          duplicatedSection.props.items = duplicatedSection.props.items.map(
            (item) => ({
              ...item,
              id: crypto.randomUUID(),
            }),
          );
        }

        if (duplicatedSection.type === 'testimonials') {
          duplicatedSection.props.items = duplicatedSection.props.items.map(
            (item) => ({
              ...item,
              id: crypto.randomUUID(),
            }),
          );
        }

        const nextSections = [...state.config.sections];

        nextSections.splice(sourceIndex + 1, 0, duplicatedSection);

        return {
          config: {
            ...state.config,
            sections: nextSections,
          },

          selectedSectionId: duplicatedSection.id,

          isDirty: true,
        };
      });
    },

    reorderSections: (fromIndex, toIndex) => {
      set((state) => {
        const nextSections = moveItem(
          state.config.sections,
          fromIndex,
          toIndex,
        );

        if (nextSections === state.config.sections) {
          return state;
        }

        return {
          config: {
            ...state.config,
            sections: nextSections,
          },

          isDirty: true,
        };
      });
    },

    updateSectionProps: (sectionId, type, patch) => {
      set((state) => ({
        config: {
          ...state.config,

          sections: state.config.sections.map((section) => {
            if (section.id !== sectionId || section.type !== type) {
              return section;
            }

            return {
              ...section,

              props: {
                ...section.props,
                ...patch,
              },
            } as PageSection;
          }),
        },

        isDirty: true,
      }));
    },

    setSectionEnabled: (sectionId, enabled) => {
      set((state) => ({
        config: {
          ...state.config,

          sections: state.config.sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  enabled,
                }
              : section,
          ),
        },

        isDirty: true,
      }));
    },

    updateSectionField: (sectionId, field, value) => {
      set((state) => {
        const targetSection = state.config.sections.find(
          (section) => section.id === sectionId,
        );

        if (!targetSection) {
          return state;
        }

        if (!Object.prototype.hasOwnProperty.call(targetSection.props, field)) {
          return state;
        }

        return {
          config: {
            ...state.config,

            sections: state.config.sections.map((section) =>
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
          },

          isDirty: true,
        };
      });
    },

    addCollectionItem: (sectionId, collectionKey, item) => {
      set((state) => ({
        config: {
          ...state.config,

          sections: state.config.sections.map((section) => {
            if (section.id !== sectionId) {
              return section;
            }

            const currentValue =
              section.props[collectionKey as keyof typeof section.props];

            if (!Array.isArray(currentValue)) {
              return section;
            }

            return {
              ...section,

              props: {
                ...section.props,

                [collectionKey]: [...currentValue, item],
              },
            } as PageSection;
          }),
        },

        isDirty: true,
      }));
    },

    updateCollectionItem: (sectionId, collectionKey, itemId, patch) => {
      set((state) => ({
        config: {
          ...state.config,

          sections: state.config.sections.map((section) => {
            if (section.id !== sectionId) {
              return section;
            }

            const currentValue =
              section.props[collectionKey as keyof typeof section.props];

            if (!Array.isArray(currentValue)) {
              return section;
            }

            return {
              ...section,

              props: {
                ...section.props,

                [collectionKey]: currentValue.map((item) =>
                  item &&
                  typeof item === 'object' &&
                  'id' in item &&
                  item.id === itemId
                    ? {
                        ...item,
                        ...patch,
                      }
                    : item,
                ),
              },
            } as PageSection;
          }),
        },

        isDirty: true,
      }));
    },

    removeCollectionItem: (sectionId, collectionKey, itemId) => {
      set((state) => ({
        config: {
          ...state.config,

          sections: state.config.sections.map((section) => {
            if (section.id !== sectionId) {
              return section;
            }

            const currentValue =
              section.props[collectionKey as keyof typeof section.props];

            if (!Array.isArray(currentValue)) {
              return section;
            }

            return {
              ...section,

              props: {
                ...section.props,

                [collectionKey]: currentValue.filter(
                  (item) =>
                    !(
                      item &&
                      typeof item === 'object' &&
                      'id' in item &&
                      item.id === itemId
                    ),
                ),
              },
            } as PageSection;
          }),
        },

        isDirty: true,
      }));
    },

    reorderCollectionItems: (sectionId, collectionKey, fromIndex, toIndex) => {
      set((state) => {
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
          return state;
        }

        return {
          config: {
            ...state.config,

            sections: state.config.sections.map((section) => {
              if (section.id !== sectionId) {
                return section;
              }

              const currentValue =
                section.props[collectionKey as keyof typeof section.props];

              if (
                !Array.isArray(currentValue) ||
                fromIndex >= currentValue.length ||
                toIndex >= currentValue.length
              ) {
                return section;
              }

              const nextItems = [...currentValue];

              const [movedItem] = nextItems.splice(fromIndex, 1);

              nextItems.splice(toIndex, 0, movedItem);

              return {
                ...section,

                props: {
                  ...section.props,

                  [collectionKey]: nextItems,
                },
              } as PageSection;
            }),
          },

          isDirty: true,
        };
      });
    },
  }));
