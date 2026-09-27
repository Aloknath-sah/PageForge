'use client';

import { useState } from 'react';

import { usePageEditorStore } from '../../providers/page-editor-provider';

import type { CollectionItemField } from '../../domain/section-properties';

type CollectionItem = Record<string, unknown> & {
  id: string;
};

type CollectionFieldProps = {
  sectionId: string;
  collectionKey: string;
  label: string;
  itemLabel: string;
  items: CollectionItem[];
  fields: CollectionItemField<any>[];
  summaryField?: string;
  minItems?: number;
  maxItems?: number;
  createItem: () => CollectionItem;
};

type TouchedFields = Set<string>;

function createFieldStateKey(
  itemId: string,
  fieldKey: string,
): string {
  return `${itemId}:${fieldKey}`;
}

function getStringValue(
  item: CollectionItem,
  fieldKey: string,
): string {
  const value = item[fieldKey];

  return typeof value === 'string' ? value : '';
}

function getFieldError(
  field: CollectionItemField<any>,
  value: string,
): string | null {
  const trimmedValue = value.trim();

  if (field.required && trimmedValue.length === 0) {
    return `${field.label} is required.`;
  }

  return null;
}

function getItemErrors(
  item: CollectionItem,
  fields: CollectionItemField<any>[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const fieldKey = String(field.key);
    const value = getStringValue(item, fieldKey);
    const error = getFieldError(field, value);

    if (error) {
      errors[fieldKey] = error;
    }
  }

  return errors;
}

function getInvalidItems(
  items: CollectionItem[],
  fields: CollectionItemField<any>[],
): CollectionItem[] {
  return items.filter((item) => {
    return Object.keys(getItemErrors(item, fields)).length > 0;
  });
}

