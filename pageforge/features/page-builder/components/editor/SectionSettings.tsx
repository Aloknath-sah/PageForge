'use client';

import PropertyField from './PropertyField';
import CollectionField from './CollectionField';

import { usePageEditorStore } from '../../providers/page-editor-provider';

import {
  getSectionPropertyDefinition,
} from '../../domain/section-properties';

import { validatePageConfig } from '../../domain/page-validation';

export default function SectionSettings() {
  const config = usePageEditorStore(
    (state) => state.config,
  );

  const selectedSection = usePageEditorStore((state) => {
    const id = state.selectedSectionId;

    return (
      state.config.sections.find(
        (section) => section.id === id,
      ) ?? null
    );
  });

  const updateSectionField = usePageEditorStore(
    (state) => state.updateSectionField,
  );

  const setSectionEnabled = usePageEditorStore(
    (state) => state.setSectionEnabled,
  );

  if (!selectedSection) {
    return (
      <aside className="w-80 shrink-0 border-l border-gray-200 bg-white">
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
          Select a section to edit its content.
        </div>
      </aside>
    );
  }

  const definition =
    getSectionPropertyDefinition(selectedSection.type);

  const validationResult =
    validatePageConfig(config);

  const props =
    selectedSection.props as Record<string, unknown>;

  const getFieldError = (fieldKey: string) => {
    return validationResult.errors.find(
      (error) =>
        error.sectionId === selectedSection.id &&
        error.fieldKey === fieldKey &&
        !error.collectionKey &&
        !error.itemId,
    )?.message;
  };

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Section settings
        </p>

        <h2 className="mt-1 text-lg font-semibold text-gray-900">
          {definition.label}
        </h2>

        {definition.description && (
          <p className="mt-1 text-xs leading-5 text-gray-500">
            {definition.description}
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-6 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Visible
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Show this section on the landing page.
              </p>
            </div>

            <input
              type="checkbox"
              checked={selectedSection.enabled}
              onChange={(event) =>
                setSectionEnabled(
                  selectedSection.id,
                  event.target.checked,
                )
              }
              className="mt-0.5 h-4 w-4 rounded border-gray-300"
              aria-label="Toggle section visibility"
            />
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="space-y-5">
              {definition.fields.map((field) => {
                if (field.type === 'collection') {
                  const collectionValue =
                    props[String(field.key)];

                  const items = Array.isArray(collectionValue)
                    ? collectionValue.filter(
                        (
                          item,
                        ): item is Record<
                          string,
                          unknown
                        > & { id: string } =>
                          item !== null &&
                          typeof item === 'object' &&
                          'id' in item &&
                          typeof item.id === 'string',
                      )
                    : [];

                  return (
                    <CollectionField
                      key={String(field.key)}
                      sectionId={selectedSection.id}
                      collectionKey={String(field.key)}
                      label={field.label}
                      itemLabel={field.itemLabel}
                      items={items}
                      fields={field.fields}
                      summaryField={
                        'summaryField' in field
                          ? field.summaryField
                          : undefined
                      }
                      createItem={field.createItem}
                    />
                  );
                }

                const value =
                  props[String(field.key)];

                const description =
                  'description' in field &&
                  typeof field.description === 'string'
                    ? field.description
                    : undefined;

                return (
                  <PropertyField
                    key={String(field.key)}
                    label={field.label}
                    type={field.type}
                    value={
                      typeof value === 'string'
                        ? value
                        : ''
                    }
                    placeholder={field.placeholder}
                    description={description}
                    required={
                      'required' in field
                        ? Boolean(field.required)
                        : false
                    }
                    error={getFieldError(
                      String(field.key),
                    )}
                    onChange={(nextValue) =>
                      updateSectionField(
                        selectedSection.id,
                        String(field.key),
                        nextValue,
                      )
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}