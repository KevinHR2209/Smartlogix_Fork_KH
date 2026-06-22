'use client';
import { Cliente, CartItem } from '@/types';
import { formatPrecio } from '@/lib/utils';

interface CartDrawerProps {
  carrito: CartItem[];
  clientes: Cliente[];
  idClienteSeleccionado: string;
  onClienteChange: (id: string) => void;
  onConfirmar: () => void;
  onCerrar: () => void;
}

export function CartDrawer({
  carrito,
  clientes,
  idClienteSeleccionado,
  onClienteChange,
  onConfirmar,
  onCerrar,
}: CartDrawerProps) {
  const total = carrito.reduce((acc, item) => acc + item.precioActual * item.cantidad, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-900/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-8 flex flex-col animate-in slide-in-from-right-10 duration-300">
        <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-4">
          <h2 className="text-xl font-black text-zinc-900">Resumen de Compra</h2>
          <button
            onClick={onCerrar}
            className="text-zinc-400 hover:text-zinc-800 font-bold text-xl"
          >
            ✕
          </button>
        </div>

        {carrito.length === 0 ? (
          <div className="text-zinc-400 text-sm text-center py-10 flex-1">
            Aún no has seleccionado productos.
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Selector de cliente */}
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                Cliente Comprador
              </label>
              {clientes.length === 0 ? (
                <div className="text-xs text-red-500 font-medium">
                  ⚠️ Crea un cliente en el admin.
                </div>
              ) : (
                <select
                  className="w-full border border-zinc-200 bg-stone-50 p-3 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 text-zinc-800 font-medium cursor-pointer"
                  value={idClienteSeleccionado}
                  onChange={e => onClienteChange(e.target.value)}
                >
                  {clientes.map(c => (
                    <option key={c.idCliente} value={c.idCliente}>
                      {c.nombre} {c.apellidoPaterno} - [{c.region ?? 'Sin Región'}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Lista de items */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar border-b border-stone-100 pb-4">
              {carrito.map(item => (
                <div key={item.idProducto} className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <p className="font-bold text-zinc-800 text-sm">{item.nombre}</p>
                    <p className="text-xs text-zinc-500 mt-1">Cant: {item.cantidad}</p>
                  </div>
                  <p className="font-semibold text-zinc-900 text-sm">
                    {formatPrecio(item.cantidad * item.precioActual)}
                  </p>
                </div>
              ))}
            </div>

            {/* Total y botón */}
            <div className="pt-6 pb-6 mt-auto">
              <div className="flex justify-between items-end mb-6">
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                  Total a Pagar
                </span>
                <span className="text-3xl font-black text-zinc-900 tracking-tighter">
                  {formatPrecio(total)}
                </span>
              </div>
              <button
                onClick={onConfirmar}
                className="w-full bg-zinc-950 text-white py-4 rounded-2xl font-bold text-sm hover:bg-zinc-800 hover:shadow-lg transition-all"
              >
                Confirmar Transacción
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
