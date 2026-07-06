export default function AdminDashboardPage() {
  return (
    <main className="container-app py-10">
      <section className="mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
          Administración
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Desde aquí podrás administrar productos, clientes y ventas.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className="card-base p-6">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Productos</h2>
          <p className="mt-4 text-3xl font-bold">--</p>
        </article>

        <article className="card-base p-6">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Clientes</h2>
          <p className="mt-4 text-3xl font-bold">--</p>
        </article>

        <article className="card-base p-6">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Ventas</h2>
          <p className="mt-4 text-3xl font-bold">--</p>
        </article>
      </section>
    </main>
  );
}