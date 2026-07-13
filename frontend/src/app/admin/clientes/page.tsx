"use client";

import { useEffect, useMemo, useState } from "react";
import { clientesService } from "@/features/clientes/services/clientesService";
import { authService } from "@/features/auth/services/authService";
import type { Cliente } from "@/features/clientes/types/cliente";
import type { RegisterRequest } from "@/features/auth/types/auth";

// ─── Comunas ──────────────────────────────────────────────────────────────────
const comunas = [
  { id: 13101, nombre: "Santiago (RM)" },
  { id: 13114, nombre: "San Miguel (RM)" },
  { id: 13119, nombre: "La Florida (RM)" },
  { id: 13124, nombre: "Providencia (RM)" },
  { id: 13125, nombre: "Puente Alto (RM)" },
  { id: 13126, nombre: "Maipú (RM)" },
  { id: 13127, nombre: "Ñuñoa (RM)" },
  { id: 5101, nombre: "Valparaíso" },
  { id: 5109, nombre: "Viña del Mar" },
  { id: 5103, nombre: "Concón" },
  { id: 5107, nombre: "Quilpué" },
  { id: 5110, nombre: "Villa Alemana" },
  { id: 5804, nombre: "San Antonio" },
  { id: 8101, nombre: "Concepción" },
  { id: 9101, nombre: "Temuco" },
  { id: 10101, nombre: "Puerto Montt" },
];

// ─── Tipos internos ───────────────────────────────────────────────────────────
type ModoFormulario = "nuevo" | "editar";

type FormCliente = {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rut: string;
  correo: string;
  telefono: string;
  // solo para crear
  password: string;
  idComuna: number | "";
  calle: string;
  numero: string;
  detalle: string;
};

const emptyForm: FormCliente = {
  nombre: "", apellidoPaterno: "", apellidoMaterno: "",
  rut: "", correo: "", telefono: "",
  password: "",
  idComuna: "", calle: "", numero: "", detalle: "",
};

type FormErrors = Partial<Record<keyof FormCliente, string>>;

