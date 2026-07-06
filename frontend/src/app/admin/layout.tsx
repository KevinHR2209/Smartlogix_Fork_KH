import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen md:grid-cols-[250px_1fr]">
        <aside className="border-r bg-card/50 p-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Smartlogix</h2>
              <p className="text-sm text-muted-foreground">Panel admin</p>
            </div>
            <ThemeToggle />
          </div>

          <nav className="space-y-2">
            <Link
              href="/admin"
              className="block rounded-lg px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/clientes"
              className="block rounded-lg px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground"
            >
              Clientes
            </Link>

            <Link
              href="/admin/productos"
              className="block rounded-lg px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground"
            >
              Productos
            </Link>

            <Link
              href="/admin/ventas"
              className="block rounded-lg px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground"
            >
              Ventas
            </Link>

            <Link
              href="/admin/transportistas"
              className="block rounded-lg px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground"
            >
              Transportistas
            </Link>
          </nav>
        </aside>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}