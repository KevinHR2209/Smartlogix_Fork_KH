"use client";

import { useEffect, useMemo, useState } from "react";
import { bodegasService } from "@/features/bodegas/services/bodegasService";
import { apiGet } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Bodega, Region, Provincia, Comuna } from "@/features/bodegas/types/bodega";

type Tab = "lista" | "crear" | "editar";
type Notif = { tipo: "ok" | "error"; msg: string } | null;

type FormData = {
  nombre: string;
  calle: string;
  numero: string;
  detalle: string;
  idRegion: number;
  idProvincia: number;
  idComuna: number;
};

const emptyForm: FormData = {
  nombre: "",
  calle: "",
  numero: "",
  detalle: "",
  idRegion: 0,
  idProvincia: 0,
  idComuna: 0,
};

function Notificacion({ n, onClose }: { n: Notif; onClose: () => void }) {
  if (!n) return null;
  return (
    <div className={`flex items-center justify-between gap-4 rounded-2xl border px-5 py-3 text-sm ${
      n.tipo === "ok"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
        : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
    }`}>
      <span>{n.msg}</span>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color ?? "text-zinc-900 dark:text-white"}`}>{value}</p>
    </div>
  );
}

export default function AdminBodegasPage() {
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [notif, setNotif] = useState<Notif>(null);
  const [tab, setTab] = useState<Tab>("lista");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Bodega | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [confirmDelete, setConfirmDelete] = useState<Bodega | null>(null);

  // Datos geográficos
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingCom, setLoadingCom] = useState(false);

  const notify = (tipo: "ok" | "error", msg: string) => setNotif({ tipo, msg });

  const cargarBodegas = async () => {
    try {
      setLoading(true);
      const data = await bodegasService.getAll();
      setBodegas(Array.isArray(data) ? data : []);
    } catch {
      notify("error", "No se pudieron cargar las bodegas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBodegas();
    apiGet<Region[]>(endpoints.regiones)
      .then((data) => setRegiones(Array.isArray(data) ? data : []))
      .catch(() => notify("error", "No se pudieron cargar las regiones."));
  }, []);

  // Cargar provincias al cambiar región
  useEffect(() => {
    if (!form.idRegion) {
      setProvincias([]);
      setComunas([]);
      setForm((p) => ({ ...p, idProvincia: 0, idComuna: 0 }));
      return;
    }
    setLoadingProv(true);
    setProvincias([]);
    setComunas([]);
    setForm((p) => ({ ...p, idProvincia: 0, idComuna: 0 }));
    apiGet<Provincia[]>(endpoints.provincias.porRegion(form.idRegion))
      .then((data) => setProvincias(Array.isArray(data) ? data : []))
      .catch(() => notify("error", "No se pudieron cargar las provincias."))
      .finally(() => setLoadingProv(false));
  }, [form.idRegion]);

  // Cargar comunas al cambiar provincia
  useEffect(() => {
    if (!form.idProvincia) {
      setComunas([]);
      setForm((p) => ({ ...p, idComuna: 0 }));
      return;
    }
    setLoadingCom(true);
    setComunas([]);
    setForm((p) => ({ ...p, idComuna: 0 }));
    apiGet<Comuna[]>(endpoints.comunas.porProvincia(form.idProvincia))
      .then((data) => setComunas(Array.isArray(data) ? data : []))
      .catch(() => notify("error", "No se pudieron cargar las comunas."))
      .finally(() => setLoadingCom(false));
  }, [form.idProvincia]);

  const bodegasFiltradas = useMemo(() => {
    const term = search.toLowerCase();
    return bodegas.filter(
      (b) =>
        b.nombre.toLowerCase().includes(term) ||
        b.direccionFisica.toLowerCase().includes(term)
    );
  }, [bodegas, search]);

  const validar = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio.";
    if (!form.calle.trim()) e.calle = "La calle es obligatoria.";
    if (!form.numero.trim()) e.numero = "El número es obligatorio.";
    if (!form.idRegion) e.idRegion = "Selecciona una región.";
    if (!form.idProvincia) e.idProvincia = "Selecciona una provincia.";
    if (!form.idComuna) e.idComuna = "Selecciona una comuna.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => ({
    nombre: form.nombre.trim(),
    direccion: {
      idComuna: form.idComuna,
      calle: form.calle.trim(),
      numero: form.numero.trim(),
      detalle: form.detalle.trim() || null,
    },
  });

  const abrirCrear = () => {
    setForm(emptyForm);
    setProvincias([]);
    setComunas([]);
    setErrors({});
    setNotif(null);
    setTab("crear");
  };

  const abrirEditar = (bodega: Bodega) => {
    setSelected(bodega);
    const d = bodega.direccion;
    setForm({
      nombre: bodega.nombre,
      calle: d?.calle ?? "",
      numero: d?.numero ?? "",
      detalle: d?.detalle ?? "",
      idRegion: 0,      // se cargará en cascada desde el select
      idProvincia: 0,
      idComuna: d?.idComuna ?? 0,
    });
    setErrors({});
    setNotif(null);
    setTab("editar");
  };

  const cancelar = () => {
    setTab("lista");
    setSelected(null);
    setForm(emptyForm);
    setProvincias([]);
    setComunas([]);
    setErrors({});
  };

  const guardar = async () => {
    if (!validar()) return;
    try {
      setSaving(true);
      setNotif(null);
      const payload = buildPayload();
      if (tab === "editar" && selected?.idBodega) {
        await bodegasService.update(selected.idBodega, payload);
        notify("ok", `Bodega "${payload.nombre}" actualizada correctamente.`);
      } else {
        await bodegasService.create(payload);
        notify("ok", `Bodega "${payload.nombre}" creada correctamente.`);
      }
      await cargarBodegas();
      cancelar();
    } catch (e: any) {
      notify("error", e?.message ?? "Error al guardar la bodega.");
    } finally {
      setSaving(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!confirmDelete?.idBodega) return;
    try {
      setDeleting(confirmDelete.idBodega);
      await bodegasService.remove(confirmDelete.idBodega);
      notify("ok", `Bodega "${confirmDelete.nombre}" eliminada.`);
      if (selected?.idBodega === confirmDelete.idBodega) cancelar();
      await cargarBodegas();
    } catch (e: any) {
      notify("error", e?.message ?? "Error al eliminar la bodega.");
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  const inputClass = (key: keyof FormData) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 transition ${
      errors[key] ? "border-red-400 dark:border-red-600" : "border-zinc-300 dark:border-zinc-700"
    }`;

  const selectClass = (key: keyof FormData) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-zinc-800 transition ${
      errors[key] ? "border-red-400 dark:border-red-600" : "border-zinc-300 dark:border-zinc-700"
    }`;

  const FieldError = ({ k }: { k: keyof FormData }) =>
    errors[k] ? <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors[k]}</p> : null;

  return (
    <main className="container-app py-10 space-y-8">

      {/* Header */}
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
          Administración
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Gestión de Bodegas</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Crea, edita y elimina bodegas. La dirección se selecciona por región, provincia y comuna.
        </p>
      </section>

      <Notificacion n={notif} onClose={() => setNotif(null)} />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Total bodegas" value={bodegas.length} />
        <StatCard label="Resultado búsqueda" value={bodegasFiltradas.length} color="text-blue-600" />
        <StatCard label="Con dirección registrada" value={bodegas.filter((b) => !!b.direccion).length} color="text-emerald-600" />
      </div>

      {/* Tabs */}
      <nav className="flex gap-2 flex-wrap">
        {(["lista", "crear"] as const).map((t) => (
          <button
            key={t}
            onClick={() => (t === "crear" ? abrirCrear() : cancelar())}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t || (tab === "editar" && t === "lista")
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {t === "lista" ? "Lista" : "Nueva Bodega"}
          </button>
        ))}
        {tab === "editar" && selected && (
          <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            Editando: {selected.nombre}
          </span>
        )}
      </nav>

      {/* Formulario Crear / Editar */}
      {(tab === "crear" || tab === "editar") && (
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">
              {tab === "editar" ? `Editar — ${selected?.nombre}` : "Nueva bodega"}
            </h2>
            {tab === "editar" && selected && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500">ID #{selected.idBodega}</span>
            )}
          </div>

          <div className="space-y-5">
            {/* Nombre */}
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-zinc-500 block mb-1">
                Nombre de la bodega
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => { setForm((p) => ({ ...p, nombre: e.target.value })); setErrors((p) => ({ ...p, nombre: undefined })); }}
                className={inputClass("nombre")}
                placeholder="Ej: Bodega Central Norte"
              />
              <FieldError k="nombre" />
            </div>

            {/* Separador */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                Dirección
              </p>
              {tab === "editar" && selected?.direccion && (
              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-4 py-3 text-xs text-blue-700 dark:text-blue-300 mb-4">
                Dirección actual: <span className="font-medium">{selected.direccionFisica}</span>
                <br />
                <span className="opacity-70">Re-selecciona región → provincia → comuna para actualizar.</span>
              </div>
            )}
              {/* Región */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-zinc-500 block mb-1">
                    Región
                  </label>
                  <select
                    value={form.idRegion}
                    onChange={(e) => { setForm((p) => ({ ...p, idRegion: Number(e.target.value) })); setErrors((p) => ({ ...p, idRegion: undefined })); }}
                    className={selectClass("idRegion")}
                  >
                    <option value={0}>-- Selecciona --</option>
                    {regiones.map((r) => (
                      <option key={r.idRegion} value={r.idRegion}>
                        {r.codigoRegion} — {r.nombreRegion}
                      </option>
                    ))}
                  </select>
                  <FieldError k="idRegion" />
                </div>

                {/* Provincia */}
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-zinc-500 block mb-1">
                    Provincia
                  </label>
                  <select
                    value={form.idProvincia}
                    onChange={(e) => { setForm((p) => ({ ...p, idProvincia: Number(e.target.value) })); setErrors((p) => ({ ...p, idProvincia: undefined })); }}
                    disabled={!form.idRegion || loadingProv}
                    className={`${selectClass("idProvincia")} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value={0}>{loadingProv ? "Cargando…" : "-- Selecciona --"}</option>
                  {provincias.map((p) => (
                    <option key={p.idProvincia} value={p.idProvincia}>
                      {p.nombreProvincia}
                    </option>
                  ))}
                  </select>
                  <FieldError k="idProvincia" />
                </div>

                {/* Comuna */}
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-zinc-500 block mb-1">
                    Comuna
                  </label>
                  <select
                    value={form.idComuna}
                    onChange={(e) => { setForm((p) => ({ ...p, idComuna: Number(e.target.value) })); setErrors((p) => ({ ...p, idComuna: undefined })); }}
                    disabled={!form.idProvincia || loadingCom}
                    className={`${selectClass("idComuna")} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value={0}>{loadingCom ? "Cargando…" : "-- Selecciona --"}</option>
                  {comunas.map((c) => (
                    <option key={c.idComuna} value={c.idComuna}>
                      {c.nombreComuna}
                    </option>
                  ))}
                  </select>
                  <FieldError k="idComuna" />
                </div>
              </div>

              {/* Calle, Número, Detalle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-zinc-500 block mb-1">
                    Calle
                  </label>
                  <input
                    type="text"
                    value={form.calle}
                    onChange={(e) => { setForm((p) => ({ ...p, calle: e.target.value })); setErrors((p) => ({ ...p, calle: undefined })); }}
                    className={inputClass("calle")}
                    placeholder="Ej: Av. Libertador Bernardo O'Higgins"
                  />
                  <FieldError k="calle" />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-zinc-500 block mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    value={form.numero}
                    onChange={(e) => { setForm((p) => ({ ...p, numero: e.target.value })); setErrors((p) => ({ ...p, numero: undefined })); }}
                    className={inputClass("numero")}
                    placeholder="Ej: 1234"
                  />
                  <FieldError k="numero" />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs font-medium uppercase tracking-wide text-zinc-500 block mb-1">
                    Detalle <span className="normal-case text-zinc-400">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.detalle}
                    onChange={(e) => setForm((p) => ({ ...p, detalle: e.target.value }))}
                    className={inputClass("detalle")}
                    placeholder="Ej: Piso 2, Galpón B"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={guardar}
              disabled={saving}
              className="flex-1 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 py-3 font-semibold text-sm hover:opacity-80 disabled:opacity-50 transition"
            >
              {saving ? "Guardando…" : tab === "editar" ? "Guardar cambios" : "Crear bodega"}
            </button>
            <button
              onClick={cancelar}
              disabled={saving}
              className="px-5 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {tab === "lista" && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center flex-wrap">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o dirección…"
              className="flex-1 min-w-[240px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm"
            />
            <button
              onClick={cargarBodegas}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 transition"
            >
              {loading ? "Cargando…" : "🔄 Recargar"}
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-400 text-sm">
              Cargando bodegas…
            </div>
          ) : bodegasFiltradas.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-400 text-sm">
              {search ? `Sin resultados para "${search}"` : "No hay bodegas registradas."}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 uppercase text-xs tracking-wide">
                    <tr>
                      <th className="px-5 py-3 text-left">ID</th>
                      <th className="px-5 py-3 text-left">Nombre</th>
                      <th className="px-5 py-3 text-left">Dirección</th>
                      <th className="px-5 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                    {bodegasFiltradas.map((bodega) => (
                      <tr key={bodega.idBodega} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                        <td className="px-5 py-4 text-zinc-400 font-mono text-xs">#{bodega.idBodega}</td>
                        <td className="px-5 py-4 font-semibold text-zinc-900 dark:text-white">{bodega.nombre}</td>
                        <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400 max-w-xs">
                          <p className="truncate">{bodega.direccionFisica || "—"}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => abrirEditar(bodega)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => setConfirmDelete(bodega)}
                              disabled={deleting === bodega.idBodega}
                              className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 transition"
                            >
                              {deleting === bodega.idBodega ? "Eliminando…" : "🗑 Eliminar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
                {bodegasFiltradas.length} de {bodegas.length} bodegas
                {search && ` — filtrado por "${search}"`}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal eliminar */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">¿Eliminar bodega?</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Estás a punto de eliminar{" "}
                <span className="font-semibold text-zinc-900 dark:text-white">{confirmDelete.nombre}</span>{" "}
                (ID #{confirmDelete.idBodega}). Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
              <p className="font-medium">{confirmDelete.nombre}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{confirmDelete.direccionFisica || "Sin dirección"}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmarEliminar}
                disabled={deleting !== null}
                className="flex-1 rounded-xl bg-red-600 text-white py-2.5 font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleting !== null ? "Eliminando…" : "Sí, eliminar"}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting !== null}
                className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 py-2.5 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}