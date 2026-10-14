import type { HeroProps } from '../../domain/page-schema';

type HeroSectionProps = {
  props: HeroProps;
};

export default function HeroSection({ props }: HeroSectionProps) {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
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
              className="inline-flex rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {props.primaryCtaText}
            </a>
          </div>
        </div>

        <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-4 shadow-sm sm:p-8">
          {props.imageUrl ? (
            <img
              src={props.imageUrl}
              alt={`Page builder preview for ${props.title}`}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="max-h-[460px] w-full rounded-2xl object-contain drop-shadow-sm"
            />
          ) : (
            <div className="flex min-h-[260px] w-full items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-white/70 text-sm text-gray-400">
              Add a hero image in section settings
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
