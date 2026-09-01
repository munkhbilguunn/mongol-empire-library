"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Source = {
  id: string;
  title: string;
  title_original: string | null;
  title_en: string | null;
  source_type: string | null;
  written_period: string | null;
  original_language: string | null;
  slug: string | null;
  featured: boolean;
};

export default function AdminSourcesPage() {
  const router = useRouter();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("sources")
        .select(
          "id, title, title_original, title_en, source_type, written_period, original_language, slug, featured"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setSources((data || []) as Source[]);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return sources;

    return sources.filter((source) =>
      [
        source.title,
        source.title_original,
        source.title_en,
        source.source_type,
        source.written_period,
        source.original_language,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query, sources]);

  async function handleDelete(source: Source) {
    const confirmed = window.confirm(
      `"${source.title}" эх сурвалжийг устгах уу?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("sources")
      .delete()
      .eq("id", source.id);

    if (error) {
      window.alert(`Устгахад алдаа гарлаа: ${error.message}`);
      return;
    }

    setSources((current) =>
      current.filter((item) => item.id !== source.id)
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] px-6 py-10 text-[#29251f] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 border-b border-[#d9d0c0] pb-8 sm:flex-row sm:items-end">
          <div>
            <a
              href="/admin"
              className="text-sm font-medium text-[#8b672f] hover:underline"
            >
              ← Admin
            </a>

            <div className="mt-6 text-xs font-medium uppercase tracking-[0.24em] text-[#9a6b25]">
              Admin / Sources
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Эх сурвалж
            </h1>

            <p className="mt-3 text-sm leading-7 text-[#766d61]">
              Түүхэн эх сурвалжуудыг нэмэх, засах, устгах.
            </p>
          </div>

          <a
            href="/admin/sources/new"
            className="inline-flex items-center justify-center rounded-xl bg-[#29251f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a6b25]"
          >
            + Шинэ эх сурвалж
          </a>
        </div>

        <div className="mt-8">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Нэр, төрөл, хэлээр хайх..."
            className="w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 py-3 text-sm outline-none transition focus:border-[#9a6b25]"
          />
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#766d61]">
            Уншиж байна...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-10 text-center text-sm text-[#766d61]">
            Эх сурвалж олдсонгүй.
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#d9d0c0] bg-[#fffdf8]">
            <div className="divide-y divide-[#d9d0c0]">
              {filtered.map((source) => (
                <div
                  key={source.id}
                  className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{source.title}</h2>

                      {source.featured && (
                        <span className="rounded-full border border-[#d8c8ae] px-2.5 py-1 text-[10px] font-medium text-[#8b672f]">
                          Онцлох
                        </span>
                      )}
                    </div>

                    {source.title_original &&
                      source.title_original !== source.title && (
                        <div className="mt-1 text-sm text-[#625b50]">
                          {source.title_original}
                        </div>
                      )}

                    {source.title_en && (
                      <div className="mt-1 text-sm italic text-[#84786a]">
                        {source.title_en}
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#766d61]">
                      {source.source_type && <span>{source.source_type}</span>}
                      {source.written_period && (
                        <span>{source.written_period}</span>
                      )}
                      {source.original_language && (
                        <span>{source.original_language}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {source.slug && (
                      <a
                        href={`/sources/${source.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-[#cfc4b2] px-3 py-2 text-xs font-medium transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
                      >
                        Нийтэд үзэх
                      </a>
                    )}

                    <a
                      href={`/admin/sources/${source.id}/edit`}
                      className="rounded-lg border border-[#cfc4b2] px-3 py-2 text-xs font-medium transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
                    >
                      Засах
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDelete(source)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50"
                    >
                      Устгах
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}