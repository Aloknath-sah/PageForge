import type { HeroProps } from '../../domain/page-schema';

type HeroSectionProps = {
  props: HeroProps;
};

const DEFAULT_HERO_IMAGE_URL = '/images/pageforge-hero.png';

export default function HeroSection({ props }: HeroSectionProps) {
  // Existing page configurations stored before image defaults were added may
  // not include imageUrl. Resolve a default so those pages still render an image.
  const imageUrl =
    typeof props.imageUrl === 'string' && props.imageUrl.trim().length > 0
      ? props.imageUrl
      : DEFAULT_HERO_IMAGE_URL;

  // For temporary debugging, log `imageUrl` here. Public page components may
  // render on the server, so those messages can appear in Vercel Runtime Logs
  // rather than the browser console.

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

        <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-gray-100 p-4 sm:p-8">
          <img
            src={imageUrl}
            alt="Landing page builder preview"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="max-h-[400px] w-full rounded-xl object-cover"
          />
        </div>
      </div>
    </section>
  );
}
