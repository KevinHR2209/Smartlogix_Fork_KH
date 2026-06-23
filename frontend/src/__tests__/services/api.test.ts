process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';

import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

// ─── apiGet ───────────────────────────────────────────────────────────────────

describe('apiGet', () => {
  it('retorna datos parseados cuando la respuesta es ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify([{ id: 1, nombre: 'Producto A' }]),
    });

    const result = await apiGet<{ id: number; nombre: string }[]>('/api/productos');

    expect(result).toEqual([{ id: 1, nombre: 'Producto A' }]);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/productos',
      undefined
    );
  });

  it('lanza error cuando la respuesta no es ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => 'Recurso no encontrado',
    });

    await expect(apiGet('/api/productos/999')).rejects.toThrow('Recurso no encontrado');
  });

  it('retorna undefined cuando el status es 204', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      text: async () => '',
    });

    const result = await apiGet('/api/productos/1');
    expect(result).toBeUndefined();
  });

  it('retorna undefined cuando el body está vacío', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => '',
    });

    const result = await apiGet('/api/productos');
    expect(result).toBeUndefined();
  });
});

// ─── apiPost ──────────────────────────────────────────────────────────────────

describe('apiPost', () => {
  it('envía POST con Content-Type JSON y body serializado', async () => {
    const nuevo = { nombre: 'Producto B', sku: 'SKU-001' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      text: async () => JSON.stringify({ idProducto: 2, ...nuevo }),
    });

    const result = await apiPost<{ idProducto: number }>('/api/productos', nuevo);

    expect(result.idProducto).toBe(2);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/productos',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo),
      })
    );
  });

  it('lanza error cuando el servidor responde 400', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => 'Datos inválidos',
    });

    await expect(apiPost('/api/productos', {})).rejects.toThrow('Datos inválidos');
  });
});

// ─── apiPut ───────────────────────────────────────────────────────────────────

describe('apiPut', () => {
  it('envía PUT con body correcto', async () => {
    const cambios = { nombre: 'Actualizado', sku: 'SKU-002' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ idProducto: 1, ...cambios }),
    });

    const result = await apiPut<{ idProducto: number }>('/api/productos/1', cambios);

    expect(result.idProducto).toBe(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/productos/1',
      expect.objectContaining({ method: 'PUT' })
    );
  });
});

// ─── apiDelete ────────────────────────────────────────────────────────────────

describe('apiDelete', () => {
  it('envía DELETE y retorna undefined en 204', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      text: async () => '',
    });

    const result = await apiDelete('/api/productos/1');
    expect(result).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/productos/1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('lanza error cuando el servidor responde 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => 'Producto no encontrado',
    });

    await expect(apiDelete('/api/productos/999')).rejects.toThrow('Producto no encontrado');
  });
});