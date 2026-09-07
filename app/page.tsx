import { supabase } from "@/lib/supabase";
import PublicHeader from "@/components/PublicHeader";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const categories = [
  {
    number: "01",
    title: "Монголын эзэнт гүрэн",
    description: "Эзэнт гүрний нийт түүх, өргөжилт, улс төрийн тогтолцоо, өв уламжлал.",
  },
  {
    number: "02",
    title: "Их Монгол улс",
    description: "Чингис хаан, Монголын нэгдэл болон эзэнт гүрний эхэн үе.",
  },
  {
    number: "03",
    title: "Юань улс",
    description: "Хубилай хаан, Юань улсын төр, нийгэм болон Зүүн Азийн түүх.",
  },
  {
    number: "04",
    title: "Цагадайн улс",
    description: "Төв Ази дахь Цагадайн угсааны улс, хаад болон улс төрийн түүх.",
  },
  {
    number: "05",
    title: "Ил хант улс",
    description: "Иран, Перс болон Ойрх Дорнод дахь Монголын төр, соёлын түүх.",
  },
  {
    number: "06",
    title: "Алтан ордны улс",
    description: "Зүчийн улс, Дешт-и Кипчак, Русь болон Евразийн баруун хэсгийн түүх.",
  },
];

export default async function Home() {
  const { data: books, error: booksError } = await supabase
    .from("books")
    .select(`
      id,
      title,
      subtitle,
      description,
      publication_year,
      featured,
      slug,
      cover_path,
      book_authors (
        author_order,
        authors (
          id,
          name,
          name_mn,
          name_en
        )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(6);

  function getCoverUrl(coverPath: string | null) {
    if (!coverPath) return null;

    return supabase.storage
      .from("book-covers")
      .getPublicUrl(coverPath).data.publicUrl;
  }

  function getAuthorNames(book: any) {
    return (book.book_authors || [])
      .slice()
      .sort(
        (a: any, b: any) =>
          (a.author_order || 0) - (b.author_order || 0)
      )
      .map((item: any) => {
        const author = item.authors;

        return (
          author?.name_mn ||
          author?.name ||
          author?.name_en ||
          ""
        );
      })
      .filter(Boolean)
      .join(", ");
  }

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      {/* HEADER */}
      <PublicHeader />

      {/* SEARCH-FIRST HERO */}
      <section className="relative overflow-hidden border-b border-[#d9d0c0]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.055]">
          <div className="absolute left-1/2 top-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-[#7b5a32]" />
          <div className="absolute left-1/2 top-24 h-[380px] w-[380px] -translate-x-1/2 rounded-full border border-[#7b5a32]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center lg:px-8 lg:py-28">
          <div className="mx-auto max-w-4xl">
            <div className="text-xs font-medium uppercase tracking-[0.3em] text-[#9a6b25]">
              1206 — 1388
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Монголын эзэнт гүрний түүхийн сан
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#6b6256] sm:text-base">
              Монголын эзэнт гүрний түүхтэй холбоотой ном, судлаач,
              эх сурвалж болон түүхэн мэдээллийг нэг дороос судлаарай.
            </p>
          </div>

          <form
            action="/search"
            method="get"
            className="mx-auto mt-10 flex max-w-4xl items-center rounded-2xl border border-[#c9bda9] bg-[#fffdf8] p-2 shadow-[0_16px_55px_rgba(70,50,20,0.09)]"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center text-2xl text-[#8b7b66]">
              ⌕
            </div>

            <input
              type="search"
              name="q"
              placeholder="Ном, зохиогч, эх сурвалж, он цагаар хайх..."
              className="h-14 min-w-0 flex-1 bg-transparent px-2 text-base text-[#29251f] outline-none placeholder:text-[#a69c8e]"
            />

            <button
              type="submit"
              className="hidden rounded-xl bg-[#29251f] px-7 py-4 text-sm font-medium text-white transition hover:bg-[#9a6b25] sm:block"
            >
              Хайх
            </button>
          </form>

          <div className="mx-auto mt-5 flex max-w-4xl flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#877c6d]">
            <a href="/books" className="hover:text-[#9a6b25]">
              Бүх ном
            </a>
            <a href="/authors" className="hover:text-[#9a6b25]">
              Зохиогч, судлаачид
            </a>
            <a href="/sources" className="hover:text-[#9a6b25]">
              Эх сурвалж
            </a>
            <a href="/timeline" className="hover:text-[#9a6b25]">
              Он цагийн хэлхээс
            </a>
          </div>
        </div>
      </section>

      {/* LATEST BOOKS */}
      <section className="border-t border-[#d9d0c0] bg-[#f7f3ea] px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
                Номын сан
              </div>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Шинээр нэмэгдсэн номууд
              </h2>
            </div>

            <a
              href="/books"
              className="text-sm font-medium text-[#8b672f] hover:underline"
            >
              Бүх номыг үзэх →
            </a>
          </div>

          {booksError ? (
            <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Номын мэдээлэл татахад алдаа гарлаа: {booksError.message}
            </div>
          ) : books && books.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book: any) => {
                const coverUrl = getCoverUrl(book.cover_path);
                const authors = getAuthorNames(book);
                const href = book.slug ? `/books/${book.slug}` : "/books";

                return (
                  <article
                    key={book.id}
                    className="group overflow-hidden rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <a href={href} className="block">
                      <div className="flex h-72 items-center justify-center overflow-hidden bg-[#e6ddce] p-7">
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={book.title || "Номын хавтас"}
                            className="h-56 w-40 object-cover shadow-xl transition duration-300 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-56 w-40 flex-col justify-between border border-[#9d8666] bg-[#d8c7aa] p-5 text-center shadow-xl">
                            <div className="text-[8px] uppercase tracking-[0.2em] text-[#59472f]">
                              Mongol Empire
                            </div>

                            <div className="text-sm font-semibold leading-5 text-[#3e3223]">
                              {book.title}
                            </div>

                            <div className="text-[8px] uppercase tracking-[0.15em] text-[#59472f]">
                              Historical Archive
                            </div>
                          </div>
                        )}
                      </div>
                    </a>

                    <div className="p-6">
                      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#9a6b25]">
                        {book.publication_year || "Ном"}
                      </div>

                      <a href={href}>
                        <h3 className="mt-3 text-lg font-semibold tracking-tight transition group-hover:text-[#9a6b25]">
                          {book.title}
                        </h3>
                      </a>

                      {authors && (
                        <p className="mt-2 text-sm font-medium text-[#5f5549]">
                          {authors}
                        </p>
                      )}

                      {book.subtitle && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#766d61]">
                          {book.subtitle}
                        </p>
                      )}

                      <a
                        href={href}
                        className="mt-5 inline-block text-sm font-medium text-[#29251f] transition hover:text-[#9a6b25]"
                      >
                        Дэлгэрэнгүй →
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-10 text-center">
              <p className="text-sm text-[#766d61]">
                Одоогоор ном бүртгэгдээгүй байна.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="bg-[#fffdf8] px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
                Судлах хүрээ
              </div>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Монголын эзэнт гүрэн ба бүрэлдэхүүн улсууд
              </h2>
            </div>

            <p className="max-w-lg text-sm leading-7 text-[#766d61]">
              Монголын эзэнт гүрэн болон түүний бүрэлдэхүүн улс, улс төрийн
              орон зайг ангилан судлаарай.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[#d9d0c0] bg-[#d9d0c0] sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <a
                key={category.number}
                href={`/books?category=${encodeURIComponent(category.title)}`}
                className="group bg-[#fffdf8] p-7 text-left transition hover:bg-[#f7f0e2] lg:p-9"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium tracking-[0.2em] text-[#a58e6e]">
                    {category.number}
                  </span>

                  <span className="text-xl text-[#b8a68d] transition group-hover:translate-x-1 group-hover:text-[#9a6b25]">
                    →
                  </span>
                </div>

                <h3 className="mt-10 text-xl font-semibold tracking-tight">
                  {category.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#766d61]">
                  {category.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section
        id="newsletter"
        className="border-t border-[#d9d0c0] bg-[#eee8dc] px-6 py-14 lg:px-8"
      >
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-[#9a6b25]">
              Newsletter
            </div>
            <h2 className="mt-2 text-2xl font-semibold">
              Шинэ материалын мэдээллийг хүлээн авах
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-[#766d61]">
              Шинээр нэмэгдсэн ном, эх сурвалж, судалгааны мэдээллийг
              имэйлээр хүргэх хэсгийг дараагийн шатанд идэвхжүүлнэ.
            </p>
          </div>

          <a
            href="/books"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[#b9aa94] bg-[#fffdf8] px-5 py-3 text-sm font-medium text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
          >
            Одоогоор шинэ номуудыг үзэх →
          </a>
        </div>
      </section>

      {/* FOOTER / ABOUT */}
      <footer
        id="about"
        className="border-t border-[#403a32] bg-[#29251f] px-6 py-12 text-[#bcb2a3] lg:px-8"
      >
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="text-sm font-medium text-[#f7f3ea]">
              Монголын эзэнт гүрний түүхийн сан
            </div>
            <p className="mt-3 text-xs leading-6 text-[#9f978c]">
              Монголын эзэнт гүрний түүхтэй холбоотой ном, зохиогч,
              эх сурвалж болон түүхэн мэдээллийг нэг дор цуглуулж,
              судалгаа ба танин мэдэхүйд хүртээмжтэй болгох зорилготой.
            </p>

            <a
              href="/about"
              className="mt-4 inline-block text-xs font-medium text-[#c69b57] transition hover:text-[#f7f3ea]"
            >
              Төслийн тухай дэлгэрэнгүй →
            </a>
          </div>

          <div className="text-xs text-[#8f877b]">
            © 2026 Historical Archive
          </div>
        </div>
      </footer>
    </main>
  );
}
