"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CartButton } from "@/features/cart/components/cart-button";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout, loading } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    router.push("/login");
    router.refresh();
  }

  const initial = user?.nombre?.trim()?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="container-app flex items-center justify-between py-6 pb-5">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Smartlogix
        </Link>

        <nav className="hidden items-center gap-6 md:flex"></nav>

        <div className="flex items-center gap-3">
          {!loading && isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Abrir menú de usuario"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)]"
              >
                {initial}
              </button>

              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-64 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-2 shadow-lg"
                >
                  <div className="border-b border-[var(--border)] px-3 py-3">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {user?.nombre}
                    </p>
                    <p className="mt-1 break-all text-xs text-[var(--muted-foreground)]">
                      {user?.correo}
                    </p>
                  </div>

                  <div className="py-2">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-500 transition hover:bg-[var(--muted)]"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            !loading && <Link href="/login">Inicia Sesión</Link>
          )}

          <CartButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}