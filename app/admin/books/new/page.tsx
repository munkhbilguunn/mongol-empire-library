"use client";
// MULTI-AUTHOR VERSION: type a name + Enter to add multiple authors

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
};

function slugifyTitle(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .trim()
    .replace(/[’'"“”]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

async function createUniqueSlug(title: string) {
  const baseSlug = slugifyTitle(title) || "book";
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("books")
      .select("id")
      .eq("slug", candidate)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export default function NewBookPage() {
  const router = useRouter();

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

  const [languageId, setLanguageId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [authorSearch, setAuthorSearch] = useState("");
  const [selectedAuthors, setSelectedAuthors] = useState<Author[]>([]);

  const [featured, setFeatured] = useState(false);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const [
        languagesResult,
        categoriesResult,
        authorsResult,
        sourcesResult,
      ] = await Promise.all([
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

      if (languagesResult.error) {
        setError(languagesResult.error.message);
      } else {
        setLanguages(languagesResult.data || []);
      }

      if (categoriesResult.error) {
        setError(categoriesResult.error.message);
      } else {
        setCategories(categoriesResult.data || []);
      }

      if (authorsResult.error) {
        setError(authorsResult.error.message);
      } else {
        setAuthors(authorsResult.data || []);
      }

      if (sourcesResult.error) {
        setError(sourcesResult.error.message);
      } else {
        setSources((sourcesResult.data || []) as Source[]);
      }

      setLoading(false);
    }

    loadData();
  }, [router]);

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
  }

  function getCoverExtension(file: File) {
    const extensionFromName = file.name.split(".").pop()?.toLowerCase();

    if (extensionFromName && ["jpg", "jpeg", "png", "webp"].includes(extensionFromName)) {
      return extensionFromName === "jpeg" ? "jpg" : extensionFromName;
    }

    if (file.type === "image/png") return "png";
    if (file.type === "image/webp") return "webp";
    return "jpg";
  }

  function getAuthorName(author: Author) {
    return (
      author.name_mn ||
      author.name ||
      author.name_en ||
      "Нэргүй зохиогч"
    );
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

    setSaving(true);

    let slug: string;

    try {
      slug = await createUniqueSlug(title);
    } catch (slugError) {
      const message =
        slugError instanceof Error ? slugError.message : "Slug үүсгэхэд алдаа гарлаа.";
      setError(`URL slug үүсгэхэд алдаа гарлаа: ${message}`);
      setSaving(false);
      return;
    }

    // 1. Cover зураг байвал Storage руу upload хийнэ
    let uploadedCoverPath: string | null = null;

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
    }

    // 2. Ном үүсгэнэ
    const { data: book, error: bookError } = await supabase
      .from("books")
      .insert({
        title: title.trim(),
        slug,
        subtitle: subtitle.trim() || null,
        description: description.trim() || null,
        publication_year: publicationYear ? Number(publicationYear) : null,
        isbn: isbn.trim() || null,
        featured,
        cover_path: uploadedCoverPath,
      })
      .select()
      .single();

    if (bookError) {
      if (uploadedCoverPath) {
        await supabase.storage.from("book-covers").remove([uploadedCoverPath]);
      }

      setError(bookError.message);
      setSaving(false);
      return;
    }

    if (!book) {
      setError("Ном үүсгэх үед тодорхойгүй алдаа гарлаа.");
      setSaving(false);
      return;
    }

    // 3. Language холбоно
    if (languageId) {
      const { error: languageError } = await supabase
        .from("books")
        .update({
          language_id: languageId,
        })
        .eq("id", book.id);

      if (languageError) {
        setError(`Хэл хадгалахад алдаа гарлаа: ${languageError.message}`);
        setSaving(false);
        return;
      }
    }

    // 4. Category холбоно
    if (categoryId) {
      const { error: categoryError } = await supabase
        .from("book_categories")
        .insert({
          book_id: book.id,
          category_id: categoryId,
        });

      if (categoryError) {
        setError(
          `Ангилал хадгалахад алдаа гарлаа: ${categoryError.message}`
        );
        setSaving(false);
        return;
      }
    }

    // 5. Олон зохиогч холбоно
    if (selectedAuthors.length > 0) {
      const authorLinks = selectedAuthors.map((author, index) => ({
        book_id: book.id,
        author_id: author.id,
        author_order: index + 1,
      }));

      const { error: authorLinkError } = await supabase
        .from("book_authors")
        .insert(authorLinks);

      if (authorLinkError) {
        setError(
          `Зохиогчдыг номтой холбоход алдаа гарлаа: ${authorLinkError.message}`
        );
        setSaving(false);
        return;
      }
    }

    // 6. Эх сурвалжуудтай холбоно
    if (selectedSources.length > 0) {
      const sourceLinks = selectedSources.map((source, index) => ({
        book_id: book.id,
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

    setSuccess("Ном амжилттай нэмэгдлээ.");

    setTimeout(() => {
      router.push("/admin/books");
      router.refresh();
    }, 800);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea]">
        <div className="text-sm text-[#766d61]">Уншиж байна...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      {/* HEADER */}
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

      {/* FORM */}
      <section className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
              Library
            </div>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Шинэ ном нэмэх
            </h1>

            <p className="mt-3 text-sm leading-7 text-[#766d61]">
              Номын үндсэн мэдээллийг оруулаад database-д хадгална.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            {/* BASIC INFO */}
            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                Үндсэн мэдээлэл
              </div>

              <div className="mt-7 space-y-6">
                {/* TITLE */}
                <div>
                  <label className="text-sm font-medium">Номын нэр *</label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Жишээ: Culture and Conquest in Mongol Eurasia"
                    required
                    className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
                  />
                </div>

                {/* SUBTITLE */}
                <div>
                  <label className="text-sm font-medium">Дэд гарчиг</label>

                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Номын дэд гарчиг"
                    className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="text-sm font-medium">Тайлбар</label>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Номын агуулга, ач холбогдлын талаар..."
                    rows={6}
                    className="mt-2 w-full resize-none rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#9a6b25]"
                  />
                </div>
              </div>
            </div>

            {/* PUBLICATION */}
            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                Ном зүйн мэдээлэл
              </div>

              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                {/* YEAR */}
                <div>
                  <label className="text-sm font-medium">Хэвлэгдсэн он</label>

                  <input
                    type="number"
                    value={publicationYear}
                    onChange={(e) => setPublicationYear(e.target.value)}
                    placeholder="2001"
                    className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
                  />
                </div>

                {/* ISBN */}
                <div>
                  <label className="text-sm font-medium">ISBN</label>

                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-..."
                    className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
                  />
                </div>
              </div>
            </div>

            {/* COVER */}
            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                Cover зураг
              </div>

              <div className="mt-7 grid gap-7 sm:grid-cols-[180px_1fr] sm:items-start">
                <div className="overflow-hidden rounded-xl border border-[#d9d0c0] bg-[#f7f3ea]">
                  {coverPreviewUrl ? (
                    <img
                      src={coverPreviewUrl}
                      alt="Сонгосон cover preview"
                      className="aspect-[2/3] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[2/3] items-center justify-center px-4 text-center text-xs leading-5 text-[#8c8376]">
                      Cover зураг сонгоогүй байна
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Номын нүүр зураг</label>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverChange}
                    className="mt-2 block w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#29251f] file:px-4 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-[#9a6b25]"
                  />

                  <p className="mt-3 text-xs leading-5 text-[#766d61]">
                    JPG, PNG эсвэл WebP. Хамгийн ихдээ 5 MB. Босоо 2:3 харьцаатай зураг тохиромжтой.
                  </p>

                  {coverFile && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="text-sm text-[#625b50]">{coverFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setCoverFile(null)}
                        className="rounded-lg border border-[#cfc4b2] px-3 py-2 text-xs text-[#625b50] transition hover:border-red-300 hover:text-red-600"
                      >
                        Сонгосон зургийг хасах
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AUTHORS */}
            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                  Зохиогчид
                </div>

                <h2 className="mt-2 text-xl font-semibold">Номын зохиогчид</h2>

                <p className="mt-2 text-sm leading-6 text-[#766d61]">
                  Нэрийг нь бичээд Enter дарна. Бүртгэлтэй зохиогч байвал
                  сонгогдоно, байхгүй бол шинэ зохиогч автоматаар үүснэ.
                </p>
              </div>

              {selectedAuthors.length > 0 && (
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
                          className="ml-1 text-[#766d61] transition hover:text-red-600"
                          aria-label={`${getAuthorName(author)}-г хасах`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
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
                    placeholder="Жишээ: Jack Weatherford"
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
                      selectedAuthors.some((author) => author.id === exactAuthor.id) && (
                        <div className="px-4 py-3 text-sm text-[#766d61]">
                          Энэ зохиогч аль хэдийн сонгогдсон байна.
                        </div>
                      )}
                  </div>
                )}

                <p className="mt-3 text-xs leading-5 text-[#766d61]">
                  Намтар, төрсөн он зэрэг дэлгэрэнгүй мэдээллийг дараа нь
                  Зохиогчийн бүртгэлээс засаж болно.
                </p>
              </div>
            </div>

            {/* CLASSIFICATION */}
            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                Ангилал
              </div>

              <div className="mt-7 grid gap-6 sm:grid-cols-2">
                {/* LANGUAGE */}
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

                {/* CATEGORY */}
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

            {/* RELATED SOURCES */}
            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                Эх сурвалжийн холбоос
              </div>

              <h2 className="mt-2 text-xl font-semibold">
                Холбогдох эх сурвалж
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#766d61]">
                Ном нь түүхэн эх сурвалжийн орчуулга, хэвлэл, тайлбар эсвэл
                судалгаа бол эндээс холбоно. Нэг номыг хэд хэдэн эх сурвалжтай
                зэрэг холбож болно.
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

            {/* FEATURED */}
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
                    Идэвхжүүлбэл homepage-ийн “Онцлох бүтээлүүд” хэсэгт
                    гаргана.
                  </p>
                </div>
              </label>
            </div>

            {/* ERROR */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {success}
              </div>
            )}

            {/* BUTTONS */}
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
                {saving ? "Хадгалж байна..." : "Ном хадгалах"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}