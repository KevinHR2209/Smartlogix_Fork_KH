'use client';
import { useEffect, useState } from 'react';
import { Pedido } from '@/types';

export default function AdminVentas() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = () => {
    fetch('http://localhost:8080/api/pedidos')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPedidos(data);
        } else {
          setPedidos([]); 
        }
      })
      .catch(err => {
        console.error("Error cargando pedidos:", err);
        setPedidos([]); 
      });
  };

  const cambiarEstado = async (id?: number, nuevoEstado?: string) => {
    if (!id || !nuevoEstado) return;
    try {
      await fetch(`http://localhost:8080/api/pedidos/${id}/estado?estado=${nuevoEstado}`, {
        method: 'PUT'
      });
      cargarPedidos();
    } catch (error) {
      console.error("Error cambiando estado:", error);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 border-b border-zinc-200 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Historial de Transacciones</h1>
        <p className="text-zinc-500 mt-1 text-sm">Monitorea los pedidos realizados en la tienda y su estado logístico.</p>
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-stone-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">ID Pedido</th>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">Cliente</th>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">Fecha</th>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">Total</th>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">Estado</th>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {pedidos.map((pedido) => (
              <tr key={pedido.idPedido} className="hover:bg-stone-50 transition-colors">
                <td className="p-5 text-sm font-bold text-zinc-900">#{pedido.idPedido}</td>
                <td className="p-5 text-sm text-zinc-500">ID: {pedido.idCliente}</td>
                <td className="p-5 text-sm text-zinc-400">
                  {pedido.fechaCreacion ? new Date(pedido.fechaCreacion).toLocaleString() : 'No registrada'}
                </td>
                <td className="p-5 text-sm font-bold text-zinc-900">${pedido.montoTotal}</td>
                <td className="p-5 text-sm">
                  <span className="px-3 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase border border-stone-200 bg-stone-100 text-zinc-600">
                    {pedido.estadoPedido}
                  </span>
                </td>
                <td className="p-5 text-sm text-right space-x-2">
                  {pedido.estadoPedido !== 'DESPACHADO' && (
                    <button 
                      onClick={() => cambiarEstado(pedido.idPedido, 'DESPACHADO')} 
                      className="text-xs bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
                    >
                      Marcar Despachado
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {pedidos.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-zinc-400 text-sm">No se han registrado transacciones aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}