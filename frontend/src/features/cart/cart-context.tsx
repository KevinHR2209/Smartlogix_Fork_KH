"use client";

import { CartItem, Producto } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartContextType {
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

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  const addItem = useCallback((producto: Producto) => {
    const idProducto = Number(producto.idProducto);

    if (!idProducto) return;

    setItems((prev) => {
      const existing = prev.find((item) => item.idProducto === idProducto);

      if (existing) {
        return prev.map((item) =>
          item.idProducto === idProducto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          ...producto,
          idProducto,
          cantidad: 1,
        },
      ];
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

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.cantidad, 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce(
      (acc, item) => acc + Number(item.precioActual ?? 0) * item.cantidad,
      0
    );
  }, [items]);

  const value = useMemo<CartContextType>(
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