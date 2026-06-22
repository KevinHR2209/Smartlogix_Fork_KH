import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { Producto } from '@/types';

export const productosService = {
  getAll: () => apiGet<Producto[]>('/api/productos'),
  create: (producto: Omit<Producto, 'idProducto'>) =>
    apiPost<Producto>('/api/productos', producto),
  update: (id: number, producto: Producto) =>
    apiPut<Producto>(`/api/productos/${id}`, producto),
  remove: (id: number) => apiDelete(`/api/productos/${id}`),
};
