"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AuthorFormFieldsProps = {
  name: string;
  setName: (value: string) => void;
  nameMn: string;
  setNameMn: (value: string) => void;
  nameEn: string;
  setNameEn: (value: string) => void;
  birthYear: string;
  setBirthYear: (value: string) => void;
  deathYear: string;
  setDeathYear: (value: string) => void;
  biography: string;
  setBiography: (value: string) => void;
  selectedWorks: string;
  setSelectedWorks: (value: string) => void;
  slug: string;
  setSlug: (value: string) => void;
};

function AuthorFormFields({
  name,
  setName,
  nameMn,
  setNameMn,
  nameEn,
  setNameEn,
  birthYear,
  setBirthYear,
  deathYear,
  setDeathYear,
  biography,
  setBiography,
  selectedWorks,
  setSelectedWorks,
  slug,
  setSlug,
}: AuthorFormFieldsProps) {
  return (
    <>
      <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
          Нэр
        </div>

        <div className="mt-7 space-y-6">
          <div>
            <label className="text-sm font-medium">
              Үндсэн нэр *
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nicola Di Cosmo"
              required
              className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">
                Монгол нэр
              </label>

              <input
                type="text"
                value={nameMn}
                onChange={(e) => setNameMn(e.target.value)}
                placeholder="Никола Ди Космо"
                className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                English name
              </label>

              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Nicola Di Cosmo"
                className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
          Намтар
        </div>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">
              Төрсөн он
            </label>

            <input
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="1962"
              className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Нас барсан он
            </label>

            <input
              type="number"
              value={deathYear}
              onChange={(e) => setDeathYear(e.target.value)}
              placeholder="Хэрэв байгаа бол"
              className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium">
            Товч намтар
          </label>

          <textarea
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            rows={8}
            placeholder="Зохиогчийн судалгааны чиглэл, академик замнал, гол бүтээлүүдийн тухай..."
            className="mt-2 w-full resize-y rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#9a6b25]"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
          Бүтээлүүд
        </div>

        <label className="mt-6 block text-sm font-medium">
          Онцлох бүтээлүүдийн жагсаалт
        </label>

        <textarea
          value={selectedWorks}
          onChange={(e) => setSelectedWorks(e.target.value)}
          rows={7}
          placeholder={"Нэг мөрөнд нэг бүтээл бичнэ.\nЖишээ:\nAncient China and Its Enemies (2002)\nThe Diary of a Manchu Soldier in Seventeenth-Century China (2006)"}
          className="mt-2 w-full resize-y rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#9a6b25]"
        />

        <p className="mt-2 text-xs leading-5 text-[#766d61]">
          Энэ жагсаалт нь манай санд бүртгэлтэй номуудаас тусдаа.
          Зохиогчийн public profile дээр “Онцлох бүтээлүүд” гэж харагдана.
        </p>
      </div>

      <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
          Public URL
        </div>

        <label className="mt-6 block text-sm font-medium">
          Slug
        </label>

        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="nicola-di-cosmo"
          className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
        />

        <p className="mt-2 text-xs leading-5 text-[#766d61]">
          Хоосон орхивол систем зохиогчийн нэрээс автоматаар үүсгэнэ.
        </p>
      </div>
    </>
  );
}


