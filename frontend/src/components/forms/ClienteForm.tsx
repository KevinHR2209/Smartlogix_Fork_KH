'use client';
import { Cliente } from '@/types';

interface ClienteFormProps {
  cliente: Cliente;
  onChange: (cliente: Cliente) => void;
  onGuardar: (e: React.FormEvent) => void;
  onCancelar: () => void;
}

export function ClienteForm({ cliente, onChange, onGuardar, onCancelar }: ClienteFormProps) {
  return (
    <form onSubmit={onGuardar} className="bg-white p-6 rounded-2xl mb-8 border border-stone-200 shadow-sm">
      <h2 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-zinc-900" />
        Editando a: {cliente.nombre} {cliente.apellidoPaterno}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          className="border border-zinc-200 bg-stone-50 p-3 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
          value={cliente.nombre}
          onChange={e => onChange({ ...cliente, nombre: e.target.value })}
          placeholder="Nombre"
        />
        <input
          type="email"
          className="border border-zinc-200 bg-stone-50 p-3 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
          value={cliente.correo}
          onChange={e => onChange({ ...cliente, correo: e.target.value })}
          placeholder="Correo"
        />
        <input
          type="text"
          className="border border-zinc-200 bg-stone-50 p-3 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
          value={cliente.telefono}
          onChange={e => onChange({ ...cliente, telefono: e.target.value })}
          placeholder="Teléfono"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
        >
          Guardar Cambios
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="bg-stone-200 hover:bg-stone-300 text-zinc-800 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
