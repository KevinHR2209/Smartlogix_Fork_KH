import Link from "next/link";
import Image from "next/image";
import { Producto } from "@/features/productos/types/producto";
import { formatCurrency } from "@/lib/utils/currency";

interface ProductCardProps {
    producto: Producto;
}

export function ProductCard({ producto }: ProductCardProps) {
    // Lógica de stock
    const stock = producto.stockTotal ?? 0;
    const disponible = stock > 0;

    // Imagen y Marca leídas correctamente
    const imagenSrc = producto.imagenUrl || "/placeholder.png";
    const marcaNombre = producto.marca?.nombre || "SMARTLOGIX";

    return (
        <Link
            href={`/productos/${producto.idProducto}`}
            className="group flex flex-col border border-gray-200 bg-white transition-all hover:border-black"
        >
            {/* CONTENEDOR DE IMAGEN */}
            <div className="aspect-[4/5] relative overflow-hidden bg-gray-50 w-full border-b border-gray-200">
                <Image
                    src={imagenSrc}
                    alt={producto.nombre}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
            </div>

            {/* INFORMACIÓN DEL PRODUCTO */}
            <div className="p-4 flex flex-col flex-1">

                {/* HEADER: MARCA Y STOCK */}
                <div className="flex justify-between items-start mb-3 gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">
            {marcaNombre}
          </span>
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">
            {disponible ? `Stock: ${stock}` : "Agotado"}
          </span>
                </div>

                {/* TÍTULO */}
                <h3 className="text-sm font-bold uppercase tracking-tighter text-black mb-2 line-clamp-2">
                    {producto.nombre}
                </h3>

                {/* FOOTER: PRECIO Y ACCIÓN */}
                <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-sm font-bold text-black">
            {formatCurrency(producto.precioActual)}
          </span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-black transition-colors">
            Ver Detalle
          </span>
                </div>
            </div>
        </Link>
    );
}