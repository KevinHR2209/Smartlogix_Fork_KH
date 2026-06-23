import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductos } from '@/hooks/useProductos';
import { productosService } from '@/services/productosService';
import { Producto } from '@/types';

jest.mock('@/services/productosService');

const mockGetAll = productosService.getAll as jest.Mock;

const productosMock: Producto[] = [
  {
    idProducto: 1,
    sku: 'SKU-001',
    nombre: 'Producto A',
    descripcion: 'Desc A',
    precioActual: 9990,
    pesoGramos: 500,
    dimensiones: '10x10x10',
    estado: 'DISPONIBLE',
    stockTotal: 50,
  },
  {
    idProducto: 2,
    sku: 'SKU-002',
    nombre: 'Producto B',
    descripcion: 'Desc B',
    precioActual: 19990,
    pesoGramos: 1000,
    dimensiones: '20x20x20',
    estado: 'DISPONIBLE',
    stockTotal: 20,
  },
];

describe('useProductos', () => {
  beforeEach(() => jest.clearAllMocks());

  it('inicia con loading=true y productos vacíos', () => {
    mockGetAll.mockReturnValueOnce(new Promise(() => {})); // promesa que nunca resuelve

    const { result } = renderHook(() => useProductos());

    expect(result.current.loading).toBe(true);
    expect(result.current.productos).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('carga los productos correctamente', async () => {
    mockGetAll.mockResolvedValueOnce(productosMock);

    const { result } = renderHook(() => useProductos());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.productos).toEqual(productosMock);
    expect(result.current.error).toBeNull();
  });

  it('setea error cuando el servicio falla', async () => {
    mockGetAll.mockRejectedValueOnce(new Error('Error de red'));

    const { result } = renderHook(() => useProductos());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error de red');
    expect(result.current.productos).toEqual([]);
  });

  it('error desconocido muestra mensaje genérico', async () => {
    mockGetAll.mockRejectedValueOnce('algo que no es Error');

    const { result } = renderHook(() => useProductos());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error desconocido');
  });

  it('recargar vuelve a llamar al servicio', async () => {
    mockGetAll
      .mockResolvedValueOnce(productosMock)
      .mockResolvedValueOnce([productosMock[0]]);

    const { result } = renderHook(() => useProductos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.productos).toHaveLength(2);

    await act(async () => {
      result.current.recargar();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.productos).toHaveLength(1);
    expect(mockGetAll).toHaveBeenCalledTimes(2);
  });

  it('loading vuelve a true durante la recarga', async () => {
    let resolveFn!: (v: Producto[]) => void;
    mockGetAll.mockResolvedValueOnce(productosMock);
    mockGetAll.mockReturnValueOnce(new Promise(r => { resolveFn = r; }));

    const { result } = renderHook(() => useProductos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.recargar(); });

    expect(result.current.loading).toBe(true);

    await act(async () => { resolveFn([]); });
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});