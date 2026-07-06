import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CartButton } from "@/components/cart/cart-button";
import { CartSheet } from "@/components/cart/cart-sheet";

export default function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
        <div className="container-app flex items-center justify-between py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Smartlogix
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/">Inicio</Link>
            <Link href="/productos">Productos</Link>
            <Link href="/login">Login</Link>
            <Link href="/admin/dashboard">Admin</Link>
          </nav>

          <div className="flex items-center gap-3">
            <CartButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {children}
      <CartSheet />
    </div>
  );
}