export default function CollectionField({
  sectionId,
  collectionKey,
  label,
  itemLabel,
  items,
  fields,
  summaryField,
  minItems,
  maxItems,
  createItem,
}: CollectionFieldProps) {
  const addCollectionItem = usePageEditorStore(
    (state) => state.addCollectionItem,
  );

  const updateCollectionItem = usePageEditorStore(
    (state) => state.updateCollectionItem,
  );

  const removeCollectionItem = usePageEditorStore(
    (state) => state.removeCollectionItem,
  );

  const reorderCollectionItems = usePageEditorStore(
    (state) => state.reorderCollectionItems,
  );

  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    () => new Set(),
  );

  const [touchedFields, setTouchedFields] = useState<TouchedFields>(
    () => new Set(),
  );

  const itemCount = items.length;

  const hasReachedMaximum =
    maxItems !== undefined && itemCount >= maxItems;

  const hasReachedMinimum =
    minItems !== undefined && itemCount <= minItems;

  const handleToggle = (itemId: string) => {
    setExpandedItems((current) => {
      const next = new Set(current);

      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }

      return next;
    });
  };

  const markItemFieldsTouched = (item: CollectionItem) => {
    setTouchedFields((current) => {
      const next = new Set(current);

      for (const field of fields) {
        next.add(
          createFieldStateKey(
            item.id,
            String(field.key),
          ),
        );
      }

      return next;
    });
  };

  const handleAdd = () => {
    if (hasReachedMaximum) {
      return;
    }

    const invalidItems = getInvalidItems(items, fields);

    if (invalidItems.length > 0) {
      setExpandedItems((current) => {
        const next = new Set(current);

        for (const item of invalidItems) {
          next.add(item.id);
        }

        return next;
      });

      invalidItems.forEach(markItemFieldsTouched);

      return;
    }

    const newItem = createItem();

    addCollectionItem(sectionId, collectionKey, newItem);

    setExpandedItems((current) => {
      const next = new Set(current);
      next.add(newItem.id);
      return next;
    });
  };

  const handleDelete = (itemId: string) => {
    if (hasReachedMinimum) {
      return;
    }

    removeCollectionItem(sectionId, collectionKey, itemId);

    setExpandedItems((current) => {
      const next = new Set(current);
      next.delete(itemId);
      return next;
    });

    setTouchedFields((current) => {
      const next = new Set(current);

      for (const key of next) {
        if (key.startsWith(`${itemId}:`)) {
          next.delete(key);
        }
      }

      return next;
    });
  };

  const handleFieldBlur = (
    itemId: string,
    fieldKey: string,
  ) => {
    setTouchedFields((current) => {
      const next = new Set(current);

      next.add(
        createFieldStateKey(
          itemId,
          fieldKey,
        ),
      );

      return next;
    });
  };

  const countLabel = maxItems !== undefined
    ? `${itemCount} of ${maxItems} ${
        maxItems === 1 ? 'item' : 'items'
      }`
    : `${itemCount} ${
        itemCount === 1 ? 'item' : 'items'
      }`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>

          <p className="text-xs text-gray-500">{countLabel}</p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={hasReachedMaximum}
          title={
            hasReachedMaximum
              ? `Maximum of ${maxItems} ${itemLabel.toLowerCase()}s reached`
              : `Add ${itemLabel.toLowerCase()}`
          }
          className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        >
          + Add
        </button>
      </div>

      {maxItems !== undefined && hasReachedMaximum && (
        <p
          className="text-xs text-gray-500"
          role="status"
        >
          Maximum of {maxItems}{' '}
          {itemLabel.toLowerCase()}
          {maxItems === 1 ? '' : 's'} reached.
        </p>
      )}

      {minItems !== undefined &&
        itemCount > 0 &&
        hasReachedMinimum && (
          <p
            className="text-xs text-gray-500"
            role="status"
          >
            Keep at least {minItems}{' '}
            {itemLabel.toLowerCase()}
            {minItems === 1 ? '' : 's'} in this collection.
          </p>
        )}

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item, index) => (
            <CollectionItem
              key={item.id}
              item={item}
              index={index}
              itemLabel={itemLabel}
              fields={fields}
              summaryField={summaryField}
              expanded={expandedItems.has(item.id)}
              touchedFields={touchedFields}
              canDelete={!hasReachedMinimum}
              onToggle={() => handleToggle(item.id)}
              onFieldBlur={handleFieldBlur}
              onUpdate={(patch) =>
                updateCollectionItem(
                  sectionId,
                  collectionKey,
                  item.id,
                  patch,
                )
              }
              onDelete={() => handleDelete(item.id)}
              onMoveUp={() =>
                reorderCollectionItems(
                  sectionId,
                  collectionKey,
                  index,
                  index - 1,
                )
              }
              onMoveDown={() =>
                reorderCollectionItems(
                  sectionId,
                  collectionKey,
                  index,
                  index + 1,
                )
              }
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
          <p className="text-sm font-medium text-gray-700">
            No {label.toLowerCase()} yet
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Add your first {itemLabel.toLowerCase()} to get started.
          </p>

          <button
            type="button"
            onClick={handleAdd}
            disabled={hasReachedMaximum}
            className="mt-4 rounded-lg bg-white px-3 py-2 text-xs font-medium text-blue-700 ring-1 ring-inset ring-gray-300 transition hover:bg-blue-50 hover:ring-blue-300 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          >
            + Add {itemLabel}
          </button>
        </div>
      )}
    </div>
  );
}

