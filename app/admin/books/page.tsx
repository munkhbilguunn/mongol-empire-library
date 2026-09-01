"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Book = {
  id: string;
  title: string;
  slug?: string | null;
  publication_year?: number | null;
  featured?: boolean | null;
  author_names?: string[];
};

type FeaturedFilter = "all" | "featured" | "not-featured";

export default function AdminBooksPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [featuredFilter, setFeaturedFilter] =
    useState<FeaturedFilter>("all");

  useEffect(() => {
    async function loadBooks() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      setUser(user);

      const { data: bookData, error: bookError } =
        await supabase
          .from("books")
          .select(
            "id, title, slug, publication_year, featured"
          )
          .order("created_at", { ascending: false });

      if (bookError) {
        setError(bookError.message);
        setLoading(false);
        return;
      }

      const baseBooks = (bookData || []) as Book[];
      const bookIds = baseBooks.map((book) => book.id);

      if (bookIds.length === 0) {
        setBooks([]);
        setLoading(false);
        return;
      }

      const { data: linkData, error: linkError } =
        await supabase
          .from("book_authors")
          .select("book_id, author_id, author_order")
          .in("book_id", bookIds)
          .order("author_order", { ascending: true });

      if (linkError) {
        setError(linkError.message);
        setLoading(false);
        return;
      }

      const authorIds = Array.from(
        new Set(
          (linkData || []).map(
            (link: any) => link.author_id
          )
        )
      );

      let authorMap = new Map<string, string>();

      if (authorIds.length > 0) {
        const { data: authorData, error: authorError } =
          await supabase
            .from("authors")
            .select("id, name, name_mn, name_en")
            .in("id", authorIds);

        if (authorError) {
          setError(authorError.message);
          setLoading(false);
          return;
        }

        authorMap = new Map(
          (authorData || []).map((author: any) => [
            author.id,
            author.name_mn ||
              author.name ||
              author.name_en ||
              "Нэргүй зохиогч",
          ])
        );
      }

      const linksByBook = new Map<string, any[]>();

      for (const link of linkData || []) {
        const current =
          linksByBook.get(link.book_id) || [];
        current.push(link);
        linksByBook.set(link.book_id, current);
      }

      const booksWithAuthors = baseBooks.map((book) => {
        const links = (
          linksByBook.get(book.id) || []
        ).slice();

        links.sort(
          (a, b) =>
            (a.author_order || 0) -
            (b.author_order || 0)
        );

        return {
          ...book,
          author_names: links
            .map((link) => authorMap.get(link.author_id))
            .filter(Boolean) as string[],
        };
      });

      setBooks(booksWithAuthors);
      setLoading(false);
    }

    loadBooks();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  async function handleDeleteBook(
    bookId: string,
    title: string
  ) {
    const confirmed = window.confirm(
      `"${title}" номыг устгахдаа итгэлтэй байна уу?\n\nЭнэ үйлдлийг буцаах боломжгүй.`
    );

    if (!confirmed) {
      return;
    }

    const { error: categoryError } = await supabase
      .from("book_categories")
      .delete()
      .eq("book_id", bookId);

    if (categoryError) {
      alert(
        `Ангиллын холбоос устгахад алдаа гарлаа:\n${categoryError.message}`
      );
      return;
    }

    const { error: authorLinkError } = await supabase
      .from("book_authors")
      .delete()
      .eq("book_id", bookId);

    if (authorLinkError) {
      alert(
        `Зохиогчийн холбоос устгахад алдаа гарлаа:\n${authorLinkError.message}`
      );
      return;
    }

    const { error: bookError } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId);

    if (bookError) {
      alert(
        `Ном устгахад алдаа гарлаа:\n${bookError.message}`
      );
      return;
    }

    setBooks((currentBooks) =>
      currentBooks.filter((book) => book.id !== bookId)
    );
  }

  function getAuthorNames(book: Book) {
    return (book.author_names || []).join(", ");
  }

  const filteredBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return books.filter((book) => {
      // Search
      const authorNames = getAuthorNames(book);

      const matchesSearch =
        keyword === "" ||
        book.title.toLowerCase().includes(keyword) ||
        authorNames.toLowerCase().includes(keyword);

      // Featured filter
      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && book.featured === true) ||
        (featuredFilter === "not-featured" &&
          book.featured !== true);

      return matchesSearch && matchesFeatured;
    });
  }, [books, search, featuredFilter]);

  function clearFilters() {
    setSearch("");
    setFeaturedFilter("all");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea]">
        <div className="text-sm text-[#766d61]">
          Номнуудыг уншиж байна...
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">

      {/* HEADER */}
      <header className="border-b border-[#d9d0c0] bg-[#fffdf8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">

          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-[#9a6b25]">
              Historical Archive
            </div>

            <div className="mt-1 text-lg font-semibold tracking-tight">
              Монголын эзэнт гүрний түүхийн сан
            </div>
          </div>

          <div className="flex items-center gap-4">

            <span className="hidden text-sm text-[#766d61] sm:block">
              {user.email}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-full border border-[#cfc4b2] px-4 py-2 text-xs text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
            >
              Гарах
            </button>

          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* TITLE */}
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>
              <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
                Library
              </div>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                Бүх ном
              </h1>

              <p className="mt-3 text-sm text-[#766d61]">
                Номын сан дахь бүх номыг эндээс удирдана.
              </p>
            </div>

            <div className="flex gap-3">

              <a
                href="/admin"
                className="inline-flex items-center justify-center rounded-xl border border-[#cfc4b2] px-5 py-3 text-sm font-medium text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
              >
                ← Dashboard
              </a>

              <a
                href="/admin/authors"
                className="inline-flex items-center justify-center rounded-xl border border-[#cfc4b2] px-5 py-3 text-sm font-medium text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
              >
                Зохиогчид
              </a>

              <a
                href="/admin/books/new"
                className="inline-flex items-center justify-center rounded-xl bg-[#29251f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a6b25]"
              >
                + Шинэ ном нэмэх
              </a>

            </div>
          </div>

          {/* SEARCH + FILTER */}
          <div className="mt-10 rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-5">

            <div className="flex flex-col gap-4 lg:flex-row">

              {/* SEARCH */}
              <div className="relative flex-1">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#9a8e7e]">
                  🔎
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Номын нэр эсвэл зохиогчоор хайх..."
                  className="h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] pl-11 pr-4 text-sm outline-none transition focus:border-[#9a6b25] focus:ring-1 focus:ring-[#9a6b25]"
                />

              </div>

              {/* FEATURED FILTER */}
              <select
                value={featuredFilter}
                onChange={(e) =>
                  setFeaturedFilter(
                    e.target.value as FeaturedFilter
                  )
                }
                className="h-12 rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm text-[#625b50] outline-none transition focus:border-[#9a6b25]"
              >
                <option value="all">
                  Бүх ном
                </option>

                <option value="featured">
                  ⭐ Featured
                </option>

                <option value="not-featured">
                  Featured биш
                </option>
              </select>

            </div>

            {/* FILTER INFO */}
            <div className="mt-4 flex flex-col gap-3 border-t border-[#e5ded3] pt-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="text-sm text-[#766d61]">
                <span className="font-medium text-[#29251f]">
                  {filteredBooks.length}
                </span>{" "}
                ном харагдаж байна
                {search.trim() && (
                  <>
                    {" "}
                    · “{search}” хайлт
                  </>
                )}
              </div>

              {(search || featuredFilter !== "all") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-left text-sm font-medium text-[#9a6b25] hover:underline sm:text-right"
                >
                  Фильтр цэвэрлэх
                </button>
              )}

            </div>

          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Ном татахад алдаа гарлаа:
              <div className="mt-2 font-medium">
                {error}
              </div>
            </div>
          )}

          {/* BOOK LIST */}
          <div className="mt-10">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
                  Books
                </div>

                <h2 className="mt-2 text-2xl font-semibold">
                  Номын жагсаалт
                </h2>
              </div>

              <div className="text-sm text-[#766d61]">
                Нийт {books.length} ном
              </div>

            </div>

            <div className="overflow-hidden rounded-2xl border border-[#d9d0c0] bg-[#fffdf8]">

              {filteredBooks.length > 0 ? (

                <div className="divide-y divide-[#e3dbcf]">

                  {filteredBooks.map((book) => (

                    <div
                      key={book.id}
                      className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"
                    >

                      {/* BOOK INFO */}
                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-3">

                          <h3 className="text-lg font-semibold">
                            {book.title}
                          </h3>

                          {book.featured && (
                            <span className="rounded-full bg-[#f0e2c8] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#8b672f]">
                              FEATURED
                            </span>
                          )}

                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#766d61]">

                          {getAuthorNames(book) && (
                            <span>
                              Зохиогч: {getAuthorNames(book)}
                            </span>
                          )}

                          {book.publication_year && (
                            <span>
                              Он: {book.publication_year}
                            </span>
                          )}

                        </div>

                      </div>

                      {/* ACTIONS */}
                      <div className="flex shrink-0 flex-wrap gap-3">

                        <a
                          href={book.slug ? `/books/${book.slug}` : "/books"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-[#cfc4b2] px-4 py-2.5 text-xs text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
                        >
                          Үзэх
                        </a>

                        <a
                          href={book.slug ? `/admin/books/${book.slug}/edit` : "#"}
                          className="rounded-lg bg-[#29251f] px-4 py-2.5 text-xs text-white transition hover:bg-[#9a6b25]"
                        >
                          ✏️ Засах
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteBook(
                              book.id,
                              book.title
                            )
                          }
                          className="rounded-lg border border-red-200 px-4 py-2.5 text-xs text-red-600 transition hover:border-red-400 hover:bg-red-50"
                        >
                          🗑️ Устгах
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="p-12 text-center">

                  <div className="text-4xl">
                    🔎
                  </div>

                  <div className="mt-5 text-lg font-semibold">
                    Илэрц олдсонгүй
                  </div>

                  <p className="mt-2 text-sm text-[#766d61]">
                    Хайлтын үг эсвэл filter-ээ өөрчлөөд дахин оролдоно уу.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-xl bg-[#29251f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a6b25]"
                  >
                    Фильтр цэвэрлэх
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>
      </section>

    </main>
  );
}