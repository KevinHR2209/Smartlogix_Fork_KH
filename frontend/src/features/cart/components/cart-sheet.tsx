"use client";

import { useCart } from "@/features/cart/cart-context";
import { formatCurrency } from "@/lib/utils/currency";

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

  if (!isOpen) return null;

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

              <div className="flex gap-3">
                <button type="button" onClick={clearCart} className="btn-secondary flex-1">
                  Vaciar
                </button>
                <button type="button" className="btn-primary flex-1">
                  Comprar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}