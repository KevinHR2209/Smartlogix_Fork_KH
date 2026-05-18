'use client';
import { useEffect, useState } from 'react';
import { Cliente } from '@/types';

export default function AdminClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editando, setEditando] = useState<Cliente | null>(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = () => {
    fetch('http://localhost:8080/api/clientes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setClientes(data);
      })
      .catch(err => console.error("Error cargando clientes:", err));
  };

  const crearClientePrueba = async () => {
    const randomNum = Math.floor(Math.random() * 10000);
    const nuevo: Cliente = {
      rut: `${randomNum}1234-5`,
      nombre: "Juan " + randomNum,
      apellidoPaterno: "Pérez",
      apellidoMaterno: "González",
      correo: `juan${randomNum}@correo.com`,
      telefono: "+56912345678"
    };

    await fetch('http://localhost:8080/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevo)
    });
    cargarClientes();
  };

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;

    await fetch(`http://localhost:8080/api/clientes/${editando.idCliente}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editando)
    });
    setEditando(null);
    cargarClientes();
  };

  const eliminarCliente = async (id?: number) => {
    if (!id) return;
    await fetch(`http://localhost:8080/api/clientes/${id}`, { method: 'DELETE' });
    cargarClientes();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Directorio de Clientes</h1>
          <p className="text-zinc-500 mt-1 text-sm">Gestiona la información de los compradores.</p>
        </div>
        <button onClick={crearClientePrueba} className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
          + Crear Cliente de Prueba
        </button>
      </div>

      {editando && (
        <form onSubmit={guardarEdicion} className="bg-white p-6 rounded-2xl mb-8 border border-stone-200 shadow-sm">
          <h2 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-900"></span>
            Editando a: {editando.nombre} {editando.apellidoPaterno}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input type="text" className="border border-zinc-200 bg-stone-50 p-3 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none" value={editando.nombre} onChange={e => setEditando({...editando, nombre: e.target.value})} placeholder="Nombre" />
            <input type="text" className="border border-zinc-200 bg-stone-50 p-3 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none" value={editando.correo} onChange={e => setEditando({...editando, correo: e.target.value})} placeholder="Correo" />
            <input type="text" className="border border-zinc-200 bg-stone-50 p-3 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none" value={editando.telefono} onChange={e => setEditando({...editando, telefono: e.target.value})} placeholder="Teléfono" />
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
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">ID</th>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">Nombre</th>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">Correo</th>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">Teléfono</th>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {clientes.map((c) => (
              <tr key={c.idCliente} className="hover:bg-stone-50 transition-colors">
                <td className="p-5 text-sm font-bold text-zinc-400">#{c.idCliente}</td>
                <td className="p-5 text-sm font-semibold text-zinc-800">{c.nombre} {c.apellidoPaterno}</td>
                <td className="p-5 text-sm text-zinc-500">{c.correo}</td>
                <td className="p-5 text-sm text-zinc-500">{c.telefono}</td>
                <td className="p-5 text-sm text-right space-x-4">
                  <button onClick={() => setEditando(c)} className="text-zinc-400 hover:text-zinc-900 font-semibold transition-colors">Editar</button>
                  <button onClick={() => eliminarCliente(c.idCliente)} className="text-red-400 hover:text-red-600 font-semibold transition-colors">Eliminar</button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr><td colSpan={5} className="p-10 text-center text-zinc-400 text-sm">No hay clientes registrados en la base de datos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}