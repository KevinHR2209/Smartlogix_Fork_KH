"use client";

import { useEffect, useState } from "react";
import { productosService } from "@/features/productos/services/productosService";
import { Producto } from "@/features/productos/types/producto";
import { formatCurrency } from "@/lib/utils/currency";
import { ProductoForm } from "@/features/productos/components/ProductoForm";

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  // Controla si mostramos la tabla o el formulario
  const [showForm, setShowForm] = useState(false);
  // Guarda el producto seleccionado para pasarlo al formulario (si es null, es un producto nuevo)
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  const loadProductos = async () => {
    setLoading(true);
    try {
      const data = await productosService.getAll();
      setProductos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductos();
  }, []);

  const handleNuevo = () => {
    setSelectedProducto(null);
    setShowForm(true);
  };

  const handleEditar = (producto: Producto) => {
    setSelectedProducto(producto);
    setShowForm(true);
  };

  const handleEliminar = async (idProducto?: number) => {
    if (!idProducto) return;
    const confirmado = window.confirm("¿Seguro que deseas descontinuar/eliminar este producto?");
    if (!confirmado) return;

    try {
      await productosService.remove(idProducto); // Asume que tu backend maneja el soft delete
      await loadProductos();
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("Error al eliminar el producto.");
    }
  };

  return (
      <main className="p-4 md:p-8 font-sans text-black bg-white min-h-screen">
        {/* CABECERA */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tighter text-black">
              Productos
            </h1>
            <p className="text-xs uppercase tracking-widest text-gray-500 mt-2 font-semibold">
              Administra el catálogo y el stock
            </p>
          </div>
          <button
              onClick={() => {
                if (showForm) {
                  setShowForm(false);
                  setSelectedProducto(null);
                } else {
                  handleNuevo();
                }
              }}
              className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold border-2 border-black hover:bg-white hover:text-black transition-colors"
          >
            {showForm ? "Volver a la Lista" : "Nuevo Perfume"}
          </button>
        </div>

        {/* CONTENIDO DUAL: FORMULARIO O TABLA */}
        {showForm ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProductoForm
                  initialData={selectedProducto} // Le pasamos la data si estamos editando
                  onSuccess={() => {
                    setShowForm(false);
                    setSelectedProducto(null);
                    loadProductos(); // Recarga la tabla para mostrar cambios
                  }}
              />
            </div>
        ) : (
            <div className="overflow-x-auto border border-gray-200 animate-in fade-in">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="p-4 font-bold">SKU</th>
                  <th className="p-4 font-bold">Producto</th>
                  <th className="p-4 font-bold">Marca</th>
                  <th className="p-4 font-bold">Precio</th>
                  <th className="p-4 font-bold">Stock</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold text-right">Acciones</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs uppercase tracking-widest font-bold text-gray-400">
                        Cargando...
                      </td>
                    </tr>
                ) : productos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs uppercase tracking-widest font-bold text-gray-400">
                        No hay productos registrados
                      </td>
                    </tr>
                ) : (
                    productos.map((producto) => (
                        <tr key={producto.idProducto} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-semibold text-xs text-gray-500">{producto.sku}</td>
                          <td className="p-4 font-bold uppercase text-xs">{producto.nombre}</td>
                          <td className="p-4 text-xs font-semibold text-gray-500">{producto.marca?.nombre || "N/A"}</td>
                          <td className="p-4 text-xs font-bold">{formatCurrency(producto.precioActual)}</td>
                          <td className="p-4 text-xs font-bold">{producto.stockTotal ?? 0}</td>
                          <td className="p-4">
                                            <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold border ${
                                                (producto.estado || "").toUpperCase() === "ACTIVO"
                                                    ? "border-black text-black bg-white"
                                                    : "border-gray-200 text-gray-400 bg-gray-50"
                                            }`}>
                                                {producto.estado}
                                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {/* BOTONES DE ACCIÓN CUADRADOS */}
                            <div className="flex justify-end gap-2">
                              <button
                                  onClick={() => handleEditar(producto)}
                                  className="border border-black px-3 py-1 text-[10px] uppercase tracking-widest font-bold text-black hover:bg-black hover:text-white transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                  onClick={() => handleEliminar(producto.idProducto)}
                                  className="border border-red-500 px-3 py-1 text-[10px] uppercase tracking-widest font-bold text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))
                )}
                </tbody>
              </table>
            </div>
        )}
      </main>
  );
}