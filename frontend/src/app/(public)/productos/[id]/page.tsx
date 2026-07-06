"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Producto } from "@/types";
import Link from "next/link";
import { useCart } from "@/features/cart/cart-context";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      const { id } = await params;

      try {
        const productos = await apiFetch<Producto[]>(endpoints.productos);
        const found = productos.find((item) => item.idProducto === Number(id)) ?? null;
        setProducto(found);
      } catch (error) {
        console.error("Error cargando producto", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params]);

  if (loading) {
    return (
      <main className="container-app py-16">
        <div className="card-base p-8">Cargando producto...</div>
      </main>
    );
  }

  if (!producto) {
    return (
      <main className="container-app py-16">
        <div className="card-base p-8">
          <h1 className="text-2xl font-bold">Producto no encontrado</h1>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400">
            No existe un producto con ese identificador.
          </p>
          <Link href="/productos" className="btn-primary mt-6 inline-flex">
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  const disponible = (producto.stockTotal ?? 0) > 0;

  return (
    <main className="container-app py-10">
      <div className="mb-6">
        <Link href="/productos" className="text-sm text-zinc-500 dark:text-zinc-400">
          ← Volver al catálogo
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="card-base aspect-square w-full rounded-[2rem] bg-zinc-100 dark:bg-zinc-800" />

        <article className="card-base p-8">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
              {producto.sku}
            </span>
            <span
              className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                disponible
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
              }`}
            >
              {disponible ? `Stock: ${producto.stockTotal}` : "Agotado"}
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight">{producto.nombre}</h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            {producto.descripcion}
          </p>

          <div className="mt-8 text-4xl font-bold">${producto.precioActual}</div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] p-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Peso</p>
              <p className="mt-2 font-semibold">{producto.pesoGramos} g</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] p-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Dimensiones</p>
              <p className="mt-2 font-semibold">{producto.dimensiones}</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] p-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Estado</p>
              <p className="mt-2 font-semibold">{producto.estado}</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] p-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">SKU</p>
              <p className="mt-2 font-semibold">{producto.sku}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!disponible}
              onClick={() => addItem(producto)}
            >
              {disponible ? "Agregar al carrito" : "Sin stock"}
            </button>

            <Link href="/productos" className="btn-secondary flex-1 text-center">
              Seguir comprando
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}