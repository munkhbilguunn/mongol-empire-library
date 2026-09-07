"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

type Source = {
  id: string;
  title: string;
  title_original: string | null;
  title_en: string | null;
};

type SelectedSource = Source & {
  relation_type: string;
  notes: string;
  display_order: number;
};

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
  slug: string | null;
};

type BookAuthorLink = {
  author_id: string;
  author_order: number | null;
};

function getAuthorName(author: Author) {
  return author.name_mn || author.name || author.name_en || "Нэргүй зохиогч";
}

function normalizeName(value: string | null) {
  return (value || "").trim().toLocaleLowerCase();
}

function authorMatchesExactName(author: Author, value: string) {
  const normalizedValue = normalizeName(value);

  return [author.name, author.name_mn, author.name_en].some(
    (name) => normalizeName(name) === normalizedValue
  );
}


function slugifyTitle(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .trim()
    .replace(/[’'"“”]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
const rawRouteSlug = params.slug as string;
const routeSlug = decodeURIComponent(rawRouteSlug);
  const [bookId, setBookId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingAuthor, setCreatingAuthor] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [languages, setLanguages] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSources, setSelectedSources] = useState<SelectedSource[]>([]);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [isbn, setIsbn] = useState("");
  const [slug, setSlug] = useState("");
  const [languageId, setLanguageId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [featured, setFeatured] = useState(false);

  const [authorSearch, setAuthorSearch] = useState("");
  const [selectedAuthors, setSelectedAuthors] = useState<Author[]>([]);

  const [existingCoverPath, setExistingCoverPath] = useState<string | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [removeCover, setRemoveCover] = useState(false);

  const filteredAuthors = useMemo(() => {
    const keyword = authorSearch.trim().toLocaleLowerCase();

    if (!keyword) {
      return [];
    }

    const selectedIds = new Set(selectedAuthors.map((author) => author.id));

    return authors
      .filter((author) => {
        if (selectedIds.has(author.id)) {
          return false;
        }

        return (
          (author.name || "").toLocaleLowerCase().includes(keyword) ||
          (author.name_mn || "").toLocaleLowerCase().includes(keyword) ||
          (author.name_en || "").toLocaleLowerCase().includes(keyword)
        );
      })
      .slice(0, 8);
  }, [authors, authorSearch, selectedAuthors]);

  const exactAuthor = useMemo(() => {
    const keyword = authorSearch.trim();

    if (!keyword) {
      return null;
    }

    return authors.find((author) => authorMatchesExactName(author, keyword)) || null;
  }, [authors, authorSearch]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [coverFile]);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;

    setError("");

    if (!file) {
      setCoverFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Cover зураг JPG, PNG эсвэл WebP форматтай байна.");
      e.target.value = "";
      setCoverFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Cover зургийн хэмжээ 5 MB-аас ихгүй байна.");
      e.target.value = "";
      setCoverFile(null);
      return;
    }

    setCoverFile(file);
    setRemoveCover(false);
  }

  function getCoverExtension(file: File) {
    const extensionFromName = file.name.split(".").pop()?.toLowerCase();

    if (
      extensionFromName &&
      ["jpg", "jpeg", "png", "webp"].includes(extensionFromName)
    ) {
      return extensionFromName === "jpeg" ? "jpg" : extensionFromName;
    }

    if (file.type === "image/png") return "png";
    if (file.type === "image/webp") return "webp";
    return "jpg";
  }

  function markCoverForRemoval() {
    setCoverFile(null);
    setRemoveCover(true);
    setError("");
    setSuccess("");
  }

  function cancelCoverRemoval() {
    setRemoveCover(false);
    setError("");
  }

  useEffect(() => {
    async function loadBook() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const [
        bookResult,
        languagesResult,
        categoriesResult,
        authorsResult,
        sourcesResult,
      ] = await Promise.all([
        supabase.from("books").select("*").eq("slug", routeSlug).single(),
        supabase.from("languages").select("id, name").order("name"),
        supabase.from("categories").select("id, name").order("name"),
        supabase
          .from("authors")
          .select("id, name, name_mn, name_en")
          .order("name"),
        supabase
          .from("sources")
          .select("id, title, title_original, title_en")
          .order("title"),
      ]);

      if (bookResult.error) {
        setError(bookResult.error.message);
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

      if (authorsResult.error) {
        setError(authorsResult.error.message);
        setLoading(false);
        return;
      }

      if (sourcesResult.error) {
        setError(sourcesResult.error.message);
        setLoading(false);
        return;
      }

      const book = bookResult.data as Book;
      const loadedAuthors = (authorsResult.data || []) as Author[];
      const loadedSources = (sourcesResult.data || []) as Source[];

      setBookId(book.id);

      setTitle(book.title || "");
      setSubtitle(book.subtitle || "");
      setDescription(book.description || "");
      setPublicationYear(
        book.publication_year ? String(book.publication_year) : ""
      );
      setIsbn(book.isbn || "");
      setSlug(book.slug || slugifyTitle(book.title || ""));
      setLanguageId(book.language_id || "");
      setFeatured(Boolean(book.featured));
      setExistingCoverPath(book.cover_path || null);

      if (book.cover_path) {
        const { data: publicUrlData } = supabase.storage
          .from("book-covers")
          .getPublicUrl(book.cover_path);
        setExistingCoverUrl(publicUrlData.publicUrl);
      } else {
        setExistingCoverUrl("");
      }

      setLanguages(languagesResult.data || []);
      setCategories(categoriesResult.data || []);
      setAuthors(loadedAuthors);
      setSources(loadedSources);

      const [
        bookCategoryResult,
        bookAuthorsResult,
        sourceBooksResult,
      ] = await Promise.all([
        supabase
          .from("book_categories")
          .select("category_id")
          .eq("book_id", book.id)
          .limit(1)
          .maybeSingle(),
        supabase
          .from("book_authors")
          .select("author_id, author_order")
          .eq("book_id", book.id)
          .order("author_order", { ascending: true }),
        supabase
          .from("source_books")
          .select("source_id, relation_type, notes, display_order")
          .eq("book_id", book.id)
          .order("display_order", { ascending: true }),
      ]);

      if (bookCategoryResult.error) {
        setError(bookCategoryResult.error.message);
        setLoading(false);
        return;
      }

      if (bookAuthorsResult.error) {
        setError(bookAuthorsResult.error.message);
        setLoading(false);
        return;
      }

      if (sourceBooksResult.error) {
        setError(sourceBooksResult.error.message);
        setLoading(false);
        return;
      }

      setCategoryId(bookCategoryResult.data?.category_id || "");

      const authorMap = new Map(loadedAuthors.map((author) => [author.id, author]));
      const linkedAuthors = ((bookAuthorsResult.data || []) as BookAuthorLink[])
        .map((link) => authorMap.get(link.author_id))
        .filter((author): author is Author => Boolean(author));

      setSelectedAuthors(linkedAuthors);

      const sourceMap = new Map(
        loadedSources.map((source) => [source.id, source])
      );

      const linkedSources = (sourceBooksResult.data || [])
        .map((link: any) => {
          const source = sourceMap.get(link.source_id);

          if (!source) return null;

          return {
            ...source,
            relation_type: link.relation_type || "",
            notes: link.notes || "",
            display_order: link.display_order || 0,
          } as SelectedSource;
        })
        .filter((source): source is SelectedSource => Boolean(source));

      setSelectedSources(linkedSources);
      setLoading(false);
    }

    if (routeSlug) {
      void loadBook();
    }
  }, [routeSlug, router]);

  function addAuthor(author: Author) {
    setSelectedAuthors((current) => {
      if (current.some((item) => item.id === author.id)) {
        return current;
      }

      return [...current, author];
    });

    setAuthorSearch("");
    setError("");
  }

  function removeAuthor(authorId: string) {
    setSelectedAuthors((current) =>
      current.filter((author) => author.id !== authorId)
    );
  }

  async function handleAddTypedAuthor() {
    const typedName = authorSearch.trim();

    if (!typedName) {
      return;
    }

    setError("");
    setSuccess("");

    const existingAuthor = authors.find((author) =>
      authorMatchesExactName(author, typedName)
    );

    if (existingAuthor) {
      addAuthor(existingAuthor);
      return;
    }

    setCreatingAuthor(true);

    const { data: newAuthor, error: authorError } = await supabase
      .from("authors")
      .insert({
        name: typedName,
      })
      .select("id, name, name_mn, name_en")
      .single();

    setCreatingAuthor(false);

    if (authorError) {
      setError(`Зохиогч нэмэхэд алдаа гарлаа: ${authorError.message}`);
      return;
    }

    if (!newAuthor) {
      setError("Зохиогч үүссэнгүй.");
      return;
    }

    setAuthors((current) =>
      [...current, newAuthor].sort((a, b) =>
        getAuthorName(a).localeCompare(getAuthorName(b))
      )
    );

    setSelectedAuthors((current) => [...current, newAuthor]);
    setAuthorSearch("");
    setSuccess(`"${getAuthorName(newAuthor)}" шинэ зохиогчоор нэмэгдлээ.`);
  }

  function handleAuthorKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleAddTypedAuthor();
    }
  }

  function isSourceSelected(sourceId: string) {
    return selectedSources.some((source) => source.id === sourceId);
  }

  function toggleSource(source: Source) {
    setSelectedSources((current) => {
      const exists = current.some((item) => item.id === source.id);

      if (exists) {
        return current.filter((item) => item.id !== source.id);
      }

      return [
        ...current,
        {
          ...source,
          relation_type: "",
          notes: "",
          display_order: current.length + 1,
        },
      ];
    });
  }

  function updateSourceField(
    sourceId: string,
    field: "relation_type" | "notes",
    value: string
  ) {
    setSelectedSources((current) =>
      current.map((source) =>
        source.id === sourceId ? { ...source, [field]: value } : source
      )
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Номын нэрийг оруулна уу.");
      return;
    }

    const normalizedSlug = slugifyTitle(slug || title);

    if (!normalizedSlug) {
      setError("URL slug үүсгэх боломжгүй байна. Slug талбарыг шалгана уу.");
      return;
    }

    setSaving(true);

    const { data: slugConflict, error: slugCheckError } = await supabase
      .from("books")
      .select("id")
      .eq("slug", normalizedSlug)
      .neq("id", bookId)
      .limit(1)
      .maybeSingle();

    if (slugCheckError) {
      setError(`URL slug шалгахад алдаа гарлаа: ${slugCheckError.message}`);
      setSaving(false);
      return;
    }

    if (slugConflict) {
      setError("Энэ URL slug өөр ном дээр ашиглагдсан байна. Өөр slug сонгоно уу.");
      setSaving(false);
      return;
    }

    let uploadedCoverPath: string | null = null;
    let nextCoverPath: string | null = existingCoverPath;

    if (coverFile) {
      const extension = getCoverExtension(coverFile);
      const coverPath = `books/${crypto.randomUUID()}.${extension}`;

      const { error: coverUploadError } = await supabase.storage
        .from("book-covers")
        .upload(coverPath, coverFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: coverFile.type,
        });

      if (coverUploadError) {
        setError(`Cover зураг upload хийхэд алдаа гарлаа: ${coverUploadError.message}`);
        setSaving(false);
        return;
      }

      uploadedCoverPath = coverPath;
      nextCoverPath = coverPath;
    } else if (removeCover) {
      nextCoverPath = null;
    }

    const { error: bookError } = await supabase
      .from("books")
      .update({
        title: title.trim(),
        slug: normalizedSlug,
        subtitle: subtitle.trim() || null,
        description: description.trim() || null,
        publication_year: publicationYear ? Number(publicationYear) : null,
        isbn: isbn.trim() || null,
        featured,
        language_id: languageId || null,
        cover_path: nextCoverPath,
      })
      .eq("id", bookId);

    if (bookError) {
      if (uploadedCoverPath) {
        await supabase.storage.from("book-covers").remove([uploadedCoverPath]);
      }

      setError(bookError.message);
      setSaving(false);
      return;
    }

    const { error: deleteCategoryError } = await supabase
      .from("book_categories")
      .delete()
      .eq("book_id", bookId);

    if (deleteCategoryError) {
      setError(`Ангилал шинэчлэхэд алдаа гарлаа: ${deleteCategoryError.message}`);
      setSaving(false);
      return;
    }

    if (categoryId) {
      const { error: categoryError } = await supabase
        .from("book_categories")
        .insert({
          book_id: bookId,
          category_id: categoryId,
        });

      if (categoryError) {
        setError(`Ангилал хадгалахад алдаа гарлаа: ${categoryError.message}`);
        setSaving(false);
        return;
      }
    }

    const { error: deleteAuthorError } = await supabase
      .from("book_authors")
      .delete()
      .eq("book_id", bookId);

    if (deleteAuthorError) {
      setError(
        `Зохиогчийн холбоос шинэчлэхэд алдаа гарлаа: ${deleteAuthorError.message}`
      );
      setSaving(false);
      return;
    }

    if (selectedAuthors.length > 0) {
      const authorLinks = selectedAuthors.map((author, index) => ({
        book_id: bookId,
        author_id: author.id,
        author_order: index + 1,
      }));

      const { error: authorLinkError } = await supabase
        .from("book_authors")
        .insert(authorLinks);

      if (authorLinkError) {
        setError(
          `Зохиогчийг номтой холбоход алдаа гарлаа: ${authorLinkError.message}`
        );
        setSaving(false);
        return;
      }
    }

    const { error: deleteSourceBooksError } = await supabase
      .from("source_books")
      .delete()
      .eq("book_id", bookId);

    if (deleteSourceBooksError) {
      setError(
        `Эх сурвалжийн холбоос шинэчлэхэд алдаа гарлаа: ${deleteSourceBooksError.message}`
      );
      setSaving(false);
      return;
    }

    if (selectedSources.length > 0) {
      const sourceLinks = selectedSources.map((source, index) => ({
        book_id: bookId,
        source_id: source.id,
        relation_type: source.relation_type.trim() || null,
        notes: source.notes.trim() || null,
        display_order: index + 1,
      }));

      const { error: sourceLinkError } = await supabase
        .from("source_books")
        .insert(sourceLinks);

      if (sourceLinkError) {
        setError(
          `Эх сурвалжийг номтой холбоход алдаа гарлаа: ${sourceLinkError.message}`
        );
        setSaving(false);
        return;
      }
    }

    if (
      existingCoverPath &&
      existingCoverPath !== nextCoverPath &&
      (uploadedCoverPath || removeCover)
    ) {
      const { error: oldCoverDeleteError } = await supabase.storage
        .from("book-covers")
        .remove([existingCoverPath]);

      if (oldCoverDeleteError) {
        setSuccess(
          "Ном шинэчлэгдлээ. Гэхдээ хуучин cover файлыг Storage-оос устгаж чадсангүй."
        );
        setSaving(false);
        return;
      }
    }

    setExistingCoverPath(nextCoverPath);
    setRemoveCover(false);
    setCoverFile(null);
    setSuccess("Номын мэдээлэл амжилттай шинэчлэгдлээ.");
    setSaving(false);

    setTimeout(() => {
      router.push("/admin/books");
      router.refresh();
    }, 800);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea]">
        <div className="text-sm text-[#766d61]">
          Номын мэдээллийг уншиж байна...
        </div>
      </main>
    );
  }

  if (error && !title) {
    return (
      <main className="min-h-screen bg-[#f7f3ea] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <div className="font-medium">Номыг уншихад алдаа гарлаа</div>
            <div className="mt-2 text-sm">{error}</div>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="mt-6 rounded-xl border border-[#cfc4b2] px-5 py-3 text-sm"
          >
            ← Dashboard руу буцах
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <header className="border-b border-[#d9d0c0] bg-[#fffdf8]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 lg:px-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-[#9a6b25]">
              Administration
            </div>
            <div className="mt-1 text-lg font-semibold">
              Монголын эзэнт гүрний түүхийн сан
            </div>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-full border border-[#cfc4b2] px-4 py-2 text-xs text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <section className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
              Library
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Ном засах
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#766d61]">
              Номын мэдээллийг өөрчлөөд хадгална.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                Үндсэн мэдээлэл
              </div>

              <div className="mt-7 space-y-6">
                <div>
                  <label className="text-sm font-medium">Номын нэр *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">URL slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    onBlur={() => setSlug(slugifyTitle(slug || title))}
                    placeholder="venice-and-the-mongols"
                    className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
                  />
                  <p className="mt-2 text-xs leading-5 text-[#766d61]">
                    Public URL: /books/{slugifyTitle(slug || title) || "..."}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Дэд гарчиг</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Тайлбар</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="mt-2 w-full resize-none rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#9a6b25]"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                Ном зүйн мэдээлэл
              </div>

              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Хэвлэгдсэн он</label>
                  <input
                    type="number"
                    value={publicationYear}
                    onChange={(e) => setPublicationYear(e.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">ISBN</label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                Cover зураг
              </div>

              <div className="mt-7 grid gap-7 sm:grid-cols-[180px_1fr] sm:items-start">
                <div className="overflow-hidden rounded-xl border border-[#d9d0c0] bg-[#f7f3ea]">
                  {coverPreviewUrl ? (
                    <img
                      src={coverPreviewUrl}
                      alt="Шинээр сонгосон cover preview"
                      className="aspect-[2/3] w-full object-cover"
                    />
                  ) : !removeCover && existingCoverUrl ? (
                    <img
                      src={existingCoverUrl}
                      alt={`${title || "Ном"} cover`}
                      className="aspect-[2/3] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[2/3] items-center justify-center px-4 text-center text-xs leading-5 text-[#8c8376]">
                      Cover зураг байхгүй
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    {existingCoverPath && !removeCover
                      ? "Шинэ зургаар солих"
                      : "Cover зураг сонгох"}
                  </label>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverChange}
                    className="mt-2 block w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#29251f] file:px-4 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-[#9a6b25]"
                  />

                  <p className="mt-3 text-xs leading-5 text-[#766d61]">
                    JPG, PNG эсвэл WebP. Хамгийн ихдээ 5 MB. Босоо 2:3
                    харьцаатай зураг тохиромжтой.
                  </p>

                  {coverFile && (
                    <div className="mt-4 rounded-xl border border-[#d9d0c0] bg-[#f7f3ea] p-4">
                      <div className="text-sm text-[#625b50]">
                        Шинэ зураг: {coverFile.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCoverFile(null)}
                        className="mt-3 rounded-lg border border-[#cfc4b2] px-3 py-2 text-xs text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
                      >
                        Шинэ зургийн сонголтыг цуцлах
                      </button>
                    </div>
                  )}

                  {existingCoverPath && !coverFile && !removeCover && (
                    <button
                      type="button"
                      onClick={markCoverForRemoval}
                      className="mt-5 rounded-xl border border-red-200 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
                    >
                      Cover зургийг устгах
                    </button>
                  )}

                  {removeCover && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                      <div className="text-sm text-red-700">
                        Cover зураг хадгалах үед устгагдана.
                      </div>
                      <button
                        type="button"
                        onClick={cancelCoverRemoval}
                        className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-red-700"
                      >
                        Устгахыг болиулах
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                  Зохиогчид
                </div>
                <h2 className="mt-2 text-xl font-semibold">Номын зохиогчид</h2>
                <p className="mt-2 text-sm leading-6 text-[#766d61]">
                  Одоогийн зохиогчид доор харагдана. Нэрийг нь бичээд Enter
                  дарж нэмэх, “Хасах” товчоор салгах боломжтой.
                </p>
              </div>

              {selectedAuthors.length > 0 ? (
                <div className="mt-6">
                  <div className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-[#766d61]">
                    Сонгосон зохиогчид
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedAuthors.map((author, index) => (
                      <div
                        key={author.id}
                        className="flex items-center gap-2 rounded-full border border-[#cfc4b2] bg-[#f7f3ea] px-4 py-2 text-sm"
                      >
                        <span className="text-xs text-[#9a6b25]">
                          {index + 1}.
                        </span>
                        <span>{getAuthorName(author)}</span>
                        <button
                          type="button"
                          onClick={() => removeAuthor(author.id)}
                          className="ml-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                          aria-label={`${getAuthorName(author)}-г хасах`}
                        >
                          Хасах
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#766d61]">
                    Зохиогчийг “Хасах” дарахад энэ form-оос түр хасагдана.
                    Database дахь холбоос “Өөрчлөлт хадгалах” дарахад шинэчлэгдэнэ.
                  </p>
                </div>
              ) : (
                <p className="mt-6 text-sm text-[#766d61]">
                  Одоогоор зохиогч сонгоогүй байна.
                </p>
              )}

              <div className="relative mt-7">
                <label className="text-sm font-medium">
                  Зохиогчийн нэр бичих
                </label>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={authorSearch}
                    onChange={(e) => setAuthorSearch(e.target.value)}
                    onKeyDown={handleAuthorKeyDown}
                    placeholder="Жишээ: Nicola Di Cosmo"
                    className="h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
                  />

                  <button
                    type="button"
                    onClick={() => void handleAddTypedAuthor()}
                    disabled={!authorSearch.trim() || creatingAuthor}
                    className="shrink-0 rounded-xl bg-[#29251f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a6b25] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingAuthor ? "Нэмж байна..." : "+ Нэмэх"}
                  </button>
                </div>

                {authorSearch.trim() && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-[#d9d0c0] bg-white">
                    {filteredAuthors.length > 0 && (
                      <div className="divide-y divide-[#eee7dc]">
                        {filteredAuthors.map((author) => (
                          <button
                            key={author.id}
                            type="button"
                            onClick={() => addAuthor(author)}
                            className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm transition hover:bg-[#f7f3ea]"
                          >
                            <span>{getAuthorName(author)}</span>
                            <span className="text-xs text-[#9a6b25]">Сонгох</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {!exactAuthor && (
                      <button
                        type="button"
                        onClick={() => void handleAddTypedAuthor()}
                        disabled={creatingAuthor}
                        className="flex w-full items-center justify-between gap-4 border-t border-[#eee7dc] px-4 py-3 text-left text-sm font-medium text-[#9a6b25] transition hover:bg-[#f7f3ea] disabled:opacity-50"
                      >
                        <span>“{authorSearch.trim()}”</span>
                        <span>Шинэ зохиогчоор нэмэх +</span>
                      </button>
                    )}

                    {exactAuthor &&
                      selectedAuthors.some(
                        (author) => author.id === exactAuthor.id
                      ) && (
                        <div className="px-4 py-3 text-sm text-[#766d61]">
                          Энэ зохиогч аль хэдийн сонгогдсон байна.
                        </div>
                      )}
                  </div>
                )}

                <p className="mt-3 text-xs leading-5 text-[#766d61]">
                  Бүртгэлгүй нэрийг Enter дарж нэмбэл шинэ зохиогч автоматаар
                  үүснэ. Намтар зэрэг дэлгэрэнгүй мэдээллийг дараа нь засаж болно.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                Ангилал
              </div>

              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Хэл</label>
                  <select
                    value={languageId}
                    onChange={(e) => setLanguageId(e.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none focus:border-[#9a6b25]"
                  >
                    <option value="">Хэл сонгох</option>
                    {languages.map((language) => (
                      <option key={language.id} value={language.id}>
                        {language.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Ангилал</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none focus:border-[#9a6b25]"
                  >
                    <option value="">Ангилал сонгох</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                Эх сурвалжийн холбоос
              </div>

              <h2 className="mt-2 text-xl font-semibold">
                Холбогдох эх сурвалж
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#766d61]">
                Энэ ном ямар түүхэн эх сурвалжтай холбоотойг сонгоно. Нэг номыг
                хэд хэдэн эх сурвалжтай холбож болно.
              </p>

              <div className="mt-6 space-y-4">
                {sources.map((source) => {
                  const selected = selectedSources.find(
                    (item) => item.id === source.id
                  );

                  return (
                    <div
                      key={source.id}
                      className={`rounded-xl border p-4 ${
                        selected
                          ? "border-[#bda77f] bg-[#f7f0e2]"
                          : "border-[#d9d0c0] bg-[#fffdf8]"
                      }`}
                    >
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSourceSelected(source.id)}
                          onChange={() => toggleSource(source)}
                          className="mt-1 h-4 w-4"
                        />

                        <div>
                          <div className="text-sm font-semibold">
                            {source.title}
                          </div>

                          {source.title_original &&
                            source.title_original !== source.title && (
                              <div className="mt-1 text-xs text-[#625b50]">
                                {source.title_original}
                              </div>
                            )}

                          {source.title_en && (
                            <div className="mt-1 text-xs italic text-[#84786a]">
                              {source.title_en}
                            </div>
                          )}
                        </div>
                      </label>

                      {selected && (
                        <div className="mt-4 grid gap-4 border-t border-[#d9d0c0] pt-4">
                          <div>
                            <label className="text-xs font-medium text-[#625b50]">
                              Холбоосын төрөл
                            </label>
                            <input
                              type="text"
                              value={selected.relation_type}
                              onChange={(e) =>
                                updateSourceField(
                                  source.id,
                                  "relation_type",
                                  e.target.value
                                )
                              }
                              placeholder="Жишээ: Орчуулга, тайлбарт хэвлэл"
                              className="mt-2 h-11 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none focus:border-[#9a6b25]"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-medium text-[#625b50]">
                              Тайлбар
                            </label>
                            <textarea
                              value={selected.notes}
                              onChange={(e) =>
                                updateSourceField(
                                  source.id,
                                  "notes",
                                  e.target.value
                                )
                              }
                              rows={3}
                              placeholder="Энэ ном эх сурвалжтай ямар байдлаар холбоотойг товч тайлбарлана."
                              className="mt-2 w-full resize-none rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 py-3 text-sm leading-6 outline-none focus:border-[#9a6b25]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {sources.length === 0 && (
                  <p className="text-sm text-[#766d61]">
                    Одоогоор эх сурвалж бүртгэгдээгүй байна.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <label className="flex cursor-pointer items-start gap-4">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="mt-1 h-4 w-4"
                />

                <div>
                  <div className="text-sm font-medium">
                    Featured ном болгох
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[#766d61]">
                    Идэвхжүүлбэл homepage-ийн “Онцлох бүтээлүүд” хэсэгт гаргана.
                  </p>
                </div>
              </label>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {success}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="rounded-xl border border-[#cfc4b2] px-6 py-3 text-sm text-[#625b50] transition hover:border-[#9a6b25]"
              >
                Цуцлах
              </button>

              <button
                type="submit"
                disabled={saving || creatingAuthor}
                className="rounded-xl bg-[#29251f] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#9a6b25] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Хадгалж байна..." : "Өөрчлөлт хадгалах"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}