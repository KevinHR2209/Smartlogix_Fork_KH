import { ProductCard } from "./product-card";
import { Producto } from "@/features/productos/types/producto";

interface ProductGridProps {
  producto: Producto;
}

export function ProductGrid({ producto }: ProductGridProps) {
  return <ProductCard producto={producto} />;
}