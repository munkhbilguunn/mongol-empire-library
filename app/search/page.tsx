import { supabase } from "@/lib/supabase";

type SearchType = "all" | "books" | "authors" | "sources" | "timeline";

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function includesQuery(values: unknown[], query: string) {
  const q = normalize(query);

  if (!q) return false;

  return values.some((value) => normalize(value).includes(q));
}

function getAuthorDisplayName(author: any) {
  return author?.name_mn || author?.name || author?.name_en || "Нэргүй зохиогч";
}

function getBookAuthorNames(book: any) {
  return (book.book_authors || [])
    .slice()
    .sort(
      (a: any, b: any) =>
        (a.author_order || 0) - (b.author_order || 0)
    )
    .map((item: any) => getAuthorDisplayName(item.authors))
    .filter(Boolean)
    .join(", ");
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();

  const allowedTypes: SearchType[] = [
    "all",
    "books",
    "authors",
    "sources",
    "timeline",
  ];

  const requestedType = (params.type || "all") as SearchType;
  const type: SearchType = allowedTypes.includes(requestedType)
    ? requestedType
    : "all";

  const [
    booksResult,
    authorsResult,
    sourcesResult,
    timelineResult,
  ] = await Promise.all([
    supabase
      .from("books")
      .select(`
        id,
        title,
        subtitle,
        description,
        publication_year,
        slug,
        cover_path,
        book_authors (
          author_order,
          authors (
            id,
            name,
            name_mn,
            name_en
          )
        )
      `)
      .order("created_at", { ascending: false }),

    supabase
      .from("authors")
      .select(`
        id,
        name,
        name_mn,
        name_en,
        birth_year,
        death_year,
        biography,
        slug
      `)
      .order("name", { ascending: true }),

    supabase
      .from("sources")
      .select(`
        id,
        title,
        title_original,
        title_en,
        source_type,
        written_period,
        original_language,
        author_compiler,
        summary,
        slug
      `)
      .order("created_at", { ascending: true }),

    supabase
      .from("timeline_events")
      .select(`
        id,
        year,
        title,
        description,
        slug,
        featured,
        display_order
      `)
      .order("year", { ascending: true })
      .order("display_order", { ascending: true }),
  ]);

  const books = booksResult.data || [];
  const authors = authorsResult.data || [];
  const sources = sourcesResult.data || [];
  const timelineEvents = timelineResult.data || [];

  const filteredBooks = q
    ? books.filter((book: any) =>
        includesQuery(
          [
            book.title,
            book.subtitle,
            book.description,
            book.publication_year,
            getBookAuthorNames(book),
          ],
          q
        )
      )
    : [];

  const filteredAuthors = q
    ? authors.filter((author: any) =>
        includesQuery(
          [
            author.name,
            author.name_mn,
            author.name_en,
            author.biography,
            author.birth_year,
            author.death_year,
          ],
          q
        )
      )
    : [];

  const filteredSources = q
    ? sources.filter((source: any) =>
        includesQuery(
          [
            source.title,
            source.title_original,
            source.title_en,
            source.source_type,
            source.written_period,
            source.original_language,
            source.author_compiler,
            source.summary,
          ],
          q
        )
      )
    : [];

  const filteredTimeline = q
    ? timelineEvents.filter((event: any) =>
        includesQuery(
          [event.year, event.title, event.description],
          q
        )
      )
    : [];

  const total =
    filteredBooks.length +
    filteredAuthors.length +
    filteredSources.length +
    filteredTimeline.length;

  const errors = [
    booksResult.error,
    authorsResult.error,
    sourcesResult.error,
    timelineResult.error,
  ].filter(Boolean);

  function typeHref(nextType: SearchType) {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (nextType !== "all") query.set("type", nextType);
    return `/search?${query.toString()}`;
  }

  const tabs: { value: SearchType; label: string; count: number }[] = [
    { value: "all", label: "Бүгд", count: total },
    { value: "books", label: "Ном", count: filteredBooks.length },
    { value: "authors", label: "Зохиогч, судлаач", count: filteredAuthors.length },
    { value: "sources", label: "Эх сурвалж", count: filteredSources.length },
    { value: "timeline", label: "Он цаг", count: filteredTimeline.length },
  ];

  const showBooks = type === "all" || type === "books";
  const showAuthors = type === "all" || type === "authors";
  const showSources = type === "all" || type === "sources";
  const showTimeline = type === "all" || type === "timeline";

  function getCoverUrl(coverPath: string | null) {
    if (!coverPath) return null;

    return supabase.storage
      .from("book-covers")
      .getPublicUrl(coverPath).data.publicUrl;
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <header className="border-b border-[#d9d0c0] bg-[#f7f3ea]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:px-8">
          <a href="/">
            <div className="text-[10px] uppercase tracking-[0.26em] text-[#9a6b25]">
              Historical Archive
            </div>
            <div className="mt-1 text-base font-semibold tracking-tight sm:text-lg">
              Монголын эзэнт гүрний түүхийн сан
            </div>
          </a>

          <a
            href="/"
            className="shrink-0 text-sm font-medium text-[#8b672f] hover:underline"
          >
            ← Нүүр хуудас
          </a>
        </div>
      </header>

      <section className="border-b border-[#d9d0c0] bg-[#fffdf8] px-6 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
            Нэгдсэн хайлт
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Түүхийн сангаас хайх
          </h1>

          <form
            action="/search"
            method="get"
            className="mt-8 flex items-center rounded-2xl border border-[#c9bda9] bg-white p-2 shadow-[0_12px_40px_rgba(70,50,20,0.06)]"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center text-2xl text-[#8b7b66]">
              ⌕
            </div>

            <input
              type="search"
              name="q"
              defaultValue={q}
              autoFocus
              placeholder="Ном, зохиогч, эх сурвалж, он цагаар хайх..."
              className="h-14 min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-[#a69c8e]"
            />

            <button
              type="submit"
              className="hidden rounded-xl bg-[#29251f] px-7 py-4 text-sm font-medium text-white transition hover:bg-[#9a6b25] sm:block"
            >
              Хайх
            </button>
          </form>

          {q && (
            <div className="mt-5 text-sm text-[#766d61]">
              <span className="font-medium text-[#29251f]">“{q}”</span>{" "}
              хайлтаар нийт{" "}
              <span className="font-semibold text-[#9a6b25]">{total}</span>{" "}
              илэрц олдлоо.
            </div>
          )}

          <div className="mt-7 flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const active = type === tab.value;

              return (
                <a
                  key={tab.value}
                  href={typeHref(tab.value)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                    active
                      ? "border-[#29251f] bg-[#29251f] text-white"
                      : "border-[#cfc4b2] bg-[#fffdf8] text-[#625b50] hover:border-[#9a6b25] hover:text-[#9a6b25]"
                  }`}
                >
                  {tab.label}{" "}
                  <span className={active ? "text-[#d9d0c0]" : "text-[#9a8e7e]"}>
                    {tab.count}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-5xl">
          {errors.length > 0 && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              Зарим мэдээллийг татахад алдаа гарлаа. Түр дахин оролдоно уу.
            </div>
          )}

          {!q ? (
            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-10 text-center">
              <div className="text-lg font-semibold">Хайлтын үгээ оруулна уу</div>
              <p className="mt-2 text-sm leading-7 text-[#766d61]">
                Номын нэр, зохиогч, судлаач, эх сурвалжийн нэр эсвэл он
                оруулж хайж болно.
              </p>
            </div>
          ) : total === 0 ? (
            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-10 text-center">
              <div className="text-lg font-semibold">Илэрц олдсонгүй</div>
              <p className="mt-2 text-sm leading-7 text-[#766d61]">
                Хайлтын үгээ богиносгох эсвэл өөр түлхүүр үгээр дахин оролдоно уу.
              </p>
            </div>
          ) : (
            <div className="space-y-14">
              {showBooks && filteredBooks.length > 0 && (
                <section>
                  <div className="flex items-end justify-between border-b border-[#d9d0c0] pb-4">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-[0.22em] text-[#9a6b25]">
                        Books
                      </div>
                      <h2 className="mt-2 text-2xl font-semibold">
                        Ном
                      </h2>
                    </div>
                    <div className="text-sm text-[#766d61]">
                      {filteredBooks.length} илэрц
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {filteredBooks.map((book: any) => {
                      const coverUrl = getCoverUrl(book.cover_path);
                      const authorNames = getBookAuthorNames(book);
                      const href = book.slug ? `/books/${book.slug}` : "/books";

                      return (
                        <a
                          key={book.id}
                          href={href}
                          className="group flex gap-5 rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-5 transition hover:border-[#bda77f] hover:shadow-md"
                        >
                          <div className="flex h-32 w-24 shrink-0 items-center justify-center overflow-hidden bg-[#e6ddce]">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={book.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="px-2 text-center text-[10px] text-[#766d61]">
                                Ном
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs text-[#9a6b25]">
                              {book.publication_year || "Он тодорхойгүй"}
                            </div>
                            <h3 className="mt-2 font-semibold leading-6 transition group-hover:text-[#9a6b25]">
                              {book.title}
                            </h3>
                            {authorNames && (
                              <p className="mt-2 text-sm text-[#625b50]">
                                {authorNames}
                              </p>
                            )}
                            {book.subtitle && (
                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#766d61]">
                                {book.subtitle}
                              </p>
                            )}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </section>
              )}

              {showAuthors && filteredAuthors.length > 0 && (
                <section>
                  <div className="flex items-end justify-between border-b border-[#d9d0c0] pb-4">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-[0.22em] text-[#9a6b25]">
                        Authors & Researchers
                      </div>
                      <h2 className="mt-2 text-2xl font-semibold">
                        Зохиогч, судлаачид
                      </h2>
                    </div>
                    <div className="text-sm text-[#766d61]">
                      {filteredAuthors.length} илэрц
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {filteredAuthors.map((author: any) => {
                      const href = author.slug
                        ? `/authors/${author.slug}`
                        : "/authors";

                      return (
                        <a
                          key={author.id}
                          href={href}
                          className="group rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-6 transition hover:border-[#bda77f] hover:shadow-md"
                        >
                          <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#9a6b25]">
                            Зохиогч / Судлаач
                          </div>

                          <h3 className="mt-3 text-lg font-semibold transition group-hover:text-[#9a6b25]">
                            {getAuthorDisplayName(author)}
                          </h3>

                          {author.name_en &&
                            author.name_en !== getAuthorDisplayName(author) && (
                              <div className="mt-1 text-sm text-[#766d61]">
                                {author.name_en}
                              </div>
                            )}

                          {(author.birth_year || author.death_year) && (
                            <div className="mt-3 text-xs text-[#8c8376]">
                              {author.birth_year || "?"} — {author.death_year || ""}
                            </div>
                          )}

                          {author.biography && (
                            <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#766d61]">
                              {author.biography}
                            </p>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </section>
              )}

              {showSources && filteredSources.length > 0 && (
                <section>
                  <div className="flex items-end justify-between border-b border-[#d9d0c0] pb-4">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-[0.22em] text-[#9a6b25]">
                        Historical Sources
                      </div>
                      <h2 className="mt-2 text-2xl font-semibold">
                        Эх сурвалж
                      </h2>
                    </div>
                    <div className="text-sm text-[#766d61]">
                      {filteredSources.length} илэрц
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {filteredSources.map((source: any) => {
                      const href = source.slug
                        ? `/sources/${source.slug}`
                        : "/sources";

                      return (
                        <a
                          key={source.id}
                          href={href}
                          className="group rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-6 transition hover:border-[#bda77f] hover:shadow-md"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#9a6b25]">
                              {source.source_type || "Түүхэн эх сурвалж"}
                            </div>
                            {source.written_period && (
                              <div className="text-xs text-[#8c8376]">
                                {source.written_period}
                              </div>
                            )}
                          </div>

                          <h3 className="mt-4 text-lg font-semibold transition group-hover:text-[#9a6b25]">
                            {source.title}
                          </h3>

                          {source.title_original &&
                            source.title_original !== source.title && (
                              <div className="mt-1 text-sm text-[#625b50]">
                                {source.title_original}
                              </div>
                            )}

                          {source.title_en && (
                            <div className="mt-1 text-sm italic text-[#84786a]">
                              {source.title_en}
                            </div>
                          )}

                          {source.summary && (
                            <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#766d61]">
                              {source.summary}
                            </p>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </section>
              )}

              {showTimeline && filteredTimeline.length > 0 && (
                <section>
                  <div className="flex items-end justify-between border-b border-[#d9d0c0] pb-4">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-[0.22em] text-[#9a6b25]">
                        Timeline
                      </div>
                      <h2 className="mt-2 text-2xl font-semibold">
                        Он цагийн хэлхээс
                      </h2>
                    </div>
                    <div className="text-sm text-[#766d61]">
                      {filteredTimeline.length} илэрц
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {filteredTimeline.map((event: any) => (
                      <a
                        key={event.id}
                        href="/timeline"
                        className="group grid gap-3 rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-5 transition hover:border-[#bda77f] hover:shadow-md sm:grid-cols-[110px_1fr]"
                      >
                        <div className="text-2xl font-semibold text-[#9a6b25]">
                          {event.year}
                        </div>

                        <div>
                          <h3 className="font-semibold transition group-hover:text-[#9a6b25]">
                            {event.title}
                          </h3>
                          {event.description && (
                            <p className="mt-2 line-clamp-2 text-sm leading-7 text-[#766d61]">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
