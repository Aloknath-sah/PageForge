import { describe, expect, it } from 'vitest';

import { samplePage } from '../domain/sample-page';
import {
  createPageEditorStore,
} from './page-editor-store';

function createTestStore() {
  return createPageEditorStore(
    structuredClone(samplePage),
  );
}

describe('page-editor-store', () => {
  it('initializes with the provided config', () => {
    const store = createTestStore();
    const state = store.getState();

    expect(state.config).toEqual(samplePage);

    expect(state.selectedSectionId).toBe(
      samplePage.sections[0].id,
    );

    expect(state.isDirty).toBe(false);
  });

  it('selects a section', () => {
    const store = createTestStore();

    const featuresSection =
      samplePage.sections.find(
        (section) => section.type === 'features',
      );

    expect(featuresSection).toBeDefined();

    store
      .getState()
      .selectSection(
        featuresSection!.id,
      );

    expect(
      store.getState().selectedSectionId,
    ).toBe(featuresSection!.id);
  });

  it('adds a section after the selected section', () => {
    const store = createTestStore();

    const featuresSection =
      samplePage.sections.find(
        (section) => section.type === 'features',
      );

    expect(featuresSection).toBeDefined();

    store
      .getState()
      .selectSection(
        featuresSection!.id,
      );

    store
      .getState()
      .addSection('cta');

    const state = store.getState();

    const sections =
      state.config.sections;

    const insertedIndex =
      sections.findIndex(
        (section) =>
          section.id ===
          state.selectedSectionId,
      );

    expect(insertedIndex).toBe(2);

    expect(
      sections[insertedIndex].type,
    ).toBe('cta');

    expect(state.isDirty).toBe(true);
  });

  it('adds a section to the end when nothing is selected', () => {
    const store = createTestStore();

    store
      .getState()
      .selectSection(null);

    const initialLength =
      store.getState().config.sections.length;

    store
      .getState()
      .addSection('hero');

    const state = store.getState();

    expect(
      state.config.sections,
    ).toHaveLength(initialLength + 1);

    expect(
      state.config.sections.at(-1)?.type,
    ).toBe('hero');

    expect(
      state.selectedSectionId,
    ).toBe(
      state.config.sections.at(-1)?.id,
    );
  });

  it('deletes the selected section and selects a replacement', () => {
    const store = createTestStore();

    const firstSectionId =
      store.getState().config.sections[0].id;

    const secondSectionId =
      store.getState().config.sections[1].id;

    store
      .getState()
      .selectSection(firstSectionId);

    store
      .getState()
      .deleteSection(firstSectionId);

    const state = store.getState();

    expect(
      state.config.sections.some(
        (section) =>
          section.id === firstSectionId,
      ),
    ).toBe(false);

    expect(
      state.selectedSectionId,
    ).toBe(secondSectionId);

    expect(state.isDirty).toBe(true);
  });

  it('ignores deletion of an unknown section', () => {
    const store = createTestStore();

    const before =
      store.getState();

    store
      .getState()
      .deleteSection('missing-section');

    const after =
      store.getState();

    expect(after.config).toBe(
      before.config,
    );

    expect(
      after.selectedSectionId,
    ).toBe(before.selectedSectionId);

    expect(after.isDirty).toBe(
      before.isDirty,
    );
  });

  it('duplicates a section with a new section id', () => {
    const store = createTestStore();

    const source =
      store.getState().config.sections.find(
        (section) =>
          section.type === 'hero',
      );

    expect(source).toBeDefined();

    store
      .getState()
      .duplicateSection(
        source!.id,
      );

    const state = store.getState();

    const duplicated =
      state.config.sections[
        state.config.sections.findIndex(
          (section) =>
            section.id ===
            source!.id,
        ) + 1
      ];

    expect(duplicated).toBeDefined();

    expect(duplicated.id).not.toBe(
      source!.id,
    );

    expect(duplicated.type).toBe(
      source!.type,
    );

    expect(
      state.selectedSectionId,
    ).toBe(duplicated.id);

    expect(state.isDirty).toBe(true);
  });

  it('duplicates nested collection items with new ids', () => {
    const store = createTestStore();

    const source =
      store.getState().config.sections.find(
        (section) =>
          section.type === 'features',
      );

    expect(source).toBeDefined();
    expect(source?.type).toBe(
      'features',
    );

    const originalItemIds =
      source!.props.items.map(
        (item) => item.id,
      );

    store
      .getState()
      .duplicateSection(
        source!.id,
      );

    const sections =
      store.getState().config.sections;

    const sourceIndex =
      sections.findIndex(
        (section) =>
          section.id ===
          source!.id,
      );

    const duplicated =
      sections[sourceIndex + 1];

    expect(
      duplicated.type,
    ).toBe('features');

    const duplicatedItemIds =
      duplicated.props.items.map(
        (item) => item.id,
      );

    expect(
      duplicatedItemIds,
    ).not.toEqual(
      originalItemIds,
    );

    expect(
      duplicatedItemIds.some(
        (id) =>
          originalItemIds.includes(id),
      ),
    ).toBe(false);
  });

  it('reorders sections while preserving section identity', () => {
    const store = createTestStore();

    const initialOrder =
      store
        .getState()
        .config.sections.map(
          (section) => section.id,
        );

    store
      .getState()
      .reorderSections(0, 2);

    const nextOrder =
      store
        .getState()
        .config.sections.map(
          (section) => section.id,
        );

    expect(nextOrder).toEqual([
      initialOrder[1],
      initialOrder[2],
      initialOrder[0],
    ]);

    expect(
      new Set(nextOrder).size,
    ).toBe(initialOrder.length);

    expect(
      store.getState().isDirty,
    ).toBe(true);
  });

  it('ignores an invalid section reorder', () => {
    const store = createTestStore();

    const before =
      store
        .getState()
        .config.sections.map(
          (section) => section.id,
        );

    store
      .getState()
      .reorderSections(-1, 2);

    const after =
      store
        .getState()
        .config.sections.map(
          (section) => section.id,
        );

    expect(after).toEqual(before);

    expect(
      store.getState().isDirty,
    ).toBe(false);
  });

  it('updates typed section props', () => {
    const store = createTestStore();

    const hero =
      store.getState().config.sections.find(
        (section) =>
          section.type === 'hero',
      );

    expect(hero).toBeDefined();

    store
      .getState()
      .updateSectionProps(
        hero!.id,
        'hero',
        {
          title: 'Updated title',
          description:
            'Updated description',
        },
      );

    const updated =
      store.getState().config.sections.find(
        (section) =>
          section.id === hero!.id,
      );

    expect(updated?.type).toBe(
      'hero',
    );

    if (updated?.type === 'hero') {
      expect(updated.props.title).toBe(
        'Updated title',
      );

      expect(
        updated.props.description,
      ).toBe(
        'Updated description',
      );
    }

    expect(
      store.getState().isDirty,
    ).toBe(true);
  });

  it('does not update a section when the type does not match', () => {
    const store = createTestStore();

    const hero =
      store.getState().config.sections.find(
        (section) =>
          section.type === 'hero',
      );

    expect(hero).toBeDefined();

    const before =
      store.getState().config.sections;

    store
      .getState()
      .updateSectionProps(
        hero!.id,
        'cta',
        {
          title: 'Should not update',
        },
      );

    expect(
      store.getState().config.sections,
    ).not.toBe(before);

    const updatedHero =
      store.getState().config.sections.find(
        (section) =>
          section.id === hero!.id,
      );

    expect(updatedHero?.type).toBe(
      'hero',
    );

    if (updatedHero?.type === 'hero') {
      expect(
        updatedHero.props.title,
      ).toBe(
        hero!.props.title,
      );
    }
  });

  it('enables and disables a section', () => {
    const store = createTestStore();

    const hero =
      store.getState().config.sections.find(
        (section) =>
          section.type === 'hero',
      );

    expect(hero).toBeDefined();

    store
      .getState()
      .setSectionEnabled(
        hero!.id,
        false,
      );

    expect(
      store.getState().config.sections.find(
        (section) =>
          section.id === hero!.id,
      )?.enabled,
    ).toBe(false);

    store
      .getState()
      .setSectionEnabled(
        hero!.id,
        true,
      );

    expect(
      store.getState().config.sections.find(
        (section) =>
          section.id === hero!.id,
      )?.enabled,
    ).toBe(true);

    expect(
      store.getState().isDirty,
    ).toBe(true);
  });

  it('updates an existing section field', () => {
    const store = createTestStore();

    const hero =
      store.getState().config.sections.find(
        (section) =>
          section.type === 'hero',
      );

    expect(hero).toBeDefined();

    store
      .getState()
      .updateSectionField(
        hero!.id,
        'title',
        'Field updated',
      );

    const updated =
      store.getState().config.sections.find(
        (section) =>
          section.id === hero!.id,
      );

    if (updated?.type === 'hero') {
      expect(updated.props.title).toBe(
        'Field updated',
      );
    }

    expect(
      store.getState().isDirty,
    ).toBe(true);
  });

  it('adds a collection item', () => {
    const store = createTestStore();

    const features =
      store.getState().config.sections.find(
        (section) =>
          section.type === 'features',
      );

    expect(features).toBeDefined();

    const initialCount =
      features!.type === 'features'
        ? features.props.items.length
        : 0;

    store
      .getState()
      .addCollectionItem(
        features!.id,
        'items',
        {
          id: 'feature-new',
          title: 'New feature',
          description:
            'New feature description',
        },
      );

    const updated =
      store.getState().config.sections.find(
        (section) =>
          section.id === features!.id,
      );

    expect(updated?.type).toBe(
      'features',
    );

    if (updated?.type === 'features') {
      expect(
        updated.props.items,
      ).toHaveLength(
        initialCount + 1,
      );

      expect(
        updated.props.items.at(-1),
      ).toEqual({
        id: 'feature-new',
        title: 'New feature',
        description:
          'New feature description',
      });
    }

    expect(
      store.getState().isDirty,
    ).toBe(true);
  });

  it('updates a collection item', () => {
    const store = createTestStore();

    const features =
      store.getState().config.sections.find(
        (section) =>
          section.type === 'features',
      );

    expect(features).toBeDefined();

    const itemId =
      features!.type === 'features'
        ? features.props.items[0].id
        : '';

    store
      .getState()
      .updateCollectionItem(
        features!.id,
        'items',
        itemId,
        {
          title: 'Updated feature',
        },
      );

    const updated =
      store.getState().config.sections.find(
        (section) =>
          section.id === features!.id,
      );

    if (updated?.type === 'features') {
      expect(
        updated.props.items[0].title,
      ).toBe(
        'Updated feature',
      );
    }

    expect(
      store.getState().isDirty,
    ).toBe(true);
  });

  it('removes a collection item', () => {
    const store = createTestStore();

    const features =
      store.getState().config.sections.find(
        (section) =>
          section.type === 'features',
      );

    expect(features).toBeDefined();

    const firstItemId =
      features!.type === 'features'
        ? features.props.items[0].id
        : '';

    const initialCount =
      features!.type === 'features'
        ? features.props.items.length
        : 0;

    store
      .getState()
      .removeCollectionItem(
        features!.id,
        'items',
        firstItemId,
      );

    const updated =
      store.getState().config.sections.find(
        (section) =>
          section.id === features!.id,
      );

    if (updated?.type === 'features') {
      expect(
        updated.props.items,
      ).toHaveLength(
        initialCount - 1,
      );

      expect(
        updated.props.items.some(
          (item) =>
            item.id ===
            firstItemId,
        ),
      ).toBe(false);
    }

    expect(
      store.getState().isDirty,
    ).toBe(true);
  });

  it('reorders collection items', () => {
    const store = createTestStore();

    const features =
      store.getState().config.sections.find(
        (section) =>
          section.type === 'features',
      );

    expect(features).toBeDefined();

    const initialIds =
      features!.type === 'features'
        ? features.props.items.map(
            (item) => item.id,
          )
        : [];

    store
      .getState()
      .reorderCollectionItems(
        features!.id,
        'items',
        0,
        2,
      );

    const updated =
      store.getState().config.sections.find(
        (section) =>
          section.id === features!.id,
      );

    if (updated?.type === 'features') {
      expect(
        updated.props.items.map(
          (item) => item.id,
        ),
      ).toEqual([
        initialIds[1],
        initialIds[2],
        initialIds[0],
      ]);
    }

    expect(
      store.getState().isDirty,
    ).toBe(true);
  });
});