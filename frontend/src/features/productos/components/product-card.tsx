import Link from "next/link";
import { Producto } from "../types/producto";
import { formatCurrency } from "@/lib/utils/currency";

interface ProductCardProps {
  producto: Producto;
  onAdd?: (producto: Producto) => void;
}

export function ProductCard({ producto, onAdd }: ProductCardProps) {
  const disponible = (producto.stockTotal ?? 0) > 0;

  return (
    <article className="card-base flex h-full flex-col overflow-hidden p-4">
      <div className="mb-3 aspect-[4/3] rounded-2xl bg-zinc-100 dark:bg-zinc-800" />

      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          {producto.sku}
        </span>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            disponible
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {disponible ? `Stock: ${producto.stockTotal}` : "Agotado"}
        </span>
      </div>

      <h3 className="text-lg font-semibold leading-tight line-clamp-2">
        {producto.nombre}
      </h3>

      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
        {producto.descripcion}
      </p>

      <div className="mt-4 text-2xl font-bold">
        {formatCurrency(Number(producto.precioActual ?? 0))}
      </div>

      <div className="mt-4 flex gap-3">
        <Link
          href={`/productos/${producto.idProducto}`}
          className="btn-secondary flex-1 text-center"
        >
          Ver detalle
        </Link>

        <button
          type="button"
          className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!disponible}
          onClick={() => onAdd?.(producto)}
        >
          {disponible ? "Agregar" : "Sin stock"}
        </button>
      </div>
    </article>
  );
}