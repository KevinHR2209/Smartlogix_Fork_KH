'use client';
import { useEffect, useState, useCallback } from 'react';
import { pedidosService } from '../services/pedidosService';
import { Pedido } from '../types/pedido';

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pedidosService.getAll();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { pedidos, loading, error, recargar: cargar };
}
