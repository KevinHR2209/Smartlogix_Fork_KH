"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Cliente } from "@/types";

const emptyForm: Cliente = {
  rut: "",
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  correo: "",
  telefono: "",
  region: "",
};

type FormErrors = Partial<Record<keyof Cliente, string>>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rutRegex = /^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}-[0-9kK]{1}$/;
const telefonoRegex = /^[+]?[0-9\s-]{8,20}$/;

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [form, setForm] = useState<Cliente>(emptyForm);
  const [mensaje, setMensaje] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Cliente[]>(endpoints.clientes);
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMensaje("No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {
    const term = search.toLowerCase();
    return clientes.filter((c) =>
      c.nombre.toLowerCase().includes(term) ||
      c.apellidoPaterno.toLowerCase().includes(term) ||
      c.apellidoMaterno.toLowerCase().includes(term) ||
      c.rut.toLowerCase().includes(term) ||
      c.correo.toLowerCase().includes(term)
    );
  }, [clientes, search]);

  const seleccionarCliente = (cliente: Cliente) => {
    setSelected(cliente);
    setForm({
      idCliente: cliente.idCliente,
      rut: cliente.rut,
      nombre: cliente.nombre,
      apellidoPaterno: cliente.apellidoPaterno,
      apellidoMaterno: cliente.apellidoMaterno,
      correo: cliente.correo,
      telefono: cliente.telefono,
      region: cliente.region ?? "",
    });
    setErrors({});
    setMensaje("");
  };

  const nuevoCliente = () => {
    setSelected(null);
    setForm(emptyForm);
    setErrors({});
    setMensaje("");
  };

  const handleChange = (field: keyof Cliente, value: string) => {
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

    const rut = form.rut.trim();
    const nombre = form.nombre.trim();
    const apellidoPaterno = form.apellidoPaterno.trim();
    const apellidoMaterno = form.apellidoMaterno.trim();
    const correo = form.correo.trim();
    const telefono = form.telefono.trim();

    if (!rut) {
      nuevosErrores.rut = "El RUT es obligatorio.";
    } else if (!rutRegex.test(rut)) {
      nuevosErrores.rut = "Ingresa un RUT válido. Ej: 12.345.678-9";
    }

    if (!nombre) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    } else if (nombre.length < 2) {
      nuevosErrores.nombre = "El nombre debe tener al menos 2 caracteres.";
    }

    if (!apellidoPaterno) {
      nuevosErrores.apellidoPaterno = "El apellido paterno es obligatorio.";
    }

    if (!apellidoMaterno) {
      nuevosErrores.apellidoMaterno = "El apellido materno es obligatorio.";
    }

    if (!correo) {
      nuevosErrores.correo = "El correo es obligatorio.";
    } else if (!emailRegex.test(correo)) {
      nuevosErrores.correo = "Ingresa un correo válido. Ej: nombre@dominio.com";
    }

    if (!telefono) {
      nuevosErrores.telefono = "El teléfono es obligatorio.";
    } else if (!telefonoRegex.test(telefono)) {
      nuevosErrores.telefono = "Ingresa un teléfono válido.";
    }

    setErrors(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarCliente = async () => {
    setMensaje("");

    if (!validarFormulario()) {
      setMensaje("Revisa los campos marcados.");
      return;
    }

    try {
      setSaving(true);

      const url = selected?.idCliente
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/clientes/${selected.idCliente}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/clientes`;

      const method = selected?.idCliente ? "PUT" : "POST";

      const body = {
        rut: form.rut.trim(),
        nombre: form.nombre.trim(),
        apellidoPaterno: form.apellidoPaterno.trim(),
        apellidoMaterno: form.apellidoMaterno.trim(),
        correo: form.correo.trim().toLowerCase(),
        telefono: form.telefono.trim(),
        region: form.region?.trim() ? form.region.trim() : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(
          selected?.idCliente
            ? "No se pudo actualizar el cliente."
            : "No se pudo crear el cliente."
        );
      }

      setMensaje(
        selected?.idCliente
          ? "Cliente actualizado correctamente."
          : "Cliente creado correctamente."
      );

      await loadClientes();
      nuevoCliente();
    } catch (error: any) {
      setMensaje(error.message || "Ocurrió un error guardando el cliente.");
    } finally {
      setSaving(false);
    }
  };

  const eliminarCliente = async (idCliente?: number) => {
    if (!idCliente) return;

    const confirmado = window.confirm("¿Seguro que deseas eliminar este cliente?");
    if (!confirmado) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/clientes/${idCliente}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error("No se pudo eliminar el cliente.");
      }

      setMensaje("Cliente eliminado correctamente.");

      if (selected?.idCliente === idCliente) {
        nuevoCliente();
      }

      await loadClientes();
    } catch (error: any) {
      setMensaje(error.message || "Error eliminando cliente.");
    }
  };

  const inputClass = (field: keyof Cliente) =>
    `input-base ${errors[field] ? "border-red-500 focus:border-red-500" : ""}`;

  return (
    <main className="container-app py-10">
      <section className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
          Administración
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Administrar clientes</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Crea, edita y elimina clientes desde el panel.
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
            <h2 className="text-xl font-semibold">Clientes</h2>
            <input
              className="input-base max-w-md"
              placeholder="Buscar por nombre, rut o correo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="py-10 text-zinc-500 dark:text-zinc-400">
              Cargando clientes...
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="py-10 text-zinc-500 dark:text-zinc-400">
              No hay clientes para mostrar.
            </div>
          ) : (
            <div className="space-y-3">
              {clientesFiltrados.map((cliente) => (
                <article
                  key={cliente.idCliente}
                  className={`rounded-2xl border p-4 transition ${
                    selected?.idCliente === cliente.idCliente
                      ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                        {cliente.rut}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold">
                        {cliente.nombre} {cliente.apellidoPaterno} {cliente.apellidoMaterno}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {cliente.correo}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                        <span>{cliente.telefono}</span>
                        <span>{cliente.region || "Sin región"}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => seleccionarCliente(cliente)}
                        className="btn-secondary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarCliente(cliente.idCliente)}
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
              {selected ? "Editar cliente" : "Nuevo cliente"}
            </h2>
            <button onClick={nuevoCliente} className="btn-secondary">
              Nuevo
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">RUT</label>
              <input
                className={inputClass("rut")}
                value={form.rut}
                onChange={(e) => handleChange("rut", e.target.value)}
                placeholder="12.345.678-9"
              />
              {errors.rut && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rut}</p>
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Apellido paterno</label>
                <input
                  className={inputClass("apellidoPaterno")}
                  value={form.apellidoPaterno}
                  onChange={(e) => handleChange("apellidoPaterno", e.target.value)}
                />
                {errors.apellidoPaterno && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.apellidoPaterno}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Apellido materno</label>
                <input
                  className={inputClass("apellidoMaterno")}
                  value={form.apellidoMaterno}
                  onChange={(e) => handleChange("apellidoMaterno", e.target.value)}
                />
                {errors.apellidoMaterno && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.apellidoMaterno}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Correo</label>
              <input
                type="email"
                className={inputClass("correo")}
                value={form.correo}
                onChange={(e) => handleChange("correo", e.target.value)}
                placeholder="nombre@dominio.com"
                required
              />
              {errors.correo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.correo}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Teléfono</label>
              <input
                className={inputClass("telefono")}
                value={form.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                placeholder="+56912345678"
              />
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.telefono}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Región</label>
              <input
                className="input-base"
                value={form.region ?? ""}
                onChange={(e) => handleChange("region", e.target.value)}
              />
            </div>

            <button
              onClick={guardarCliente}
              className="btn-primary w-full"
              disabled={saving}
            >
              {saving
                ? "Guardando..."
                : selected?.idCliente
                ? "Guardar cambios"
                : "Crear cliente"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}