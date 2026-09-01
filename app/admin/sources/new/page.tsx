"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewSourcePage() {
  const router = useRouter();

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#9a6b25]";
  const textareaClass =
    "mt-2 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#9a6b25]";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/admin/login");
    });
  }, [router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const { error } = await supabase.from("sources").insert({
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
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/admin/sources");
    router.refresh();
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

        <div className="mt-8 border-b border-[#d9d0c0] pb-7">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#9a6b25]">
            Admin / Sources
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Шинэ эх сурвалж
          </h1>
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
          <span className="text-sm font-medium">Зохиогч / эмхэтгэгч</span>
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
          <span className="text-sm font-medium">Судалгааны ач холбогдол</span>
          <textarea
            value={significance}
            onChange={(e) => setSignificance(e.target.value)}
            className={textareaClass}
            rows={6}
          />
        </label>

        <label className="sm:col-span-2">
          <span className="text-sm font-medium">Эх бичиг ба уламжлал</span>
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
          <span className="text-sm font-medium">Онцлох эх сурвалж</span>
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
      </div>
    </main>
  );
}