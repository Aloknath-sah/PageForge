import { createStore } from "zustand/vanilla";

import type {
  PageConfig,
  PageSection,
  SectionType,
} from "../domain/page-schema";

type PropsFor<T extends SectionType> = Extract<
  PageSection,
  { type: T }
>["props"];

export type PageEditorState = {
  config: PageConfig;
  selectedSectionId: string | null;
  isDirty: boolean;

  selectSection: (sectionId: string | null) => void;

  updateSectionProps: <T extends SectionType>(
    sectionId: string,
    type: T,
    patch: Partial<PropsFor<T>>,
  ) => void;

  setSectionEnabled: (
    sectionId: string,
    enabled: boolean,
  ) => void;
};

export const createPageEditorStore = (
  initialConfig: PageConfig,
) =>
  createStore<PageEditorState>()((set) => ({
    config: initialConfig,

    selectedSectionId:
      initialConfig.sections[0]?.id ?? null,

    isDirty: false,

    selectSection: (sectionId) => {
      set({
        selectedSectionId: sectionId,
      });
    },

    updateSectionProps: (sectionId, type, patch) => {
      set((state) => ({
        config: {
          ...state.config,

          sections: state.config.sections.map(
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
        },

        isDirty: true,
      }));
    },

    setSectionEnabled: (
      sectionId,
      enabled,
    ) => {
      set((state) => ({
        config: {
          ...state.config,

          sections: state.config.sections.map(
            (section) =>
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
  }));