import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container-app py-16">
      <section className="card-base flex flex-col gap-6 p-8 md:p-12">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
            Smartlogix
          </p>
          <h1 className="max-w-3xl ()text-4xl font-bold tracking-tight md:text-6xl">
            Ecommerce moderno, simple y listo para separar usuario y administración
          </h1>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
            Navega el catálogo, revisa productos y prepara la base del panel de administración.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/productos" className="btn-primary">
            Ver catálogo
          </Link>
          <Link href="/login" className="btn-secondary">
            Iniciar sesión
          </Link>
        </div>
      </section>
    </main>
  );
}