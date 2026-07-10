import type { Producto } from "@/features/productos/types/producto";

export interface CartItem extends Producto {
  cantidad: number;
}