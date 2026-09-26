import type { HeroProps } from "../../domain/page-schema";

type HeroSectionProps = {
  props: HeroProps;
};

export default function HeroSection({
  props,
}: HeroSectionProps) {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            PageForge
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
            {props.title}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
            {props.description}
          </p>

          <div className="mt-8">
            <a
              href={props.primaryCtaUrl}
              className="inline-flex rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              {props.primaryCtaText}
            </a>
          </div>
        </div>

        <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-gray-100 p-8">
          {props.imageUrl ? (
            <img
              src={props.imageUrl}
              alt=""
              className="max-h-[400px] w-full rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[260px] w-full items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-400">
              Hero Image
            </div>
          )}
        </div>
      </div>
    </section>
  );
}