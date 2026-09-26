import type { FeaturesProps } from "../../domain/page-schema";

type FeaturesSectionProps = {
  props: FeaturesProps;
};

export default function FeaturesSection({
  props,
}: FeaturesSectionProps) {
  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            {props.title}
          </h2>

          {props.description && (
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {props.description}
            </p>
          )}
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {props.items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                {item.icon ?? "•"}
              </div>

              <h3 className="text-lg font-semibold text-gray-950">
                {item.title}
              </h3>

              <p className="mt-2 leading-7 text-gray-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}