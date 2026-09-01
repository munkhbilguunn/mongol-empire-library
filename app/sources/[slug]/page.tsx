import { supabase } from "@/lib/supabase";
import PublicHeader from "@/components/PublicHeader";

type SourcePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function SourceDetailPage({
  params,
}: SourcePageProps) {
  const { slug } = await params;

  const { data: source, error: sourceError } = await supabase
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
      historical_context,
      contents,
      significance,
      textual_tradition,
      notes,
      slug,
      featured
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (sourceError) {
    return (
      <main className="min-h-screen bg-[#f7f3ea] px-6 py-20 text-[#29251f] lg:px-8">
        <div className="mx-auto max-w-4xl">
          <a
            href="/sources"
            className="text-sm font-medium text-[#8b672f] hover:underline"
          >
            ← Эх сурвалж руу буцах
          </a>

          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Эх сурвалжийн мэдээлэл татахад алдаа гарлаа: {sourceError.message}
          </div>
        </div>
      </main>
    );
  }

  if (!source) {
    return (
      <main className="min-h-screen bg-[#f7f3ea] px-6 py-20 text-[#29251f] lg:px-8">
        <div className="mx-auto max-w-4xl">
          <a
            href="/sources"
            className="text-sm font-medium text-[#8b672f] hover:underline"
          >
            ← Эх сурвалж руу буцах
          </a>

          <div className="mt-10 rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-10 text-center">
            <h1 className="text-2xl font-semibold">Эх сурвалж олдсонгүй</h1>
            <p className="mt-3 text-sm text-[#766d61]">
              Энэ хаягтай эх сурвалж бүртгэгдээгүй байна.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { data: sourceBookLinks, error: linksError } = await supabase
    .from("source_books")
    .select("book_id, relation_type, notes, display_order")
    .eq("source_id", source.id)
    .order("display_order", { ascending: true });

  const links = sourceBookLinks || [];
  const bookIds = links.map((item: any) => item.book_id).filter(Boolean);

  let books: any[] = [];
  let bookAuthors: any[] = [];
  let authors: any[] = [];
  let relatedBooksError = linksError?.message || "";

  if (bookIds.length > 0 && !linksError) {
    const { data: booksData, error: booksError } = await supabase
      .from("books")
      .select(`
        id,
        title,
        subtitle,
        publication_year,
        slug,
        cover_path
      `)
      .in("id", bookIds);

    if (booksError) {
      relatedBooksError = booksError.message;
    } else {
      books = booksData || [];

      const { data: bookAuthorsData, error: bookAuthorsError } = await supabase
        .from("book_authors")
        .select("book_id, author_id, author_order")
        .in("book_id", bookIds)
        .order("author_order", { ascending: true });

      if (bookAuthorsError) {
        relatedBooksError = bookAuthorsError.message;
      } else {
        bookAuthors = bookAuthorsData || [];

        const authorIds = Array.from(
          new Set<string>(
            bookAuthors
              .map((item: any) => item.author_id as string)
              .filter(Boolean)
          )
        );

        if (authorIds.length > 0) {
          const { data: authorsData, error: authorsError } = await supabase
            .from("authors")
            .select("id, name, name_mn, name_en")
            .in("id", authorIds);

          if (authorsError) {
            relatedBooksError = authorsError.message;
          } else {
            authors = authorsData || [];
          }
        }
      }
    }
  }

  const authorMap = new Map(
    authors.map((author: any) => [
      author.id,
      author.name_mn || author.name || author.name_en || "",
    ])
  );

  const bookMap = new Map(books.map((book: any) => [book.id, book]));

  const relatedBooks = links
    .map((link: any) => {
      const book = bookMap.get(link.book_id);
      if (!book) return null;

      const authorNames = bookAuthors
        .filter((item: any) => item.book_id === book.id)
        .sort(
          (a: any, b: any) =>
            (a.author_order || 0) - (b.author_order || 0)
        )
        .map((item: any) => authorMap.get(item.author_id))
        .filter(Boolean)
        .join(", ");

      return {
        ...book,
        relation_type: link.relation_type,
        relation_notes: link.notes,
        display_order: link.display_order,
        author_names: authorNames,
      };
    })
    .filter(Boolean);

  function getCoverUrl(coverPath: string | null) {
    if (!coverPath) return null;

    return supabase.storage
      .from("book-covers")
      .getPublicUrl(coverPath).data.publicUrl;
  }

  const sections = [
    {
      title: "Товч танилцуулга",
      content: source.summary,
    },
    {
      title: "Түүхэн нөхцөл",
      content: source.historical_context,
    },
    {
      title: "Агуулга, бүтэц",
      content: source.contents,
    },
    {
      title: "Судалгааны ач холбогдол",
      content: source.significance,
    },
    {
      title: "Эх бичиг ба уламжлал",
      content: source.textual_tradition,
    },
    {
      title: "Нэмэлт тайлбар",
      content: source.notes,
    },
  ].filter((section) => section.content);

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <PublicHeader active="sources" />

      <section className="border-b border-[#d9d0c0] px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <a
            href="/sources"
            className="text-sm font-medium text-[#8b672f] hover:underline"
          >
            ← Бүх эх сурвалж
          </a>

          <div className="mt-10">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-[#9a6b25]">
              <span>{source.source_type || "Түүхэн сурвалж"}</span>

              {source.featured && (
                <>
                  <span>•</span>
                  <span>Онцлох</span>
                </>
              )}
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              {source.title}
            </h1>

            {source.title_original &&
              source.title_original !== source.title && (
                <div className="mt-4 text-2xl text-[#5f5549]">
                  {source.title_original}
                </div>
              )}

            {source.title_en && (
              <div className="mt-2 text-lg italic text-[#84786a]">
                {source.title_en}
              </div>
            )}
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[#d9d0c0] bg-[#d9d0c0] sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-[#fffdf8] p-5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#9a6b25]">
                Үе
              </div>
              <div className="mt-2 text-sm font-medium">
                {source.written_period || "—"}
              </div>
            </div>

            <div className="bg-[#fffdf8] p-5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#9a6b25]">
                Эх хэл
              </div>
              <div className="mt-2 text-sm font-medium">
                {source.original_language || "—"}
              </div>
            </div>

            <div className="bg-[#fffdf8] p-5 sm:col-span-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#9a6b25]">
                Зохиогч / эмхэтгэгч
              </div>
              <div className="mt-2 text-sm font-medium">
                {source.author_compiler || "—"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fffdf8] px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          {sections.length > 0 ? (
            <div className="divide-y divide-[#d9d0c0] border-y border-[#d9d0c0]">
              {sections.map((section) => (
                <section
                  key={section.title}
                  className="grid gap-5 py-10 md:grid-cols-[220px_1fr] md:gap-12"
                >
                  <h2 className="text-lg font-semibold tracking-tight">
                    {section.title}
                  </h2>

                  <div className="whitespace-pre-line text-[15px] leading-8 text-[#625b50]">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#d9d0c0] bg-[#f7f3ea] p-10 text-center">
              <p className="text-sm text-[#766d61]">
                Энэ эх сурвалжийн дэлгэрэнгүй тайлбар хараахан оруулаагүй байна.
              </p>
            </div>
          )}

          <div className="mt-14">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                  Холбогдох судалгаа
                </div>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  Манай сан дахь холбогдох номууд
                </h2>
              </div>

              <a
                href="/books"
                className="text-sm font-medium text-[#8b672f] hover:underline"
              >
                Бүх номыг үзэх →
              </a>
            </div>

            {relatedBooksError ? (
              <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                Холбогдох номын мэдээлэл татахад алдаа гарлаа:{" "}
                {relatedBooksError}
              </div>
            ) : relatedBooks.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {relatedBooks.map((book: any) => {
                  const href = book.slug
                    ? `/books/${book.slug}`
                    : "/books";
                  const coverUrl = getCoverUrl(book.cover_path);

                  return (
                    <article
                      key={book.id}
                      className="group flex gap-5 rounded-2xl border border-[#d9d0c0] bg-[#f7f3ea] p-5 transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <a
                        href={href}
                        className="flex h-44 w-28 shrink-0 items-center justify-center overflow-hidden bg-[#e6ddce]"
                      >
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={book.title || "Номын хавтас"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="p-3 text-center text-xs font-medium leading-5 text-[#5f5549]">
                            {book.title}
                          </div>
                        )}
                      </a>

                      <div className="min-w-0 flex-1">
                        {book.relation_type && (
                          <div className="text-[10px] font-medium uppercase tracking-[0.17em] text-[#9a6b25]">
                            {book.relation_type}
                          </div>
                        )}

                        <a href={href} className="block">
                          <h3 className="mt-2 text-lg font-semibold leading-6 transition group-hover:text-[#9a6b25]">
                            {book.title}
                          </h3>
                        </a>

                        {book.author_names && (
                          <p className="mt-2 text-sm font-medium text-[#625b50]">
                            {book.author_names}
                          </p>
                        )}

                        {book.publication_year && (
                          <p className="mt-1 text-xs text-[#8c8376]">
                            {book.publication_year}
                          </p>
                        )}

                        {book.subtitle && (
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#766d61]">
                            {book.subtitle}
                          </p>
                        )}

                        {book.relation_notes && (
                          <p className="mt-3 line-clamp-2 text-xs leading-6 text-[#84786a]">
                            {book.relation_notes}
                          </p>
                        )}

                        <a
                          href={href}
                          className="mt-4 inline-block text-sm font-medium text-[#29251f] transition hover:text-[#9a6b25]"
                        >
                          Номыг үзэх →
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-[#d9d0c0] bg-[#f7f3ea] p-8 text-center">
                <p className="text-sm text-[#766d61]">
                  Энэ эх сурвалжтай холбоотой ном одоогоор бүртгэгдээгүй байна.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#4a443c] bg-[#29251f] px-6 py-8 text-[#aaa195] lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-medium text-[#f7f3ea]">
              Монголын эзэнт гүрний түүхийн сан
            </div>
            <div className="mt-1 text-xs">
              Mongol Empire Historical Archive
            </div>
          </div>
          <div className="text-xs">© 2026 Historical Archive</div>
        </div>
      </footer>
    </main>
  );
}
