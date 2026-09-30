import { describe, expect, it } from 'vitest';

import { createDefaultSection } from './section-factory';

describe('createDefaultSection', () => {
  it('creates a valid hero section', () => {
    const section =
      createDefaultSection('hero');

    expect(section.type).toBe('hero');
    expect(section.enabled).toBe(true);
    expect(section.id).toBeTruthy();

    expect(section.props.title).toBe(
      'Build something amazing',
    );

    expect(
      section.props.primaryCtaText,
    ).toBe('Get Started');

    expect(
      section.props.primaryCtaUrl,
    ).toBe('#');
  });

  it('creates a features section with default items', () => {
    const section =
      createDefaultSection('features');

    expect(section.type).toBe('features');
    expect(section.enabled).toBe(true);
    expect(section.props.items).toHaveLength(3);

    for (const item of section.props.items) {
      expect(item.id).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(item.description).toBeTruthy();
    }
  });

  it('creates a testimonials section with default items', () => {
    const section =
      createDefaultSection('testimonials');

    expect(section.type).toBe(
      'testimonials',
    );

    expect(section.enabled).toBe(true);
    expect(section.props.items).toHaveLength(1);

    expect(
      section.props.items[0].id,
    ).toBeTruthy();

    expect(
      section.props.items[0].name,
    ).toBeTruthy();

    expect(
      section.props.items[0].quote,
    ).toBeTruthy();
  });

  it('creates a cta section', () => {
    const section =
      createDefaultSection('cta');

    expect(section.type).toBe('cta');
    expect(section.enabled).toBe(true);

    expect(section.props.title).toBe(
      'Ready to get started?',
    );

    expect(
      section.props.buttonText,
    ).toBe('Get Started');

    expect(
      section.props.buttonUrl,
    ).toBe('#');
  });

  it('creates unique section IDs', () => {
    const first =
      createDefaultSection('hero');

    const second =
      createDefaultSection('hero');

    expect(first.id).not.toBe(second.id);
  });

  it('creates unique collection item IDs', () => {
    const first =
      createDefaultSection('features');

    const second =
      createDefaultSection('features');

    const firstIds =
      first.props.items.map(
        (item) => item.id,
      );

    const secondIds =
      second.props.items.map(
        (item) => item.id,
      );

    expect(
      firstIds.some(
        (id) => secondIds.includes(id),
      ),
    ).toBe(false);
  });
});