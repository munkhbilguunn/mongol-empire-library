"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewTimelineEventPage() {
  const router = useRouter();

  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [featured, setFeatured] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    if (!year.trim() || !title.trim()) {
      setError("Он болон гарчгийг заавал оруулна уу.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("timeline_events").insert({
      year: Number(year),
      title: title.trim(),
      description: description.trim() || null,
      slug: slug.trim() || null,
      display_order: Number(displayOrder) || 0,
      featured,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/admin/timeline");
    router.refresh();
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#9a6b25]";

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-6 py-10 text-[#29251f] lg:px-8">
      <div className="mx-auto max-w-3xl">
        <a
          href="/admin/timeline"
          className="text-sm font-medium text-[#8b672f] hover:underline"
        >
          ← Он цагийн хэлхээс
        </a>

        <div className="mt-8 border-b border-[#d9d0c0] pb-7">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-[#9a6b25]">
            Admin / Timeline
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Шинэ үйл явдал
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-6 sm:p-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <label>
              <span className="text-sm font-medium">Он *</span>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={inputClass}
                placeholder="1206"
              />
            </label>

            <label>
              <span className="text-sm font-medium">Дараалал</span>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className={inputClass}
                placeholder="0"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Гарчиг *</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="Их Монгол улс байгуулагдав"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-medium">Тайлбар</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className={inputClass}
                placeholder="Үйл явдлын товч тайлбар..."
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

            <label className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-[#d9d0c0] bg-[#f7f3ea] p-4">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              <span className="text-sm font-medium">Онцлох үйл явдал</span>
            </label>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <a
              href="/admin/timeline"
              className="rounded-xl border border-[#cfc4b2] px-5 py-3 text-sm font-medium"
            >
              Болих
            </a>

            <button
              type="submit"
              disabled={saving}
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
