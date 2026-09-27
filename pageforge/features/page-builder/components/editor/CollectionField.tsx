'use client';

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
  createItem: () => CollectionItem;
};

export default function CollectionField({
  sectionId,
  collectionKey,
  label,
  itemLabel,
  items,
  fields,
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

  const handleAdd = () => {
    addCollectionItem(sectionId, collectionKey, createItem());
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>

          <p className="text-xs text-gray-500">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
        >
          + Add
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <CollectionItem
            key={item.id}
            item={item}
            index={index}
            itemLabel={itemLabel}
            fields={fields}
            onUpdate={(patch) =>
              updateCollectionItem(sectionId, collectionKey, item.id, patch)
            }
            onDelete={() =>
              removeCollectionItem(sectionId, collectionKey, item.id)
            }
            onMoveUp={() =>
              reorderCollectionItems(sectionId, collectionKey, index, index - 1)
            }
            onMoveDown={() =>
              reorderCollectionItems(sectionId, collectionKey, index, index + 1)
            }
          />
        ))}
      </div>

      {items.length === 0 && (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full rounded-lg border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
        >
          Add your first {itemLabel.toLowerCase()}
        </button>
      )}
    </div>
  );
}

type CollectionItemProps = {
  item: CollectionItem;
  index: number;
  itemLabel: string;
  fields: CollectionItemField<any>[];
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
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: CollectionItemProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-800">
          {itemLabel} {index + 1}
        </p>

        <div className="flex items-center gap-1">
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
            className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-white"
            aria-label={`Move ${itemLabel} down`}
          >
            ↓
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field) => {
          const value = item[String(field.key)];

          const stringValue = typeof value === 'string' ? value : '';

          return (
            <label key={String(field.key)} className="block">
              <span className="mb-1.5 block text-xs font-medium text-gray-700">
                {field.label}
              </span>

              {field.type === 'textarea' ? (
                <textarea
                  value={stringValue}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    onUpdate({
                      [field.key]: event.target.value,
                    })
                  }
                  rows={3}
                  className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              ) : (
                <input
                  type={field.type === 'url' ? 'url' : 'text'}
                  value={stringValue}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    onUpdate({
                      [field.key]: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
