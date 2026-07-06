"use client";

import { CartProvider } from "@/features/cart/cart-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}