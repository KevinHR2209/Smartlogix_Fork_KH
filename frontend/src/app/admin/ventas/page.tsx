"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { pedidosService } from "@/features/pedidos/services/pedidosService";
import { formatCurrency } from "@/lib/utils/currency";
import { Pedido } from "@/features/pedidos/types/pedido";

// ─── Constantes ─────────────────────────────────────────────────────────────
const ESTADOS = [
  "PENDIENTE",
  "PAGADO",
  "PREPARANDO",
  "ENVIADO",
  "ENTREGADO",
  "CANCELADO",
];

const ESTADO_BADGE: Record<string, string> = {
  PENDIENTE:  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  PAGADO:     "bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300",
  PREPARANDO: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  ENVIADO:    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  ENTREGADO:  "bg-green-100  text-green-800  dark:bg-green-900/40  dark:text-green-300",
  CANCELADO:  "bg-red-100    text-red-800    dark:bg-red-900/40    dark:text-red-300",
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatFecha(fecha?: string) {
  if (!fecha) return "Sin fecha";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;
  return date.toLocaleString("es-CL");
}

function BadgeEstado({ estado }: { estado: string }) {
  const cls =
    ESTADO_BADGE[estado] ??
    "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {estado}
    </span>
  );
}

// ─── Tipos auxiliares ────────────────────────────────────────────────────────
type SortField = "idPedido" | "idCliente" | "fechaCreacion" | "montoTotal";
type SortDir = "asc" | "desc";

