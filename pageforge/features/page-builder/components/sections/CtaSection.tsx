import type { CtaProps } from "../../domain/page-schema";

type CtaSectionProps = {
  props: CtaProps;
};

export default function CtaSection({
  props,
}: CtaSectionProps) {
  return (
    <section className="bg-gray-950">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {props.title}
        </h2>

        {props.description && (
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-300">
            {props.description}
          </p>
        )}

        <div className="mt-8">
          <a
            href={props.buttonUrl}
            className="inline-flex rounded-lg bg-white px-6 py-3 font-semibold text-gray-950 transition hover:bg-gray-100"
          >
            {props.buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}