"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PublicHeader from "@/components/PublicHeader";

type Book = {
  id: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  publication_year: number | null;
  isbn: string | null;
  featured: boolean | null;
  language_id: string | null;
  cover_path: string | null;
  slug: string;
};

type Author = {
  id: string;
  name: string | null;
  name_mn: string | null;
  name_en: string | null;
  slug: string | null;
};

type AuthorLink = {
  author_id: string;
  author_order: number | null;
};

type Source = {
  id: string;
  title: string;
  title_original: string | null;
  title_en: string | null;
  source_type: string | null;
  written_period: string | null;
  slug: string | null;
};

type SourceLink = {
  source_id: string;
  relation_type: string | null;
  notes: string | null;
  display_order: number | null;
};

type RelatedSource = Source & {
  relation_type: string | null;
  relation_notes: string | null;
  display_order: number | null;
};

type DetailData = {
  book: Book;
  authors: Author[];
  languageName: string | null;
  categoryName: string | null;
  coverUrl: string;
  relatedSources: RelatedSource[];
};

function getAuthorName(author: Author) {
  return author.name_mn || author.name || author.name_en || "Нэргүй зохиогч";
}

export default function BookDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<DetailData | null>(null);

  useEffect(() => {
    async function loadBook() {
      setLoading(true);
      setError("");

      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .select(
          "id, title, subtitle, description, publication_year, isbn, featured, language_id, cover_path, slug"
        )
        .eq("slug", slug)
        .single();

      if (bookError || !bookData) {
        setError("Ном олдсонгүй.");
        setLoading(false);
        return;
      }

      const book = bookData as Book;

      const [
        authorLinksResult,
        categoryLinkResult,
        sourceLinksResult,
      ] = await Promise.all([
        supabase
          .from("book_authors")
          .select("author_id, author_order")
          .eq("book_id", book.id)
          .order("author_order", { ascending: true }),
        supabase
          .from("book_categories")
          .select("category_id")
          .eq("book_id", book.id)
          .limit(1)
          .maybeSingle(),
        supabase
          .from("source_books")
          .select("source_id, relation_type, notes, display_order")
          .eq("book_id", book.id)
          .order("display_order", { ascending: true }),
      ]);

      if (authorLinksResult.error) {
        setError(authorLinksResult.error.message);
        setLoading(false);
        return;
      }

      if (categoryLinkResult.error) {
        setError(categoryLinkResult.error.message);
        setLoading(false);
        return;
      }

      if (sourceLinksResult.error) {
        setError(sourceLinksResult.error.message);
        setLoading(false);
        return;
      }

      const authorLinks = (authorLinksResult.data || []) as AuthorLink[];
      let orderedAuthors: Author[] = [];

      if (authorLinks.length > 0) {
        const authorIds = authorLinks.map((link) => link.author_id);

        const { data: authorData, error: authorError } = await supabase
          .from("authors")
          .select("id, name, name_mn, name_en, slug")
          .in("id", authorIds);

        if (authorError) {
          setError(authorError.message);
          setLoading(false);
          return;
        }

        const authorMap = new Map(
          ((authorData || []) as Author[]).map((author) => [author.id, author])
        );

        orderedAuthors = authorLinks
          .map((link) => authorMap.get(link.author_id))
          .filter((author): author is Author => Boolean(author));
      }

      const sourceLinks = (sourceLinksResult.data || []) as SourceLink[];
      let relatedSources: RelatedSource[] = [];

      if (sourceLinks.length > 0) {
        const sourceIds = sourceLinks.map((link) => link.source_id);

        const { data: sourceData, error: sourceError } = await supabase
          .from("sources")
          .select(
            "id, title, title_original, title_en, source_type, written_period, slug"
          )
          .in("id", sourceIds);

        if (sourceError) {
          setError(sourceError.message);
          setLoading(false);
          return;
        }

        const sourceMap = new Map(
          ((sourceData || []) as Source[]).map((source) => [source.id, source])
        );

        relatedSources = sourceLinks
          .map((link) => {
            const source = sourceMap.get(link.source_id);

            if (!source) return null;

            return {
              ...source,
              relation_type: link.relation_type,
              relation_notes: link.notes,
              display_order: link.display_order,
            };
          })
          .filter(
            (source): source is RelatedSource => Boolean(source)
          );
      }

      let languageName: string | null = null;

      if (book.language_id) {
        const { data: languageData, error: languageError } = await supabase
          .from("languages")
          .select("name")
          .eq("id", book.language_id)
          .maybeSingle();

        if (languageError) {
          setError(languageError.message);
          setLoading(false);
          return;
        }

        languageName = languageData?.name || null;
      }

      let categoryName: string | null = null;
      const categoryId = categoryLinkResult.data?.category_id;

      if (categoryId) {
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("name")
          .eq("id", categoryId)
          .maybeSingle();

        if (categoryError) {
          setError(categoryError.message);
          setLoading(false);
          return;
        }

        categoryName = categoryData?.name || null;
      }

      let coverUrl = "";

      if (book.cover_path) {
        const { data: publicUrlData } = supabase.storage
          .from("book-covers")
          .getPublicUrl(book.cover_path);

        coverUrl = publicUrlData.publicUrl;
      }

      setDetail({
        book,
        authors: orderedAuthors,
        languageName,
        categoryName,
        coverUrl,
        relatedSources,
      });

      setLoading(false);
    }

    if (slug) {
      void loadBook();
    }
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea] text-[#29251f]">
        <div className="text-sm text-[#766d61]">
          Номын мэдээллийг уншиж байна...
        </div>
      </main>
    );
  }

  if (error || !detail) {
    return (
      <main className="min-h-screen bg-[#f7f3ea] px-6 py-16 text-[#29251f]">
        <div className="mx-auto max-w-4xl">
          <a href="/" className="text-sm text-[#9a6b25] hover:underline">
            ← Нүүр хуудас
          </a>

          <div className="mt-8 rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-8">
            <h1 className="text-2xl font-semibold">Ном олдсонгүй</h1>
            <p className="mt-3 text-sm leading-7 text-[#766d61]">
              {error || "Энэ номын мэдээллийг унших боломжгүй байна."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const {
    book,
    authors,
    languageName,
    categoryName,
    coverUrl,
    relatedSources,
  } = detail;

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <PublicHeader active="books" />

      <section className="px-6 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-16">
            <div>
              <div className="overflow-hidden rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] shadow-sm">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={`${book.title || "Ном"} cover`}
                    className="aspect-[2/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center px-8 text-center text-sm leading-6 text-[#8c8376]">
                    Cover зураг байхгүй
                  </div>
                )}
              </div>
            </div>

            <article>
              <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#9a6b25]">
                {categoryName || "Ном"}
              </div>

              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
  {book.title || "Нэргүй ном"}
</h1>

{book.subtitle && (
  <p className="mt-4 text-2xl font-medium leading-8 text-[#625b50] sm:text-3xl sm:leading-10">
    {book.subtitle}
  </p>
)}

{authors.length > 0 && (
  <div className="mt-6 flex flex-wrap gap-x-2 gap-y-1 text-lg font-medium text-[#9a6b25] sm:text-xl">
                  {authors.map((author, index) => (
                    <span key={author.id}>
                      {author.slug ? (
                        <a
                          href={`/authors/${author.slug}`}
                          className="hover:underline"
                        >
                          {getAuthorName(author)}
                        </a>
                      ) : (
                        getAuthorName(author)
                      )}
                      {index < authors.length - 1 ? "," : ""}
                    </span>
                  ))}
                </div>
              )}

              <dl className="mt-9 grid gap-x-8 gap-y-5 border-y border-[#d9d0c0] py-7 sm:grid-cols-2">
                {book.publication_year && (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-[#8c8376]">
                      Хэвлэгдсэн он
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {book.publication_year}
                    </dd>
                  </div>
                )}

                {languageName && (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-[#8c8376]">
                      Хэл
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {languageName}
                    </dd>
                  </div>
                )}

                {categoryName && (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-[#8c8376]">
                      Ангилал
                    </dt>
                    <dd className="mt-1 text-sm font-medium">
                      {categoryName}
                    </dd>
                  </div>
                )}

                {book.isbn && (
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-[#8c8376]">
                      ISBN
                    </dt>
                    <dd className="mt-1 text-sm font-medium">{book.isbn}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-9">
                <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                  Номын тухай
                </h2>

                {book.description ? (
                  <p className="mt-4 whitespace-pre-line text-justify text-base leading-8 text-[#4f493f]">
                    {book.description}
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-[#766d61]">
                    Энэ номын тайлбар хараахан оруулаагүй байна.
                  </p>
                )}
              </div>

              {relatedSources.length > 0 && (
                <div className="mt-10 border-t border-[#d9d0c0] pt-9">
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                    Эх сурвалжийн холбоос
                  </div>

                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                    Холбогдох эх сурвалж
                  </h2>

                  <div className="mt-6 space-y-4">
                    {relatedSources.map((source) => {
                      const href = source.slug
                        ? `/sources/${source.slug}`
                        : "/sources";

                      return (
                        <a
                          key={source.id}
                          href={href}
                          className="group block rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-6 transition hover:-translate-y-0.5 hover:border-[#bda77f] hover:shadow-md"
                        >
                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                            <div>
                              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#9a6b25]">
                                {source.relation_type ||
                                  source.source_type ||
                                  "Түүхэн эх сурвалж"}
                              </div>

                              <h3 className="mt-3 text-xl font-semibold transition group-hover:text-[#9a6b25]">
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

                              {source.relation_notes && (
                                <p className="mt-4 text-sm leading-7 text-[#766d61]">
                                  {source.relation_notes}
                                </p>
                              )}
                            </div>

                            <div className="shrink-0 text-sm font-medium text-[#8b672f]">
                              Эх сурвалжийг үзэх →
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
