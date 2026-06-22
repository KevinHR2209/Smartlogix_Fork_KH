'use client';
import { useTransportistas } from '@/hooks/useTransportistas';
import { transportistasService } from '@/services/transportistasService';
import { PageHeader } from '@/components/ui/PageHeader';
import { AdminTable } from '@/components/ui/AdminTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Transportista } from '@/types';
import { randomInt } from '@/lib/utils';

export default function AdminTransportistas() {
  const { transportistas, recargar } = useTransportistas();

  const handleCrear = async () => {
    await transportistasService.create({
      nombreCompleto: `Camión Rápido ${randomInt(1, 100)}`,
      patenteVehiculo: `XX-YY-${randomInt(10, 99)}`,
      telefonoContacto: '+56900000000',
      estado: 'DISPONIBLE',
    });
    recargar();
  };

  const columns = [
    {
      header: 'ID',
      accessor: (t: Transportista) => (
        <span className="font-bold text-zinc-400">#{t.idTransportista}</span>
      ),
    },
    {
      header: 'Conductor / Empresa',
      accessor: (t: Transportista) => (
        <span className="font-semibold text-zinc-800">{t.nombreCompleto}</span>
      ),
    },
    {
      header: 'Patente',
      accessor: (t: Transportista) => (
        <span className="tracking-wider font-mono bg-stone-100 px-3 py-1 rounded-md text-zinc-600">
          {t.patenteVehiculo}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessor: (t: Transportista) => <StatusBadge estado={t.estado} />,
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <PageHeader
        titulo="Flota de Transportistas"
        subtitulo="Administra los vehículos y conductores disponibles."
        labelAccion="+ Agregar Transportista"
        onAccion={handleCrear}
      />
      <AdminTable
        columns={columns}
        data={transportistas}
        keyExtractor={t => t.idTransportista!}
        emptyMessage="No hay transportistas registrados."
      />
    </div>
  );
}
