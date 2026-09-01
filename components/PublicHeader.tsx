"use client";

import { useState } from "react";

type PublicHeaderProps = {
  active?: "books" | "authors" | "sources" | "timeline" | "about";
};

const navItems = [
  { key: "books", label: "Номын сан", href: "/books" },
  { key: "authors", label: "Зохиогч, судлаачид", href: "/authors" },
  { key: "sources", label: "Эх сурвалж", href: "/sources" },
  { key: "timeline", label: "Он цагийн хэлхээс", href: "/timeline" },
  { key: "newsletter", label: "Newsletter", href: "/#newsletter" },
  { key: "about", label: "Төслийн тухай", href: "/about" },
] as const;

export default function PublicHeader({
  active,
}: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#d9d0c0] bg-[#f7f3ea]/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex min-h-[76px] items-center justify-between gap-5">
          <a
            href="/"
            className="min-w-0"
            onClick={() => setMobileOpen(false)}
          >
            <div className="text-[10px] uppercase tracking-[0.26em] text-[#9a6b25]">
              Historical Archive
            </div>

            <div className="mt-1 truncate text-sm font-semibold tracking-tight sm:text-base lg:text-lg">
              Монголын эзэнт гүрний түүхийн сан
            </div>
          </a>

          {/* Desktop navigation */}
          <nav
            className="hidden items-center gap-5 text-[13px] text-[#625b50] xl:flex"
            aria-label="Үндсэн цэс"
          >
            {navItems.map((item) => {
              const isActive = active === item.key;

              return (
                <a
                  key={item.key}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "border-b border-[#9a6b25] pb-1 font-medium text-[#9a6b25]"
                      : "border-b border-transparent pb-1 transition hover:border-[#c8b38f] hover:text-[#9a6b25]"
                  }
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-navigation"
            aria-label={mobileOpen ? "Цэс хаах" : "Цэс нээх"}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#cfc4b2] bg-[#fffdf8] text-[#625b50] transition hover:border-[#9a6b25] hover:text-[#9a6b25] xl:hidden"
          >
            {mobileOpen ? (
              <span className="text-xl leading-none">×</span>
            ) : (
              <span className="flex w-4 flex-col gap-1">
                <span className="h-px w-4 bg-current" />
                <span className="h-px w-4 bg-current" />
                <span className="h-px w-4 bg-current" />
              </span>
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        {mobileOpen && (
          <nav
            id="public-mobile-navigation"
            aria-label="Гар утасны үндсэн цэс"
            className="border-t border-[#e4dccf] py-3 xl:hidden"
          >
            <div className="grid sm:grid-cols-2">
              {navItems.map((item) => {
                const isActive = active === item.key;

                return (
                  <a
                    key={item.key}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={
                      isActive
                        ? "rounded-xl bg-[#eee4d3] px-4 py-3 text-sm font-medium text-[#9a6b25]"
                        : "rounded-xl px-4 py-3 text-sm text-[#625b50] transition hover:bg-[#eee8dc] hover:text-[#9a6b25]"
                    }
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
