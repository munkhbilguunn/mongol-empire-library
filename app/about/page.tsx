export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <header className="border-b border-[#d9d0c0] bg-[#f7f3ea]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:px-8">
          <a href="/">
            <div className="text-[10px] uppercase tracking-[0.26em] text-[#9a6b25]">
              Historical Archive
            </div>
            <div className="mt-1 text-base font-semibold tracking-tight sm:text-lg">
              Монголын эзэнт гүрний түүхийн сан
            </div>
          </a>

          <nav className="hidden items-center gap-5 text-[13px] text-[#625b50] lg:flex">
            <a href="/books" className="transition hover:text-[#9a6b25]">
              Номын сан
            </a>
            <a href="/authors" className="transition hover:text-[#9a6b25]">
              Зохиогч, судлаачид
            </a>
            <a href="/sources" className="transition hover:text-[#9a6b25]">
              Эх сурвалж
            </a>
            <a href="/timeline" className="transition hover:text-[#9a6b25]">
              Он цагийн хэлхээс
            </a>
            <a href="/#newsletter" className="transition hover:text-[#9a6b25]">
              Newsletter
            </a>
            <span className="font-medium text-[#9a6b25]">
              Төслийн тухай
            </span>
          </nav>

          <a
            href="/"
            className="shrink-0 text-sm font-medium text-[#8b672f] hover:underline lg:hidden"
          >
            ← Нүүр хуудас
          </a>
        </div>
      </header>

      <section className="border-b border-[#d9d0c0] bg-[#fffdf8] px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-xs font-medium uppercase tracking-[0.25em] text-[#9a6b25]">
            About the Project
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Төслийн тухай
          </h1>

          <p className="mt-7 max-w-3xl text-base leading-8 text-[#625b50] sm:text-lg">
            Монголын эзэнт гүрний түүхийн сан нь Монголын эзэнт гүрэн,
            түүний бүрэлдэхүүн улсууд болон холбогдох түүхэн орон зайг
            судлахад хэрэгтэй ном, зохиогч, эх сурвалж, он цагийн мэдээллийг
            нэг дор эмхэтгэн хүргэх цахим сан юм.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-10 md:grid-cols-[220px_1fr]">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-[#9a6b25]">
                Зорилго
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold">
                Судалгааны мэдээлэлд хүрэх замыг хялбарчлах
              </h2>

              <p className="mt-4 text-sm leading-8 text-[#766d61]">
                Түүхийн судалгааны ном, анхдагч болон уламжлалт эх сурвалж,
                зохиогч, судлаачдын мэдээллийг тус тусад нь бус харин
                хоорондын холбоотой нь харах боломжтой сан бүрдүүлэхийг
                зорьж байна.
              </p>
            </div>
          </div>

          <div className="my-12 border-t border-[#d9d0c0]" />

          <div className="grid gap-10 md:grid-cols-[220px_1fr]">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-[#9a6b25]">
                Сангийн бүтэц
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {[
                {
                  title: "Номын сан",
                  text: "Монголын эзэнт гүрний түүхтэй холбоотой судалгааны ном, орчуулга, тайлбар бүтээлүүд.",
                  href: "/books",
                },
                {
                  title: "Зохиогч, судлаачид",
                  text: "Номын санд бүртгэлтэй зохиогч, орчуулагч, судлаачдын мэдээлэл.",
                  href: "/authors",
                },
                {
                  title: "Эх сурвалж",
                  text: "Монголын эзэнт гүрний түүхийг судлахад чухал түүхэн сурвалж бичгүүд.",
                  href: "/sources",
                },
                {
                  title: "Он цагийн хэлхээс",
                  text: "Түүхэн үйл явдлыг он дарааллаар нэгтгэн харах хэсэг.",
                  href: "/timeline",
                },
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-6 transition hover:border-[#bda77f] hover:shadow-md"
                >
                  <h3 className="font-semibold transition group-hover:text-[#9a6b25]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#766d61]">
                    {item.text}
                  </p>
                  <div className="mt-5 text-sm font-medium text-[#8b672f]">
                    Үзэх →
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="my-12 border-t border-[#d9d0c0]" />

          <div className="grid gap-10 md:grid-cols-[220px_1fr]">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-[#9a6b25]">
                Хамрах хүрээ
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold">
                Монголын эзэнт гүрэн ба бүрэлдэхүүн улсууд
              </h2>

              <p className="mt-4 text-sm leading-8 text-[#766d61]">
                Сангийн үндсэн ангилалд Их Монгол улс, Юань улс,
                Цагадайн улс, Ил хант улс, Алтан ордны улс болон
                Монголын эзэнт гүрний нийт түүхийг хамруулна.
              </p>

              <a
                href="/#categories"
                className="mt-5 inline-block text-sm font-medium text-[#8b672f] hover:underline"
              >
                Судлах хүрээг үзэх →
              </a>
            </div>
          </div>

          <div className="my-12 border-t border-[#d9d0c0]" />

          <div className="grid gap-10 md:grid-cols-[220px_1fr]">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.22em] text-[#9a6b25]">
                Хэрхэн ашиглах вэ?
              </div>
            </div>

            <div>
              <p className="text-sm leading-8 text-[#766d61]">
                Нүүр хуудасны нэгдсэн хайлтаар ном, зохиогч, эх сурвалж,
                он цагийн мэдээллийг зэрэг хайх боломжтой. Мөн тус бүрийн
                сан руу орж ангилал, хэл болон бусад шүүлтүүрээр нарийвчлан
                үзэж болно.
              </p>

              <a
                href="/search"
                className="mt-6 inline-flex rounded-xl bg-[#29251f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a6b25]"
              >
                Нэгдсэн хайлт руу орох
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#403a32] bg-[#29251f] px-6 py-10 text-[#bcb2a3] lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-medium text-[#f7f3ea]">
              Монголын эзэнт гүрний түүхийн сан
            </div>
            <div className="mt-1 text-xs text-[#8f877b]">
              Mongol Empire Historical Archive
            </div>
          </div>

          <div className="text-xs">
            © 2026 Historical Archive
          </div>
        </div>
      </footer>
    </main>
  );
}
