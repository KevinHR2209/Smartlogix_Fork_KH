"use client";

import { useEffect, useMemo, useState } from "react";
import { InventarioSearch } from "@/features/inventario/components/InventarioSearch";
import { InventarioCreateForm } from "@/features/inventario/components/InventarioCreateForm";
import { InventarioTransferForm } from "@/features/inventario/components/InventarioTransferForm";
import { InventarioList } from "@/features/inventario/components/InventarioList";
import { inventarioService } from "@/features/inventario/services/inventarioService";
import {
  Inventario,
  InventarioRequest,
  TransferenciaStockRequest,
} from "@/features/inventario/types/inventario";
import { productosService } from "@/features/productos/services/productosService";
import { bodegasService } from "@/features/bodegas/services/bodegasService";
import { Producto } from "@/features/productos/types/producto";
import { Bodega } from "@/features/bodegas/types/bodega";

const emptyInventarioForm: InventarioRequest = {
  idBodega: 0,
  idProducto: 0,
  stockDisponible: 0,
  stockReservado: 0,
};

const emptyTransferForm: TransferenciaStockRequest = {
  idProducto: 0,
  idBodegaOrigen: 0,
  idBodegaDestino: 0,
  cantidad: 0,
};

export default function AdminInventarioPage() {
  const [inventario, setInventario] = useState<Inventario[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [searchMode, setSearchMode] = useState<"bodega" | "producto">("bodega");
  const [selectedSearchValue, setSelectedSearchValue] = useState("");
  const [createForm, setCreateForm] = useState<InventarioRequest>(emptyInventarioForm);
  const [transferForm, setTransferForm] = useState<TransferenciaStockRequest>(emptyTransferForm);

  useEffect(() => {
    const loadCatalogos = async () => {
      try {
        const [productosData, bodegasData] = await Promise.all([
          productosService.getAll(),
          bodegasService.getAll(),
        ]);

        setProductos(Array.isArray(productosData) ? productosData : []);
        setBodegas(Array.isArray(bodegasData) ? bodegasData : []);
      } catch (error) {
        console.error(error);
        setMensaje("No se pudieron cargar productos o bodegas.");
      }
    };

    loadCatalogos();
  }, []);

  const inventarioOrdenado = useMemo(
    () =>
      [...inventario].sort((a, b) => {
        const nombreA = `${a.nombreBodega ?? ""}${a.nombreProducto ?? ""}`;
        const nombreB = `${b.nombreBodega ?? ""}${b.nombreProducto ?? ""}`;
        return nombreA.localeCompare(nombreB);
      }),
    [inventario]
  );

  const buscarInventario = async () => {
    const id = Number(selectedSearchValue);

    if (!id || id <= 0) {
      setMensaje(
        searchMode === "bodega"
          ? "Selecciona una bodega válida."
          : "Selecciona un producto válido."
      );
      setInventario([]);
      return;
    }

    try {
      setLoading(true);
      setMensaje("");

      const data =
        searchMode === "bodega"
          ? await inventarioService.getByBodega(id)
          : await inventarioService.getByProducto(id);

      setInventario(Array.isArray(data) ? data : []);

      if (Array.isArray(data) && data.length === 0) {
        setMensaje("No se encontraron registros.");
      }
    } catch (error: any) {
      setInventario([]);
      setMensaje(error?.message ?? "No se pudo consultar el inventario.");
    } finally {
      setLoading(false);
    }
  };

  const crearInventario = async () => {
    try {
      setMensaje("");

      if (
        createForm.idBodega <= 0 ||
        createForm.idProducto <= 0 ||
        createForm.stockDisponible < 0 ||
        createForm.stockReservado < 0
      ) {
        setMensaje("Completa correctamente los datos del inventario.");
        return;
      }

      const bodegaConsultada = createForm.idBodega;

      await inventarioService.create(createForm);
      setMensaje("Inventario creado correctamente.");
      setSearchMode("bodega");
      setSelectedSearchValue(String(bodegaConsultada));
      setCreateForm(emptyInventarioForm);

      const data = await inventarioService.getByBodega(bodegaConsultada);
      setInventario(Array.isArray(data) ? data : []);
    } catch (error: any) {
      setMensaje(error?.message ?? "No se pudo crear el inventario.");
    }
  };

  const ejecutarOperacion = async (
    action: "ajustar" | "reservar" | "liberar" | "descontar",
    item: Inventario,
    cantidad: number
  ) => {
    if (!item.idInventario || cantidad <= 0) {
      setMensaje("Ingresa una cantidad válida para operar.");
      return;
    }

    try {
      setMensaje("");

      if (action === "ajustar") {
        await inventarioService.ajustar(item.idInventario, { cantidad });
      }

      if (action === "reservar") {
        await inventarioService.reservar(item.idInventario, { cantidad });
      }

      if (action === "liberar") {
        await inventarioService.liberar(item.idInventario, { cantidad });
      }

      if (action === "descontar") {
        await inventarioService.descontar(item.idInventario, { cantidad });
      }

      setMensaje(`Operación "${action}" ejecutada correctamente.`);
      await buscarInventario();
    } catch (error: any) {
      setMensaje(error?.message ?? `No se pudo ejecutar la operación ${action}.`);
    }
  };

  const transferirStock = async () => {
    try {
      setMensaje("");

      if (
        transferForm.idProducto <= 0 ||
        transferForm.idBodegaOrigen <= 0 ||
        transferForm.idBodegaDestino <= 0 ||
        transferForm.cantidad <= 0
      ) {
        setMensaje("Completa correctamente los datos de transferencia.");
        return;
      }

      const bodegaOrigenConsultada = transferForm.idBodegaOrigen;

      await inventarioService.transferir(transferForm);
      setMensaje("Transferencia realizada correctamente.");
      setSearchMode("bodega");
      setSelectedSearchValue(String(bodegaOrigenConsultada));
      setTransferForm(emptyTransferForm);

      const data = await inventarioService.getByBodega(bodegaOrigenConsultada);
      setInventario(Array.isArray(data) ? data : []);
    } catch (error: any) {
      setMensaje(error?.message ?? "No se pudo transferir stock.");
    }
  };

  return (
    <main className="container-app py-10">
      <section className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
          Administración
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Inventario por bodega</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Consulta stock por producto o bodega y ejecuta operaciones de inventario.
        </p>
      </section>

      {mensaje && (
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          {mensaje}
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <InventarioSearch
          searchMode={searchMode}
          searchValue={selectedSearchValue}
          bodegas={bodegas}
          productos={productos}
          onSearchModeChange={setSearchMode}
          onSearchValueChange={setSelectedSearchValue}
          onSubmit={buscarInventario}
          loading={loading}
        />

        <InventarioCreateForm
          form={createForm}
          productos={productos}
          bodegas={bodegas}
          onChange={setCreateForm}
          onSubmit={crearInventario}
        />

        <InventarioTransferForm
          form={transferForm}
          productos={productos}
          bodegas={bodegas}
          onChange={setTransferForm}
          onSubmit={transferirStock}
        />
      </section>

      <section className="mt-6">
        <InventarioList items={inventarioOrdenado} onAction={ejecutarOperacion} />
      </section>
    </main>
  );
}