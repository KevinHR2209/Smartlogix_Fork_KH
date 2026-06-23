import { productosService } from '@/services/productosService';
import * as api from '@/services/api';
import { Producto } from '@/types';

jest.mock('@/services/api');

const mockApiGet = api.apiGet as jest.Mock;
const mockApiPost = api.apiPost as jest.Mock;
const mockApiPut = api.apiPut as jest.Mock;
const mockApiDelete = api.apiDelete as jest.Mock;

const productoMock: Producto = {
  idProducto: 1,
  sku: 'SKU-001',
  nombre: 'Producto A',
  descripcion: 'Descripción A',
  precioActual: 9990,
  pesoGramos: 500,
  dimensiones: '10x10x10',
  estado: 'DISPONIBLE',
  stockTotal: 100,
};

describe('productosService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getAll llama a apiGet con la ruta correcta', async () => {
    mockApiGet.mockResolvedValueOnce([productoMock]);

    const result = await productosService.getAll();

    expect(mockApiGet).toHaveBeenCalledWith('/api/productos');
    expect(result).toEqual([productoMock]);
  });

  it('create llama a apiPost con los datos del producto', async () => {
    const { idProducto, ...sinId } = productoMock;
    mockApiPost.mockResolvedValueOnce(productoMock);

    const result = await productosService.create(sinId);

    expect(mockApiPost).toHaveBeenCalledWith('/api/productos', sinId);
    expect(result.idProducto).toBe(1);
  });

  it('update llama a apiPut con id y datos correctos', async () => {
    mockApiPut.mockResolvedValueOnce(productoMock);

    await productosService.update(1, productoMock);

    expect(mockApiPut).toHaveBeenCalledWith('/api/productos/1', productoMock);
  });

  it('remove llama a apiDelete con el id correcto', async () => {
    mockApiDelete.mockResolvedValueOnce(undefined);

    await productosService.remove(1);

    expect(mockApiDelete).toHaveBeenCalledWith('/api/productos/1');
  });

  it('getAll propaga el error si apiGet falla', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Error de red'));

    await expect(productosService.getAll()).rejects.toThrow('Error de red');
  });
});