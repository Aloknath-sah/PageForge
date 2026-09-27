import type { FaqProps } from '../../domain/page-schema';

type FaqSectionProps = {
  props: FaqProps;
};

export default function FaqSection({
  props,
}: FaqSectionProps) {
  return (
    <section className="bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            {props.title}
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
          {props.items.map((item) => (
            <details
              key={item.id}
              className="group px-6 py-5"
            >
              <summary className="cursor-pointer list-none text-base font-semibold text-gray-950">
                <div className="flex items-center justify-between gap-4">
                  <span>{item.question}</span>

                  <span
                    aria-hidden="true"
                    className="shrink-0 text-gray-400 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </div>
              </summary>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}