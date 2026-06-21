'use client';
import { useEffect, useState } from 'react';
import { Producto, CartItem, Cliente } from '@/types';

export default function TiendaPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [idClienteSeleccionado, setIdClienteSeleccionado] = useState<string>('');
  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/api/productos')
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setProductos(data); })
        .catch(err => console.error(err));

    fetch('http://localhost:8080/api/clientes')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setClientes(data);
            if (data.length > 0 && data[0].idCliente) setIdClienteSeleccionado(data[0].idCliente.toString());
          }
        })
        .catch(err => console.error(err));
  }, []);

  const agregarAlCarrito = (prod: Producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.idProducto === prod.idProducto);
      if (existe) return prev.map(item => item.idProducto === prod.idProducto ? { ...item, cantidad: item.cantidad + 1 } : item);
      return [...prev, { ...prod, cantidad: 1 }];
    });
    setIsCartOpen(true);
  };

  const procesarCompra = async () => {
    if (carrito.length === 0) return;
    if (clientes.length === 0 || !idClienteSeleccionado) {
      setMensaje("Falta seleccionar un cliente válido.");
      setIsCartOpen(false);
      return;
    }

    // Identificamos al cliente y extraemos su región
    const clienteSeleccionado = clientes.find(c => c.idCliente === parseInt(idClienteSeleccionado));
    const regionDestino = clienteSeleccionado?.region || "Metropolitana"; // Fallback seguro

    const pedidoPayload = {
      idCliente: parseInt(idClienteSeleccionado),
      estadoPedido: "PAGADO",
      montoTotal: carrito.reduce((acc, item) => acc + (item.precioActual * item.cantidad), 0),
      detalles: carrito.map(item => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad,
        precioUnitarioSnapshot: item.precioActual
      }))
    };

    try {
      // AQUÍ OCURRE LA MAGIA: Enviamos la región por Query Param al Gateway
      const resPedido = await fetch(`http://localhost:8080/api/pedidos?regionDestino=${encodeURIComponent(regionDestino)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoPayload)
      });

      if (!resPedido.ok) throw new Error("Error procesando el pedido o falta de stock en bodega.");

      const pedidoCreado = await resPedido.json();
      setMensaje(`Transacción exitosa. Pedido #${pedidoCreado.idPedido} enviado a ${regionDestino}.`);
      setCarrito([]);
      setIsCartOpen(false);

      // Actualizamos los productos para refrescar el stock visualmente
      fetch('http://localhost:8080/api/productos')
          .then(res => res.json())
          .then(data => { if (Array.isArray(data)) setProductos(data); });

      setTimeout(() => setMensaje(''), 5000);

    } catch (error: any) {
      setMensaje(error.message);
      setIsCartOpen(false);
    }
  };

  return (
      <div className="animate-in fade-in duration-500 relative">
        <header className="mb-12 flex justify-between items-end border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">Catálogo</h1>
            <p className="text-zinc-500 mt-2">Selecciona tus productos y finaliza la compra simulada.</p>
          </div>
          <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-white border border-zinc-200 px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-zinc-50 transition-colors"
          >
            🛒 Mi Carrito
            {carrito.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-zinc-900 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-md">
              {carrito.reduce((acc, item) => acc + item.cantidad, 0)}
            </span>
            )}
          </button>
        </header>

        {mensaje && (
            <div className={`p-4 rounded-xl mb-8 font-medium text-sm border flex items-center gap-3 shadow-sm ${
                mensaje.includes('Error') || mensaje.includes('Falta') ? 'bg-red-50 text-red-900 border-red-100' : 'bg-green-50 text-green-900 border-green-100'
            }`}>
              <div className={`w-2 h-2 rounded-full ${mensaje.includes('Error') || mensaje.includes('Falta') ? 'bg-red-500' : 'bg-green-500'}`}></div>
              {mensaje}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 rounded-3xl text-zinc-400">
                El catálogo está vacío.
              </div>
          ) : null}

          {productos.map(p => (
              <div key={p.idProducto} className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 flex flex-col justify-between hover:shadow-md transition-shadow group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-stone-100 px-2 py-1 rounded-md w-max">{p.sku}</span>
                      {/* Etiqueta de Stock */}
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md w-max ${
                          p.stockTotal && p.stockTotal > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                    {p.stockTotal && p.stockTotal > 0 ? `Stock: ${p.stockTotal}` : 'Agotado'}
                  </span>
                    </div>
                    <span className="text-xl font-bold text-zinc-900">${p.precioActual}</span>
                  </div>
                  <h2 className="font-bold text-lg leading-tight text-zinc-800 mb-2 group-hover:text-black transition-colors">{p.nombre}</h2>
                  <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">{p.descripcion}</p>
                </div>
                <button
                    onClick={() => agregarAlCarrito(p)}
                    disabled={!p.stockTotal || p.stockTotal <= 0} // Desactiva si no hay stock
                    className={`mt-6 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm border ${
                        p.stockTotal && p.stockTotal > 0
                            ? 'bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50'
                            : 'bg-zinc-100 text-zinc-400 border-zinc-100 cursor-not-allowed'
                    }`}
                >
                  {p.stockTotal && p.stockTotal > 0 ? 'Agregar' : 'Sin Stock'}
                </button>
              </div>
          ))}
        </div>

        {isCartOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-zinc-900/40 backdrop-blur-sm transition-opacity">
              <div className="w-full max-w-md bg-white h-full shadow-2xl p-8 flex flex-col animate-in slide-in-from-right-10 duration-300">

                <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-4">
                  <h2 className="text-xl font-black text-zinc-900">Resumen de Compra</h2>
                  <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-zinc-800 font-bold text-xl">
                    ✕
                  </button>
                </div>

                {carrito.length === 0 ? (
                    <div className="text-zinc-400 text-sm text-center py-10 flex-1">
                      Aún no has seleccionado productos.
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="mb-6">
                        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Cliente Comprador</label>
                        {clientes.length === 0 ? (
                            <div className="text-xs text-red-500 font-medium">⚠️ Crea un cliente en el admin.</div>
                        ) : (
                            <select
                                className="w-full border border-zinc-200 bg-stone-50 p-3 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 text-zinc-800 font-medium cursor-pointer"
                                value={idClienteSeleccionado}
                                onChange={e => setIdClienteSeleccionado(e.target.value)}
                            >
                              {clientes.map(c => (
                                  <option key={c.idCliente} value={c.idCliente}>
                                    {c.nombre} {c.apellidoPaterno} - [{c.region || 'Sin Región'}]
                                  </option>
                              ))}
                            </select>
                        )}
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar border-b border-stone-100 pb-4">
                        {carrito.map(item => (
                            <div key={item.idProducto} className="flex justify-between items-start">
                              <div className="flex-1 pr-4">
                                <p className="font-bold text-zinc-800 text-sm">{item.nombre}</p>
                                <p className="text-xs text-zinc-500 mt-1">Cant: {item.cantidad}</p>
                              </div>
                              <p className="font-semibold text-zinc-900 text-sm">${item.cantidad * item.precioActual}</p>
                            </div>
                        ))}
                      </div>

                      <div className="pt-6 pb-6 mt-auto">
                        <div className="flex justify-between items-end mb-6">
                          <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Total a Pagar</span>
                          <span className="text-3xl font-black text-zinc-900 tracking-tighter">
                      ${carrito.reduce((acc, item) => acc + (item.precioActual * item.cantidad), 0)}
                    </span>
                        </div>
                        <button
                            onClick={procesarCompra}
                            className="w-full bg-zinc-950 text-white py-4 rounded-2xl font-bold text-sm hover:bg-zinc-800 hover:shadow-lg transition-all"
                        >
                          Confirmar Transacción
                        </button>
                      </div>
                    </div>
                )}
              </div>
            </div>
        )}
      </div>
  );
}