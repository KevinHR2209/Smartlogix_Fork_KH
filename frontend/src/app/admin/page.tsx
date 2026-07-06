import Link from "next/link";

const stats = [
  {
    title: "Clientes",
    value: "128",
    href: "/admin/clientes",
    color: "bg-blue-500",
  },
  {
    title: "Productos",
    value: "54",
    href: "/admin/productos",
    color: "bg-emerald-500",
  },
  {
    title: "Ventas",
    value: "312",
    href: "/admin/ventas",
    color: "bg-violet-500",
  },
  {
    title: "Transportistas",
    value: "18",
    href: "/admin/transportistas",
    color: "bg-orange-500",
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Panel general de administración de Smartlogix.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="rounded-2xl border bg-card p-5 shadow-sm transition hover:bg-accent/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{item.title}</span>
              <span className={`h-3 w-3 rounded-full ${item.color}`} />
            </div>

            <div className="mt-4 text-3xl font-semibold">{item.value}</div>

            <p className="mt-3 text-sm text-primary">Ver módulo</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Accesos rápidos</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/clientes"
              className="rounded-xl border p-4 transition hover:bg-accent"
            >
              Administrar clientes
            </Link>

            <Link
              href="/admin/productos"
              className="rounded-xl border p-4 transition hover:bg-accent"
            >
              Administrar productos
            </Link>

            <Link
              href="/admin/ventas"
              className="rounded-xl border p-4 transition hover:bg-accent"
            >
              Revisar ventas
            </Link>

            <Link
              href="/admin/transportistas"
              className="rounded-xl border p-4 transition hover:bg-accent"
            >
              Gestionar transportistas
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="text-lg font-semibold">Estado</h2>

          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>Frontend operativo.</p>
            <p>Toggle de tema funcionando.</p>
            <p>Dashboard admin actualizado.</p>
          </div>
        </div>
      </section>
    </div>
  );
}