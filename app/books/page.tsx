"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import PublicHeader from "@/components/PublicHeader";

type Option = {
  id: string;
  name: string;
};

type Author = {
  id: string;
  name: string | null;
  name_mn: string | null;
  name_en: string | null;
};

type AuthorLink = {
  author_order: number | null;
  authors: Author | null;
};

type CategoryLink = {
  category_id: string;
};

type Book = {
  id: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  publication_year: number | null;
  isbn: string | null;
  featured: boolean | null;
  slug: string | null;
  cover_path: string | null;
  language_id: string | null;
  book_authors: AuthorLink[] | null;
  book_categories: CategoryLink[] | null;
};

function getAuthorName(author: Author) {
  return author.name_mn || author.name || author.name_en || "";
}

export default function BooksPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [books, setBooks] = useState<Book[]>([]);
  const [languages, setLanguages] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);

  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setSearch(params.get("q") || "");
    setLanguageFilter(params.get("language") || "");
    setCategoryFilter(params.get("category") || "");

    async function loadData() {
      setLoading(true);
      setError("");

      const [booksResult, languagesResult, categoriesResult] =
        await Promise.all([
          supabase
            .from("books")
            .select(`
              id,
              title,
              subtitle,
              description,
              publication_year,
              isbn,
              featured,
              slug,
              cover_path,
              language_id,
              book_authors (
                author_order,
                authors (
                  id,
                  name,
                  name_mn,
                  name_en
                )
              ),
              book_categories (
                category_id
              )
            `)
            .order("publication_year", {
              ascending: false,
              nullsFirst: false,
            })
            .order("created_at", { ascending: false }),

          supabase
            .from("languages")
            .select("id, name")
            .order("name"),

          supabase
            .from("categories")
            .select("id, name")
            .order("name"),
        ]);

      if (booksResult.error) {
        setError(booksResult.error.message);
        setLoading(false);
        return;
      }

      if (languagesResult.error) {
        setError(languagesResult.error.message);
        setLoading(false);
        return;
      }

      if (categoriesResult.error) {
        setError(categoriesResult.error.message);
        setLoading(false);
        return;
      }

      setBooks((booksResult.data || []) as unknown as Book[]);
      setLanguages((languagesResult.data || []) as Option[]);
      setCategories((categoriesResult.data || []) as Option[]);
      setLoading(false);
    }

    void loadData();
  }, []);

  const languageNameById = useMemo(
    () => new Map(languages.map((item) => [item.id, item.name])),
    [languages]
  );

  const categoryNameById = useMemo(
    () => new Map(categories.map((item) => [item.id, item.name])),
    [categories]
  );

  function getBookAuthors(book: Book) {
    return (book.book_authors || [])
      .slice()
      .sort(
        (a, b) =>
          (a.author_order || 0) - (b.author_order || 0)
      )
      .map((item) =>
        item.authors ? getAuthorName(item.authors) : ""
      )
      .filter(Boolean);
  }

  function getBookCategories(book: Book) {
    return (book.book_categories || [])
      .map((item) => categoryNameById.get(item.category_id) || "")
      .filter(Boolean);
  }

  function getBookLanguage(book: Book) {
    if (!book.language_id) return "";
    return languageNameById.get(book.language_id) || "";
  }

  function getCoverUrl(coverPath: string | null) {
    if (!coverPath) return null;

    return supabase.storage
      .from("book-covers")
      .getPublicUrl(coverPath).data.publicUrl;
  }

  const filteredBooks = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();

    return books.filter((book) => {
      const authors = getBookAuthors(book);
      const categoryNames = getBookCategories(book);
      const languageName = getBookLanguage(book);

      const matchesSearch =
        !keyword ||
        [
          book.title || "",
          book.subtitle || "",
          book.description || "",
          book.isbn || "",
          book.publication_year
            ? String(book.publication_year)
            : "",
          authors.join(" "),
          categoryNames.join(" "),
          languageName,
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(keyword);

      const matchesLanguage =
        !languageFilter || languageName === languageFilter;

      const matchesCategory =
        !categoryFilter ||
        categoryNames.includes(categoryFilter);

      return (
        matchesSearch &&
        matchesLanguage &&
        matchesCategory
      );
    });
  }, [
    books,
    search,
    languageFilter,
    categoryFilter,
    languageNameById,
    categoryNameById,
  ]);

  function syncUrl(
    nextSearch: string,
    nextLanguage: string,
    nextCategory: string
  ) {
    const params = new URLSearchParams();

    if (nextSearch.trim()) {
      params.set("q", nextSearch.trim());
    }

    if (nextLanguage) {
      params.set("language", nextLanguage);
    }

    if (nextCategory) {
      params.set("category", nextCategory);
    }

    const query = params.toString();
    const nextUrl = query ? `/books?${query}` : "/books";

    window.history.replaceState({}, "", nextUrl);
  }

  function clearFilters() {
    setSearch("");
    setLanguageFilter("");
    setCategoryFilter("");
    window.history.replaceState({}, "", "/books");
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <PublicHeader active="books" />

      <section className="border-b border-[#d9d0c0] bg-[#fffdf8] px-6 py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
            Номын сан
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Бүх ном
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#766d61]">
            Номын нэр, зохиогч, ISBN болон сэдвээр хайж,
            хэл ба ангиллаар шүүн үзээрэй.
          </p>

          <div className="mt-9 rounded-2xl border border-[#d9d0c0] bg-[#f7f3ea] p-5 sm:p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                syncUrl(
                  search,
                  languageFilter,
                  categoryFilter
                );
              }}
              className="grid gap-4 lg:grid-cols-[1fr_220px_240px_auto]"
            >
              <div>
                <label className="text-xs font-medium uppercase tracking-[0.14em] text-[#766d61]">
                  Хайх
                </label>

                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ном, зохиогч, ISBN, сэдэв..."
                  className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
                />
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-[0.14em] text-[#766d61]">
                  Хэл
                </label>

                <select
                  value={languageFilter}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLanguageFilter(value);
                    syncUrl(search, value, categoryFilter);
                  }}
                  className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
                >
                  <option value="">Бүх хэл</option>

                  {languages.map((language) => (
                    <option
                      key={language.id}
                      value={language.name}
                    >
                      {language.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-[0.14em] text-[#766d61]">
                  Ангилал
                </label>

                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCategoryFilter(value);
                    syncUrl(search, languageFilter, value);
                  }}
                  className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
                >
                  <option value="">Бүх ангилал</option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="h-12 rounded-xl bg-[#29251f] px-5 text-sm font-medium text-white transition hover:bg-[#9a6b25]"
                >
                  Хайх
                </button>

                {(search ||
                  languageFilter ||
                  categoryFilter) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="h-12 rounded-xl border border-[#cfc4b2] px-4 text-sm text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
                  >
                    Цэвэрлэх
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-10 text-center text-sm text-[#766d61]">
              Номын санг уншиж байна...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Номын мэдээлэл татахад алдаа гарлаа: {error}
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-[#766d61]">
                  {filteredBooks.length} ном олдлоо
                </div>

                {(search ||
                  languageFilter ||
                  categoryFilter) && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {search && (
                      <span className="rounded-full border border-[#d9d0c0] bg-[#fffdf8] px-3 py-1.5">
                        “{search}”
                      </span>
                    )}

                    {languageFilter && (
                      <span className="rounded-full border border-[#d9d0c0] bg-[#fffdf8] px-3 py-1.5">
                        {languageFilter}
                      </span>
                    )}

                    {categoryFilter && (
                      <span className="rounded-full border border-[#d9d0c0] bg-[#fffdf8] px-3 py-1.5">
                        {categoryFilter}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {filteredBooks.length > 0 ? (
                <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredBooks.map((book) => {
                    const coverUrl = getCoverUrl(book.cover_path);
                    const authors = getBookAuthors(book);
                    const languageName = getBookLanguage(book);
                    const categoryNames =
                      getBookCategories(book);
                    const href = book.slug
                      ? `/books/${book.slug}`
                      : "#";

                    return (
                      <article
                        key={book.id}
                        className="group overflow-hidden rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] transition hover:-translate-y-1 hover:shadow-xl"
                      >
                        <a href={href} className="block">
                          <div className="flex h-80 items-center justify-center overflow-hidden bg-[#e6ddce] p-7">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={
                                  book.title ||
                                  "Номын хавтас"
                                }
                                className="h-64 w-44 object-cover shadow-xl transition duration-300 group-hover:scale-[1.02]"
                              />
                            ) : (
                              <div className="flex h-64 w-44 flex-col justify-between border border-[#9d8666] bg-[#d8c7aa] p-5 text-center shadow-xl">
                                <div className="text-[8px] uppercase tracking-[0.2em] text-[#59472f]">
                                  Mongol Empire
                                </div>

                                <div className="text-sm font-semibold leading-5 text-[#3e3223]">
                                  {book.title}
                                </div>

                                <div className="text-[8px] uppercase tracking-[0.15em] text-[#59472f]">
                                  Historical Archive
                                </div>
                              </div>
                            )}
                          </div>
                        </a>

                        <div className="p-6">
                          <div className="flex flex-wrap gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#9a6b25]">
                            {book.publication_year && (
                              <span>
                                {book.publication_year}
                              </span>
                            )}

                            {languageName && (
                              <span>· {languageName}</span>
                            )}
                          </div>

                          <a href={href} className="block">
                            <h2 className="mt-3 text-lg font-semibold leading-6 tracking-tight transition group-hover:text-[#9a6b25]">
                              {book.title}
                            </h2>
                          </a>

                          {authors.length > 0 && (
                            <p className="mt-2 text-sm font-medium leading-6 text-[#5f5549]">
                              {authors.join(", ")}
                            </p>
                          )}

                          {categoryNames.length > 0 && (
                            <p className="mt-3 text-xs leading-5 text-[#9a6b25]">
                              {categoryNames.join(" · ")}
                            </p>
                          )}

                          {book.description && (
                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#766d61]">
                              {book.description}
                            </p>
                          )}

                          {book.slug ? (
                            <a
                              href={href}
                              className="mt-6 inline-block text-sm font-medium text-[#29251f] transition hover:text-[#9a6b25]"
                            >
                              Дэлгэрэнгүй →
                            </a>
                          ) : (
                            <p className="mt-6 text-xs text-red-600">
                              Энэ номд slug байхгүй байна.
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-12 text-center">
                  <h2 className="text-xl font-semibold">
                    Тохирох ном олдсонгүй
                  </h2>

                  <p className="mt-3 text-sm text-[#766d61]">
                    Хайлтын үг эсвэл filter-ээ өөрчлөөд
                    дахин оролдоно уу.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-xl border border-[#cfc4b2] px-5 py-3 text-sm transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
                  >
                    Бүх номыг харуулах
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
