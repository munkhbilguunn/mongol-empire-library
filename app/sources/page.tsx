import { supabase } from "@/lib/supabase";
import PublicHeader from "@/components/PublicHeader";

export default async function SourcesPage() {
  const { data: sources, error } = await supabase
    .from("sources")
    .select(`
      id,
      title,
      title_original,
      title_en,
      source_type,
      written_period,
      original_language,
      author_compiler,
      summary,
      slug,
      featured
    `)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <PublicHeader active="sources" />

      <section className="border-b border-[#d9d0c0] px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
              Primary Sources
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Эх сурвалж
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[#6b6256]">
              Монголын эзэнт гүрэн болон түүний залгамж улсуудын түүхийг
              судлахад чухал анхдагч болон уламжлалт түүхэн сурвалжуудын
              танилцуулга.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#fffdf8] px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Эх сурвалжийн мэдээлэл татахад алдаа гарлаа: {error.message}
            </div>
          ) : sources && sources.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sources.map((source: any) => {
                const href = source.slug
                  ? `/sources/${source.slug}`
                  : "/sources";

                return (
                  <article
                    key={source.id}
                    className="group flex h-full flex-col rounded-2xl border border-[#d9d0c0] bg-[#f7f3ea] p-7 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#9a6b25]">
                        {source.source_type || "Түүхэн сурвалж"}
                      </div>

                      {source.featured && (
                        <span className="shrink-0 rounded-full border border-[#d8c8ae] bg-[#fffdf8] px-3 py-1 text-[10px] font-medium text-[#8b672f]">
                          Онцлох
                        </span>
                      )}
                    </div>

                    <a href={href} className="mt-7 block">
                      <h2 className="text-2xl font-semibold tracking-tight transition group-hover:text-[#9a6b25]">
                        {source.title}
                      </h2>
                    </a>

                    {source.title_original &&
                      source.title_original !== source.title && (
                        <div className="mt-2 text-base text-[#5f5549]">
                          {source.title_original}
                        </div>
                      )}

                    {source.title_en && (
                      <div className="mt-1 text-sm italic text-[#84786a]">
                        {source.title_en}
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#d9d0c0] pt-5 text-xs text-[#766d61]">
                      {source.written_period && (
                        <span>{source.written_period}</span>
                      )}
                      {source.original_language && (
                        <span>{source.original_language}</span>
                      )}
                    </div>

                    {source.author_compiler && (
                      <p className="mt-4 text-sm text-[#625b50]">
                        <span className="font-medium">Зохиогч / эмхэтгэгч:</span>{" "}
                        {source.author_compiler}
                      </p>
                    )}

                    {source.summary && (
                      <p className="mt-5 line-clamp-4 text-sm leading-7 text-[#766d61]">
                        {source.summary}
                      </p>
                    )}

                    <div className="mt-auto pt-7">
                      <a
                        href={href}
                        className="inline-block text-sm font-medium text-[#29251f] transition hover:text-[#9a6b25]"
                      >
                        Дэлгэрэнгүй →
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#d9d0c0] bg-[#f7f3ea] p-10 text-center">
              <p className="text-sm text-[#766d61]">
                Одоогоор эх сурвалж бүртгэгдээгүй байна.
              </p>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-[#4a443c] bg-[#29251f] px-6 py-8 text-[#aaa195] lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-medium text-[#f7f3ea]">
              Монголын эзэнт гүрний түүхийн сан
            </div>
            <div className="mt-1 text-xs">
              Mongol Empire Historical Archive
            </div>
          </div>
          <div className="text-xs">© 2026 Historical Archive</div>
        </div>
      </footer>
    </main>
  );
}
