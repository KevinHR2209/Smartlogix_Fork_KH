"use client";

import { useEffect, useMemo, useState } from "react";
import { pedidosService } from "@/features/pedidos/services/pedidosService";
import { formatCurrency } from "@/lib/utils/currency";
import { Pedido } from "@/features/pedidos/types/pedido";

const ESTADOS = [
  "PENDIENTE",
  "PAGADO",
  "PREPARANDO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
];

function formatFecha(fecha?: string) {
  if (!fecha) return "Sin fecha";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;
  return date.toLocaleString("es-CL");
}

export default function AdminVentasPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      setMensaje("");
      const data = await pedidosService.getAll();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setPedidos([]);
      setMensaje("No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPedidos();
  }, []);

  const pedidosFiltrados = useMemo(() => {
    const term = search.toLowerCase();

    return pedidos.filter((pedido) => {
      const idPedido = String(pedido.idPedido ?? "").toLowerCase();
      const idCliente = String(pedido.idCliente ?? "").toLowerCase();
      const estadoPedido = String(pedido.estadoPedido ?? "").toLowerCase();
      const montoTotal = String(pedido.montoTotal ?? "").toLowerCase();

      return (
        idPedido.includes(term) ||
        idCliente.includes(term) ||
        estadoPedido.includes(term) ||
        montoTotal.includes(term)
      );
    });
  }, [pedidos, search]);

  const cambiarEstado = async (idPedido: number | undefined, estado: string) => {
    if (!idPedido) return;

    try {
      setSavingId(idPedido);
      setMensaje("");

      await pedidosService.cambiarEstado(idPedido, estado);

      setMensaje(`Pedido #${idPedido} actualizado a ${estado}.`);
      await loadPedidos();
    } catch (error: any) {
      setMensaje(error?.message || "Error actualizando el estado.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="container-app py-10">
      <section className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
          Administración
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Administrar ventas</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Revisa pedidos y actualiza su estado.
        </p>
      </section>

      {mensaje && (
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          {mensaje}
        </div>
      )}

      <section className="card-base p-6">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold">Pedidos</h2>
          <input
            className="input-base max-w-md"
            placeholder="Buscar por id pedido, cliente, estado o monto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-10 text-zinc-500 dark:text-zinc-400">
            Cargando pedidos...
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="py-10 text-zinc-500 dark:text-zinc-400">
            No hay pedidos para mostrar.
          </div>
        ) : (
          <div className="space-y-3">
            {pedidosFiltrados.map((pedido) => (
              <article
                key={pedido.idPedido}
                className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                      Pedido #{pedido.idPedido}
                    </p>

                    <div className="flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                      <span>Cliente: {pedido.idCliente}</span>
                      <span>Estado: {pedido.estadoPedido}</span>
                      <span>Monto: {formatCurrency(Number(pedido.montoTotal ?? 0))}</span>
                      <span>Items: {pedido.detalles?.length ?? 0}</span>
                    </div>

                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Fecha: {formatFecha(pedido.fechaCreacion)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                      className="input-base min-w-[220px]"
                      value={pedido.estadoPedido}
                      onChange={(e) => cambiarEstado(pedido.idPedido, e.target.value)}
                      disabled={savingId === pedido.idPedido}
                    >
                      {ESTADOS.map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>

                    {savingId === pedido.idPedido && (
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Guardando...
                      </span>
                    )}
                  </div>
                </div>

                {pedido.detalles && pedido.detalles.length > 0 && (
                  <div className="mt-4 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800">
                    <p className="mb-3 text-sm font-semibold">Detalle del pedido</p>
                    <div className="space-y-2">
                      {pedido.detalles.map((detalle) => (
                        <div
                          key={detalle.idDetalle}
                          className="flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-300"
                        >
                          <span>Presentación: {detalle.idPresentacion}</span>
                          <span>Cantidad: {detalle.cantidad}</span>
                          <span>
                            Precio snapshot:{" "}
                            {formatCurrency(Number(detalle.precioUnitarioSnapshot ?? 0))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}