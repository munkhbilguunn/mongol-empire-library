import PublicHeader from "@/components/PublicHeader";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <PublicHeader />

      <section className="px-6 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-3 w-28 rounded bg-[#d9d0c0]" />
            <div className="mt-5 h-10 w-full max-w-xl rounded bg-[#e4dccf]" />
            <div className="mt-4 h-4 w-full max-w-2xl rounded bg-[#e8e1d6]" />
            <div className="mt-2 h-4 w-3/4 max-w-xl rounded bg-[#e8e1d6]" />

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-[#d9d0c0] bg-[#fffdf8]"
                >
                  <div className="h-56 bg-[#e6ddce]" />

                  <div className="p-6">
                    <div className="h-3 w-20 rounded bg-[#d9d0c0]" />
                    <div className="mt-4 h-5 w-4/5 rounded bg-[#ddd4c7]" />
                    <div className="mt-3 h-4 w-2/3 rounded bg-[#e8e1d6]" />
                    <div className="mt-2 h-4 w-full rounded bg-[#e8e1d6]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-[#8c8376]">
            Мэдээллийг ачаалж байна...
          </p>
        </div>
      </section>
    </main>
  );
}
