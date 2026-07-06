"use client";

import { CartItem, Producto } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (producto: Producto) => void;
  removeItem: (idProducto: number) => void;
  decreaseItem: (idProducto: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback((producto: Producto) => {
    if (!producto.idProducto) return;

    setItems((prev) => {
      const existing = prev.find((item) => item.idProducto === producto.idProducto);

      if (existing) {
        return prev.map((item) =>
          item.idProducto === producto.idProducto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...prev, { ...producto, cantidad: 1 }];
    });

    setIsOpen(true);
  }, []);

  const decreaseItem = useCallback((idProducto: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.idProducto === idProducto
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  }, []);

  const removeItem = useCallback((idProducto: number) => {
    setItems((prev) => prev.filter((item) => item.idProducto !== idProducto));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.cantidad, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((acc, item) => acc + item.precioActual * item.cantidad, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      decreaseItem,
      clearCart,
      totalItems,
      totalPrice,
    }),
    [
      items,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      decreaseItem,
      clearCart,
      totalItems,
      totalPrice,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }

  return context;
}