// ─── Validaciones ─────────────────────────────────────────────────────────────
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarRut(rut: string): boolean {
  const clean = rut.replace(/[.\-]/g, "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(clean)) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let sum = 0, factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const expected = 11 - (sum % 11);
  const dvCalc = expected === 11 ? "0" : expected === 10 ? "K" : String(expected);
  return dv === dvCalc;
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [modo, setModo] = useState<ModoFormulario>("nuevo");
  const [form, setForm] = useState<FormCliente>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState<Cliente | null>(null);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);

  // ── Cargar clientes ──────────────────────────────────────────────────────────
  const cargarClientes = async () => {
    try {
      setLoadingList(true);
      const data = await clientesService.getAll();
      setClientes(Array.isArray(data) ? data : []);
    } catch {
      setMensaje({ texto: "No se pudieron cargar los clientes.", tipo: "error" });
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  // ── Filtro de búsqueda ───────────────────────────────────────────────────────
  const clientesFiltrados = useMemo(() => {
    const term = search.toLowerCase();
    return clientes.filter((c) =>
      `${c.nombre} ${c.apellidoPaterno} ${c.apellidoMaterno} ${c.rut} ${c.correo}`
        .toLowerCase()
        .includes(term)
    );
  }, [clientes, search]);

  // ── Seleccionar para editar ──────────────────────────────────────────────────
  const seleccionar = (c: Cliente) => {
    setSelected(c);
    setModo("editar");
    setErrors({});
    setMensaje(null);
    // Para editar no necesitamos password ni dirección nueva
    setForm({
      nombre: c.nombre ?? "",
      apellidoPaterno: c.apellidoPaterno ?? "",
      apellidoMaterno: c.apellidoMaterno ?? "",
      rut: c.rut ?? "",
      correo: c.correo ?? "",
      telefono: c.telefono ?? "",
      password: "",
      idComuna: c.direccionPrincipal?.idComuna ?? "",
      calle: c.direccionPrincipal?.calle ?? "",
      numero: c.direccionPrincipal?.numero ?? "",
      detalle: c.direccionPrincipal?.detalle ?? "",
    });
  };

  const nuevo = () => {
    setSelected(null);
    setModo("nuevo");
    setForm(emptyForm);
    setErrors({});
    setMensaje(null);
  };

  // ── Actualizar campo ─────────────────────────────────────────────────────────
  const set = (field: keyof FormCliente, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── Validación ───────────────────────────────────────────────────────────────
  const validar = (): boolean => {
    const e: FormErrors = {};
    if (!form.nombre.trim()) e.nombre = "Obligatorio.";
    if (!form.apellidoPaterno.trim()) e.apellidoPaterno = "Obligatorio.";
    if (!form.apellidoMaterno.trim()) e.apellidoMaterno = "Obligatorio.";
    if (!form.rut.trim()) {
      e.rut = "Obligatorio.";
    } else if (!validarRut(form.rut)) {
      e.rut = "RUT inválido. Ej: 12.345.678-9";
    }
    if (!form.correo.trim()) {
      e.correo = "Obligatorio.";
    } else if (!emailRegex.test(form.correo)) {
      e.correo = "Correo inválido.";
    }
    if (!form.telefono.trim()) e.telefono = "Obligatorio.";
    if (modo === "nuevo") {
      if (!form.password || form.password.length < 6)
        e.password = "Mínimo 6 caracteres.";
      if (form.idComuna === "") e.idComuna = "Selecciona una comuna.";
      if (!form.calle.trim()) e.calle = "Obligatorio.";
      if (!form.numero.trim()) e.numero = "Obligatorio.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Guardar ──────────────────────────────────────────────────────────────────
  const guardar = async () => {
    setMensaje(null);
    if (!validar()) return;

    try {
      setSaving(true);

      if (modo === "nuevo") {
        // Crear cuenta en ms-autenticacion → automáticamente crea en ms-clientes
        const payload: RegisterRequest = {
          nombre: form.nombre.trim(),
          correo: form.correo.trim().toLowerCase(),
          password: form.password,
          rut: form.rut.trim(),
          apellidoPaterno: form.apellidoPaterno.trim(),
          apellidoMaterno: form.apellidoMaterno.trim(),
          telefono: form.telefono.trim(),
          rol: "CLIENTE",
          direccionPrincipal: {
            idComuna: Number(form.idComuna),
            calle: form.calle.trim(),
            numero: form.numero.trim(),
            detalle: form.detalle.trim() || undefined,
          },
        };
        await authService.register(payload);
        setMensaje({ texto: "Cliente creado correctamente.", tipo: "ok" });

      } else if (selected?.idCliente) {
        // Actualizar solo datos del perfil en ms-clientes
        await clientesService.update(selected.idCliente, {
          idUsuarioAuth: selected.idUsuarioAuth!,
          nombre: form.nombre.trim(),
          correo: form.correo.trim().toLowerCase(),
          rut: form.rut.trim(),
          apellidoPaterno: form.apellidoPaterno.trim(),
          apellidoMaterno: form.apellidoMaterno.trim(),
          telefono: form.telefono.trim(),
          direccionPrincipal: {
            idComuna: Number(form.idComuna) || 13101,
            calle: form.calle.trim() || "-",
            numero: form.numero.trim() || "-",
            detalle: form.detalle.trim() || undefined,
          },
        });
        setMensaje({ texto: "Cliente actualizado correctamente.", tipo: "ok" });
      }

      await cargarClientes();
      nuevo();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("409") || msg.toLowerCase().includes("correo")) {
        setMensaje({ texto: "Ya existe una cuenta con ese correo o RUT.", tipo: "error" });
      } else {
        setMensaje({ texto: "Ocurrió un error. Intenta nuevamente.", tipo: "error" });
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Eliminar ─────────────────────────────────────────────────────────────────
  const eliminar = async () => {
    if (!confirmEliminar?.idCliente) return;
    try {
      await clientesService.remove(confirmEliminar.idCliente);
      setMensaje({ texto: "Cliente eliminado correctamente.", tipo: "ok" });
      if (selected?.idCliente === confirmEliminar.idCliente) nuevo();
      await cargarClientes();
    } catch {
      setMensaje({ texto: "No se pudo eliminar el cliente.", tipo: "error" });
    } finally {
      setConfirmEliminar(null);
    }
  };

  // ─── Clases ────────────────────────────────────────────────────────────────
  const inp = (field: keyof FormCliente) =>
    `input-base ${errors[field] ? "border-red-500" : ""}`;

  return (
    <main className="container-app py-10">

      {/* Header */}
      <section className="mb-8">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">Administración</p>
        <h1 className="text-4xl font-bold tracking-tight mt-1">Clientes</h1>
        <p className="text-zinc-500 mt-1 text-sm">Crea, edita y elimina clientes y sus cuentas.</p>
      </section>

      {/* Mensaje global */}
      {mensaje && (
        <div className={`mb-6 rounded-2xl border p-4 text-sm font-medium ${
          mensaje.tipo === "ok"
            ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            : "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        }`}>
          {mensaje.texto}
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">

        {/* ── Lista de clientes ── */}
        <div className="card-base p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold">
              Lista ({clientesFiltrados.length})
            </h2>
            <input
              className="input-base max-w-xs"
              placeholder="Buscar por nombre, RUT o correo…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loadingList ? (
            <p className="py-10 text-zinc-500">Cargando clientes…</p>
          ) : clientesFiltrados.length === 0 ? (
            <p className="py-10 text-zinc-500">No hay clientes para mostrar.</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {clientesFiltrados.map((c) => (
                <article
                  key={c.idCliente}
                  className={`rounded-2xl border p-4 transition ${
                    selected?.idCliente === c.idCliente
                      ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{c.rut}</p>
                      <h3 className="mt-1 font-semibold">
                        {c.nombre} {c.apellidoPaterno} {c.apellidoMaterno}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500">{c.correo}</p>
                      <p className="text-sm text-zinc-400">{c.telefono}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => seleccionar(c)} className="btn-secondary">
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmEliminar(c)}
                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
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

        {/* ── Formulario ── */}
        <div className="card-base p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {modo === "editar" ? "Editar cliente" : "Nuevo cliente"}
            </h2>
            <button onClick={nuevo} className="btn-secondary">Limpiar</button>
          </div>

          <div className="space-y-4">

            {/* Nombre */}
            <div>
              <label className="mb-1 block text-sm font-medium">Nombre *</label>
              <input className={inp("nombre")} value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)} placeholder="Juan" />
              {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
            </div>

            {/* Apellidos */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Ap. paterno *</label>
                <input className={inp("apellidoPaterno")} value={form.apellidoPaterno}
                  onChange={(e) => set("apellidoPaterno", e.target.value)} />
                {errors.apellidoPaterno && <p className="mt-1 text-xs text-red-500">{errors.apellidoPaterno}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Ap. materno *</label>
                <input className={inp("apellidoMaterno")} value={form.apellidoMaterno}
                  onChange={(e) => set("apellidoMaterno", e.target.value)} />
                {errors.apellidoMaterno && <p className="mt-1 text-xs text-red-500">{errors.apellidoMaterno}</p>}
              </div>
            </div>

            {/* RUT y Teléfono */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">RUT *</label>
                <input className={inp("rut")} value={form.rut}
                  onChange={(e) => set("rut", e.target.value)} placeholder="12.345.678-9" />
                {errors.rut && <p className="mt-1 text-xs text-red-500">{errors.rut}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Teléfono *</label>
                <input className={inp("telefono")} value={form.telefono}
                  onChange={(e) => set("telefono", e.target.value)} placeholder="56912345678" />
                {errors.telefono && <p className="mt-1 text-xs text-red-500">{errors.telefono}</p>}
              </div>
            </div>

            {/* Correo */}
            <div>
              <label className="mb-1 block text-sm font-medium">Correo *</label>
              <input type="email" className={inp("correo")} value={form.correo}
                onChange={(e) => set("correo", e.target.value)} placeholder="cliente@ejemplo.cl"
                disabled={modo === "editar"} // no cambiar correo al editar (es la llave en auth)
              />
              {modo === "editar" && (
                <p className="mt-1 text-xs text-zinc-400">El correo no se puede cambiar al editar.</p>
              )}
              {errors.correo && <p className="mt-1 text-xs text-red-500">{errors.correo}</p>}
            </div>

            {/* Password — solo al crear */}
            {modo === "nuevo" && (
              <div>
                <label className="mb-1 block text-sm font-medium">Contraseña temporal *</label>
                <input type="password" className={inp("password")} value={form.password}
                  onChange={(e) => set("password", e.target.value)} placeholder="Mín. 6 caracteres" />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
            )}

            {/* Dirección — siempre visible para editar también */}
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <p className="mb-3 text-sm font-semibold">Dirección principal</p>

              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium">
                  Comuna {modo === "nuevo" && <span className="text-red-400">*</span>}
                </label>
                <select
                  className={`input-base bg-white dark:bg-zinc-900 ${errors.idComuna ? "border-red-500" : ""}`}
                  value={form.idComuna}
                  onChange={(e) => set("idComuna", e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">Selecciona una comuna</option>
                  {comunas.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                {errors.idComuna && <p className="mt-1 text-xs text-red-500">{errors.idComuna}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Calle {modo === "nuevo" && <span className="text-red-400">*</span>}
                  </label>
                  <input className={inp("calle")} value={form.calle}
                    onChange={(e) => set("calle", e.target.value)} placeholder="Av. Argentina" />
                  {errors.calle && <p className="mt-1 text-xs text-red-500">{errors.calle}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Número {modo === "nuevo" && <span className="text-red-400">*</span>}
                  </label>
                  <input className={inp("numero")} value={form.numero}
                    onChange={(e) => set("numero", e.target.value)} placeholder="1234" />
                  {errors.numero && <p className="mt-1 text-xs text-red-500">{errors.numero}</p>}
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1 block text-sm font-medium">Detalle <span className="text-zinc-400 text-xs">(opcional)</span></label>
                <input className="input-base" value={form.detalle}
                  onChange={(e) => set("detalle", e.target.value)} placeholder="Depto 401" />
              </div>
            </div>

            <button onClick={guardar} disabled={saving} className="btn-primary w-full">
              {saving
                ? "Guardando…"
                : modo === "editar"
                ? "Guardar cambios"
                : "Crear cliente"}
            </button>
          </div>
        </div>
      </section>

      {/* ── Modal confirmación eliminar ── */}
      {confirmEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="text-xl font-bold">¿Eliminar cliente?</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Se eliminará el perfil de{" "}
              <strong>{confirmEliminar.nombre} {confirmEliminar.apellidoPaterno}</strong>.
              Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmEliminar(null)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={eliminar}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}