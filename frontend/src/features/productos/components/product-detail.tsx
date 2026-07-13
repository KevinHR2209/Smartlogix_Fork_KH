"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

import { useCart } from "@/features/cart/context/cart-context";
import { productosService } from "@/features/productos/services/productosService";
import { formatCurrency } from "@/lib/utils/currency";
import { Producto } from "@/features/productos/types/producto"; // Ojo con la ruta, ajusta si es index.ts

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const id = Number(params.id);

    if (Number.isNaN(id) || id <= 0) {
      setError("El identificador del producto no es válido.");
      setProducto(null);
      setLoading(false);
      return;
    }

    const loadProducto = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productosService.getById(id);
        setProducto(data);
      } catch (err) {
        console.error("Error cargando producto", err);
        setError("No se pudo cargar el producto.");
        setProducto(null);
      } finally {
        setLoading(false);
      }
    };

    loadProducto();
  }, [params.id]);

  if (loading) {
    return (
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-sm uppercase tracking-widest font-bold text-black">
            Cargando producto...
          </div>
        </main>
    );
  }

  if (error || !producto) {
    return (
        <main className="min-h-screen bg-white flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-black mb-4">
            {error ? "Error al cargar" : "Producto no encontrado"}
          </h1>
          <p className="text-gray-500 mb-8 font-medium">
            {error || "No existe un producto con ese identificador."}
          </p>
          <Link href="/productos" className="border-2 border-black px-8 py-3 uppercase tracking-widest text-sm font-bold text-black hover:bg-black hover:text-white transition-colors">
            Volver al catálogo
          </Link>
        </main>
    );
  }

  const disponible = (producto.stockTotal ?? 0) > 0;
  // Como ya lo agregamos al aplanamiento, esto leerá la URL real del bucket
  const imagenSrc = producto.imagenUrl || "/placeholder.png";

  return (
      <main className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">

        {/* BREADCRUMB */}
        <div className="max-w-7xl mx-auto px-4 py-6 text-xs uppercase tracking-widest text-gray-500">
          <Link href="/" className="hover:text-black transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href="/productos" className="hover:text-black transition-colors">Catálogo</Link>
          <span className="mx-2">/</span>
          <span className="text-black font-semibold">{producto.nombre}</span>
        </div>

        <section className="max-w-7xl mx-auto px-4 pb-24 pt-4 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">

          {/* IMAGEN */}
          <div className="w-full flex flex-col gap-4">
            <div className="aspect-[4/5] relative overflow-hidden w-full bg-gray-50 border border-gray-200">
              <Image
                  src={imagenSrc}
                  alt={producto.nombre}
                  fill
                  className="object-cover"
                  priority
              />
            </div>
          </div>

          {/* INFO */}
          <article className="w-full flex flex-col pt-2 lg:pt-8">

            <div className="mb-4 flex flex-wrap gap-4 items-center">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">
              {producto.marca?.nombre || "MARCA NO DISPONIBLE"}
            </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-tighter mb-4 text-black">
              {producto.nombre}
            </h1>

            <p className="text-xl text-black font-medium mb-8">
              {formatCurrency(producto.precioActual)}
            </p>

            <p className="text-gray-600 leading-relaxed font-normal mb-10">
              {producto.descripcion}
            </p>

            {/* ATRIBUTOS TÉCNICOS ESTÉTICOS */}
            <div className="mb-10 flex flex-col space-y-3 text-sm text-gray-600">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="uppercase tracking-widest font-semibold text-black">SKU</span>
                <span className="text-gray-500">{producto.sku}</span>
              </div>
              {producto.volumenMl && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="uppercase tracking-widest font-semibold text-black">Volumen</span>
                    <span className="text-gray-500">{producto.volumenMl} ml</span>
                  </div>
              )}
              {producto.pesoGramos && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="uppercase tracking-widest font-semibold text-black">Peso</span>
                    <span className="text-gray-500">{producto.pesoGramos} g</span>
                  </div>
              )}
              {producto.dimensiones && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="uppercase tracking-widest font-semibold text-black">Tipo Envase</span>
                    <span className="text-gray-500">{producto.dimensiones}</span>
                  </div>
              )}
              {producto.familiaOlfativa?.nombre && (
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="uppercase tracking-widest font-semibold text-black">Familia Olfativa</span>
                    <span className="text-gray-500">{producto.familiaOlfativa.nombre}</span>
                  </div>
              )}
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="uppercase tracking-widest font-semibold text-black">Stock</span>
                <span className="text-gray-500">
                {producto.stockTotal ?? 0} {producto.stockTotal === 1 ? 'unidad' : 'unidades'}
              </span>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3 sm:flex-row">
              <button
                  className={`flex-1 py-4 text-sm uppercase tracking-widest font-bold transition-all rounded-none border-2 ${
                      !disponible
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-black text-white border-black hover:bg-white hover:text-black'
                  }`}
                  disabled={!disponible}
                  onClick={() => addItem(producto)}
              >
                {disponible ? "Agregar al carrito" : "Agotado"}
              </button>
            </div>

          </article>
        </section>
      </main>
  );
}