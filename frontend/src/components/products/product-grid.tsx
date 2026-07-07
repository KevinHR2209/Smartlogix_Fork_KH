import { Producto } from "@/types";
import { ProductCard } from "@/features/productos/components/product-card";

interface ProductGridProps {
  productos: Producto[];
  onAdd?: (producto: Producto) => void;
}

export function ProductGrid({ productos, onAdd }: ProductGridProps) {
  if (productos.length === 0) {
    return (
      <div className="card-base flex min-h-72 items-center justify-center p-8 text-center text-zinc-500 dark:text-zinc-400">
        No se encontraron productos.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {productos.map((producto) => (
        <ProductCard key={producto.idProducto} producto={producto} onAdd={onAdd} />
      ))}
    </div>
  );
}