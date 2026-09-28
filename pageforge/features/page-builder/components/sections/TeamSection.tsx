import type { TeamProps } from '../../domain/page-schema';

type TeamSectionProps = {
  props: TeamProps;
};

function getInitials(
  name: string,
): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0).toUpperCase(),
    )
    .join('');
}

export default function TeamSection({
  props,
}: TeamSectionProps) {
  return (
    <section className="bg-white">
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

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {props.items.map(
            (item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-6"
              >
                <div className="flex items-center gap-4">
                  {item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt={item.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                      {getInitials(
                        item.name,
                      )}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-gray-950">
                      {item.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {item.role}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-gray-600">
                  {item.bio}
                </p>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}