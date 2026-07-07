import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const adminLinks = [
  { label: "Inicio", href: "/admin" },
  { label: "Clientes", href: "/admin/clientes" },
  { label: "Productos", href: "/admin/productos" },
  { label: "Ventas", href: "/admin/ventas" },
  { label: "Transportistas", href: "/admin/transportistas" },
];

const quickLinks = [
  { label: "Ver catálogo", href: "/productos" },
];

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
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 border-t pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Vista cliente
            </p>

            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}