type LinkedBook = {
  id: string;
  title: string | null;
  slug: string | null;
  publication_year: number | null;
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EditAuthorPage() {
  const router = useRouter();
  const params = useParams();
  const authorId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [nameMn, setNameMn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [deathYear, setDeathYear] = useState("");
  const [biography, setBiography] = useState("");
  const [selectedWorks, setSelectedWorks] = useState("");
  const [slug, setSlug] = useState("");
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  const [books, setBooks] = useState<LinkedBook[]>([]);



  function getPhotoUrl(path: string | null) {
    if (!path) return "";

    return supabase.storage
      .from("author-photos")
      .getPublicUrl(path).data.publicUrl;
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setPhotoFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Зураг JPG, PNG эсвэл WebP форматтай байна.");
      e.target.value = "";
      setPhotoFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Зургийн хэмжээ 5 MB-аас ихгүй байна.");
      e.target.value = "";
      setPhotoFile(null);
      return;
    }

    setError("");
    setPhotoFile(file);
    setRemovePhoto(false);
  }

  function getPhotoExtension(file: File) {
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

  function markPhotoForRemoval() {
    setPhotoFile(null);
    setRemovePhoto(true);
    setError("");
    setSuccess("");
  }

  function cancelPhotoRemoval() {
    setRemovePhoto(false);
    setError("");
  }

  useEffect(() => {
    async function loadAuthor() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data: authorData, error: authorError } =
        await supabase
          .from("authors")
          .select(
            "id, name, name_mn, name_en, birth_year, death_year, biography, selected_works, slug, photo_path"
          )
          .eq("id", authorId)
          .single();

      if (authorError || !authorData) {
        setError(
          authorError?.message || "Зохиогч олдсонгүй."
        );
        setLoading(false);
        return;
      }

      setName(authorData.name || "");
      setNameMn(authorData.name_mn || "");
      setNameEn(authorData.name_en || "");
      setBirthYear(
        authorData.birth_year
          ? String(authorData.birth_year)
          : ""
      );
      setDeathYear(
        authorData.death_year
          ? String(authorData.death_year)
          : ""
      );
      setBiography(authorData.biography || "");
      setSelectedWorks(authorData.selected_works || "");
      setSlug(authorData.slug || "");
      setPhotoPath(authorData.photo_path || null);

      const { data: links, error: linksError } =
        await supabase
          .from("book_authors")
          .select("book_id")
          .eq("author_id", authorId);

      if (linksError) {
        setError(linksError.message);
        setLoading(false);
        return;
      }

      const bookIds = (links || []).map(
        (item: any) => item.book_id
      );

      if (bookIds.length > 0) {
        const { data: bookData, error: booksError } =
          await supabase
            .from("books")
            .select(
              "id, title, slug, publication_year"
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

        setBooks((bookData || []) as LinkedBook[]);
      }

      setLoading(false);
    }

    if (authorId) {
      void loadAuthor();
    }
  }, [authorId, router]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Зохиогчийн үндсэн нэрийг оруулна уу.");
      return;
    }

    setSaving(true);

    const normalizedSlug = slug
      ? normalizeSlug(slug)
      : null;

    let nextPhotoPath = removePhoto ? null : photoPath;
    let uploadedPhotoPath: string | null = null;

    if (photoFile) {
      const extension = getPhotoExtension(photoFile);
      uploadedPhotoPath = `${authorId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("author-photos")
        .upload(uploadedPhotoPath, photoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setError(`Зураг оруулахад алдаа гарлаа: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      nextPhotoPath = uploadedPhotoPath;
    }

    const { error: updateError } = await supabase
      .from("authors")
      .update({
        name: name.trim(),
        name_mn: nameMn.trim() || null,
        name_en: nameEn.trim() || null,
        birth_year: birthYear ? Number(birthYear) : null,
        death_year: deathYear ? Number(deathYear) : null,
        biography: biography.trim() || null,
        selected_works: selectedWorks.trim() || null,
        slug: normalizedSlug,
        photo_path: nextPhotoPath,
      })
      .eq("id", authorId);

    if (updateError) {
      if (uploadedPhotoPath) {
        await supabase.storage.from("author-photos").remove([uploadedPhotoPath]);
      }

      setError(updateError.message);
      setSaving(false);
      return;
    }

    if (photoPath && photoPath !== nextPhotoPath) {
      await supabase.storage.from("author-photos").remove([photoPath]);
    }

    setPhotoPath(nextPhotoPath);
    setPhotoFile(null);
    setRemovePhoto(false);
    setSuccess("Зохиогчийн мэдээлэл шинэчлэгдлээ.");
    setSaving(false);

    setTimeout(() => {
      router.push("/admin/authors");
      router.refresh();
    }, 700);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea]">
        <div className="text-sm text-[#766d61]">
          Зохиогчийн мэдээллийг уншиж байна...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <header className="border-b border-[#d9d0c0] bg-[#fffdf8]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5 lg:px-8">
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
            onClick={() => router.push("/admin/authors")}
            className="rounded-full border border-[#cfc4b2] px-4 py-2 text-xs text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
          >
            ← Зохиогчид
          </button>
        </div>
      </header>

      <section className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
                Authors
              </div>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                Зохиогч засах
              </h1>

              <p className="mt-3 text-sm leading-7 text-[#766d61]">
                Зохиогчийн public profile болон намтрыг шинэчилнэ.
              </p>
            </div>

            {slug && (
              <a
                href={`/authors/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#8b672f] hover:underline"
              >
                Public profile ↗
              </a>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-8"
          >

            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                Зураг
              </div>

              {photoPath && !removePhoto && (
                <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
                  <img
                    src={getPhotoUrl(photoPath)}
                    alt={nameMn || name || nameEn || "Зохиогчийн зураг"}
                    className="h-40 w-32 rounded-xl border border-[#d9d0c0] object-cover"
                  />

                  <div>
                    <div className="text-sm font-medium">Одоогийн зураг</div>
                    <button
                      type="button"
                      onClick={markPhotoForRemoval}
                      className="mt-3 rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50"
                    >
                      Зураг устгах
                    </button>
                  </div>
                </div>
              )}

              {photoPath && removePhoto && (
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Одоогийн зураг хадгалах үед устгагдана.
                  <button
                    type="button"
                    onClick={cancelPhotoRemoval}
                    className="ml-3 font-medium underline"
                  >
                    Цуцлах
                  </button>
                </div>
              )}

              <label className="mt-6 block text-sm font-medium">
                {photoPath ? "Шинэ зургаар солих" : "Зохиогчийн зураг"}
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="mt-3 block w-full text-sm text-[#625b50] file:mr-4 file:rounded-lg file:border-0 file:bg-[#29251f] file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-[#9a6b25]"
              />

              <p className="mt-3 text-xs leading-5 text-[#766d61]">
                JPG, PNG эсвэл WebP. Хэмжээ 5 MB-аас ихгүй.
              </p>

              {photoFile && (
                <div className="mt-4 rounded-xl border border-[#e4ddd1] bg-[#f7f3ea] px-4 py-3 text-sm text-[#625b50]">
                  Сонгосон шинэ зураг: {photoFile.name}
                </div>
              )}
            </div>

            <AuthorFormFields
              name={name}
              setName={setName}
              nameMn={nameMn}
              setNameMn={setNameMn}
              nameEn={nameEn}
              setNameEn={setNameEn}
              birthYear={birthYear}
              setBirthYear={setBirthYear}
              deathYear={deathYear}
              setDeathYear={setDeathYear}
              biography={biography}
              setBiography={setBiography}
              selectedWorks={selectedWorks}
              setSelectedWorks={setSelectedWorks}
              slug={slug}
              setSlug={setSlug}
            />

            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                    Бүтээлүүд
                  </div>

                  <h2 className="mt-2 text-xl font-semibold">
                    Холбоотой номууд
                  </h2>
                </div>

                <div className="text-sm text-[#766d61]">
                  {books.length} ном
                </div>
              </div>

              {books.length > 0 ? (
                <div className="mt-6 overflow-hidden rounded-xl border border-[#e4ddd1]">
                  {books.map((book, index) => (
                    <div
                      key={book.id}
                      className={`flex flex-col gap-3 bg-[#fffdf8] p-4 sm:flex-row sm:items-center sm:justify-between ${
                        index > 0
                          ? "border-t border-[#e4ddd1]"
                          : ""
                      }`}
                    >
                      <div>
                        <div className="font-medium">
                          {book.title || "Нэргүй ном"}
                        </div>

                        {book.publication_year && (
                          <div className="mt-1 text-xs text-[#8c8376]">
                            {book.publication_year}
                          </div>
                        )}
                      </div>

                      {book.slug && (
                        <a
                          href={`/books/${book.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-[#8b672f] hover:underline"
                        >
                          Номыг үзэх ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm leading-7 text-[#766d61]">
                  Энэ зохиогчтой холбоотой ном одоогоор байхгүй байна.
                </p>
              )}
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
                onClick={() => router.push("/admin/authors")}
                className="rounded-xl border border-[#cfc4b2] px-6 py-3 text-sm text-[#625b50] transition hover:border-[#9a6b25]"
              >
                Цуцлах
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#29251f] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#9a6b25] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Хадгалж байна..."
                  : "Өөрчлөлт хадгалах"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
