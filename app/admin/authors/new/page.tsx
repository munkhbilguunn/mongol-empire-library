"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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


function normalizeSlug(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewAuthorPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [nameMn, setNameMn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [deathYear, setDeathYear] = useState("");
  const [biography, setBiography] = useState("");
  const [selectedWorks, setSelectedWorks] = useState("");
  const [slug, setSlug] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);



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

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      setLoading(false);
    }

    void checkAuth();
  }, [router]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Зохиогчийн үндсэн нэрийг оруулна уу.");
      return;
    }

    setSaving(true);

    const normalizedSlug = slug
      ? normalizeSlug(slug)
      : null;

    const { data, error: insertError } = await supabase
      .from("authors")
      .insert({
        name: name.trim(),
        name_mn: nameMn.trim() || null,
        name_en: nameEn.trim() || null,
        birth_year: birthYear ? Number(birthYear) : null,
        death_year: deathYear ? Number(deathYear) : null,
        biography: biography.trim() || null,
        selected_works: selectedWorks.trim() || null,
        slug: normalizedSlug,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    if (!data) {
      setError("Зохиогч үүссэнгүй.");
      setSaving(false);
      return;
    }

    if (photoFile) {
      const extension = getPhotoExtension(photoFile);
      const photoPath = `${data.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("author-photos")
        .upload(photoPath, photoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setError(`Зохиогч үүссэн боловч зураг оруулахад алдаа гарлаа: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      const { error: photoUpdateError } = await supabase
        .from("authors")
        .update({ photo_path: photoPath })
        .eq("id", data.id);

      if (photoUpdateError) {
        await supabase.storage.from("author-photos").remove([photoPath]);
        setError(`Зураг хадгалах замыг бүртгэхэд алдаа гарлаа: ${photoUpdateError.message}`);
        setSaving(false);
        return;
      }
    }

    router.push("/admin/authors");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea]">
        <div className="text-sm text-[#766d61]">
          Уншиж байна...
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
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
              Authors
            </div>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
              Шинэ зохиогч
            </h1>

            <p className="mt-3 text-sm leading-7 text-[#766d61]">
              Зохиогчийн public profile-д харагдах мэдээллийг бүртгэнэ.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-8"
          >

            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 sm:p-9">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                Зураг
              </div>

              <label className="mt-6 block text-sm font-medium">
                Зохиогчийн зураг
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
                  Сонгосон зураг: {photoFile.name}
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

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
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
                {saving ? "Хадгалж байна..." : "Зохиогч хадгалах"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
