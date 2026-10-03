// @vitest-environment jsdom

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CollectionField from './CollectionField';

import {
  PageEditorProvider,
  usePageEditorStore,
} from '../../providers/page-editor-provider';

import { samplePage } from '../../domain/sample-page';
import type { FeaturesSection } from '../../domain/page-schema';

import {
  getSectionPropertyDefinition,
} from '../../domain/section-properties';

function TestHarness() {
  const featuresSection =
    usePageEditorStore((state) =>
      state.config.sections.find(
        (section): section is FeaturesSection =>
          section.id === 'features-1' &&
          section.type === 'features',
      ),
    );

  const definition =
    getSectionPropertyDefinition('features');

  const collectionField =
    definition.fields.find(
      (field) =>
        field.type === 'collection' &&
        field.key === 'items',
    );

  if (!featuresSection) {
    throw new Error(
      'Features section not found in test configuration',
    );
  }

  if (
    !collectionField ||
    collectionField.type !== 'collection'
  ) {
    throw new Error(
      'Features collection field not found',
    );
  }

  return (
    <CollectionField
      sectionId={featuresSection.id}
      collectionKey={String(collectionField.key)}
      label={collectionField.label}
      itemLabel={collectionField.itemLabel}
      items={featuresSection.props.items}
      fields={collectionField.fields}
      summaryField={
        collectionField.summaryField
          ? String(collectionField.summaryField)
          : undefined
      }
      createItem={collectionField.createItem}
    />
  );
}

function renderCollectionField() {
  return render(
    <PageEditorProvider initialConfig={samplePage}>
      <TestHarness />
    </PageEditorProvider>,
  );
}

describe('CollectionField', () => {
  it('renders the collection label and item count', () => {
    renderCollectionField();

    expect(
      screen.getByText('Features'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('3 items'),
    ).toBeInTheDocument();
  });

  it('renders each collection item with its summary', () => {
    renderCollectionField();

    expect(
      screen.getByText('Feature 1'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Feature 2'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Feature 3'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Automate'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Collaborate'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Measure'),
    ).toBeInTheDocument();
  });

  it('expands and collapses a collection item', async () => {
    const user = userEvent.setup();

    renderCollectionField();

    const firstItemToggle =
      screen.getByRole('button', {
        name: 'Expand Feature 1',
      });

    expect(
      screen.queryByLabelText('Title'),
    ).not.toBeInTheDocument();

    await user.click(firstItemToggle);

    expect(
      screen.getByLabelText('Title'),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue('Automate'),
    ).toBeInTheDocument();

    expect(
      firstItemToggle,
    ).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Collapse Feature 1',
      }),
    );

    expect(
      screen.queryByDisplayValue('Automate'),
    ).not.toBeInTheDocument();
  });

  it('adds a new collection item and expands it', async () => {
    const user = userEvent.setup();

    renderCollectionField();

    expect(
      screen.getByText('3 items'),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: '+ Add',
      }),
    );

    expect(
      screen.getByText('4 items'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Collapse Feature 4',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue('New Feature'),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue(
        'Describe this feature.',
      ),
    ).toBeInTheDocument();
  });

  it('updates an item field through the editor store', async () => {
    const user = userEvent.setup();

    renderCollectionField();

    await user.click(
      screen.getByRole('button', {
        name: 'Expand Feature 1',
      }),
    );

    const titleInput =
      screen.getByDisplayValue('Automate');

    await user.clear(titleInput);
    await user.type(
      titleInput,
      'Automate Everything',
    );

    expect(
      screen.getByDisplayValue(
        'Automate Everything',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Automate Everything'),
    ).toBeInTheDocument();
  });

  it('deletes a collection item', async () => {
    const user = userEvent.setup();

    renderCollectionField();

    expect(
      screen.getByText('3 items'),
    ).toBeInTheDocument();

    const deleteButtons =
      screen.getAllByRole('button', {
        name: 'Delete',
      });

    expect(deleteButtons).toHaveLength(3);

    await user.click(deleteButtons[0]);

    expect(
      screen.getByText('2 items'),
    ).toBeInTheDocument();

    expect(
      screen.queryByText('Automate'),
    ).not.toBeInTheDocument();
  });

  it('reorders collection items using the move down button', async () => {
    const user = userEvent.setup();

    renderCollectionField();

    const moveDownButtons =
      screen.getAllByRole('button', {
        name: /Move Feature .* down/,
      });

    expect(moveDownButtons).toHaveLength(3);

    await user.click(moveDownButtons[0]);

    const itemButtons =
      screen.getAllByRole('button', {
        name: /Expand Feature|Collapse Feature/,
      });

    expect(itemButtons[0]).toHaveAccessibleName(
      'Expand Feature 2',
    );

    expect(itemButtons[1]).toHaveAccessibleName(
      'Expand Feature 1',
    );
  });
});