import { renderHook, act, waitFor } from '@testing-library/react';
import { useClientes } from '@/hooks/useClientes';
import { clientesService } from '@/services/clientesService';
import { Cliente } from '@/types';

jest.mock('@/services/clientesService');

const mockGetAll = clientesService.getAll as jest.Mock;

const clientesMock: Cliente[] = [
  {
    idCliente: 1,
    rut: '12345678-9',
    nombre: 'Carlos',
    apellidoPaterno: 'González',
    apellidoMaterno: 'Pérez',
    correo: 'carlos@email.com',
    telefono: '+56912345678',
    region: 'Valparaíso',
  },
];

describe('useClientes', () => {
  beforeEach(() => jest.clearAllMocks());

  it('inicia con loading=true y lista vacía', () => {
    mockGetAll.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useClientes());

    expect(result.current.loading).toBe(true);
    expect(result.current.clientes).toEqual([]);
  });

  it('carga los clientes correctamente', async () => {
    mockGetAll.mockResolvedValueOnce(clientesMock);

    const { result } = renderHook(() => useClientes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.clientes).toEqual(clientesMock);
    expect(result.current.error).toBeNull();
  });

  it('captura el error correctamente', async () => {
    mockGetAll.mockRejectedValueOnce(new Error('Fallo al cargar'));

    const { result } = renderHook(() => useClientes());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Fallo al cargar');
    expect(result.current.clientes).toEqual([]);
  });

  it('recargar vuelve a llamar al servicio', async () => {
    mockGetAll
      .mockResolvedValueOnce(clientesMock)
      .mockResolvedValueOnce([]);

    const { result } = renderHook(() => useClientes());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { result.current.recargar(); });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.clientes).toEqual([]);
    expect(mockGetAll).toHaveBeenCalledTimes(2);
  });
});