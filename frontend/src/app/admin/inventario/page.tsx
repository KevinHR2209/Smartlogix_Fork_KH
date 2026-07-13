"use client";

import { useEffect, useMemo, useState } from "react";
import { inventarioService } from "@/features/inventario/services/inventarioService";
import { productosService } from "@/features/productos/services/productosService";
import { bodegasService } from "@/features/bodegas/services/bodegasService";
import {
  Inventario,
  InventarioRequest,
  TransferenciaStockRequest,
  MovimientoResponse,
} from "@/features/inventario/types/inventario";
import { Presentacion as Producto } from "@/features/productos/types/producto";
import { Bodega } from "@/features/bodegas/types/bodega";

type Tab = "stock" | "transferir" | "crear" | "movimientos";
type Operacion = "ajustar" | "reservar" | "liberar" | "descontar";
type Notif = { tipo: "ok" | "error"; msg: string } | null;

const BADGE: Record<string, string> = {
  ENTRADA: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  SALIDA: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  TRANSFERENCIA: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
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

export default function AdminInventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [tab, setTab] = useState<Tab>("stock");
  const [notif, setNotif] = useState<Notif>(null);
  const [loading, setLoading] = useState(false);

  // Tab Stock
  const [filterMode, setFilterMode] = useState<"bodega" | "presentacion">("bodega");
  const [filterId, setFilterId] = useState("");
  const [inventario, setInventario] = useState<Inventario[]>([]);
  const [cantidades, setCantidades] = useState<Record<number, string>>({});
  const [operaciones, setOperaciones] = useState<Record<number, Operacion>>({});

  // Tab Transferir
  const [transfer, setTransfer] = useState<TransferenciaStockRequest>({
    idPresentacion: 0,
    idBodegaOrigen: 0,
    idBodegaDestino: 0,
    cantidad: 0,
    observacion: "",
    usuarioResponsable: "",
  });

  // Tab Crear
  const [createForm, setCreateForm] = useState<InventarioRequest>({
    idBodega: 0,
    idPresentacion: 0,
    stockDisponible: 0,
    stockReservado: 0,
    stockMinimo: 5,
  });

  // Tab Movimientos
  const [movIdPresentacion, setMovIdPresentacion] = useState("");
  const [movimientos, setMovimientos] = useState<MovimientoResponse[]>([]);

  useEffect(() => {
    Promise.all([productosService.getAll(), bodegasService.getAll()])
      .then(([p, b]) => {
        setProductos(Array.isArray(p) ? p : []);
        setBodegas(Array.isArray(b) ? b : []);
      })
      .catch(() => notify("error", "No se pudieron cargar productos o bodegas."));
  }, []);

  const notify = (tipo: "ok" | "error", msg: string) => setNotif({ tipo, msg });

  const inventarioOrdenado = useMemo(
    () =>
      [...inventario].sort((a, b) =>
        `${a.nombreBodega ?? ""}${a.nombrePerfume ?? ""}`.localeCompare(
          `${b.nombreBodega ?? ""}${b.nombrePerfume ?? ""}`
        )
      ),
    [inventario]
  );

  const stockBajoCount = useMemo(
    () => inventarioOrdenado.filter((i) => i.stockBajo).length,
    [inventarioOrdenado]
  );

  const buscarInventario = async () => {
    const id = Number(filterId);
    if (!id || id <= 0) {
      notify("error", filterMode === "bodega" ? "Selecciona una bodega." : "Selecciona una presentación.");
      return;
    }
    try {
      setLoading(true);
      setNotif(null);
      const data = filterMode === "bodega"
        ? await inventarioService.getByBodega(id)
        : await inventarioService.getByProducto(id);
      setInventario(Array.isArray(data) ? data : []);
      setCantidades({});
      setOperaciones({});
      if (!data?.length) notify("ok", "No se encontraron registros para ese filtro.");
    } catch (e: any) {
      setInventario([]);
      notify("error", e?.message ?? "Error al consultar inventario.");
    } finally {
      setLoading(false);
    }
  };

  const ejecutarOperacion = async (item: Inventario) => {
    const id = item.idInventario!;
    const cant = Number(cantidades[id]);
    const op = operaciones[id] ?? "ajustar";

    if (!cant || cant <= 0) {
      notify("error", "Ingresa una cantidad válida (> 0).");
      return;
    }

    try {
      setLoading(true);
      setNotif(null);
      if (op === "ajustar") await inventarioService.ajustar(id, { cantidad: cant });
      if (op === "reservar") await inventarioService.reservar(id, { cantidad: cant });
      if (op === "liberar") await inventarioService.liberar(id, { cantidad: cant });
      if (op === "descontar") await inventarioService.descontar(id, { cantidad: cant });
      notify("ok", `Operación "${op}" ejecutada en ${item.nombrePerfume}.`);
      await buscarInventario();
    } catch (e: any) {
      notify("error", e?.message ?? `Error al ejecutar "${op}".`);
    } finally {
      setLoading(false);
    }
  };

  const ejecutarTransferencia = async () => {
    const { idPresentacion, idBodegaOrigen, idBodegaDestino, cantidad } = transfer;
    if (!idPresentacion || !idBodegaOrigen || !idBodegaDestino || !cantidad || cantidad <= 0) {
      notify("error", "Completa todos los campos de la transferencia.");
      return;
    }
    if (idBodegaOrigen === idBodegaDestino) {
      notify("error", "La bodega origen y destino no pueden ser la misma.");
      return;
    }
    try {
      setLoading(true);
      setNotif(null);
      await inventarioService.transferir(transfer);
      notify("ok", "Transferencia realizada correctamente.");
      setTransfer({ idPresentacion: 0, idBodegaOrigen: 0, idBodegaDestino: 0, cantidad: 0, observacion: "", usuarioResponsable: "" });
    } catch (e: any) {
      notify("error", e?.message ?? "Error al transferir stock.");
    } finally {
      setLoading(false);
    }
  };

  const crearInventario = async () => {
    const { idBodega, idPresentacion, stockDisponible, stockReservado } = createForm;
    if (!idBodega || !idPresentacion || stockDisponible < 0 || stockReservado < 0) {
      notify("error", "Completa correctamente todos los campos.");
      return;
    }
    try {
      setLoading(true);
      setNotif(null);
      await inventarioService.create(createForm);
      notify("ok", "Inventario creado correctamente.");
      setCreateForm({ idBodega: 0, idPresentacion: 0, stockDisponible: 0, stockReservado: 0, stockMinimo: 5 });
    } catch (e: any) {
      notify("error", e?.message ?? "Error al crear inventario.");
    } finally {
      setLoading(false);
    }
  };

  const cargarMovimientos = async () => {
    const id = Number(movIdPresentacion);
    if (!id || id <= 0) {
      notify("error", "Selecciona una presentación válida.");
      return;
    }
    try {
      setLoading(true);
      setNotif(null);
      const data = await inventarioService.getMovimientos(id);
      setMovimientos(Array.isArray(data) ? data : []);
      if (!data?.length) notify("ok", "No hay movimientos registrados para esta presentación.");
    } catch (e: any) {
      setMovimientos([]);
      notify("error", e?.message ?? "Error al cargar movimientos.");
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { id: "stock" as Tab, label: "Control de Stock", icon: "📦" },
    { id: "transferir" as Tab, label: "Transferencias", icon: "🔀" },
    { id: "crear" as Tab, label: "Nuevo Registro", icon: "➕" },
    { id: "movimientos" as Tab, label: "Movimientos", icon: "📋" },
  ];

  return (
    <main className="container-app py-10 space-y-8">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">Administración</p>
        <h1 className="text-4xl font-bold tracking-tight">Gestión de Inventario</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Control total de stock, transferencias entre bodegas, reservas y liberaciones.
        </p>
      </section>

      <Notificacion n={notif} onClose={() => setNotif(null)} />

      <nav className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setNotif(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* ══════════════ TAB: STOCK ══════════════ */}
      {tab === "stock" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 space-y-5">
            <h2 className="font-semibold text-lg">Consultar inventario</h2>
            <div className="flex gap-2 flex-wrap">
              {(["bodega", "presentacion"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setFilterMode(m); setFilterId(""); setInventario([]); }}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                    filterMode === m
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white"
                      : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  Por {m === "bodega" ? "Bodega" : "Presentación"}
                </button>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              <select value={filterId} onChange={(e) => setFilterId(e.target.value)}
                className="flex-1 min-w-[220px] rounded-xl border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800 px-4 py-2.5 text-sm">
                <option value="">-- Selecciona {filterMode === "bodega" ? "bodega" : "presentación"} --</option>
                {filterMode === "bodega"
                  ? bodegas.map((b) => <option key={b.idBodega} value={b.idBodega}>{b.nombre}</option>)
                  : productos.map((p) => <option key={p.idPresentacion} value={p.idPresentacion}>{p.nombrePerfume} – {p.volumenMl}ml</option>)}
              </select>
              <button onClick={buscarInventario} disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm font-medium hover:opacity-80 disabled:opacity-50 transition">
                {loading ? "Buscando…" : "Buscar"}
              </button>
            </div>
          </div>

          {inventarioOrdenado.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Registros", value: inventarioOrdenado.length },
                { label: "Stock Disponible Total", value: inventarioOrdenado.reduce((s, i) => s + i.stockDisponible, 0), color: "text-emerald-600" },
                { label: "Stock Reservado Total", value: inventarioOrdenado.reduce((s, i) => s + i.stockReservado, 0), color: "text-amber-600" },
                { label: "Stock Bajo ⚠️", value: stockBajoCount, color: stockBajoCount > 0 ? "text-red-600" : "text-zinc-500" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color ?? "text-zinc-900 dark:text-white"}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {inventarioOrdenado.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 uppercase text-xs tracking-wide">
                    <tr>
                      <th className="px-5 py-3 text-left">Perfume</th>
                      <th className="px-5 py-3 text-left">Volumen</th>
                      <th className="px-5 py-3 text-left">Bodega</th>
                      <th className="px-4 py-3 text-center">Disponible</th>
                      <th className="px-4 py-3 text-center">Reservado</th>
                      <th className="px-4 py-3 text-center">Mínimo</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                      <th className="px-5 py-3 text-left">Precio</th>
                      <th className="px-5 py-3 text-center">Operación</th>
                      <th className="px-4 py-3 text-center">Cantidad</th>
                      <th className="px-4 py-3 text-center">Ejecutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                    {inventarioOrdenado.map((item) => {
                      const id = item.idInventario!;
                      const op = operaciones[id] ?? "ajustar";
                      return (
                        <tr key={id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition ${item.stockBajo ? "bg-red-50/40 dark:bg-red-950/10" : ""}`}>
                          <td className="px-5 py-3 font-medium text-zinc-900 dark:text-white">{item.nombrePerfume}</td>
                          <td className="px-5 py-3 text-zinc-500">{item.volumenMl} ml</td>
                          <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">{item.nombreBodega}</td>
                          <td className="px-4 py-3 text-center font-semibold text-emerald-600">{item.stockDisponible}</td>
                          <td className="px-4 py-3 text-center font-semibold text-amber-600">{item.stockReservado}</td>
                          <td className="px-4 py-3 text-center text-zinc-500">{item.stockMinimo}</td>
                          <td className="px-4 py-3 text-center">
                            {item.stockBajo ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">⚠️ Bajo</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">✓ OK</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300">${item.precioActual?.toLocaleString("es-CL")}</td>
                          <td className="px-5 py-3">
                            <select value={op} onChange={(e) => setOperaciones((prev) => ({ ...prev, [id]: e.target.value as Operacion }))}
                              className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1.5 text-xs w-full">
                              <option value="ajustar">Ajustar stock</option>
                              <option value="reservar">Reservar</option>
                              <option value="liberar">Liberar reserva</option>
                              <option value="descontar">Descontar reservado</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input type="number" min="1" placeholder="0" value={cantidades[id] ?? ""}
                              onChange={(e) => setCantidades((prev) => ({ ...prev, [id]: e.target.value }))}
                              className="w-20 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1.5 text-sm text-center" />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => ejecutarOperacion(item)} disabled={loading}
                              className="rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-3 py-1.5 text-xs font-semibold hover:opacity-80 disabled:opacity-40 transition">
                              ▶ Aplicar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ TAB: TRANSFERIR ══════════════ */}
      {tab === "transferir" && (
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 max-w-2xl space-y-6">
          <h2 className="font-semibold text-lg">Transferencia entre bodegas</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Mueve stock de una presentación desde una bodega origen hacia otra.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Presentación</label>
              <select value={transfer.idPresentacion} onChange={(e) => setTransfer((p) => ({ ...p, idPresentacion: Number(e.target.value) }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm">
                <option value={0}>-- Selecciona presentación --</option>
                {productos.map((p) => <option key={p.idPresentacion} value={p.idPresentacion}>{p.nombrePerfume} – {p.volumenMl}ml</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Cantidad</label>
              <input type="number" min="1" value={transfer.cantidad || ""}
                onChange={(e) => setTransfer((p) => ({ ...p, cantidad: Number(e.target.value) }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm" placeholder="Ej: 50" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Bodega Origen</label>
              <select value={transfer.idBodegaOrigen} onChange={(e) => setTransfer((p) => ({ ...p, idBodegaOrigen: Number(e.target.value) }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm">
                <option value={0}>-- Selecciona origen --</option>
                {bodegas.map((b) => <option key={b.idBodega} value={b.idBodega}>{b.nombre}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Bodega Destino</label>
              <select value={transfer.idBodegaDestino} onChange={(e) => setTransfer((p) => ({ ...p, idBodegaDestino: Number(e.target.value) }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm">
                <option value={0}>-- Selecciona destino --</option>
                {bodegas.filter((b) => b.idBodega !== transfer.idBodegaOrigen).map((b) => <option key={b.idBodega} value={b.idBodega}>{b.nombre}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Observación</label>
              <input type="text" value={transfer.observacion ?? ""}
                onChange={(e) => setTransfer((p) => ({ ...p, observacion: e.target.value }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm" placeholder="Motivo (opcional)" />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Usuario responsable</label>
              <input type="text" value={transfer.usuarioResponsable ?? ""}
                onChange={(e) => setTransfer((p) => ({ ...p, usuarioResponsable: e.target.value }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm" placeholder="Nombre del responsable" />
            </div>
          </div>

          <button onClick={ejecutarTransferencia} disabled={loading}
            className="w-full rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 py-3 font-semibold text-sm hover:opacity-80 disabled:opacity-50 transition">
            {loading ? "Transfiriendo…" : "🔀 Ejecutar Transferencia"}
          </button>
        </div>
      )}

      {/* ══════════════ TAB: CREAR ══════════════ */}
      {tab === "crear" && (
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 max-w-xl space-y-6">
          <h2 className="font-semibold text-lg">Crear registro de inventario</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Asocia una presentación de perfume a una bodega con su stock inicial.</p>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Bodega</label>
              <select value={createForm.idBodega} onChange={(e) => setCreateForm((p) => ({ ...p, idBodega: Number(e.target.value) }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm">
                <option value={0}>-- Selecciona bodega --</option>
                {bodegas.map((b) => <option key={b.idBodega} value={b.idBodega}>{b.nombre}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Presentación</label>
              <select value={createForm.idPresentacion} onChange={(e) => setCreateForm((p) => ({ ...p, idPresentacion: Number(e.target.value) }))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm">
                <option value={0}>-- Selecciona presentación --</option>
                {productos.map((p) => <option key={p.idPresentacion} value={p.idPresentacion}>{p.nombrePerfume} – {p.volumenMl}ml</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Stock Disponible", key: "stockDisponible" },
                { label: "Stock Reservado", key: "stockReservado" },
                { label: "Stock Mínimo", key: "stockMinimo" },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</label>
                  <input type="number" min="0" value={(createForm as any)[key] ?? 0}
                    onChange={(e) => setCreateForm((p) => ({ ...p, [key]: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm" />
                </div>
              ))}
            </div>
          </div>

          <button onClick={crearInventario} disabled={loading}
            className="w-full rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 py-3 font-semibold text-sm hover:opacity-80 disabled:opacity-50 transition">
            {loading ? "Creando…" : "➕ Crear inventario"}
          </button>
        </div>
      )}

      {/* ══════════════ TAB: MOVIMIENTOS ══════════════ */}
      {tab === "movimientos" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 space-y-4">
            <h2 className="font-semibold text-lg">Historial de movimientos</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Consulta todas las entradas, salidas y transferencias.</p>
            <div className="flex gap-3 flex-wrap">
              <select value={movIdPresentacion} onChange={(e) => setMovIdPresentacion(e.target.value)}
                className="flex-1 min-w-[220px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm">
                <option value="">-- Selecciona presentación --</option>
                {productos.map((p) => <option key={p.idPresentacion} value={p.idPresentacion}>{p.nombrePerfume} – {p.volumenMl}ml</option>)}
              </select>
              <button onClick={cargarMovimientos} disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm font-medium hover:opacity-80 disabled:opacity-50 transition">
                {loading ? "Cargando…" : "Ver movimientos"}
              </button>
            </div>
          </div>

          {movimientos.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 uppercase text-xs tracking-wide">
                    <tr>
                      <th className="px-5 py-3 text-left">ID</th>
                      <th className="px-5 py-3 text-left">Tipo</th>
                      <th className="px-5 py-3 text-left">Perfume</th>
                      <th className="px-5 py-3 text-left">Origen</th>
                      <th className="px-5 py-3 text-left">Destino</th>
                      <th className="px-4 py-3 text-center">Cantidad</th>
                      <th className="px-5 py-3 text-left">Observación</th>
                      <th className="px-5 py-3 text-left">Responsable</th>
                      <th className="px-5 py-3 text-left">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                    {movimientos.map((m) => (
                      <tr key={m.idMovimiento} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                        <td className="px-5 py-3 text-zinc-400">#{m.idMovimiento}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE[m.tipoMovimiento] ?? "bg-zinc-100 text-zinc-600"}`}>{m.tipoMovimiento}</span>
                        </td>
                        <td className="px-5 py-3 font-medium text-zinc-900 dark:text-white">{m.nombrePerfume} {m.volumenMl}ml</td>
                        <td className="px-5 py-3 text-zinc-500">{m.nombreBodegaOrigen ?? "—"}</td>
                        <td className="px-5 py-3 text-zinc-500">{m.nombreBodegaDestino ?? "—"}</td>
                        <td className="px-4 py-3 text-center font-semibold">{m.cantidad}</td>
                        <td className="px-5 py-3 text-zinc-500 max-w-[180px] truncate">{m.observacion ?? "—"}</td>
                        <td className="px-5 py-3 text-zinc-500">{m.usuarioResponsable ?? "—"}</td>
                        <td className="px-5 py-3 text-zinc-400 text-xs whitespace-nowrap">{new Date(m.fechaMovimiento).toLocaleString("es-CL")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}