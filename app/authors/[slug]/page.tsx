"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PublicHeader from "@/components/PublicHeader";

type Author = {
  id: string;
  name: string | null;
  name_mn: string | null;
  name_en: string | null;
  slug: string;
  birth_year: number | null;
  death_year: number | null;
  biography: string | null;
  selected_works: string | null;
};

type Book = {
  id: string;
  title: string | null;
  subtitle: string | null;
  publication_year: number | null;
  slug: string | null;
  cover_path: string | null;
};

function getAuthorName(author: Author) {
  return (
    author.name_mn ||
    author.name ||
    author.name_en ||
    "Нэргүй зохиогч"
  );
}

export default function AuthorDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [author, setAuthor] = useState<Author | null>(null);
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    async function loadAuthor() {
      setLoading(true);
      setError("");

      const { data: authorData, error: authorError } = await supabase
        .from("authors")
        .select(
          "id, name, name_mn, name_en, slug, birth_year, death_year, biography, selected_works"
        )
        .eq("slug", slug)
        .single();

      if (authorError || !authorData) {
        setError("Зохиогч олдсонгүй.");
        setLoading(false);
        return;
      }

      const loadedAuthor = authorData as Author;
      setAuthor(loadedAuthor);

      const { data: links, error: linksError } = await supabase
        .from("book_authors")
        .select("book_id, author_order")
        .eq("author_id", loadedAuthor.id);

      if (linksError) {
        setError(linksError.message);
        setLoading(false);
        return;
      }

      const bookIds = (links || []).map((item: any) => item.book_id);

      if (bookIds.length > 0) {
        const { data: bookData, error: booksError } = await supabase
          .from("books")
          .select(
            "id, title, subtitle, publication_year, slug, cover_path"
          )
          .in("id", bookIds)
          .order("publication_year", {
            ascending: false,
            nullsFirst: false,
          });

        if (booksError) {
          setError(booksError.message);
          setLoading(false);
          return;
        }

        setBooks((bookData || []) as Book[]);
      }

      setLoading(false);
    }

    if (slug) {
      void loadAuthor();
    }
  }, [slug]);

  function getCoverUrl(path: string | null) {
    if (!path) return "";

    return supabase.storage
      .from("book-covers")
      .getPublicUrl(path).data.publicUrl;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea] text-[#29251f]">
        <div className="text-sm text-[#766d61]">
          Зохиогчийн мэдээллийг уншиж байна...
        </div>
      </main>
    );
  }

  if (error || !author) {
    return (
      <main className="min-h-screen bg-[#f7f3ea] px-6 py-16 text-[#29251f]">
        <div className="mx-auto max-w-4xl">
          <a href="/authors" className="text-sm text-[#9a6b25] hover:underline">
            ← Зохиогч, судлаачид
          </a>

          <div className="mt-8 rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-8">
            <h1 className="text-2xl font-semibold">Зохиогч олдсонгүй</h1>
            <p className="mt-3 text-sm text-[#766d61]">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const name = getAuthorName(author);

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <PublicHeader active="authors" />

      <section className="border-b border-[#d9d0c0] bg-[#fffdf8] px-6 py-14 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#9a6b25]">
            Author
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {name}
          </h1>

          {(author.birth_year || author.death_year) && (
            <p className="mt-4 text-sm text-[#766d61]">
              {author.birth_year || "?"}
              {" — "}
              {author.death_year || ""}
            </p>
          )}

          {author.name_en &&
            author.name_en !== name && (
              <p className="mt-2 text-sm text-[#8c8376]">
                {author.name_en}
              </p>
            )}
        </div>
      </section>

      <section className="px-6 py-14 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
              Намтар
            </div>

            {author.biography ? (
              <p className="mt-5 whitespace-pre-line text-base leading-8 text-[#4f493f]">
                {author.biography}
              </p>
            ) : (
              <p className="mt-5 text-sm leading-7 text-[#766d61]">
                Энэ зохиогчийн намтар хараахан оруулаагүй байна.
              </p>
            )}

            {author.selected_works && (
              <div className="mt-10 border-t border-[#d9d0c0] pt-8">
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                  Онцлох бүтээлүүд
                </div>

                <ul className="mt-5 space-y-3 text-sm leading-7 text-[#4f493f]">
                  {author.selected_works
                    .split("\n")
                    .map((work) => work.trim())
                    .filter(Boolean)
                    .map((work, index) => (
                      <li
                        key={`${work}-${index}`}
                        className="flex gap-3"
                      >
                        <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a6b25]" />
                        <span>{work}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                  Бүтээлүүд
                </div>

                <h2 className="mt-3 text-2xl font-semibold">
                  Сан дахь номууд
                </h2>
              </div>

              <div className="text-sm text-[#766d61]">
                {books.length} ном
              </div>
            </div>

            {books.length > 0 ? (
              <div className="mt-7 space-y-4">
                {books.map((book) => {
                  const coverUrl = getCoverUrl(book.cover_path);

                  return (
                    <article
                      key={book.id}
                      className="flex gap-5 rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-5"
                    >
                      <a
                        href={book.slug ? `/books/${book.slug}` : "#"}
                        className="shrink-0"
                      >
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={book.title || "Номын хавтас"}
                            className="h-28 w-20 object-cover shadow-sm"
                          />
                        ) : (
                          <div className="flex h-28 w-20 items-center justify-center bg-[#e6ddce] px-2 text-center text-[10px] text-[#766d61]">
                            Cover
                          </div>
                        )}
                      </a>

                      <div className="min-w-0">
                        {book.publication_year && (
                          <div className="text-[10px] uppercase tracking-[0.18em] text-[#9a6b25]">
                            {book.publication_year}
                          </div>
                        )}

                        <a
                          href={book.slug ? `/books/${book.slug}` : "#"}
                          className="group"
                        >
                          <h3 className="mt-2 font-semibold leading-6 transition group-hover:text-[#9a6b25]">
                            {book.title}
                          </h3>
                        </a>

                        {book.subtitle && (
                          <p className="mt-2 text-sm leading-6 text-[#766d61]">
                            {book.subtitle}
                          </p>
                        )}

                        {book.slug && (
                          <a
                            href={`/books/${book.slug}`}
                            className="mt-3 inline-block text-xs font-medium text-[#8b672f] hover:underline"
                          >
                            Номыг үзэх →
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-8 text-sm text-[#766d61]">
                Энэ зохиогчтой холбоотой ном одоогоор бүртгэгдээгүй байна.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
