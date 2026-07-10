import { useState } from "react";
import { Inventario } from "../types/inventario";

type Props = {
  items: Inventario[];
  onAction: (
    action: "ajustar" | "reservar" | "liberar" | "descontar",
    item: Inventario,
    cantidad: number
  ) => void;
};

export function InventarioList({ items, onAction }: Props) {
  const [cantidades, setCantidades] = useState<Record<number, number>>({});

  return (
    <div className="card-base p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Resultados</h2>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {items.length} registros
        </span>
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-zinc-500 dark:text-zinc-400">
          No hay registros cargados.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.idInventario}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                    Inventario #{item.idInventario}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">
                    {item.nombreProducto ?? "Producto"} · {item.sku ?? "Sin SKU"}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Bodega: {item.nombreBodega ?? item.idBodega}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                    <span>Disponible: {item.stockDisponible}</span>
                    <span>Reservado: {item.stockReservado}</span>
                    <span>ID producto: {item.idProducto}</span>
                    <span>ID bodega: {item.idBodega}</span>
                  </div>
                </div>

                <div className="w-full max-w-md space-y-3">
                  <input
                    type="number"
                    min={1}
                    className="input-base"
                    placeholder="Cantidad"
                    value={cantidades[item.idInventario ?? 0] ?? ""}
                    onChange={(e) =>
                      setCantidades((prev) => ({
                        ...prev,
                        [item.idInventario ?? 0]: Number(e.target.value),
                      }))
                    }
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        onAction("ajustar", item, cantidades[item.idInventario ?? 0] ?? 0)
                      }
                      className="btn-secondary"
                    >
                      Ajustar
                    </button>
                    <button
                      onClick={() =>
                        onAction("reservar", item, cantidades[item.idInventario ?? 0] ?? 0)
                      }
                      className="btn-secondary"
                    >
                      Reservar
                    </button>
                    <button
                      onClick={() =>
                        onAction("liberar", item, cantidades[item.idInventario ?? 0] ?? 0)
                      }
                      className="btn-secondary"
                    >
                      Liberar
                    </button>
                    <button
                      onClick={() =>
                        onAction("descontar", item, cantidades[item.idInventario ?? 0] ?? 0)
                      }
                      className="btn-secondary"
                    >
                      Descontar
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}