// @vitest-environment jsdom

import { useEffect } from 'react';

import {
  render,
  screen,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import {
  describe,
  expect,
  it,
} from 'vitest';

import SectionSettings from './SectionSettings';

import {
  PageEditorProvider,
  usePageEditorStore,
} from '../../providers/page-editor-provider';

import { samplePage } from '../../domain/sample-page';

function SelectSection({
  sectionId,
}: {
  sectionId: string;
}) {
  const selectSection = usePageEditorStore(
    (state) => state.selectSection,
  );

  useEffect(() => {
    selectSection(sectionId);
  }, [sectionId, selectSection]);

  return null;
}

function renderSettings(
  sectionId?: string,
) {
  return render(
    <PageEditorProvider initialConfig={samplePage}>
      {sectionId && (
        <SelectSection sectionId={sectionId} />
      )}

      <SectionSettings />
    </PageEditorProvider>,
  );
}

describe('SectionSettings', () => {
  it('shows the empty state when no section is selected', () => {
    renderSettings();

    expect(
      screen.getByText(
        'Select a section to edit its content.',
      ),
    ).toBeInTheDocument();
  });

  it('renders settings for the selected hero section', async () => {
    renderSettings('hero-1');

    expect(
      await screen.findByRole('heading', {
        name: 'Hero',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Section settings',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Introduce your product and primary call to action.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the section visibility control', async () => {
    renderSettings('hero-1');

    const visibilityToggle =
      await screen.findByRole(
        'checkbox',
        {
          name: 'Toggle section visibility',
        },
      );

    expect(
      visibilityToggle,
    ).toBeChecked();
  });

  it('updates section visibility through the store', async () => {
    const user = userEvent.setup();

    renderSettings('hero-1');

    const visibilityToggle =
      await screen.findByRole(
        'checkbox',
        {
          name: 'Toggle section visibility',
        },
      );

    expect(
      visibilityToggle,
    ).toBeChecked();

    await user.click(
      visibilityToggle,
    );

    expect(
      visibilityToggle,
    ).not.toBeChecked();

    await user.click(
      visibilityToggle,
    );

    expect(
      visibilityToggle,
    ).toBeChecked();
  });

  it('renders hero scalar properties', async () => {
    renderSettings('hero-1');

    expect(
      await screen.findByDisplayValue(
        'Build your business faster',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue(
        'Build faster workflows without repetitive manual work.',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue(
        'Get Started',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue(
        '/signup',
      ),
    ).toBeInTheDocument();
  });

  it('updates a scalar section property', async () => {
    const user = userEvent.setup();

    renderSettings('hero-1');

    const titleInput =
      await screen.findByDisplayValue(
        'Build your business faster',
      );

    await user.clear(titleInput);

    await user.type(
      titleInput,
      'Build products faster',
    );

    expect(
      screen.getByDisplayValue(
        'Build products faster',
      ),
    ).toBeInTheDocument();
  });

  it('renders the features collection editor', async () => {
    renderSettings('features-1');

    expect(
      await screen.findByRole(
        'heading',
        {
          name: 'Features',
        },
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Everything you need',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /3 items/,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: '+ Add',
      }),
    ).toBeInTheDocument();
  });

  it('renders the features collection items', async () => {
    renderSettings('features-1');

    expect(
      await screen.findByText(
        'Feature 1',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Feature 2',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Feature 3',
      ),
    ).toBeInTheDocument();
  });
});