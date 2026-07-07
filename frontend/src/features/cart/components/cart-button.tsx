"use client";

import { useCart } from "@/features/cart/cart-context";

export function CartButton() {
  const { openCart, totalItems } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative overflow-visible inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--accent)]"
    >
      <span className="mr-2">🛒</span>
      <span className="hidden sm:inline">Carrito</span>

      {totalItems > 0 && (
        <span className="absolute -right-3 -top-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-black leading-none text-black shadow-md ring-2 ring-[var(--background)]">
          {totalItems}
        </span>
      )}
    </button>
  );
}