type CollectionItemProps = {
  item: CollectionItem;
  index: number;
  itemLabel: string;
  fields: CollectionItemField<any>[];
  summaryField?: string;
  expanded: boolean;
  touchedFields: TouchedFields;
  canDelete: boolean;
  onToggle: () => void;
  onFieldBlur: (
    itemId: string,
    fieldKey: string,
  ) => void;
  onUpdate: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

function CollectionItem({
  item,
  index,
  itemLabel,
  fields,
  summaryField,
  expanded,
  touchedFields,
  canDelete,
  onToggle,
  onFieldBlur,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: CollectionItemProps) {
  const summaryValue = summaryField
    ? item[summaryField]
    : undefined;

  const summary =
    typeof summaryValue === 'string'
      ? summaryValue.trim()
      : '';

  const itemErrors = getItemErrors(item, fields);

  const hasVisibleErrors = fields.some((field) => {
    const fieldKey = String(field.key);

    return (
      touchedFields.has(
        createFieldStateKey(
          item.id,
          fieldKey,
        ),
      ) &&
      Boolean(itemErrors[fieldKey])
    );
  });

  return (
    <div
      className={[
        'overflow-hidden rounded-xl border bg-gray-50',
        hasVisibleErrors
          ? 'border-red-200'
          : 'border-gray-200',
      ].join(' ')}
    >
      <div className="flex min-h-12 items-center justify-between gap-3 px-3 py-2.5">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${itemLabel} ${
            index + 1
          }`}
        >
          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center text-xs text-gray-500"
          >
            {expanded ? '▼' : '▶'}
          </span>

          <span className="truncate text-sm font-medium text-gray-800">
            {itemLabel} {index + 1}
          </span>

          {summary && (
            <>
              <span
                aria-hidden="true"
                className="text-xs text-gray-300"
              >
                —
              </span>

              <span className="min-w-0 truncate text-xs text-gray-500">
                {summary}
              </span>
            </>
          )}

          {hasVisibleErrors && (
            <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
              Needs attention
            </span>
          )}
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={`Move ${itemLabel} up`}
          >
            ↑
          </button>

          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === 0 && false}
            className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-white"
            aria-label={`Move ${itemLabel} down`}
          >
            ↓
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={!canDelete}
            title={
              !canDelete
                ? `At least one ${itemLabel.toLowerCase()} is required`
                : `Delete ${itemLabel.toLowerCase()}`
            }
            className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={
              !canDelete
                ? `Cannot delete ${itemLabel} because the minimum item count has been reached`
                : `Delete ${itemLabel}`
            }
          >
            Delete
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="space-y-4">
            {fields.map((field) => {
              const fieldKey = String(field.key);
              const value = getStringValue(item, fieldKey);

              const fieldStateKey = createFieldStateKey(
                item.id,
                fieldKey,
              );

              const isTouched =
                touchedFields.has(fieldStateKey);

              const error = isTouched
                ? itemErrors[fieldKey] ?? null
                : null;

              const inputId =
                `collection-${item.id}-${fieldKey}`;

              const errorId =
                `${inputId}-error`;

              return (
                <label
                  key={fieldKey}
                  htmlFor={inputId}
                  className="block"
                >
                  <span className="mb-1.5 block text-xs font-medium text-gray-700">
                    {field.label}

                    {field.required && (
                      <span
                        aria-hidden="true"
                        className="ml-1 text-red-500"
                      >
                        *
                      </span>
                    )}
                  </span>

                  {field.type === 'textarea' ? (
                    <textarea
                      id={inputId}
                      value={value}
                      placeholder={field.placeholder}
                      required={field.required}
                      aria-invalid={Boolean(error)}
                      aria-describedby={
                        error
                          ? errorId
                          : undefined
                      }
                      onChange={(event) =>
                        onUpdate({
                          [field.key]:
                            event.target.value,
                        })
                      }
                      onBlur={() =>
                        onFieldBlur(
                          item.id,
                          fieldKey,
                        )
                      }
                      rows={3}
                      className={[
                        'w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2',
                        error
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100',
                      ].join(' ')}
                    />
                  ) : (
                    <input
                      id={inputId}
                      type={
                        field.type === 'url'
                          ? 'url'
                          : 'text'
                      }
                      value={value}
                      placeholder={field.placeholder}
                      required={field.required}
                      aria-invalid={Boolean(error)}
                      aria-describedby={
                        error
                          ? errorId
                          : undefined
                      }
                      onChange={(event) =>
                        onUpdate({
                          [field.key]:
                            event.target.value,
                        })
                      }
                      onBlur={() =>
                        onFieldBlur(
                          item.id,
                          fieldKey,
                        )
                      }
                      className={[
                        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2',
                        error
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100',
                      ].join(' ')}
                    />
                  )}

                  {error && (
                    <p
                      id={errorId}
                      className="mt-1.5 text-xs text-red-600"
                      role="alert"
                    >
                      {error}
                    </p>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}