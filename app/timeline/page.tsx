import { supabase } from "@/lib/supabase";

export default async function TimelinePage() {
  const { data: events, error } = await supabase
    .from("timeline_events")
    .select("id, year, title, description, slug, featured, display_order")
    .order("year", { ascending: true })
    .order("display_order", { ascending: true });

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <header className="border-b border-[#d9d0c0] bg-[#f7f3ea]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <a href="/">
            <div className="text-[10px] uppercase tracking-[0.26em] text-[#9a6b25]">
              Historical Archive
            </div>
            <div className="mt-1 text-lg font-semibold tracking-tight">
              Монголын эзэнт гүрний түүхийн сан
            </div>
          </a>

          <a
            href="/"
            className="text-sm font-medium text-[#8b672f] hover:underline"
          >
            ← Нүүр хуудас
          </a>
        </div>
      </header>

      <section className="border-b border-[#d9d0c0] px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
            Timeline
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Он цагийн хэлхээс
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#766d61]">
            Монголын эзэнт гүрний үүсэл, тэлэлт, төрийн залгамжлал болон
            улс төрийн өөрчлөлтийг он дарааллаар үзнэ.
          </p>
        </div>
      </section>

      <section className="px-6 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Он цагийн мэдээлэл татахад алдаа гарлаа: {error.message}
            </div>
          ) : events && events.length > 0 ? (
            <div className="relative">
              <div className="absolute bottom-0 left-[48px] top-0 w-px bg-[#cfc4b2] sm:left-[70px]" />

              <div className="space-y-9">
                {events.map((event: any) => (
                  <article
                    key={event.id}
                    className="relative grid grid-cols-[96px_1fr] gap-5 sm:grid-cols-[140px_1fr] sm:gap-8"
                  >
                    <div className="relative text-right">
                      <div className="text-2xl font-semibold text-[#9a6b25] sm:text-3xl">
                        {event.year}
                      </div>
                      <div className="absolute right-[-7px] top-3 h-3 w-3 rounded-full border-2 border-[#9a6b25] bg-[#f7f3ea] sm:right-[-7px]" />
                    </div>

                    <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold sm:text-xl">
                          {event.title}
                        </h2>

                        {event.featured && (
                          <span className="rounded-full bg-[#f0e2c8] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#8b672f]">
                            Онцлох
                          </span>
                        )}
                      </div>

                      {event.description && (
                        <p className="mt-3 text-sm leading-7 text-[#766d61]">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-10 text-center text-sm text-[#766d61]">
              Одоогоор үйл явдал бүртгэгдээгүй байна.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
