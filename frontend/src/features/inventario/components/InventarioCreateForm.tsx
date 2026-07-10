import { InventarioRequest } from "../types/inventario";
import { Producto } from "@/features/productos/types/producto";
import { Bodega } from "@/features/bodegas/types/bodega";

type Props = {
  form: InventarioRequest;
  productos: Producto[];
  bodegas: Bodega[];
  onChange: (value: InventarioRequest) => void;
  onSubmit: () => void;
};

export function InventarioCreateForm({
  form,
  productos,
  bodegas,
  onChange,
  onSubmit,
}: Props) {
  return (
    <div className="card-base p-6">
      <h2 className="mb-4 text-xl font-semibold">Crear inventario</h2>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Bodega</label>
          <select
            className="input-base"
            value={form.idBodega || ""}
            onChange={(e) => onChange({ ...form, idBodega: Number(e.target.value) })}
          >
            <option value="">Selecciona una bodega</option>
            {bodegas.map((bodega) => (
              <option key={bodega.idBodega} value={bodega.idBodega}>
                {bodega.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Producto</label>
          <select
            className="input-base"
            value={form.idProducto || ""}
            onChange={(e) => onChange({ ...form, idProducto: Number(e.target.value) })}
          >
            <option value="">Selecciona un producto</option>
            {productos.map((producto) => (
              <option key={producto.idProducto} value={producto.idProducto}>
                {producto.nombre} {producto.sku ? `(${producto.sku})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Stock disponible</label>
          <input
            type="number"
            min={0}
            className="input-base"
            value={form.stockDisponible}
            onChange={(e) =>
              onChange({ ...form, stockDisponible: Number(e.target.value) })
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Stock reservado</label>
          <input
            type="number"
            min={0}
            className="input-base"
            value={form.stockReservado}
            onChange={(e) =>
              onChange({ ...form, stockReservado: Number(e.target.value) })
            }
          />
        </div>

        <button onClick={onSubmit} className="btn-primary w-full">
          Crear registro
        </button>
      </div>
    </div>
  );
}