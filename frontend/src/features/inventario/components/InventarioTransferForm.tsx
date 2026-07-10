import { Producto } from "@/features/productos/types/producto";
import { Bodega } from "@/features/bodegas/types/bodega";
import { TransferenciaStockRequest } from "../types/inventario";

type Props = {
  form: TransferenciaStockRequest;
  productos: Producto[];
  bodegas: Bodega[];
  onChange: (value: TransferenciaStockRequest) => void;
  onSubmit: () => void;
};

export function InventarioTransferForm({
  form,
  productos,
  bodegas,
  onChange,
  onSubmit,
}: Props) {
  return (
    <div className="card-base p-6">
      <h2 className="mb-4 text-xl font-semibold">Transferir stock</h2>

      <div className="space-y-4">
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
          <label className="mb-2 block text-sm font-medium">Bodega origen</label>
          <select
            className="input-base"
            value={form.idBodegaOrigen || ""}
            onChange={(e) => onChange({ ...form, idBodegaOrigen: Number(e.target.value) })}
          >
            <option value="">Selecciona origen</option>
            {bodegas.map((bodega) => (
              <option key={bodega.idBodega} value={bodega.idBodega}>
                {bodega.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Bodega destino</label>
          <select
            className="input-base"
            value={form.idBodegaDestino || ""}
            onChange={(e) => onChange({ ...form, idBodegaDestino: Number(e.target.value) })}
          >
            <option value="">Selecciona destino</option>
            {bodegas.map((bodega) => (
              <option key={bodega.idBodega} value={bodega.idBodega}>
                {bodega.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Cantidad</label>
          <input
            type="number"
            min={1}
            className="input-base"
            value={form.cantidad || ""}
            onChange={(e) => onChange({ ...form, cantidad: Number(e.target.value) })}
          />
        </div>

        <button onClick={onSubmit} className="btn-primary w-full">
          Transferir
        </button>
      </div>
    </div>
  );
}