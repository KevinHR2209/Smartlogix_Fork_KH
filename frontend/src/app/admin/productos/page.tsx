"use client";

import { useEffect, useMemo, useState } from "react";
import { productosService } from "@/services/productosService";
import { formatCurrency } from "@/lib/utils/currency";
import { Producto } from "@/types";

const emptyForm: Producto = {
  sku: "",
  nombre: "",
  descripcion: "",
  precioActual: 0,
  pesoGramos: 0,
  dimensiones: "",
  estado: "ACTIVO",
  stockTotal: 0,
};

type FormErrors = Partial<Record<keyof Producto, string>>;

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Producto | null>(null);
  const [form, setForm] = useState<Producto>(emptyForm);
  const [mensaje, setMensaje] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const loadProductos = async () => {
    try {
      setLoading(true);
      setMensaje("");
      const data = await productosService.getAll();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setProductos([]);
      setMensaje("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductos();
  }, []);

  const productosFiltrados = useMemo(() => {
    const term = search.toLowerCase();

    return productos.filter((p) => {
      return (
        (p.nombre ?? "").toLowerCase().includes(term) ||
        (p.sku ?? "").toLowerCase().includes(term) ||
        (p.descripcion ?? "").toLowerCase().includes(term)
      );
    });
  }, [productos, search]);

  const seleccionarProducto = (producto: Producto) => {
    setSelected(producto);
    setForm({
      idProducto: producto.idProducto,
      sku: producto.sku ?? "",
      nombre: producto.nombre ?? "",
      descripcion: producto.descripcion ?? "",
      precioActual: Number(producto.precioActual ?? 0),
      pesoGramos: Number(producto.pesoGramos ?? 0),
      dimensiones: producto.dimensiones ?? "",
      estado: producto.estado ?? "ACTIVO",
      stockTotal: Number(producto.stockTotal ?? 0),
    });
    setErrors({});
    setMensaje("");
  };

  const nuevoProducto = () => {
    setSelected(null);
    setForm(emptyForm);
    setErrors({});
    setMensaje("");
  };

  const handleChange = (field: keyof Producto, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores: FormErrors = {};

    if (!form.sku.trim()) {
      nuevosErrores.sku = "El SKU es obligatorio.";
    }

    if (!form.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    }

    if (!form.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es obligatoria.";
    }

    if (Number(form.precioActual) < 0) {
      nuevosErrores.precioActual = "El precio no puede ser negativo.";
    }

    if (Number(form.pesoGramos) < 0) {
      nuevosErrores.pesoGramos = "El peso no puede ser negativo.";
    }

    if (Number(form.stockTotal ?? 0) < 0) {
      nuevosErrores.stockTotal = "El stock no puede ser negativo.";
    }

    if (!(form.estado ?? "").trim()) {
      nuevosErrores.estado = "El estado es obligatorio.";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarProducto = async () => {
    setMensaje("");

    if (!validarFormulario()) {
      setMensaje("Revisa los campos marcados.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        sku: form.sku.trim(),
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precioActual: Number(form.precioActual),
        pesoGramos: Number(form.pesoGramos),
        dimensiones: form.dimensiones.trim(),
        estado: form.estado.trim().toUpperCase(),
        stockTotal: Number(form.stockTotal ?? 0),
      };

      if (selected?.idProducto) {
        await productosService.update(selected.idProducto, {
          ...payload,
          idProducto: selected.idProducto,
        });
        setMensaje("Producto actualizado correctamente.");
      } else {
        await productosService.create(payload);
        setMensaje("Producto creado correctamente.");
      }

      await loadProductos();
      nuevoProducto();
    } catch (error: any) {
      setMensaje(error?.message || "Ocurrió un error guardando el producto.");
    } finally {
      setSaving(false);
    }
  };

  const eliminarProducto = async (idProducto?: number) => {
    if (!idProducto) return;

    const confirmado = window.confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirmado) return;

    try {
      await productosService.remove(idProducto);
      setMensaje("Producto eliminado correctamente.");

      if (selected?.idProducto === idProducto) {
        nuevoProducto();
      }

      await loadProductos();
    } catch (error: any) {
      setMensaje(error?.message || "Error eliminando producto.");
    }
  };

  const inputClass = (field: keyof Producto) =>
    `input-base ${errors[field] ? "border-red-500 focus:border-red-500" : ""}`;

  return (
    <main className="container-app py-10">
      <section className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
          Administración
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Administrar productos</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Crea, edita y elimina productos desde el panel.
        </p>
      </section>

      {mensaje && (
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          {mensaje}
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card-base p-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">Productos</h2>
            <input
              className="input-base max-w-md"
              placeholder="Buscar por nombre, sku o descripción"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="py-10 text-zinc-500 dark:text-zinc-400">
              Cargando productos...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="py-10 text-zinc-500 dark:text-zinc-400">
              No hay productos para mostrar.
            </div>
          ) : (
            <div className="space-y-3">
              {productosFiltrados.map((producto) => (
                <article
                  key={producto.idProducto}
                  className={`rounded-2xl border p-4 transition ${
                    selected?.idProducto === producto.idProducto
                      ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                        {producto.sku}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold">{producto.nombre}</h3>
                      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {producto.descripcion}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                        <span>{formatCurrency(producto.precioActual)}</span>
                        <span>Stock: {producto.stockTotal ?? 0}</span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            (producto.estado ?? "").toUpperCase() === "ACTIVO"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {producto.estado}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => seleccionarProducto(producto)}
                        className="btn-secondary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarProducto(producto.idProducto)}
                        className="rounded-xl border border-red-200 px-4 py-3 font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="card-base p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {selected ? "Editar producto" : "Nuevo producto"}
            </h2>
            <button onClick={nuevoProducto} className="btn-secondary">
              Nuevo
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">SKU</label>
              <input
                className={inputClass("sku")}
                value={form.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
              />
              {errors.sku && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.sku}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Nombre</label>
              <input
                className={inputClass("nombre")}
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Descripción</label>
              <textarea
                className={inputClass("descripcion")}
                value={form.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.descripcion}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Precio</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass("precioActual")}
                  value={form.precioActual}
                  onChange={(e) => handleChange("precioActual", Number(e.target.value))}
                />
                {errors.precioActual && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.precioActual}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Stock</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass("stockTotal")}
                  value={form.stockTotal ?? 0}
                  onChange={(e) => handleChange("stockTotal", Number(e.target.value))}
                />
                {errors.stockTotal && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.stockTotal}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Peso (g)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass("pesoGramos")}
                  value={form.pesoGramos}
                  onChange={(e) => handleChange("pesoGramos", Number(e.target.value))}
                />
                {errors.pesoGramos && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.pesoGramos}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Dimensiones</label>
                <input
                  className={inputClass("dimensiones")}
                  value={form.dimensiones}
                  onChange={(e) => handleChange("dimensiones", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Estado</label>
              <select
                className={inputClass("estado")}
                value={form.estado}
                onChange={(e) => handleChange("estado", e.target.value)}
              >
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
              {errors.estado && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.estado}</p>
              )}
            </div>

            <button
              onClick={guardarProducto}
              className="btn-primary w-full"
              disabled={saving}
            >
              {saving
                ? "Guardando..."
                : selected?.idProducto
                ? "Guardar cambios"
                : "Crear producto"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}