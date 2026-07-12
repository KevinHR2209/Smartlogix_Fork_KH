"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { clientesService } from "@/features/clientes/services/clientesService";
import { pedidosService } from "@/features/pedidos/services/pedidosService";
import { mercadopagoService } from "@/features/pagos/services/mercadopagoService";
import { Pedido } from "@/types";
import { EstadoPago } from "@/features/pagos/types/pago";
import { formatCurrency } from "@/lib/utils/currency";

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE_PAGO: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  PAGADO: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  PAGO_RECHAZADO: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  CANCELADO: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  ENVIADO: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  COMPLETADO: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export default function PedidosPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadosPago, setEstadosPago] = useState<Record<number, EstadoPago | null>>({});
  const [consultando, setConsultando] = useState<number | null>(null);

  const cargarPedidos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const cliente = await clientesService.getByCorreo(user.correo);
      if (!cliente.idCliente) throw new Error("No se encontró un cliente asociado a tu cuenta");
      const data = await pedidosService.getByCliente(cliente.idCliente);
      setPedidos(data.sort((a, b) => (b.idPedido ?? 0) - (a.idPedido ?? 0)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar tus pedidos");
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

  if (authLoading || loading) {
    return (
      <main className="container-app py-10">
        <div className="card-base flex min-h-72 items-center justify-center p-8">
          Cargando tus pedidos...
        </div>
      </main>
    );
  }

  return (
    <main className="container-app py-10">
      <section className="mb-8 flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
          Smartlogix Store
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Mis pedidos</h1>
      </section>

      {error && (
        <div className="card-base mb-6 border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {pedidos.length === 0 && !error ? (
        <div className="card-base flex min-h-48 items-center justify-center p-8 text-zinc-500 dark:text-zinc-400">
          Todavía no tienes pedidos.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pedidos.map((pedido) => (
            <article key={pedido.idPedido} className="card-base p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Pedido #{pedido.idPedido}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {pedido.fechaCreacion
                      ? new Date(pedido.fechaCreacion).toLocaleString("es-CL")
                      : ""}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    ESTADO_COLOR[pedido.estadoPedido] ??
                    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {pedido.estadoPedido}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-lg font-bold">{formatCurrency(pedido.montoTotal)}</p>

                {pedido.idPedido && (
                  <button
                    type="button"
                    className="btn-secondary text-sm"
                    onClick={() => verEstadoPago(pedido.idPedido!)}
                    disabled={consultando === pedido.idPedido}
                  >
                    {consultando === pedido.idPedido ? "Consultando..." : "Ver estado de pago"}
                  </button>
                )}
              </div>

              {pedido.idPedido && pedido.idPedido in estadosPago && (
                <div className="mt-3 rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-800">
                  {estadosPago[pedido.idPedido] ? (
                    <>
                      <p>
                        Estado del pago:{" "}
                        <strong>{estadosPago[pedido.idPedido]!.estadoPago}</strong>
                      </p>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        Método: {estadosPago[pedido.idPedido]!.metodoPago} · Monto:{" "}
                        {formatCurrency(estadosPago[pedido.idPedido]!.montoTransaccion)}
                      </p>
                    </>
                  ) : (
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Todavía no hay un pago registrado para este pedido.
                    </p>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
