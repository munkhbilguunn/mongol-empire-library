"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setAllowed(true);
      setChecking(false);
      return;
    }

    let active = true;

    async function checkAdmin() {
      setChecking(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (userError || !user) {
        setAllowed(false);
        setChecking(false);
        router.replace("/admin/login");
        return;
      }

      const { data: isAdmin, error: adminError } = await supabase.rpc(
        "is_admin"
      );

      if (!active) return;

      if (adminError || isAdmin !== true) {
        await supabase.auth.signOut();

        if (!active) return;

        setAllowed(false);
        setChecking(false);
        router.replace("/admin/login?error=not-admin");
        return;
      }

      setAllowed(true);
      setChecking(false);
    }

    void checkAdmin();

    return () => {
      active = false;
    };
  }, [isLoginPage, pathname, router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f3ea] text-[#29251f]">
        <div className="text-sm text-[#766d61]">
          Admin эрхийг шалгаж байна...
        </div>
      </main>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}