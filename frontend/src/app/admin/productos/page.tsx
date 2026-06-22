'use client';
import { useState } from 'react';
import { useProductos } from '@/hooks/useProductos';
import { productosService } from '@/services/productosService';
import { PageHeader } from '@/components/ui/PageHeader';
import { AdminTable } from '@/components/ui/AdminTable';
import { ProductoForm } from '@/components/forms/ProductoForm';
import { Producto } from '@/types';
import { formatPrecio, randomInt } from '@/lib/utils';

export default function AdminProductos() {
  const { productos, recargar } = useProductos();
  const [editando, setEditando] = useState<Producto | null>(null);

  const handleCrear = async () => {
    await productosService.create({
      sku: `SKU-${randomInt(1000, 9999)}`,
      nombre: `Producto Demo ${randomInt(1, 100)}`,
      descripcion: 'Descripción generada automáticamente.',
      precioActual: 15000,
      pesoGramos: 500,
      dimensiones: '10x10x10',
      estado: 'ACTIVO',
    });
    recargar();
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando?.idProducto) return;
    await productosService.update(editando.idProducto, editando);
    setEditando(null);
    recargar();
  };

  const handleEliminar = async (id: number) => {
    await productosService.remove(id);
    recargar();
  };

  const columns = [
    {
      header: 'SKU',
      accessor: (p: Producto) => (
        <span className="font-bold text-zinc-400">{p.sku}</span>
      ),
    },
    {
      header: 'Nombre',
      accessor: (p: Producto) => (
        <span className="font-semibold text-zinc-800">{p.nombre}</span>
      ),
    },
    {
      header: 'Precio',
      accessor: (p: Producto) => (
        <span className="font-bold text-zinc-900">{formatPrecio(p.precioActual)}</span>
      ),
    },
    {
      header: 'Acciones',
      className: 'text-right',
      accessor: (p: Producto) => (
        <span className="space-x-4">
          <button
            onClick={() => setEditando(p)}
            className="text-zinc-400 hover:text-zinc-900 font-semibold transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => handleEliminar(p.idProducto!)}
            className="text-red-400 hover:text-red-600 font-semibold transition-colors"
          >
            Eliminar
          </button>
        </span>
      ),
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        titulo="Catálogo de Inventario"
        subtitulo="Administra los productos disponibles en la tienda."
        labelAccion="+ Crear Producto Rápido"
        onAccion={handleCrear}
      />
      {editando && (
        <ProductoForm
          producto={editando}
          onChange={setEditando}
          onGuardar={handleGuardar}
          onCancelar={() => setEditando(null)}
        />
      )}
      <AdminTable
        columns={columns}
        data={productos}
        keyExtractor={p => p.idProducto!}
        emptyMessage="No hay productos en el inventario."
      />
    </div>
  );
}
