"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { clientesService } from "@/features/clientes/services/clientesService";
import { pedidosService } from "@/features/pedidos/services/pedidosService";
import { mercadopagoService } from "@/features/pagos/services/mercadopagoService";
import { Pedido } from "@/types";
import { EstadoPago } from "@/features/pagos/types/pago";
import { formatCurrency } from "@/lib/utils/currency";

// ─── Constantes ───────────────────────────────────────────────────────────────
const ESTADO_BADGE: Record<string, string> = {
  PENDIENTE:       "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  PENDIENTE_PAGO:  "bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300",
  PAGADO:          "bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300",
  PAGO_RECHAZADO:  "bg-red-100    text-red-800    dark:bg-red-900/40    dark:text-red-300",
  PREPARANDO:      "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  ENVIADO:         "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  ENTREGADO:       "bg-green-100  text-green-800  dark:bg-green-900/40  dark:text-green-300",
  COMPLETADO:      "bg-green-100  text-green-800  dark:bg-green-900/40  dark:text-green-300",
  CANCELADO:       "bg-red-100    text-red-800    dark:bg-red-900/40    dark:text-red-300",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatFecha(fecha?: string) {
  if (!fecha) return "Sin fecha";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;
  return date.toLocaleString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BadgeEstado({ estado }: { estado: string }) {
  const cls =
    ESTADO_BADGE[estado] ??
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {estado.replace(/_/g, " ")}
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PedidosPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [pedidos,     setPedidos]     = useState<Pedido[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [expandedId,  setExpandedId]  = useState<number | null>(null);
  const [estadosPago, setEstadosPago] = useState<Record<number, EstadoPago | null>>({});
  const [consultando, setConsultando] = useState<number | null>(null);

  // ─── Carga de pedidos del cliente autenticado ─────────────────────────────
  const cargarPedidos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const cliente = await clientesService.getByCorreo(user.correo);
      if (!cliente.idCliente)
        throw new Error("No se encontró un cliente asociado a tu cuenta.");
      const data = await pedidosService.getByCliente(cliente.idCliente);
      // Más recientes primero
      setPedidos(data.sort((a, b) => (b.idPedido ?? 0) - (a.idPedido ?? 0)));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudieron cargar tus pedidos."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    cargarPedidos();
  }, [authLoading, isAuthenticated, router, cargarPedidos]);

  // ─── Consultar estado de pago en MercadoPago ──────────────────────────────
  async function verEstadoPago(idPedido: number) {
    setConsultando(idPedido);
    try {
      const estado = await mercadopagoService.consultarEstado(idPedido);
      setEstadosPago((prev) => ({ ...prev, [idPedido]: estado }));
    } catch {
      setEstadosPago((prev) => ({ ...prev, [idPedido]: null }));
    } finally {
      setConsultando(null);
    }
  }

  // ─── Toggle detalle ───────────────────────────────────────────────────────
  const toggleDetalle = (idPedido: number) =>
    setExpandedId((prev) => (prev === idPedido ? null : idPedido));

  // ─── Estadísticas rápidas ─────────────────────────────────────────────────
  const totalGastado = pedidos.reduce(
    (acc, p) => acc + Number(p.montoTotal ?? 0),
    0
  );
  const pedidosActivos = pedidos.filter(
    (p) => !["ENTREGADO", "COMPLETADO", "CANCELADO"].includes(p.estadoPedido)
  ).length;

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <main className="container-app py-10">
        <section className="mb-8 flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
            Smartlogix Store
          </p>
          <h1 className="text-4xl font-bold tracking-tight">Mis pedidos</h1>
        </section>
        <div className="card-base flex min-h-72 items-center justify-center p-8 text-zinc-500 dark:text-zinc-400">
          <div className="flex flex-col items-center gap-3">
            <div className="text-3xl">⏳</div>
            Cargando tus pedidos...
          </div>
        </div>
      </main>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="container-app py-10">

      {/* Encabezado */}
      <section className="mb-8 flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
          Smartlogix Store
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Mis pedidos</h1>
        {user && (
          <p className="text-zinc-500 dark:text-zinc-400">
            Hola,{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-200">
              {user.correo}
            </span>{" "}
            — aquí están todos tus pedidos.
          </p>
        )}
      </section>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          ✕ {error}
        </div>
      )}

      {/* Estadísticas rápidas */}
      {pedidos.length > 0 && (
        <section className="mb-6 grid grid-cols-3 gap-3">
          <div className="card-base p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total pedidos
            </p>
            <p className="mt-1 text-2xl font-bold">{pedidos.length}</p>
          </div>
          <div className="card-base p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              En curso
            </p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {pedidosActivos}
            </p>
          </div>
          <div className="card-base p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total gastado
            </p>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(totalGastado)}
            </p>
          </div>
        </section>
      )}

      {/* Sin pedidos */}
      {pedidos.length === 0 && !error && (
        <div className="card-base flex min-h-48 flex-col items-center justify-center gap-3 p-8 text-zinc-500 dark:text-zinc-400">
          <div className="text-4xl">📦</div>
          <p>Todavía no tienes pedidos.</p>
          <button
            className="btn-primary mt-2 text-sm"
            onClick={() => router.push("/productos")}
          >
            Ver productos
          </button>
        </div>
      )}

      {/* Lista de pedidos */}
      {pedidos.length > 0 && (
        <div className="flex flex-col gap-4">
          {pedidos.map((pedido) => (
            <article
              key={pedido.idPedido}
              className="card-base overflow-hidden"
            >
              {/* Header del pedido */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="flex flex-col gap-0.5">
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Pedido
                  </p>
                  <p className="text-lg font-bold">#{pedido.idPedido}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatFecha(pedido.fechaCreacion)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <BadgeEstado estado={pedido.estadoPedido} />
                  <p className="text-xl font-bold">
                    {formatCurrency(Number(pedido.montoTotal ?? 0))}
                  </p>
                </div>
              </div>

              {/* Barra separadora */}
              <div className="border-t border-zinc-100 dark:border-zinc-800" />

              {/* Resumen de ítems */}
              <div className="px-5 py-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {pedido.detalles?.length ?? 0}{" "}
                  {(pedido.detalles?.length ?? 0) === 1 ? "ítem" : "ítems"}
                </p>

                {/* Detalle expandible */}
                {pedido.detalles && pedido.detalles.length > 0 && (
                  <>
                    {expandedId === pedido.idPedido && (
                      <div className="mb-3 overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-zinc-200 text-left text-xs text-zinc-400 dark:border-zinc-700">
                              <th className="px-4 py-2">Presentación</th>
                              <th className="px-4 py-2">Cant.</th>
                              <th className="px-4 py-2 text-right">
                                Precio unit.
                              </th>
                              <th className="px-4 py-2 text-right">
                                Subtotal
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                            {pedido.detalles.map((d) => (
                              <tr key={d.idDetalle}>
                                <td className="px-4 py-2 text-zinc-700 dark:text-zinc-200">
                                  #{d.idPresentacion}
                                </td>
                                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-300">
                                  x{d.cantidad}
                                </td>
                                <td className="px-4 py-2 text-right text-zinc-600 dark:text-zinc-300">
                                  {formatCurrency(
                                    Number(d.precioUnitarioSnapshot ?? 0)
                                  )}
                                </td>
                                <td className="px-4 py-2 text-right font-medium text-zinc-700 dark:text-zinc-200">
                                  {formatCurrency(
                                    Number(d.precioUnitarioSnapshot ?? 0) *
                                      d.cantidad
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <button
                      onClick={() => toggleDetalle(pedido.idPedido!)}
                      className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
                    >
                      {expandedId === pedido.idPedido
                        ? "▲ Ocultar detalle"
                        : "▼ Ver detalle del pedido"}
                    </button>
                  </>
                )}
              </div>

              {/* Footer: estado de pago con MercadoPago */}
              {pedido.idPedido && (
                <div className="border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    onClick={() => verEstadoPago(pedido.idPedido!)}
                    disabled={consultando === pedido.idPedido}
                  >
                    {consultando === pedido.idPedido
                      ? "Consultando pago..."
                      : "Ver estado de pago"}
                  </button>

                  {pedido.idPedido in estadosPago && (
                    <div className="mt-3 rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-800">
                      {estadosPago[pedido.idPedido] ? (
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-zinc-700 dark:text-zinc-200">
                          <span>
                            Estado:{" "}
                            <strong>
                              {estadosPago[pedido.idPedido]!.estadoPago}
                            </strong>
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            Método:{" "}
                            {estadosPago[pedido.idPedido]!.metodoPago}
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400">
                            Monto:{" "}
                            {formatCurrency(
                              estadosPago[pedido.idPedido]!.montoTransaccion
                            )}
                          </span>
                        </div>
                      ) : (
                        <p className="text-zinc-500 dark:text-zinc-400">
                          Todavía no hay un pago registrado para este pedido.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Botón recargar */}
      {pedidos.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={cargarPedidos}
            className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:hover:text-zinc-100"
          >
            ↻ Recargar pedidos
          </button>
        </div>
      )}
    </main>
  );
}