"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { canBuy, getSession } from "@/lib/auth";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
};

const productos: Producto[] = [
  {
    id: 1,
    nombre: "Notebook Lenovo ThinkPad",
    precio: 899990,
    descripcion: "Equipo empresarial con alto rendimiento para oficina y trabajo remoto.",
  },
  {
    id: 2,
    nombre: "Mouse Logitech MX Master",
    precio: 99990,
    descripcion: "Mouse ergonómico y preciso para productividad avanzada.",
  },
  {
    id: 3,
    nombre: "Monitor LG UltraWide 29”",
    precio: 229990,
    descripcion: "Pantalla panorámica ideal para multitarea y paneles de gestión.",
  },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(value);
}

export default function HomePage() {
  const router = useRouter();
  const [mensaje, setMensaje] = useState("");

  const session = useMemo(() => getSession(), []);

  function handleComprar(producto: Producto) {
    setMensaje("");

    if (!session) {
      router.push("/login");
      return;
    }

    if (!canBuy()) {
      setMensaje("Solo los usuarios con rol CLIENTE pueden comprar.");
      return;
    }

    setMensaje(`Producto "${producto.nombre}" agregado al flujo de compra.`);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Catálogo de productos</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Explora productos disponibles para compra.
            </p>
          </div>

          <div className="flex gap-3">
            {!session ? (
              <button
                onClick={() => router.push("/login")}
                className="rounded-xl border px-4 py-2 text-sm"
              >
                Iniciar sesión
              </button>
            ) : (
              <div className="text-right text-sm">
                <p className="font-medium">{session.nombre}</p>
                <p className="text-muted-foreground">{session.rol}</p>
              </div>
            )}
          </div>
        </div>

        {mensaje ? (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {mensaje}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {productos.map((producto) => (
            <article
              key={producto.id}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold">{producto.nombre}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {producto.descripcion}
              </p>
              <p className="mt-4 text-lg font-bold">
                {formatPrice(producto.precio)}
              </p>

              <button
                onClick={() => handleComprar(producto)}
                className="mt-6 w-full rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background"
              >
                Comprar
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}