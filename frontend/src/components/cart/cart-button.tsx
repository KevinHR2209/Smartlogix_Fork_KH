"use client";

import { useCart } from "@/features/cart/cart-context";

export function CartButton() {
  const { openCart, totalItems } = useCart();

  return (
    <button onClick={openCart} className="relative btn-secondary">
      🛒 Carrito
      {totalItems > 0 && (
        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
          {totalItems}
        </span>
      )}
    </button>
  );
}