// ─── Componente principal ────────────────────────────────────────────────────
export default function AdminVentasPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [searchId, setSearchId] = useState("");
  const [searchCliente, setSearchCliente] = useState("");
  const [filterEstado, setFilterEstado] = useState("TODOS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [montoMin, setMontoMin] = useState("");
  const [montoMax, setMontoMax] = useState("");

  // ── Ordenamiento ─────────────────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>("idPedido");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ── Paginación ────────────────────────────────────────────────────────────
  const [pagina, setPagina] = useState(1);
  const ITEMS_POR_PAGINA = 10;

  // ─── Carga de datos ────────────────────────────────────────────────────────
  const loadPedidos = async () => {
    try {
      setLoading(true);
      setMensaje("");
      const data = await pedidosService.getAll();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setPedidos([]);
      setMensaje("No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPedidos();
  }, []);

  // ── Reset paginación cuando cambian filtros ───────────────────────────────
  useEffect(() => {
    setPagina(1);
  }, [searchId, searchCliente, filterEstado, fechaDesde, fechaHasta, montoMin, montoMax]);

  // ─── Filtrado + Ordenamiento ────────────────────────────────────────────────
  const pedidosFiltrados = useMemo(() => {
    let lista = pedidos.filter((p) => {
      if (searchId && !String(p.idPedido ?? "").includes(searchId.trim())) return false;
      if (searchCliente && !String(p.idCliente ?? "").includes(searchCliente.trim())) return false;
      if (filterEstado !== "TODOS" && p.estadoPedido !== filterEstado) return false;
      if (fechaDesde && p.fechaCreacion) {
        if (new Date(p.fechaCreacion) < new Date(fechaDesde)) return false;
      }
      if (fechaHasta && p.fechaCreacion) {
        if (new Date(p.fechaCreacion) > new Date(fechaHasta + "T23:59:59")) return false;
      }
      if (montoMin && Number(p.montoTotal) < Number(montoMin)) return false;
      if (montoMax && Number(p.montoTotal) > Number(montoMax)) return false;
      return true;
    });

    lista = [...lista].sort((a, b) => {
      let va: number | string = "";
      let vb: number | string = "";

      if (sortField === "idPedido")      { va = a.idPedido ?? 0;     vb = b.idPedido ?? 0; }
      if (sortField === "idCliente")     { va = a.idCliente ?? 0;    vb = b.idCliente ?? 0; }
      if (sortField === "montoTotal")    { va = Number(a.montoTotal); vb = Number(b.montoTotal); }
      if (sortField === "fechaCreacion") {
        va = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
        vb = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
      }

      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return lista;
  }, [pedidos, searchId, searchCliente, filterEstado, fechaDesde, fechaHasta, montoMin, montoMax, sortField, sortDir]);

  // ── Paginación calculada ──────────────────────────────────────────────────
  const totalPaginas = Math.max(1, Math.ceil(pedidosFiltrados.length / ITEMS_POR_PAGINA));
  const pedidosPagina = pedidosFiltrados.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA
  );

  // ─── Estadísticas rápidas ─────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = pedidosFiltrados.length;
    const montoTotal = pedidosFiltrados.reduce((acc, p) => acc + Number(p.montoTotal ?? 0), 0);
    const porEstado = ESTADOS.reduce<Record<string, number>>((acc, e) => {
      acc[e] = pedidosFiltrados.filter((p) => p.estadoPedido === e).length;
      return acc;
    }, {});
    return { total, montoTotal, porEstado };
  }, [pedidosFiltrados]);

  // ─── Cambiar estado ────────────────────────────────────────────────────────
  const cambiarEstado = async (idPedido: number | undefined, estado: string) => {
    if (!idPedido) return;
    try {
      setSavingId(idPedido);
      setMensaje("");
      await pedidosService.cambiarEstado(idPedido, estado);
      setMensaje(`✓ Pedido #${idPedido} actualizado a "${estado}".`);
      await loadPedidos();
    } catch (error: any) {
      setMensaje(`✕ ${error?.message || "Error actualizando el estado."}`);
    } finally {
      setSavingId(null);
    }
  };

  // ─── Helper ordenamiento ──────────────────────────────────────────────────
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <span className="ml-1 text-zinc-300 dark:text-zinc-600">↕</span>;
    return (
      <span className="ml-1 text-zinc-700 dark:text-zinc-200">
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  // ─── Limpiar filtros ───────────────────────────────────────────────────────
  const limpiarFiltros = () => {
    setSearchId("");
    setSearchCliente("");
    setFilterEstado("TODOS");
    setFechaDesde("");
    setFechaHasta("");
    setMontoMin("");
    setMontoMax("");
    setSortField("idPedido");
    setSortDir("desc");
  };

  const hayFiltrosActivos =
    searchId || searchCliente || filterEstado !== "TODOS" ||
    fechaDesde || fechaHasta || montoMin || montoMax;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="container-app py-10">

      {/* Encabezado */}
      <section className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
          Administración
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Administrar ventas</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Visualiza y gestiona todos los pedidos de los clientes.
        </p>
      </section>

      {mensaje && (
        <div
          className={`mb-6 rounded-2xl border p-4 text-sm ${
            mensaje.startsWith("✓")
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
          }`}
        >
          {mensaje}
        </div>
      )}

      {!loading && (
        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="card-base p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total pedidos
            </p>
            <p className="mt-1 text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="card-base p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Monto total
            </p>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(stats.montoTotal)}</p>
          </div>
          <div className="card-base p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Pendientes
            </p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {stats.porEstado["PENDIENTE"] ?? 0}
            </p>
          </div>
          <div className="card-base p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Entregados
            </p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {stats.porEstado["ENTREGADO"] ?? 0}
            </p>
          </div>
        </section>
      )}

      {/* Filtros */}
      <section className="card-base mb-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Filtros
          </h2>
          {hayFiltrosActivos && (
            <button
              onClick={limpiarFiltros}
              className="text-xs text-red-500 transition-colors hover:text-red-700 dark:hover:text-red-400"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              ID Pedido
            </label>
            <input
              className="input-base"
              placeholder="Ej: 42"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              type="number"
              min={0}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              ID Cliente
            </label>
            <input
              className="input-base"
              placeholder="Ej: 7"
              value={searchCliente}
              onChange={(e) => setSearchCliente(e.target.value)}
              type="number"
              min={0}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Estado
            </label>
            <select
              className="input-base"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="TODOS">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Fecha desde
            </label>
            <input
              className="input-base"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Fecha hasta
            </label>
            <input
              className="input-base"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Monto mínimo
            </label>
            <input
              className="input-base"
              placeholder="Ej: 10000"
              value={montoMin}
              onChange={(e) => setMontoMin(e.target.value)}
              type="number"
              min={0}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Monto máximo
            </label>
            <input
              className="input-base"
              placeholder="Ej: 500000"
              value={montoMax}
              onChange={(e) => setMontoMax(e.target.value)}
              type="number"
              min={0}
            />
          </div>

          <div className="flex flex-col justify-end gap-1">
            <button
              onClick={loadPedidos}
              disabled={loading}
              className="input-base cursor-pointer text-center transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
            >
              {loading ? "Cargando..." : "↻ Recargar"}
            </button>
          </div>
        </div>
      </section>

      {/* Tabla de pedidos */}
      <section className="card-base p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Pedidos
            <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">
              ({pedidosFiltrados.length} resultado
              {pedidosFiltrados.length !== 1 ? "s" : ""})
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="py-16 text-center text-zinc-500 dark:text-zinc-400">
            <div className="mb-3 text-3xl"></div>
            Cargando pedidos...
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 dark:text-zinc-400">
            <div className="mb-3 text-3xl"></div>
            No hay pedidos que coincidan con los filtros.
          </div>
        ) : (
          <>
            {/* Tabla desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
                    {(
                      [
                        { label: "# Pedido",      field: "idPedido"      },
                        { label: "Cliente",        field: "idCliente"     },
                        { label: "Estado",         field: null            },
                        { label: "Monto",          field: "montoTotal"    },
                        { label: "Fecha",          field: "fechaCreacion" },
                        { label: "Items",          field: null            },
                        { label: "Cambiar estado", field: null            },
                      ] as { label: string; field: SortField | null }[]
                    ).map(({ label, field }) => (
                      <th
                        key={label}
                        className={`pb-3 pr-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ${
                          field
                            ? "cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-100"
                            : ""
                        }`}
                        onClick={() => field && toggleSort(field)}
                      >
                        {label}
                        {field && <SortIcon field={field} />}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {pedidosPagina.map((pedido) => (
                    <Fragment key={pedido.idPedido}>
                      <tr
                        className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        onClick={() =>
                          setExpandedId(
                            expandedId === pedido.idPedido ? null : pedido.idPedido ?? null
                          )
                        }
                      >
                        <td className="py-3 pr-4 font-mono font-bold text-zinc-700 dark:text-zinc-200">
                          #{pedido.idPedido}
                        </td>
                        <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-300">
                          {pedido.idCliente}
                        </td>
                        <td className="py-3 pr-4">
                          <BadgeEstado estado={pedido.estadoPedido} />
                        </td>
                        <td className="py-3 pr-4 font-medium text-zinc-700 dark:text-zinc-200">
                          {formatCurrency(Number(pedido.montoTotal ?? 0))}
                        </td>
                        <td className="whitespace-nowrap py-3 pr-4 text-zinc-500 dark:text-zinc-400">
                          {formatFecha(pedido.fechaCreacion)}
                        </td>
                        <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-300">
                          {pedido.detalles?.length ?? 0}
                        </td>
                        <td
                          className="py-3 pr-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            className="input-base min-w-[170px] py-1 text-xs"
                            value={pedido.estadoPedido}
                            onChange={(e) =>
                              cambiarEstado(pedido.idPedido, e.target.value)
                            }
                            disabled={savingId === pedido.idPedido}
                          >
                            {ESTADOS.map((estado) => (
                              <option key={estado} value={estado}>
                                {estado}
                              </option>
                            ))}
                          </select>
                          {savingId === pedido.idPedido && (
                            <span className="ml-2 text-xs text-zinc-400">
                              Guardando...
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Fila expandible de detalle */}
                      {expandedId === pedido.idPedido &&
                        pedido.detalles &&
                        pedido.detalles.length > 0 && (
                          <tr>
                            <td colSpan={7} className="pb-4 pt-0">
                              <div className="ml-4 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                  Detalle del pedido #{pedido.idPedido}
                                </p>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-left text-xs text-zinc-400">
                                      <th className="pb-2 pr-4">ID Detalle</th>
                                      <th className="pb-2 pr-4">Presentación</th>
                                      <th className="pb-2 pr-4">Cantidad</th>
                                      <th className="pb-2">Precio unitario</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                    {pedido.detalles.map((d) => (
                                      <tr key={d.idDetalle}>
                                        <td className="py-1.5 pr-4 text-zinc-400">
                                          {d.idDetalle}
                                        </td>
                                        <td className="py-1.5 pr-4">
                                          {d.idPresentacion}
                                        </td>
                                        <td className="py-1.5 pr-4">{d.cantidad}</td>
                                        <td className="py-1.5">
                                          {formatCurrency(
                                            Number(d.precioUnitarioSnapshot ?? 0)
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards mobile */}
            <div className="space-y-3 md:hidden">
              {pedidosPagina.map((pedido) => (
                <article
                  key={pedido.idPedido}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-mono font-bold">#{pedido.idPedido}</p>
                    <BadgeEstado estado={pedido.estadoPedido} />
                  </div>

                  <div className="mb-3 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
                    <p>
                      Cliente:{" "}
                      <span className="font-medium">{pedido.idCliente}</span>
                    </p>
                    <p>
                      Monto:{" "}
                      <span className="font-medium">
                        {formatCurrency(Number(pedido.montoTotal ?? 0))}
                      </span>
                    </p>
                    <p>Items: {pedido.detalles?.length ?? 0}</p>
                    <p className="text-xs text-zinc-400">
                      {formatFecha(pedido.fechaCreacion)}
                    </p>
                  </div>

                  <select
                    className="input-base w-full text-sm"
                    value={pedido.estadoPedido}
                    onChange={(e) =>
                      cambiarEstado(pedido.idPedido, e.target.value)
                    }
                    disabled={savingId === pedido.idPedido}
                  >
                    {ESTADOS.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>

                  {pedido.detalles && pedido.detalles.length > 0 && (
                    <button
                      className="mt-3 w-full rounded-xl bg-zinc-100 py-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      onClick={() =>
                        setExpandedId(
                          expandedId === pedido.idPedido
                            ? null
                            : pedido.idPedido ?? null
                        )
                      }
                    >
                      {expandedId === pedido.idPedido
                        ? "▲ Ocultar detalle"
                        : "▼ Ver detalle"}
                    </button>
                  )}

                  {expandedId === pedido.idPedido && pedido.detalles && (
                    <div className="mt-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">
                      {pedido.detalles.map((d) => (
                        <div
                          key={d.idDetalle}
                          className="py-1 text-xs text-zinc-600 dark:text-zinc-300"
                        >
                          Presentación {d.idPresentacion} · x{d.cantidad} ·{" "}
                          {formatCurrency(Number(d.precioUnitarioSnapshot ?? 0))}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  ← Anterior
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter(
                      (n) =>
                        n === 1 ||
                        n === totalPaginas ||
                        Math.abs(n - pagina) <= 2
                    )
                    .reduce<(number | "...")[]>((acc, n, i, arr) => {
                      if (i > 0 && n - (arr[i - 1] as number) > 1)
                        acc.push("...");
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === "..." ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="px-1 text-zinc-400"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPagina(item as number)}
                          className={`min-w-[36px] rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                            pagina === item
                              ? "border-zinc-800 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-white dark:text-zinc-900"
                              : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                </div>

                <button
                  onClick={() =>
                    setPagina((p) => Math.min(totalPaginas, p + 1))
                  }
                  disabled={pagina === totalPaginas}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}