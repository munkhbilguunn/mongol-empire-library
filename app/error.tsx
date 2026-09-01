"use client";

import { useEffect } from "react";
import PublicHeader from "@/components/PublicHeader";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#f7f3ea] text-[#29251f]">
      <PublicHeader />

      <section className="px-6 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-xs font-medium uppercase tracking-[0.28em] text-[#9a6b25]">
            Something went wrong
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Алдаа гарлаа
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#766d61] sm:text-base">
            Мэдээллийг ачаалах үед түр зуурын алдаа гарлаа. Дахин оролдох эсвэл
            нүүр хуудас руу буцаж болно.
          </p>

          {error.digest && (
            <p className="mt-4 text-xs text-[#9b9184]">
              Алдааны дугаар: {error.digest}
            </p>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-xl bg-[#29251f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a6b25]"
            >
              Дахин оролдох
            </button>

            <a
              href="/"
              className="rounded-xl border border-[#cfc4b2] bg-[#fffdf8] px-5 py-3 text-sm font-medium text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25]"
            >
              Нүүр хуудас
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
