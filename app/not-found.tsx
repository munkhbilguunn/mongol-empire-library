import PublicHeader from "@/components/PublicHeader";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <PublicHeader />

      <section className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-xs font-medium uppercase tracking-[0.28em] text-[#9a6b25]">
            404 · Page not found
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Хуудас олдсонгүй
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#766d61] sm:text-base">
            Таны нээх гэж буй хуудас байхгүй, устсан эсвэл хаяг нь өөрчлөгдсөн
            байж болно.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="/"
              className="rounded-xl bg-[#29251f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a6b25]"
            >
              Нүүр хуудас
            </a>

            <a
              href="/search"
              className="rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-5 py-3 text-sm font-medium text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
            >
              Нэгдсэн хайлт
            </a>

            <a
              href="/books"
              className="rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-5 py-3 text-sm font-medium text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
            >
              Номын сан
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
