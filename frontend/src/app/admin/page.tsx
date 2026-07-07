import Link from "next/link";

const modules = [
  {
    title: "Clientes",
    description: "Consulta, crea y edita clientes del sistema.",
    href: "/admin/clientes",
  },
  {
    title: "Productos",
    description: "Administra el catálogo disponible en la tienda.",
    href: "/admin/productos",
  },
  {
    title: "Ventas",
    description: "Revisa pedidos, ventas y movimientos recientes.",
    href: "/admin/ventas",
  },
  {
    title: "Transportistas",
    description: "Gestiona transportistas y su información operativa.",
    href: "/admin/transportistas",
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inicio admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Panel general de administración de Smartlogix.
          </p>
        </div>

        <Link
          href="/productos"
          className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition hover:bg-accent"
        >
          Ver catálogo
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {modules.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="rounded-2xl border bg-card p-5 shadow-sm transition hover:bg-accent/40 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.description}
            </p>
            <p className="mt-4 text-sm font-medium text-primary">Abrir módulo</p>
          </Link>
        ))}
      </section>

    </div>
  );
}