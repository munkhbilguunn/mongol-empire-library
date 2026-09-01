"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type TimelineEvent = {
  id: string;
  year: number;
  title: string;
  description: string | null;
  slug: string | null;
  featured: boolean;
  display_order: number;
};

export default function AdminTimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadEvents() {
      const { data, error } = await supabase
        .from("timeline_events")
        .select("id, year, title, description, slug, featured, display_order")
        .order("year", { ascending: true })
        .order("display_order", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setEvents((data || []) as TimelineEvent[]);
      }

      setLoading(false);
    }

    void loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return events;

    return events.filter((event) =>
      [String(event.year), event.title, event.description || ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [events, search]);

  async function handleDelete(event: TimelineEvent) {
    const confirmed = window.confirm(
      `"${event.year} — ${event.title}" үйл явдлыг устгах уу?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("timeline_events")
      .delete()
      .eq("id", event.id);

    if (error) {
      window.alert(`Устгахад алдаа гарлаа: ${error.message}`);
      return;
    }

    setEvents((current) => current.filter((item) => item.id !== event.id));
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
              Admin / Timeline
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Он цагийн хэлхээс
            </h1>

            <p className="mt-3 text-sm leading-7 text-[#766d61]">
              Homepage болон түүхийн он цагийн хэсэгт харагдах үйл явдлуудыг
              эндээс удирдана.
            </p>
          </div>

          <a
            href="/admin/timeline/new"
            className="inline-flex items-center justify-center rounded-xl bg-[#29251f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a6b25]"
          >
            + Шинэ үйл явдал
          </a>
        </div>

        <div className="mt-8 rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Он, гарчиг, тайлбараар хайх..."
            className="h-12 w-full rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#9a6b25]"
          />
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#d9d0c0] bg-[#fffdf8]">
          {filteredEvents.length > 0 ? (
            <div className="divide-y divide-[#e3dbcf]">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-2xl font-semibold text-[#9a6b25]">
                        {event.year}
                      </div>

                      {event.featured && (
                        <span className="rounded-full bg-[#f0e2c8] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#8b672f]">
                          FEATURED
                        </span>
                      )}
                    </div>

                    <h2 className="mt-2 text-lg font-semibold">{event.title}</h2>

                    {event.description && (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#766d61]">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-3">
                    <a
                      href={`/admin/timeline/${event.id}/edit`}
                      className="rounded-lg bg-[#29251f] px-4 py-2.5 text-xs text-white transition hover:bg-[#9a6b25]"
                    >
                      ✏️ Засах
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDelete(event)}
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
              <div className="text-lg font-semibold">Үйл явдал алга</div>
              <p className="mt-2 text-sm text-[#766d61]">
                Шинэ үйл явдал нэмэхээс эхэлнэ үү.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
