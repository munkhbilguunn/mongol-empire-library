"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Author = {
  id: string;
  name: string | null;
  name_mn: string | null;
  name_en: string | null;
  slug: string | null;
  birth_year: number | null;
  death_year: number | null;
  biography: string | null;
  book_authors: { book_id: string }[] | null;
};

function getAuthorName(author: Author) {
  return (
    author.name_mn ||
    author.name ||
    author.name_en ||
    "Нэргүй зохиогч"
  );
}

export default function AdminAuthorsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadAuthors() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data, error: authorsError } = await supabase
        .from("authors")
        .select(`
          id,
          name,
          name_mn,
          name_en,
          slug,
          birth_year,
          death_year,
          biography,
          book_authors (
            book_id
          )
        `)
        .order("name");

      if (authorsError) {
        setError(authorsError.message);
        setLoading(false);
        return;
      }

      setAuthors((data || []) as unknown as Author[]);
      setLoading(false);
    }

    void loadAuthors();
  }, [router]);

  const filteredAuthors = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();

    if (!keyword) return authors;

    return authors.filter((author) => {
      return [
        author.name || "",
        author.name_mn || "",
        author.name_en || "",
        author.slug || "",
        author.biography || "",
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(keyword);
    });
  }, [authors, search]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea] text-[#29251f]">
        <div className="text-sm text-[#766d61]">
          Зохиогчдын мэдээллийг уншиж байна...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <header className="border-b border-[#d9d0c0] bg-[#fffdf8]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5 lg:px-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-[#9a6b25]">
              Administration
            </div>

            <div className="mt-1 text-lg font-semibold">
              Монголын эзэнт гүрний түүхийн сан
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-full border border-[#cfc4b2] px-4 py-2 text-xs text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <section className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
                Authors
              </div>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                Зохиогчид
              </h1>

              <p className="mt-3 text-sm leading-7 text-[#766d61]">
                Зохиогчдын нэр, намтар болон public profile-ийг удирдана.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/admin/authors/new")}
              className="rounded-xl bg-[#29251f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a6b25]"
            >
              + Шинэ зохиогч
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-5">
            <label className="text-xs font-medium uppercase tracking-[0.14em] text-[#766d61]">
              Хайх
            </label>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Зохиогчийн нэр, slug, намтраар хайх..."
              className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
            />
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!error && (
            <>
              <div className="mt-8 text-sm text-[#766d61]">
                {filteredAuthors.length} зохиогч
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-[#d9d0c0] bg-[#fffdf8]">
                {filteredAuthors.length > 0 ? (
                  filteredAuthors.map((author, index) => {
                    const name = getAuthorName(author);
                    const bookCount = author.book_authors?.length || 0;

                    return (
                      <div
                        key={author.id}
                        className={`flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between ${
                          index > 0 ? "border-t border-[#e4ddd1]" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-semibold">
                              {name}
                            </h2>

                            {(author.birth_year || author.death_year) && (
                              <span className="text-xs text-[#8c8376]">
                                {author.birth_year || "?"}
                                {" — "}
                                {author.death_year || ""}
                              </span>
                            )}
                          </div>

                          {author.name_en &&
                            author.name_en !== name && (
                              <p className="mt-1 text-sm text-[#766d61]">
                                {author.name_en}
                              </p>
                            )}

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8c8376]">
                            <span>{bookCount} ном</span>
                            {author.slug && (
                              <span>/{author.slug}</span>
                            )}
                          </div>

                          {author.biography && (
                            <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-[#766d61]">
                              {author.biography}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          {author.slug && (
                            <a
                              href={`/authors/${author.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-[#cfc4b2] px-4 py-2.5 text-xs text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
                            >
                              Public profile ↗
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/admin/authors/${author.id}/edit`
                              )
                            }
                            className="rounded-xl bg-[#29251f] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#9a6b25]"
                          >
                            Засах
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-10 text-center text-sm text-[#766d61]">
                    Тохирох зохиогч олдсонгүй.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}