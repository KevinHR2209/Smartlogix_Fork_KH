import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { Cliente } from '@/types';

export const clientesService = {
  getAll: () => apiGet<Cliente[]>('/api/clientes'),
  create: (cliente: Omit<Cliente, 'idCliente'>) =>
    apiPost<Cliente>('/api/clientes', cliente),
  update: (id: number, cliente: Cliente) =>
    apiPut<Cliente>(`/api/clientes/${id}`, cliente),
  remove: (id: number) => apiDelete(`/api/clientes/${id}`),
};
