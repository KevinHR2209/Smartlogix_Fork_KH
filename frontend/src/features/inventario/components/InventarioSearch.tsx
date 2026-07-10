import { Producto } from "@/features/productos/types/producto";
import { Bodega } from "@/features/bodegas/types/bodega";

type Props = {
  searchMode: "bodega" | "producto";
  searchValue: string;
  bodegas: Bodega[];
  productos: Producto[];
  onSearchModeChange: (value: "bodega" | "producto") => void;
  onSearchValueChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
};

export function InventarioSearch({
  searchMode,
  searchValue,
  bodegas,
  productos,
  onSearchModeChange,
  onSearchValueChange,
  onSubmit,
  loading = false,
}: Props) {
  const options =
    searchMode === "bodega"
      ? bodegas.map((bodega) => ({
          value: String(bodega.idBodega),
          label: `${bodega.nombre} (${bodega.idBodega})`,
        }))
      : productos.map((producto) => ({
          value: String(producto.idProducto),
          label: `${producto.nombre} ${producto.sku ? `(${producto.sku})` : ""}`,
        }));

  return (
    <div className="card-base p-6">
      <h2 className="mb-4 text-xl font-semibold">Consultar</h2>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Buscar por</label>
          <select
            className="input-base"
            value={searchMode}
            onChange={(e) => {
              onSearchModeChange(e.target.value as "bodega" | "producto");
              onSearchValueChange("");
            }}
          >
            <option value="bodega">Bodega</option>
            <option value="producto">Producto</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Selecciona una {searchMode === "bodega" ? "bodega" : "producto"}
          </label>
          <select
            className="input-base"
            value={searchValue}
            onChange={(e) => onSearchValueChange(e.target.value)}
          >
            <option value="">
              {searchMode === "bodega"
                ? "Selecciona una bodega"
                : "Selecciona un producto"}
            </option>

            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button onClick={onSubmit} className="btn-primary w-full">
          {loading ? "Consultando..." : "Consultar inventario"}
        </button>
      </div>
    </div>
  );
}