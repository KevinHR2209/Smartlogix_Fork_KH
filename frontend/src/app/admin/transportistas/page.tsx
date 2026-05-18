'use client';
import { useEffect, useState } from 'react';
import { Transportista } from '@/types';

export default function AdminTransportistas() {
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);

  useEffect(() => {
    cargarTransportistas();
  }, []);

  const cargarTransportistas = () => {
    fetch('http://localhost:8080/api/transportistas')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTransportistas(data);
      })
      .catch(err => console.error("Error", err));
  };

  const crearTransportistaDemo = async () => {
    const nuevo: Transportista = {
      nombreCompleto: "Camión Rápido " + Math.floor(Math.random() * 100),
      patenteVehiculo: "XX-YY-" + Math.floor(Math.random() * 99),
      telefonoContacto: "+56900000000",
      estado: "ACTIVO"
    };

    await fetch('http://localhost:8080/api/transportistas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevo)
    });
    cargarTransportistas();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Flota de Transportistas</h1>
          <p className="text-zinc-500 mt-1 text-sm">Administra los vehículos y conductores disponibles.</p>
        </div>
        <button onClick={crearTransportistaDemo} className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
          + Agregar Transportista
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-stone-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">ID</th>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">Conductor / Empresa</th>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">Patente</th>
              <th className="p-5 text-xs font-bold tracking-wider text-zinc-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {transportistas.map((t) => (
              <tr key={t.idTransportista} className="hover:bg-stone-50 transition-colors">
                <td className="p-5 text-sm font-bold text-zinc-400">#{t.idTransportista}</td>
                <td className="p-5 text-sm font-semibold text-zinc-800">{t.nombreCompleto}</td>
                <td className="p-5 text-sm tracking-wider font-mono bg-stone-100 w-fit px-3 py-1 rounded-md text-zinc-600">{t.patenteVehiculo}</td>
                <td className="p-5 text-sm">
                  <span className="px-3 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase border border-stone-200 bg-stone-100 text-zinc-600">
                    {t.estado}
                  </span>
                </td>
              </tr>
            ))}
            {transportistas.length === 0 && (
              <tr><td colSpan={4} className="p-10 text-center text-zinc-400 text-sm">No hay transportistas registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}