"use client";

import { usePageEditorStore } from "../../providers/page-editor-provider";

export default function SectionSettings() {
  const selectedSection = usePageEditorStore(
    (state) => {
      const id =
        state.selectedSectionId;

      return (
        state.config.sections.find(
          (section) => section.id === id,
        ) ?? null
      );
    },
  );

  const updateSectionProps =
    usePageEditorStore(
      (state) => state.updateSectionProps,
    );

  const setSectionEnabled =
    usePageEditorStore(
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

  return (
    <aside className="w-80 shrink-0 overflow-y-auto border-l border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Section
        </p>

        <h2 className="mt-1 text-lg font-semibold capitalize text-gray-900">
          {selectedSection.type}
        </h2>
      </div>

      <div className="space-y-6 p-5">
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-sm font-medium text-gray-900">
              Visible
            </span>

            <span className="block text-xs text-gray-500">
              Show this section on the page.
            </span>
          </span>

          <input
            type="checkbox"
            checked={selectedSection.enabled}
            onChange={(event) =>
              setSectionEnabled(
                selectedSection.id,
                event.target.checked,
              )
            }
            className="h-4 w-4"
          />
        </label>

        {selectedSection.type === "hero" && (
          <>
            <Field
              label="Title"
              value={selectedSection.props.title}
              onChange={(value) =>
                updateSectionProps(
                  selectedSection.id,
                  "hero",
                  {
                    title: value,
                  },
                )
              }
            />

            <TextAreaField
              label="Description"
              value={
                selectedSection.props.description
              }
              onChange={(value) =>
                updateSectionProps(
                  selectedSection.id,
                  "hero",
                  {
                    description: value,
                  },
                )
              }
            />

            <Field
              label="CTA Text"
              value={
                selectedSection.props
                  .primaryCtaText
              }
              onChange={(value) =>
                updateSectionProps(
                  selectedSection.id,
                  "hero",
                  {
                    primaryCtaText: value,
                  },
                )
              }
            />

            <Field
              label="CTA URL"
              value={
                selectedSection.props
                  .primaryCtaUrl
              }
              onChange={(value) =>
                updateSectionProps(
                  selectedSection.id,
                  "hero",
                  {
                    primaryCtaUrl: value,
                  },
                )
              }
            />
          </>
        )}

        {selectedSection.type ===
          "features" && (
          <>
            <Field
              label="Title"
              value={
                selectedSection.props.title
              }
              onChange={(value) =>
                updateSectionProps(
                  selectedSection.id,
                  "features",
                  {
                    title: value,
                  },
                )
              }
            />

            <TextAreaField
              label="Description"
              value={
                selectedSection.props
                  .description ?? ""
              }
              onChange={(value) =>
                updateSectionProps(
                  selectedSection.id,
                  "features",
                  {
                    description: value,
                  },
                )
              }
            />
          </>
        )}

        {selectedSection.type ===
          "testimonials" && (
          <Field
            label="Title"
            value={
              selectedSection.props.title
            }
            onChange={(value) =>
              updateSectionProps(
                selectedSection.id,
                "testimonials",
                {
                  title: value,
                },
              )
            }
          />
        )}

        {selectedSection.type === "cta" && (
          <>
            <Field
              label="Title"
              value={
                selectedSection.props.title
              }
              onChange={(value) =>
                updateSectionProps(
                  selectedSection.id,
                  "cta",
                  {
                    title: value,
                  },
                )
              }
            />

            <TextAreaField
              label="Description"
              value={
                selectedSection.props
                  .description ?? ""
              }
              onChange={(value) =>
                updateSectionProps(
                  selectedSection.id,
                  "cta",
                  {
                    description: value,
                  },
                )
              }
            />

            <Field
              label="Button Text"
              value={
                selectedSection.props
                  .buttonText
              }
              onChange={(value) =>
                updateSectionProps(
                  selectedSection.id,
                  "cta",
                  {
                    buttonText: value,
                  },
                )
              }
            />

            <Field
              label="Button URL"
              value={
                selectedSection.props.buttonUrl
              }
              onChange={(value) =>
                updateSectionProps(
                  selectedSection.id,
                  "cta",
                  {
                    buttonUrl: value,
                  },
                )
              }
            />
          </>
        )}
      </div>
    </aside>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function Field({
  label,
  value,
  onChange,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

type TextAreaFieldProps = FieldProps;

function TextAreaField({
  label,
  value,
  onChange,
}: TextAreaFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        rows={4}
        className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}