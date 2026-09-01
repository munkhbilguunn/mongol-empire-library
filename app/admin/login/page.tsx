"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email эсвэл нууц үг буруу байна.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea] px-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[#9a6b25]">
            Historical Archive
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Admin нэвтрэх
          </h1>

          <p className="mt-3 text-sm text-[#766d61]">
            Монголын эзэнт гүрний түүхийн сан
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl border border-[#d9d0c0] bg-[#fffdf8] p-8 shadow-sm"
        >
          <div>
            <label className="text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-white px-4 text-sm outline-none transition focus:border-[#9a6b25]"
              placeholder="admin@example.com"
            />
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium">
              Нууц үг
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 h-12 w-full rounded-xl border border-[#cfc4b2] bg-white px-4 text-sm outline-none transition focus:border-[#9a6b25]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-xl bg-[#29251f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a6b25] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-[#766d61] transition hover:text-[#9a6b25]"
          >
            ← Нүүр хуудас руу буцах
          </a>
        </div>
      </div>
    </main>
  );
}