'use client';
import { useEffect, useState, useCallback } from 'react';
import { transportistasService } from '@/services/transportistasService';
import { Transportista } from '@/types';

export function useTransportistas() {
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transportistasService.getAll();
      setTransportistas(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { transportistas, loading, error, recargar: cargar };
}
