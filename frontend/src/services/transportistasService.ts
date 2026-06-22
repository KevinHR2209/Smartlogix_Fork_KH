import { apiGet, apiPost } from './api';
import { Transportista } from '@/types';

export const transportistasService = {
  getAll: () => apiGet<Transportista[]>('/api/transportistas'),
  create: (transportista: Omit<Transportista, 'idTransportista'>) =>
    apiPost<Transportista>('/api/transportistas', transportista),
};
