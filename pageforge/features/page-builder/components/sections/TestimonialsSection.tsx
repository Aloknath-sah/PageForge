import type { TestimonialsProps } from '../../domain/page-schema';

type TestimonialsSectionProps = {
  props: TestimonialsProps;
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function TestimonialsSection({ props }: TestimonialsSectionProps) {
  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Customer stories
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            {props.title}
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {props.items.map((item) => (
            <figure
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
            >
              <div aria-hidden="true" className="text-4xl leading-none text-blue-600">
                “
              </div>
              <blockquote className="mt-3 text-lg leading-8 text-gray-700">
                {item.quote}
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5">
                {item.avatarUrl ? (
                  <img
                    src={item.avatarUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700"
                  >
                    {getInitials(item.name)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-950">{item.name}</div>
                  {item.role && <div className="text-sm text-gray-500">{item.role}</div>}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
