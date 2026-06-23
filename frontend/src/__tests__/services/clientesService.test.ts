import { clientesService } from '@/services/clientesService';
import * as api from '@/services/api';
import { Cliente } from '@/types';

jest.mock('@/services/api');

const mockApiGet = api.apiGet as jest.Mock;
const mockApiPost = api.apiPost as jest.Mock;
const mockApiPut = api.apiPut as jest.Mock;
const mockApiDelete = api.apiDelete as jest.Mock;

const clienteMock: Cliente = {
  idCliente: 1,
  rut: '12345678-9',
  nombre: 'Carlos',
  apellidoPaterno: 'González',
  apellidoMaterno: 'Pérez',
  correo: 'carlos@email.com',
  telefono: '+56912345678',
  region: 'Valparaíso',
};

describe('clientesService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getAll llama a apiGet con la ruta correcta', async () => {
    mockApiGet.mockResolvedValueOnce([clienteMock]);

    const result = await clientesService.getAll();

    expect(mockApiGet).toHaveBeenCalledWith('/api/clientes');
    expect(result).toHaveLength(1);
    expect(result[0].rut).toBe('12345678-9');
  });

  it('getById llama a apiGet con el id correcto', async () => {
    mockApiGet.mockResolvedValueOnce(clienteMock);

    const result = await clientesService.getById(1);

    expect(mockApiGet).toHaveBeenCalledWith('/api/clientes/1');
    expect(result.nombre).toBe('Carlos');
  });

  it('create llama a apiPost con los datos del cliente', async () => {
    mockApiPost.mockResolvedValueOnce(clienteMock);

    await clientesService.create(clienteMock);

    expect(mockApiPost).toHaveBeenCalledWith('/api/clientes', clienteMock);
  });

  it('update llama a apiPut con id y datos correctos', async () => {
    mockApiPut.mockResolvedValueOnce(clienteMock);

    await clientesService.update(1, clienteMock);

    expect(mockApiPut).toHaveBeenCalledWith('/api/clientes/1', clienteMock);
  });

  it('remove llama a apiDelete con el id correcto', async () => {
    mockApiDelete.mockResolvedValueOnce(undefined);

    await clientesService.remove(1);

    expect(mockApiDelete).toHaveBeenCalledWith('/api/clientes/1');
  });
});