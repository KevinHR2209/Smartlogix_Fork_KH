'use client';
import { useState } from 'react';
import { useClientes } from '@/hooks/useClientes';
import { clientesService } from '@/services/clientesService';
import { PageHeader } from '@/components/ui/PageHeader';
import { AdminTable } from '@/components/ui/AdminTable';
import { ClienteForm } from '@/components/forms/ClienteForm';
import { Cliente } from '@/types';
import { randomInt } from '@/lib/utils';

export default function AdminClientes() {
  const { clientes, recargar } = useClientes();
  const [editando, setEditando] = useState<Cliente | null>(null);

  const handleCrear = async () => {
    const num = randomInt(1000, 9999);
    await clientesService.create({
      rut: `${num}1234-5`,
      nombre: `Juan ${num}`,
      apellidoPaterno: 'Pérez',
      apellidoMaterno: 'González',
      correo: `juan${num}@correo.com`,
      telefono: '+56912345678',
    });
    recargar();
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando?.idCliente) return;
    await clientesService.update(editando.idCliente, editando);
    setEditando(null);
    recargar();
  };

  const handleEliminar = async (id: number) => {
    await clientesService.remove(id);
    recargar();
  };

  const columns = [
    {
      header: 'ID',
      accessor: (c: Cliente) => (
        <span className="font-bold text-zinc-400">#{c.idCliente}</span>
      ),
    },
    {
      header: 'Nombre',
      accessor: (c: Cliente) => (
        <span className="font-semibold text-zinc-800">
          {c.nombre} {c.apellidoPaterno}
        </span>
      ),
    },
    {
      header: 'Correo',
      accessor: (c: Cliente) => <span className="text-zinc-500">{c.correo}</span>,
    },
    {
      header: 'Teléfono',
      accessor: (c: Cliente) => <span className="text-zinc-500">{c.telefono}</span>,
    },
    {
      header: 'Acciones',
      className: 'text-right',
      accessor: (c: Cliente) => (
        <span className="space-x-4">
          <button
            onClick={() => setEditando(c)}
            className="text-zinc-400 hover:text-zinc-900 font-semibold transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => handleEliminar(c.idCliente!)}
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
        titulo="Directorio de Clientes"
        subtitulo="Gestiona la información de los compradores."
        labelAccion="+ Crear Cliente de Prueba"
        onAccion={handleCrear}
      />
      {editando && (
        <ClienteForm
          cliente={editando}
          onChange={setEditando}
          onGuardar={handleGuardar}
          onCancelar={() => setEditando(null)}
        />
      )}
      <AdminTable
        columns={columns}
        data={clientes}
        keyExtractor={c => c.idCliente!}
        emptyMessage="No hay clientes registrados en la base de datos."
      />
    </div>
  );
}
