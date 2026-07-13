import { InventarioRequest } from "../types/inventario";
import { Presentacion as Producto } from "@/features/productos/types/producto";
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
            onChange={(e) =>
              onChange({ ...form, idBodega: Number(e.target.value) })
            }
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
          <label className="mb-2 block text-sm font-medium">
            Presentación
          </label>
          <select
            className="input-base"
            value={form.idPresentacion || ""}
            onChange={(e) =>
              onChange({ ...form, idPresentacion: Number(e.target.value) })
            }
          >
            <option value="">Selecciona una presentación</option>
            {productos.map((producto) => (
              <option
                key={producto.idPresentacion}
                value={producto.idPresentacion}
              >
                {producto.nombrePerfume ?? "Sin nombre"} -{" "}
                {producto.volumenMl ?? 0}ml
                {producto.codigoBarras ? ` - ${producto.codigoBarras}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Stock disponible
          </label>
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
          <label className="mb-2 block text-sm font-medium">
            Stock reservado
          </label>
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

        <div>
          <label className="mb-2 block text-sm font-medium">
            Stock mínimo
          </label>
          <input
            type="number"
            min={0}
            className="input-base"
            value={form.stockMinimo}
            onChange={(e) =>
              onChange({ ...form, stockMinimo: Number(e.target.value) })
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