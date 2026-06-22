'use client';
import { usePedidos } from '@/hooks/usePedidos';
import { pedidosService } from '@/services/pedidosService';
import { PageHeader } from '@/components/ui/PageHeader';
import { AdminTable } from '@/components/ui/AdminTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pedido } from '@/types';
import { formatPrecio, formatFecha } from '@/lib/utils';

export default function AdminVentas() {
  const { pedidos, recargar } = usePedidos();

  const handleCambiarEstado = async (id: number, estado: string) => {
    await pedidosService.cambiarEstado(id, estado);
    recargar();
  };

  const columns = [
    {
      header: 'ID Pedido',
      accessor: (p: Pedido) => (
        <span className="font-bold text-zinc-900">#{p.idPedido}</span>
      ),
    },
    {
      header: 'Cliente',
      accessor: (p: Pedido) => (
        <span className="text-zinc-500">ID: {p.idCliente}</span>
      ),
    },
    {
      header: 'Fecha',
      accessor: (p: Pedido) => (
        <span className="text-zinc-400">{formatFecha(p.fechaCreacion)}</span>
      ),
    },
    {
      header: 'Total',
      accessor: (p: Pedido) => (
        <span className="font-bold text-zinc-900">{formatPrecio(p.montoTotal)}</span>
      ),
    },
    {
      header: 'Estado',
      accessor: (p: Pedido) => <StatusBadge estado={p.estadoPedido} />,
    },
    {
      header: 'Acciones',
      className: 'text-right',
      accessor: (p: Pedido) =>
        p.estadoPedido !== 'DESPACHADO' ? (
          <button
            onClick={() => handleCambiarEstado(p.idPedido!, 'DESPACHADO')}
            className="text-xs bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
          >
            Marcar Despachado
          </button>
        ) : null,
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        titulo="Historial de Transacciones"
        subtitulo="Monitorea los pedidos realizados en la tienda y su estado logístico."
      />
      <AdminTable
        columns={columns}
        data={pedidos}
        keyExtractor={p => p.idPedido!}
        emptyMessage="No se han registrado transacciones aún."
      />
    </div>
  );
}
