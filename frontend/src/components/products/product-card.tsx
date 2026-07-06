import Link from "next/link";
import { Producto } from "@/types";

interface ProductCardProps {
  producto: Producto;
  onAdd?: (producto: Producto) => void;
}

export function ProductCard({ producto, onAdd }: ProductCardProps) {
  const disponible = (producto.stockTotal ?? 0) > 0;

  return (
    <article className="card-base flex h-full flex-col justify-between p-5 transition hover:shadow-md">
      <div className="space-y-4">
        <div className="aspect-[4/3] w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800" />

        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <span className="inline-flex rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
              {producto.sku}
            </span>

            <p
              className={`w-max rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                disponible
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
              }`}
            >
              {disponible ? `Stock: ${producto.stockTotal}` : "Agotado"}
            </p>
          </div>

          <p className="text-lg font-bold">${producto.precioActual}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">{producto.nombre}</h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {producto.descripcion}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href={`/productos/${producto.idProducto}`}
          className="btn-secondary flex-1 text-center"
        >
          Ver detalle
        </Link>

        <button
          onClick={() => onAdd?.(producto)}
          disabled={!disponible}
          className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disponible ? "Agregar" : "Sin stock"}
        </button>
      </div>
    </article>
  );
}