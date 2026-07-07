import Link from "next/link";

const links = [
  { label: "Inicio", href: "/admin" },
  { label: "Clientes", href: "/admin/clientes" },
  { label: "Productos", href: "/admin/productos" },
  { label: "Ventas", href: "/admin/ventas" },
  { label: "Transportistas", href: "/admin/transportistas" },
  { label: "Ver catálogo", href: "/productos" },
];

export function Sidebar() {
  return (
    <aside className="space-y-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-accent"
        >
          {link.label}
        </Link>
      ))}
    </aside>
  );
}