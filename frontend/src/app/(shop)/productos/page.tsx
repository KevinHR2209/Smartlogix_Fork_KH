"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductGrid } from "@/features/productos/components/product-grid";
import { ProductFilters } from "@/features/productos/components/product-filters";
import { productosService } from "@/features/productos/services/productosService";
import { Producto } from "@/features/productos/types/producto";

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyStock, setOnlyStock] = useState(false);

  useEffect(() => {
    const loadProductos = async () => {
      try {
        setLoading(true);
        const data = await productosService.getAll();
        setProductos(data);
      } catch (err) {
        console.error("Error cargando el catálogo:", err);
        setError("No se pudo cargar el catálogo de productos.");
      } finally {
        setLoading(false);
      }
    };

    loadProductos();
  }, []);

  if (loading) {
    return (
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-sm uppercase tracking-widest font-bold text-black">
            Cargando catálogo...
          </div>
        </main>
    );
  }

  if (error) {
    return (
        <main className="min-h-screen bg-white flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-black mb-4">Error</h1>
          <p className="text-gray-500 mb-8 font-medium">{error}</p>
        </main>
    );
  }

  // LÓGICA DE FILTRADO
  const productosFiltrados = productos.filter((producto) => {
    const marca = producto.marca?.nombre || "";
    const textoBusqueda = searchTerm.toLowerCase();

    // Busca por nombre, SKU o marca
    const coincideBusqueda =
        producto.nombre.toLowerCase().includes(textoBusqueda) ||
        producto.sku.toLowerCase().includes(textoBusqueda) ||
        marca.toLowerCase().includes(textoBusqueda);

    // Verifica el stock si el checkbox está marcado
    const stock = producto.stockTotal ?? 0;
    const coincideStock = onlyStock ? stock > 0 : true;

    return coincideBusqueda && coincideStock;
  });

  return (
      <main className="min-h-screen bg-white font-sans text-black selection:bg-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 text-xs uppercase tracking-widest text-gray-500">
          <Link href="/" className="hover:text-black transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-semibold">Catálogo</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-gray-100 pb-6 gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-tighter text-black">
                Catálogo
              </h1>
              <p className="text-gray-500 mt-2 text-sm font-medium">
                {productosFiltrados.length} {productosFiltrados.length === 1 ? 'producto encontrado' : 'productos encontrados'}.
              </p>
            </div>

            {/* PASAMOS LOS ESTADOS AL COMPONENTE DE FILTROS */}
            <div className="relative z-30">
              <ProductFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onlyStock={onlyStock}
                  setOnlyStock={setOnlyStock}
              />
            </div>
          </div>

          {/* LA GRILLA DEFINITIVA */}
          {productosFiltrados.length === 0 ? (
              <div className="py-24 text-center text-gray-500 uppercase tracking-widest text-sm font-bold">
                No hay productos que coincidan con tu búsqueda.
              </div>
          ) : (
              /* AQUÍ FORZAMOS LAS 4 COLUMNAS (lg:grid-cols-4) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {productosFiltrados.map((producto) => (
                    <ProductGrid key={producto.idProducto} producto={producto} />
                ))}
              </div>
          )}
        </div>
      </main>
  );
}