"use client";

import { useEffect, useMemo, useState } from "react";
import { bodegasService } from "@/features/bodegas/services/bodegasService";
import { Bodega } from "@/features/bodegas/types/bodega";

const emptyForm: Bodega = {
  nombre: "",
  direccionFisica: "",
};

type FormErrors = Partial<Record<keyof Bodega, string>>;

export default function AdminBodegasPage() {
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Bodega | null>(null);
  const [form, setForm] = useState<Bodega>(emptyForm);
  const [mensaje, setMensaje] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const loadBodegas = async () => {
    try {
      setLoading(true);
      setMensaje("");
      const data = await bodegasService.getAll();
      setBodegas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setBodegas([]);
      setMensaje("No se pudieron cargar las bodegas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBodegas();
  }, []);

  const bodegasFiltradas = useMemo(() => {
    const term = search.toLowerCase();
    return bodegas.filter((b) =>
      (b.nombre ?? "").toLowerCase().includes(term) ||
      (b.direccionFisica ?? "").toLowerCase().includes(term)
    );
  }, [bodegas, search]);

  const seleccionarBodega = (bodega: Bodega) => {
    setSelected(bodega);
    setForm({
      idBodega: bodega.idBodega,
      nombre: bodega.nombre ?? "",
      direccionFisica: bodega.direccionFisica ?? "",
    });
    setErrors({});
    setMensaje("");
  };

  const nuevaBodega = () => {
    setSelected(null);
    setForm(emptyForm);
    setErrors({});
    setMensaje("");
  };

  const handleChange = (field: keyof Bodega, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validarFormulario = () => {
    const nuevosErrores: FormErrors = {};

    if (!form.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    }

    if (!form.direccionFisica.trim()) {
      nuevosErrores.direccionFisica = "La dirección es obligatoria.";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarBodega = async () => {
    setMensaje("");

    if (!validarFormulario()) {
      setMensaje("Revisa los campos marcados.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        nombre: form.nombre.trim(),
        direccionFisica: form.direccionFisica.trim(),
      };

      if (selected?.idBodega) {
        await bodegasService.update(selected.idBodega, {
          ...payload,
          idBodega: selected.idBodega,
        });
        setMensaje("Bodega actualizada correctamente.");
      } else {
        await bodegasService.create(payload);
        setMensaje("Bodega creada correctamente.");
      }

      await loadBodegas();
      nuevaBodega();
    } catch (error: any) {
      setMensaje(error?.message ?? "Ocurrió un error guardando la bodega.");
    } finally {
      setSaving(false);
    }
  };

  const eliminarBodega = async (idBodega?: number) => {
    if (!idBodega) return;

    const confirmado = window.confirm("¿Seguro que deseas eliminar esta bodega?");
    if (!confirmado) return;

    try {
      await bodegasService.remove(idBodega);
      setMensaje("Bodega eliminada correctamente.");

      if (selected?.idBodega === idBodega) {
        nuevaBodega();
      }

      await loadBodegas();
    } catch (error: any) {
      setMensaje(error?.message ?? "Error eliminando bodega.");
    }
  };

  const inputClass = (field: keyof Bodega) =>
    `input-base ${errors[field] ? "border-red-500 focus:border-red-500" : ""}`;

  return (
    <main className="container-app py-10">
      <section className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
          Administración
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Administrar bodegas</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Crea, edita y elimina bodegas desde el panel.
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
            <h2 className="text-xl font-semibold">Bodegas</h2>
            <input
              className="input-base max-w-md"
              placeholder="Buscar por nombre o dirección"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="py-10 text-zinc-500 dark:text-zinc-400">
              Cargando bodegas...
            </div>
          ) : bodegasFiltradas.length === 0 ? (
            <div className="py-10 text-zinc-500 dark:text-zinc-400">
              No hay bodegas para mostrar.
            </div>
          ) : (
            <div className="space-y-3">
              {bodegasFiltradas.map((bodega) => (
                <article
                  key={bodega.idBodega}
                  className={`rounded-2xl border p-4 transition ${
                    selected?.idBodega === bodega.idBodega
                      ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                        Bodega #{bodega.idBodega}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold">{bodega.nombre}</h3>
                      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {bodega.direccionFisica}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => seleccionarBodega(bodega)}
                        className="btn-secondary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarBodega(bodega.idBodega)}
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
              {selected ? "Editar bodega" : "Nueva bodega"}
            </h2>
            <button onClick={nuevaBodega} className="btn-secondary">
              Nueva
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Nombre</label>
              <input
                className={inputClass("nombre")}
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.nombre}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Dirección física</label>
              <textarea
                className={inputClass("direccionFisica")}
                value={form.direccionFisica}
                onChange={(e) => handleChange("direccionFisica", e.target.value)}
              />
              {errors.direccionFisica && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.direccionFisica}
                </p>
              )}
            </div>

            <button
              onClick={guardarBodega}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Guardando..." : selected?.idBodega ? "Guardar cambios" : "Crear bodega"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}