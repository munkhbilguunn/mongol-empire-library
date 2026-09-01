"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type LinkedBook = {
  id: string;
  title: string;
  subtitle: string | null;
  publication_year: number | null;
  slug: string | null;
  relation_type: string | null;
  relation_notes: string | null;
  display_order: number;
  author_names: string;
};

export default function EditSourcePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [titleOriginal, setTitleOriginal] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [writtenPeriod, setWrittenPeriod] = useState("");
  const [originalLanguage, setOriginalLanguage] = useState("");
  const [authorCompiler, setAuthorCompiler] = useState("");
  const [summary, setSummary] = useState("");
  const [historicalContext, setHistoricalContext] = useState("");
  const [contents, setContents] = useState("");
  const [significance, setSignificance] = useState("");
  const [textualTradition, setTextualTradition] = useState("");
  const [notes, setNotes] = useState("");
  const [slug, setSlug] = useState("");
  const [featured, setFeatured] = useState(false);

  const [linkedBooks, setLinkedBooks] = useState<LinkedBook[]>([]);
  const [linkedBooksError, setLinkedBooksError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#9a6b25]";
  const textareaClass =
    "mt-2 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#9a6b25]";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      setLinkedBooksError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data, error: sourceError } = await supabase
        .from("sources")
        .select("*")
        .eq("id", id)
        .single();

      if (sourceError) {
        setError(sourceError.message);
        setLoading(false);
        return;
      }

      setTitle(data.title || "");
      setTitleOriginal(data.title_original || "");
      setTitleEn(data.title_en || "");
      setSourceType(data.source_type || "");
      setWrittenPeriod(data.written_period || "");
      setOriginalLanguage(data.original_language || "");
      setAuthorCompiler(data.author_compiler || "");
      setSummary(data.summary || "");
      setHistoricalContext(data.historical_context || "");
      setContents(data.contents || "");
      setSignificance(data.significance || "");
      setTextualTradition(data.textual_tradition || "");
      setNotes(data.notes || "");
      setSlug(data.slug || "");
      setFeatured(Boolean(data.featured));

      const { data: linkData, error: linkError } = await supabase
        .from("source_books")
        .select("book_id, relation_type, notes, display_order")
        .eq("source_id", id)
        .order("display_order", { ascending: true });

      if (linkError) {
        setLinkedBooksError(linkError.message);
        setLoading(false);
        return;
      }

      const links = linkData || [];
      const bookIds = links.map((link: any) => link.book_id).filter(Boolean);

      if (bookIds.length === 0) {
        setLinkedBooks([]);
        setLoading(false);
        return;
      }

      const [booksResult, bookAuthorsResult] = await Promise.all([
        supabase
          .from("books")
          .select("id, title, subtitle, publication_year, slug")
          .in("id", bookIds),
        supabase
          .from("book_authors")
          .select("book_id, author_id, author_order")
          .in("book_id", bookIds)
          .order("author_order", { ascending: true }),
      ]);

      if (booksResult.error) {
        setLinkedBooksError(booksResult.error.message);
        setLoading(false);
        return;
      }

      if (bookAuthorsResult.error) {
        setLinkedBooksError(bookAuthorsResult.error.message);
        setLoading(false);
        return;
      }

      const bookAuthors = bookAuthorsResult.data || [];
      const authorIds = Array.from(
        new Set(
          bookAuthors.map((item: any) => item.author_id).filter(Boolean)
        )
      );

      let authorMap = new Map<string, string>();

      if (authorIds.length > 0) {
        const { data: authorsData, error: authorsError } = await supabase
          .from("authors")
          .select("id, name, name_mn, name_en")
          .in("id", authorIds);

        if (authorsError) {
          setLinkedBooksError(authorsError.message);
          setLoading(false);
          return;
        }

        authorMap = new Map(
          (authorsData || []).map((author: any) => [
            author.id,
            author.name_mn ||
              author.name ||
              author.name_en ||
              "Нэргүй зохиогч",
          ])
        );
      }

      const booksById = new Map(
        (booksResult.data || []).map((book: any) => [book.id, book])
      );

      const preparedBooks = links
        .map((link: any) => {
          const book = booksById.get(link.book_id);

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
            id: book.id,
            title: book.title,
            subtitle: book.subtitle,
            publication_year: book.publication_year,
            slug: book.slug,
            relation_type: link.relation_type,
            relation_notes: link.notes,
            display_order: link.display_order || 0,
            author_names: authorNames,
          } as LinkedBook;
        })
        .filter((book): book is LinkedBook => Boolean(book));

      setLinkedBooks(preparedBooks);
      setLoading(false);
    }

    if (id) {
      void load();
    }
  }, [id, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("sources")
      .update({
        title: title.trim(),
        title_original: titleOriginal.trim() || null,
        title_en: titleEn.trim() || null,
        source_type: sourceType.trim() || null,
        written_period: writtenPeriod.trim() || null,
        original_language: originalLanguage.trim() || null,
        author_compiler: authorCompiler.trim() || null,
        summary: summary.trim() || null,
        historical_context: historicalContext.trim() || null,
        contents: contents.trim() || null,
        significance: significance.trim() || null,
        textual_tradition: textualTradition.trim() || null,
        notes: notes.trim() || null,
        slug: slug.trim() || null,
        featured,
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/admin/sources");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f3ea] px-6 py-16 text-center text-sm text-[#766d61]">
        Уншиж байна...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-6 py-10 text-[#29251f] lg:px-8">
      <div className="mx-auto max-w-4xl">
        <a
          href="/admin/sources"
          className="text-sm font-medium text-[#8b672f] hover:underline"
        >
          ← Эх сурвалж
        </a>

        <div className="mt-8 flex flex-col justify-between gap-5 border-b border-[#d9d0c0] pb-7 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#9a6b25]">
              Admin / Sources
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Эх сурвалж засах
            </h1>
          </div>

          {slug && (
            <a
              href={`/sources/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-[#cfc4b2] px-4 py-2.5 text-sm font-medium text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
            >
              Нийтэд үзэх ↗
            </a>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-6 sm:p-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Монгол нэр *</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="Монголын нууц товчоон"
              />
            </label>

            <label>
              <span className="text-sm font-medium">Эх нэр</span>
              <input
                value={titleOriginal}
                onChange={(e) => setTitleOriginal(e.target.value)}
                className={inputClass}
                placeholder="元史"
              />
            </label>

            <label>
              <span className="text-sm font-medium">Англи нэр</span>
              <input
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className={inputClass}
                placeholder="The Secret History of the Mongols"
              />
            </label>

            <label>
              <span className="text-sm font-medium">Төрөл</span>
              <input
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className={inputClass}
                placeholder="Анхдагч эх сурвалж"
              />
            </label>

            <label>
              <span className="text-sm font-medium">Бичигдсэн үе</span>
              <input
                value={writtenPeriod}
                onChange={(e) => setWrittenPeriod(e.target.value)}
                className={inputClass}
                placeholder="XIII зуун"
              />
            </label>

            <label>
              <span className="text-sm font-medium">Эх хэл</span>
              <input
                value={originalLanguage}
                onChange={(e) => setOriginalLanguage(e.target.value)}
                className={inputClass}
                placeholder="Дундад монгол хэл"
              />
            </label>

            <label>
              <span className="text-sm font-medium">
                Зохиогч / эмхэтгэгч
              </span>
              <input
                value={authorCompiler}
                onChange={(e) => setAuthorCompiler(e.target.value)}
                className={inputClass}
                placeholder="Рашид ад-Дин Фазлуллах"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Slug</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={inputClass}
                placeholder="Хоосон орхивол автоматаар үүснэ"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Товч танилцуулга</span>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className={textareaClass}
                rows={5}
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Түүхэн нөхцөл</span>
              <textarea
                value={historicalContext}
                onChange={(e) => setHistoricalContext(e.target.value)}
                className={textareaClass}
                rows={6}
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Агуулга, бүтэц</span>
              <textarea
                value={contents}
                onChange={(e) => setContents(e.target.value)}
                className={textareaClass}
                rows={6}
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-medium">
                Судалгааны ач холбогдол
              </span>
              <textarea
                value={significance}
                onChange={(e) => setSignificance(e.target.value)}
                className={textareaClass}
                rows={6}
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-medium">
                Эх бичиг ба уламжлал
              </span>
              <textarea
                value={textualTradition}
                onChange={(e) => setTextualTradition(e.target.value)}
                className={textareaClass}
                rows={6}
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Нэмэлт тайлбар</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={textareaClass}
                rows={5}
              />
            </label>

            <label className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-[#d9d0c0] bg-[#f7f3ea] p-4">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              <span className="text-sm font-medium">
                Онцлох эх сурвалж
              </span>
            </label>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <a
              href="/admin/sources"
              className="rounded-xl border border-[#cfc4b2] px-5 py-3 text-sm font-medium"
            >
              Болих
            </a>

            <button
              disabled={saving}
              type="submit"
              className="rounded-xl bg-[#29251f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a6b25] disabled:opacity-60"
            >
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </form>

        <section className="mt-8 rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                Холбоотой номууд
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Энэ эх сурвалжтай холбоотой номууд
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#766d61]">
                Номын admin засварын хэсгээс энэ холбоосыг нэмэх, өөрчлөх,
                устгах боломжтой.
              </p>
            </div>

            <div className="text-sm text-[#766d61]">
              Нийт {linkedBooks.length} ном
            </div>
          </div>

          {linkedBooksError ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Холбоотой номын мэдээлэл татахад алдаа гарлаа:{" "}
              {linkedBooksError}
            </div>
          ) : linkedBooks.length > 0 ? (
            <div className="mt-7 divide-y divide-[#e3dbcf] overflow-hidden rounded-xl border border-[#d9d0c0]">
              {linkedBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-[#f7f3ea] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6"
                >
                  <div className="min-w-0">
                    {book.relation_type && (
                      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#9a6b25]">
                        {book.relation_type}
                      </div>
                    )}

                    <h3 className="mt-2 text-lg font-semibold">
                      {book.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#766d61]">
                      {book.author_names && (
                        <span>{book.author_names}</span>
                      )}

                      {book.publication_year && (
                        <span>{book.publication_year}</span>
                      )}
                    </div>

                    {book.subtitle && (
                      <p className="mt-2 text-sm leading-6 text-[#766d61]">
                        {book.subtitle}
                      </p>
                    )}

                    {book.relation_notes && (
                      <p className="mt-3 text-xs leading-6 text-[#84786a]">
                        {book.relation_notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex shrink-0 flex-wrap gap-2 sm:mt-0">
                    {book.slug && (
                      <>
                        <a
                          href={`/books/${book.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-[#cfc4b2] px-3.5 py-2 text-xs font-medium text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
                        >
                          Нийтэд үзэх
                        </a>

                        <a
                          href={`/admin/books/${book.slug}/edit`}
                          className="rounded-lg bg-[#29251f] px-3.5 py-2 text-xs font-medium text-white transition hover:bg-[#9a6b25]"
                        >
                          Ном засах
                        </a>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-xl border border-dashed border-[#cfc4b2] bg-[#f7f3ea] p-8 text-center">
              <p className="text-sm text-[#766d61]">
                Энэ эх сурвалжтай холбоотой ном одоогоор байхгүй байна.
              </p>
              <a
                href="/admin/books"
                className="mt-4 inline-block text-sm font-medium text-[#8b672f] hover:underline"
              >
                Номууд руу очих →
              </a>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}