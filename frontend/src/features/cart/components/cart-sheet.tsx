"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/context/cart-context";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatCurrency } from "@/lib/utils/currency";
import { clientesService } from "@/features/clientes/services/clientesService";
import { pedidosService } from "@/features/pedidos/services/pedidosService";
import { mercadopagoService } from "@/features/pagos/services/mercadopagoService";

export function CartSheet() {
  const {
    items,
    isOpen,
    closeCart,
    addItem,
    decreaseItem,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [procesando, setProcesando] = useState(false);
  const [errorPago, setErrorPago] = useState<string | null>(null);

  if (!isOpen) return null;

  async function comprar() {
    if (!isAuthenticated || !user) {
      closeCart();
      router.push("/login");
      return;
    }

    setErrorPago(null);
    setProcesando(true);
    try {
      // 1. El JWT solo trae el correo, hay que resolver el idCliente real
      const cliente = await clientesService.getByCorreo(user.correo);
      if (!cliente.idCliente) {
        throw new Error("No se encontro un cliente asociado a tu cuenta");
      }

      // 2. Crear el pedido (queda en PENDIENTE_PAGO, con stock ya reservado)
      const pedido = await pedidosService.create({
        idCliente: cliente.idCliente,
        detalles: items.map((item) => ({
          idPresentacion: item.idProducto!,
          cantidad: item.cantidad,
        })),
      });

      if (!pedido.idPedido) {
        throw new Error("El pedido se creo pero no devolvio un id");
      }

      // 3. Crear la preferencia de pago en Mercado Pago
      const preferencia = await mercadopagoService.crearPreferencia(pedido.idPedido);

      // 4. Redirigir al checkout de Mercado Pago.
      // OJO: sandbox_init_point esta DEPRECADO por Mercado Pago y suele dar
      // error o pagina en blanco con credenciales APP_USR- (incluso las de
      // usuario de prueba). El flujo correcto hoy es usar siempre init_point
      // con credenciales del VENDEDOR de prueba y pagar con el COMPRADOR de
      // prueba (o tarjetas de prueba).
      clearCart();
      closeCart();
      window.location.href = preferencia.init_point || preferencia.sandbox_init_point;
    } catch (e) {
      setErrorPago(e instanceof Error ? e.message : "No se pudo iniciar el pago");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={closeCart}
    >
      <div
        className="flex h-full w-full max-w-md flex-col bg-[var(--card)] p-6 text-[var(--card-foreground)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div>
            <h2 className="text-xl font-bold">Mi carrito</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {totalItems} producto(s)
            </p>
          </div>

          <button
            type="button"
            onClick={closeCart}
            className="rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-center text-zinc-500 dark:text-zinc-400">
            Tu carrito está vacío.
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              {items.map((item) => (
                <article
                  key={item.idProducto}
                  className="rounded-2xl border border-[var(--border)] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{item.nombre}</h3>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {formatCurrency(Number(item.precioActual ?? 0))} c/u
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => item.idProducto && removeItem(item.idProducto)}
                      className="text-sm text-red-500"
                    >
                      Quitar
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => item.idProducto && decreaseItem(item.idProducto)}
                        className="btn-secondary h-10 w-10 p-0"
                      >
                        -
                      </button>

                      <span className="min-w-8 text-center font-semibold">
                        {item.cantidad}
                      </span>

                      <button
                        type="button"
                        onClick={() => addItem(item)}
                        className="btn-secondary h-10 w-10 p-0"
                      >
                        +
                      </button>
                    </div>

                    <p className="font-bold">
                      {formatCurrency(Number(item.precioActual ?? 0) * item.cantidad)}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 border-t border-[var(--border)] pt-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Total
                </span>
                <span className="text-2xl font-bold">
                  {formatCurrency(Number(totalPrice ?? 0))}
                </span>
              </div>

              {errorPago && (
                <p className="mb-3 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                  {errorPago}
                </p>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={clearCart} className="btn-secondary flex-1">
                  Vaciar
                </button>
                <button
                  type="button"
                  onClick={comprar}
                  disabled={procesando}
                  className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {procesando ? "Procesando..." : "Comprar"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}