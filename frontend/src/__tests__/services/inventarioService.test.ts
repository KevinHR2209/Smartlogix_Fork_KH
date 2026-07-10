import { inventarioService } from "@/features/inventario/services/inventarioService";
import { apiGet, apiPost, apiPut } from "@/lib/api/client";

jest.mock("@/lib/api/client", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
}));

describe("inventarioService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("getById llama apiGet con el idInventario", async () => {
    (apiGet as jest.Mock).mockResolvedValue({});

    await inventarioService.getById(10);

    expect(apiGet).toHaveBeenCalledWith("/api/inventario/10");
  });

  it("getByProducto llama apiGet con el idProducto", async () => {
    (apiGet as jest.Mock).mockResolvedValue([]);

    await inventarioService.getByProducto(5);

    expect(apiGet).toHaveBeenCalledWith("/api/inventario/producto/5");
  });

  it("getByBodega llama apiGet con el idBodega", async () => {
    (apiGet as jest.Mock).mockResolvedValue([]);

    await inventarioService.getByBodega(3);

    expect(apiGet).toHaveBeenCalledWith("/api/inventario/bodega/3");
  });

  it("create llama apiPost con payload", async () => {
    const payload = {
      idBodega: 1,
      idProducto: 2,
      stockDisponible: 15,
      stockReservado: 4,
    };

    (apiPost as jest.Mock).mockResolvedValue(payload);

    await inventarioService.create(payload);

    expect(apiPost).toHaveBeenCalledWith("/api/inventario", payload);
  });

  it("ajustar llama apiPut con ruta correcta", async () => {
    (apiPut as jest.Mock).mockResolvedValue({});

    await inventarioService.ajustar(9, { cantidad: 3 });

    expect(apiPut).toHaveBeenCalledWith("/api/inventario/9/ajustar", {
      cantidad: 3,
    });
  });

  it("reservar llama apiPut con ruta correcta", async () => {
    (apiPut as jest.Mock).mockResolvedValue({});

    await inventarioService.reservar(9, { cantidad: 2 });

    expect(apiPut).toHaveBeenCalledWith("/api/inventario/9/reservar", {
      cantidad: 2,
    });
  });

  it("liberar llama apiPut con ruta correcta", async () => {
    (apiPut as jest.Mock).mockResolvedValue({});

    await inventarioService.liberar(9, { cantidad: 1 });

    expect(apiPut).toHaveBeenCalledWith("/api/inventario/9/liberar", {
      cantidad: 1,
    });
  });

  it("descontar llama apiPut con ruta correcta", async () => {
    (apiPut as jest.Mock).mockResolvedValue({});

    await inventarioService.descontar(9, { cantidad: 1 });

    expect(apiPut).toHaveBeenCalledWith("/api/inventario/9/descontar", {
      cantidad: 1,
    });
  });

  it("transferir llama apiPut con payload correcto", async () => {
    const payload = {
      idProducto: 7,
      idBodegaOrigen: 1,
      idBodegaDestino: 2,
      cantidad: 6,
    };

    (apiPut as jest.Mock).mockResolvedValue(undefined);

    await inventarioService.transferir(payload);

    expect(apiPut).toHaveBeenCalledWith("/api/inventario/transferir", payload);
  });
});