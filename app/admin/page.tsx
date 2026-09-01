"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookCount, setBookCount] = useState<number | null>(null);
  const [authorCount, setAuthorCount] = useState<number | null>(null);
  const [sourceCount, setSourceCount] = useState<number | null>(null);
  const [timelineCount, setTimelineCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      setUser(user);

      const [booksResult, authorsResult, sourcesResult, timelineResult] = await Promise.all([
        supabase
          .from("books")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("authors")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("sources")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("timeline_events")
          .select("id", { count: "exact", head: true }),
      ]);

      if (!booksResult.error) {
        setBookCount(booksResult.count ?? 0);
      }

      if (!authorsResult.error) {
        setAuthorCount(authorsResult.count ?? 0);
      }

      if (!sourcesResult.error) {
        setSourceCount(sourcesResult.count ?? 0);
      }

      if (!timelineResult.error) {
        setTimelineCount(timelineResult.count ?? 0);
      }

      setLoading(false);
    }

    void loadDashboard();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea] text-[#29251f]">
        <div className="text-sm text-[#766d61]">
          Dashboard уншиж байна...
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <header className="border-b border-[#d9d0c0] bg-[#fffdf8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 lg:px-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-[#9a6b25]">
              Administration
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
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-[#cfc4b2] px-4 py-2 text-xs text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
            >
              Гарах
            </button>
          </div>
        </div>
      </header>

      <section className="px-6 py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
              Dashboard
            </div>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Удирдлагын хэсэг
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#766d61]">
              Номын сан, зохиогчид, эх сурвалж, он цагийн хэлхээс болон
              public сайтын мэдээллийг эндээс удирдана.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            <a
              href="/admin/books"
              className="group rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 transition hover:-translate-y-1 hover:border-[#bda77f] hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                    Library
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold">
                    Номууд
                  </h2>
                </div>

                <span className="text-2xl text-[#b8a68d] transition group-hover:translate-x-1 group-hover:text-[#9a6b25]">
                  →
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-[#766d61]">
                Ном нэмэх, засах, featured тохируулах болон
                номын санг удирдах.
              </p>

              <div className="mt-8 border-t border-[#e4ddd1] pt-5 text-sm">
                <span className="font-medium text-[#29251f]">
                  {bookCount ?? "—"}
                </span>{" "}
                <span className="text-[#766d61]">ном</span>
              </div>
            </a>

            <a
              href="/admin/authors"
              className="group rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 transition hover:-translate-y-1 hover:border-[#bda77f] hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                    Authors
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold">
                    Зохиогчид
                  </h2>
                </div>

                <span className="text-2xl text-[#b8a68d] transition group-hover:translate-x-1 group-hover:text-[#9a6b25]">
                  →
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-[#766d61]">
                Зохиогч нэмэх, намтар засах, public profile болон
                бүтээлийн холбоосуудыг удирдах.
              </p>

              <div className="mt-8 border-t border-[#e4ddd1] pt-5 text-sm">
                <span className="font-medium text-[#29251f]">
                  {authorCount ?? "—"}
                </span>{" "}
                <span className="text-[#766d61]">зохиогч</span>
              </div>
            </a>

            <a
              href="/admin/sources"
              className="group rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 transition hover:-translate-y-1 hover:border-[#bda77f] hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                    Sources
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold">
                    Эх сурвалж
                  </h2>
                </div>

                <span className="text-2xl text-[#b8a68d] transition group-hover:translate-x-1 group-hover:text-[#9a6b25]">
                  →
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-[#766d61]">
                Түүхэн эх сурвалж нэмэх, тайлбар засах, public хуудсыг удирдах.
              </p>

              <div className="mt-8 border-t border-[#e4ddd1] pt-5 text-sm">
                <span className="font-medium text-[#29251f]">
                  {sourceCount ?? "—"}
                </span>{" "}
                <span className="text-[#766d61]">эх сурвалж</span>
              </div>
            </a>

            <a
              href="/admin/timeline"
              className="group rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-7 transition hover:-translate-y-1 hover:border-[#bda77f] hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
                    Timeline
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold">
                    Он цагийн хэлхээс
                  </h2>
                </div>

                <span className="text-2xl text-[#b8a68d] transition group-hover:translate-x-1 group-hover:text-[#9a6b25]">
                  →
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-[#766d61]">
                Түүхэн үйл явдал нэмэх, он дараалал засах, онцлох үйл явдлыг
                удирдах.
              </p>

              <div className="mt-8 border-t border-[#e4ddd1] pt-5 text-sm">
                <span className="font-medium text-[#29251f]">
                  {timelineCount ?? "—"}
                </span>{" "}
                <span className="text-[#766d61]">үйл явдал</span>
              </div>
            </a>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-[#d9d0c0] bg-[#29251f] p-7 text-[#f7f3ea] transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#c69b57]">
                    Public site
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold">
                    Вэбийг үзэх
                  </h2>
                </div>

                <span className="text-2xl text-[#bcb2a3] transition group-hover:translate-x-1 group-hover:text-white">
                  ↗
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-[#bcb2a3]">
                Нийтэд харагдах нүүр хуудас, номын сан, зохиогч болон
                эх сурвалжийн хуудсуудыг шинэ цонхоор үзэх.
              </p>

              <div className="mt-8 border-t border-[#504a42] pt-5 text-sm text-[#d8d0c5]">
                Public site →
              </div>
            </a>
          </div>

          <div className="mt-10 rounded-2xl border border-[#d9d0c0] bg-[#eee8dc] p-6">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b25]">
              Quick actions
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="/admin/books/new"
                className="rounded-xl bg-[#29251f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a6b25]"
              >
                + Шинэ ном
              </a>

              <a
                href="/admin/authors/new"
                className="rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-5 py-3 text-sm font-medium text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
              >
                + Шинэ зохиогч
              </a>

              <a
                href="/admin/sources/new"
                className="rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-5 py-3 text-sm font-medium text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
              >
                + Шинэ эх сурвалж
              </a>

              <a
                href="/admin/timeline/new"
                className="rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-5 py-3 text-sm font-medium text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
              >
                + Шинэ үйл явдал
              </a>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
