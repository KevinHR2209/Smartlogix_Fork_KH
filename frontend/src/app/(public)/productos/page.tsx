"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Producto } from "@/types";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductGrid } from "@/components/products/product-grid";
import { useCart } from "@/features/cart/cart-context";

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState("");
  const [onlyStock, setOnlyStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const loadProductos = async () => {
      try {
        const data = await apiFetch<Producto[]>(endpoints.productos);
        if (Array.isArray(data)) {
          setProductos(data);
        }
      } catch (error) {
        console.error("Error cargando productos", error);
      } finally {
        setLoading(false);
      }
    };

    loadProductos();
  }, []);

    const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
        const term = search.toLowerCase();

        const matchSearch =
        (producto.nombre ?? "").toLowerCase().includes(term) ||
        (producto.descripcion ?? "").toLowerCase().includes(term) ||
        (producto.sku ?? "").toLowerCase().includes(term);

        const matchStock = onlyStock ? (producto.stockTotal ?? 0) > 0 : true;
        const matchEstado = (producto.estado ?? "").toUpperCase() === "ACTIVO";

        return matchSearch && matchStock && matchEstado;
    });
    }, [productos, search, onlyStock]);

  return (
    <main className="container-app py-10">
      <section className="mb-10 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
          Smartlogix Store
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Catálogo de productos</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Explora el catálogo, filtra por disponibilidad y revisa cada producto en una vista separada.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <ProductFilters
          search={search}
          onSearchChange={setSearch}
          onlyStock={onlyStock}
          onOnlyStockChange={setOnlyStock}
        />

        {loading ? (
          <div className="card-base flex min-h-72 items-center justify-center p-8">
            Cargando productos...
          </div>
        ) : (
          <ProductGrid productos={productosFiltrados} onAdd={addItem} />
        )}
      </section>
    </main>
  );
}