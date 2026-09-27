import type { TestimonialsProps } from "../../domain/page-schema";

type TestimonialsSectionProps = {
  props: TestimonialsProps;
};

export default function TestimonialsSection({
  props,
}: TestimonialsSectionProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            {props.title}
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {props.items.map((item) => (
            <figure
              key={item.id}
              className="rounded-2xl border border-gray-200 p-8"
            >
              <blockquote className="text-lg leading-8 text-gray-700">
                {`"${item.quote}"`}
              </blockquote>

              <figcaption className="mt-6">
                <div className="font-semibold text-gray-950">
                  {item.name}
                </div>

                {item.role && (
                  <div className="text-sm text-gray-500">
                    {item.role}
                  </div>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}