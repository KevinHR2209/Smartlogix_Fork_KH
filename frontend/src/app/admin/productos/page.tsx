'use client';
import { useEffect, useState } from 'react';
import { Producto } from '@/types';

export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [editando, setEditando] = useState<Producto | null>(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = () => {
    fetch('http://localhost:8080/api/productos')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setProductos(data);
      })
      .catch(err => console.error("Error", err));
  };

  const crearProductoDemo = async () => {
    const nuevo: Producto = {
      sku: `SKU-${Math.floor(Math.random() * 10000)}`,
      nombre: "Producto Demo " + Math.floor(Math.random() * 100),
      descripcion: "Descripción generada automáticamente.",
      precioActual: 15000,
      pesoGramos: 500,
      dimensiones: "10x10x10",
      estado: "ACTIVO"
    };

    await fetch('http://localhost:8080/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevo)
    });
    cargarProductos();
  };

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;

    await fetch(`http://localhost:8080/api/productos/${editando.idProducto}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editando)
    });
    setEditando(null);
    cargarProductos();
  };

  const eliminarProducto = async (id?: number) => {
    if (!id) return;
    await fetch(`http://localhost:8080/api/productos/${id}`, { method: 'DELETE' });
    cargarProductos();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Catálogo de Inventario</h1>
          <p className="text-zinc-500 mt-1 text-sm">Administra los productos disponibles en la tienda.</p>
        </div>
        <button onClick={crearProductoDemo} className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
          + Crear Producto Rápido
        </button>
      </div>

      {editando && (
        <form onSubmit={guardarEdicion} className="bg-white p-6 rounded-2xl mb-8 border border-stone-200 shadow-sm">
          <h2 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-900"></span>
            Editando: {editando.nombre}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input 
              type="text" 
              className="border border-zinc-200 bg-stone-50 p-3 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none" 
              value={editando.nombre} 
              onChange={e => setEditando({...editando, nombre: e.target.value})} 
              placeholder="Nombre del Producto"
            />
            <input 
              type="number" 
              className="border border-zinc-200 bg-stone-50 p-3 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none" 
              value={editando.precioActual} 
              onChange={e => setEditando({...editando, precioActual: parseInt(e.target.value)})} 
              placeholder="Precio"
            />
            <textarea 
              className="border border-zinc-200 bg-stone-50 p-3 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none md:col-span-2" 
              value={editando.descripcion} 
              onChange={e => setEditando({...editando, descripcion: e.target.value})} 
              placeholder="Descripción del producto"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">Guardar Cambios</button>
            <button type="button" onClick={() => setEditando(null)} className="bg-stone-200 hover:bg-stone-300 text-zinc-800 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white shadow-sm rounded-2xl border border-stone-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">SKU</th>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">Nombre</th>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">Precio</th>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {productos.map((p) => (
              <tr key={p.idProducto} className="hover:bg-stone-50 transition-colors">
                <td className="p-5 text-sm font-bold text-zinc-400">{p.sku}</td>
                <td className="p-5 text-sm font-semibold text-zinc-800">{p.nombre}</td>
                <td className="p-5 text-sm font-bold text-zinc-900">${p.precioActual}</td>
                <td className="p-5 text-sm text-right space-x-4">
                  <button onClick={() => setEditando(p)} className="text-zinc-400 hover:text-zinc-900 font-semibold transition-colors">Editar</button>
                  <button onClick={() => eliminarProducto(p.idProducto)} className="text-red-400 hover:text-red-600 font-semibold transition-colors">Eliminar</button>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr><td colSpan={4} className="p-10 text-center text-zinc-400 text-sm">No hay productos en el inventario.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}