"use client";

import { useMemo, useState } from "react";
import { Transportista } from "@/features/transportistas/types/transportista";
import { useTransportistas } from "@/features/transportistas/hooks/useTransportistas";
import { transportistasService } from "@/features/transportistas/services/transportistasService";

const emptyForm: Transportista = {
  nombreCompleto: "",
  patenteVehiculo: "",
  telefonoContacto: "",
  estado: "ACTIVO",
};

type FormErrors = Partial<Record<keyof Transportista, string>>;

const telefonoRegex = /^[+]?[0-9\s-]{8,20}$/;
const patenteRegex = /^[A-Za-z0-9-]{5,10}$/;

export default function AdminTransportistasPage() {
  const { transportistas, loading, error, recargar } = useTransportistas();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Transportista | null>(null);
  const [form, setForm] = useState<Transportista>(emptyForm);
  const [mensaje, setMensaje] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const transportistasFiltrados = useMemo(() => {
    const term = search.toLowerCase();

    return transportistas.filter((t) => {
      return (
        (t.nombreCompleto ?? "").toLowerCase().includes(term) ||
        (t.patenteVehiculo ?? "").toLowerCase().includes(term) ||
        (t.telefonoContacto ?? "").toLowerCase().includes(term) ||
        (t.estado ?? "").toLowerCase().includes(term)
      );
    });
  }, [transportistas, search]);

  const seleccionarTransportista = (transportista: Transportista) => {
    setSelected(transportista);
    setForm({
      idTransportista: transportista.idTransportista,
      nombreCompleto: transportista.nombreCompleto ?? "",
      patenteVehiculo: transportista.patenteVehiculo ?? "",
      telefonoContacto: transportista.telefonoContacto ?? "",
      estado: transportista.estado ?? "ACTIVO",
    });
    setErrors({});
    setMensaje("");
  };

  const nuevoTransportista = () => {
    setSelected(null);
    setForm(emptyForm);
    setErrors({});
    setMensaje("");
  };

  const handleChange = (field: keyof Transportista, value: string) => {
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

    const nombreCompleto = form.nombreCompleto.trim();
    const patenteVehiculo = form.patenteVehiculo.trim();
    const telefonoContacto = form.telefonoContacto.trim();
    const estado = form.estado.trim();

    if (!nombreCompleto) {
      nuevosErrores.nombreCompleto = "El nombre completo es obligatorio.";
    } else if (nombreCompleto.length < 3) {
      nuevosErrores.nombreCompleto = "Debe tener al menos 3 caracteres.";
    }

    if (!patenteVehiculo) {
      nuevosErrores.patenteVehiculo = "La patente es obligatoria.";
    } else if (!patenteRegex.test(patenteVehiculo)) {
      nuevosErrores.patenteVehiculo = "Ingresa una patente válida.";
    }

    if (!telefonoContacto) {
      nuevosErrores.telefonoContacto = "El teléfono es obligatorio.";
    } else if (!telefonoRegex.test(telefonoContacto)) {
      nuevosErrores.telefonoContacto = "Ingresa un teléfono válido.";
    }

    if (!estado) {
      nuevosErrores.estado = "El estado es obligatorio.";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarTransportista = async () => {
    setMensaje("");

    if (!validarFormulario()) {
      setMensaje("Revisa los campos marcados.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        nombreCompleto: form.nombreCompleto.trim(),
        patenteVehiculo: form.patenteVehiculo.trim().toUpperCase(),
        telefonoContacto: form.telefonoContacto.trim(),
        estado: form.estado.trim().toUpperCase(),
      };

      if (selected?.idTransportista) {
        await transportistasService.update(selected.idTransportista, {
          ...payload,
          idTransportista: selected.idTransportista,
        });
        setMensaje("Transportista actualizado correctamente.");
      } else {
        await transportistasService.create(payload as Transportista);
        setMensaje("Transportista creado correctamente.");
      }

      await recargar();
      nuevoTransportista();
    } catch (error: any) {
      setMensaje(error?.message || "Ocurrió un error guardando el transportista.");
    } finally {
      setSaving(false);
    }
  };

  const eliminarTransportista = async (idTransportista?: number) => {
    if (!idTransportista) return;

    const confirmado = window.confirm("¿Seguro que deseas eliminar este transportista?");
    if (!confirmado) return;

    try {
      await transportistasService.remove(idTransportista);
      setMensaje("Transportista eliminado correctamente.");

      if (selected?.idTransportista === idTransportista) {
        nuevoTransportista();
      }

      await recargar();
    } catch (error: any) {
      setMensaje(error?.message || "Error eliminando transportista.");
    }
  };

  const inputClass = (field: keyof Transportista) =>
    `input-base ${errors[field] ? "border-red-500 focus:border-red-500" : ""}`;

  return (
    <main className="container-app py-10">
      <section className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
          Administración
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Administrar transportistas</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Crea y gestiona transportistas desde el panel logístico.
        </p>
      </section>

      {(mensaje || error) && (
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          {mensaje || error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card-base p-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">Transportistas</h2>
            <input
              className="input-base max-w-md"
              placeholder="Buscar por nombre, patente o teléfono"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="py-10 text-zinc-500 dark:text-zinc-400">
              Cargando transportistas...
            </div>
          ) : transportistasFiltrados.length === 0 ? (
            <div className="py-10 text-zinc-500 dark:text-zinc-400">
              No hay transportistas para mostrar.
            </div>
          ) : (
            <div className="space-y-3">
              {transportistasFiltrados.map((transportista) => (
                <article
                  key={transportista.idTransportista}
                  className={`rounded-2xl border p-4 transition ${
                    selected?.idTransportista === transportista.idTransportista
                      ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                        {transportista.patenteVehiculo}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold">
                        {transportista.nombreCompleto}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {transportista.telefonoContacto}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            (transportista.estado ?? "").toUpperCase() === "ACTIVO"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {transportista.estado}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => seleccionarTransportista(transportista)}
                        className="btn-secondary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarTransportista(transportista.idTransportista)}
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
              {selected ? "Editar transportista" : "Nuevo transportista"}
            </h2>
            <button onClick={nuevoTransportista} className="btn-secondary">
              Nuevo
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Nombre completo</label>
              <input
                className={inputClass("nombreCompleto")}
                value={form.nombreCompleto}
                onChange={(e) => handleChange("nombreCompleto", e.target.value)}
              />
              {errors.nombreCompleto && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.nombreCompleto}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Patente vehículo</label>
              <input
                className={inputClass("patenteVehiculo")}
                value={form.patenteVehiculo}
                onChange={(e) => handleChange("patenteVehiculo", e.target.value)}
                placeholder="LJTX-41"
              />
              {errors.patenteVehiculo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.patenteVehiculo}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Teléfono contacto</label>
              <input
                className={inputClass("telefonoContacto")}
                value={form.telefonoContacto}
                onChange={(e) => handleChange("telefonoContacto", e.target.value)}
                placeholder="+56955550001"
              />
              {errors.telefonoContacto && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.telefonoContacto}
                </p>
              )}
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
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.estado}
                </p>
              )}
            </div>

            <button
              onClick={guardarTransportista}
              className="btn-primary w-full"
              disabled={saving}
            >
              {saving
                ? "Guardando..."
                : selected?.idTransportista
                ? "Guardar cambios"
                : "Crear transportista"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}