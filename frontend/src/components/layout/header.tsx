"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CartButton } from "@/features/cart/components/cart-button";

export function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="container-app flex items-center justify-between py-6 pb-5">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Smartlogix
        </Link>

        <nav className="hidden items-center gap-6 md:flex">

        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">Inicia Sesión</Link>
          <CartButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}