import { bodegasService } from "@/features/bodegas/services/bodegasService";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";

jest.mock("@/lib/api/client", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

describe("bodegasService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("getAll llama apiGet con /api/bodegas", async () => {
    (apiGet as jest.Mock).mockResolvedValue([]);

    await bodegasService.getAll();

    expect(apiGet).toHaveBeenCalledWith("/api/bodegas");
  });

  it("getById filtra la bodega correcta", async () => {
    (apiGet as jest.Mock).mockResolvedValue([
      { idBodega: 1, nombre: "Centro", direccionFisica: "A" },
      { idBodega: 2, nombre: "Norte", direccionFisica: "B" },
    ]);

    const result = await bodegasService.getById(2);

    expect(apiGet).toHaveBeenCalledWith("/api/bodegas");
    expect(result).toEqual({
      idBodega: 2,
      nombre: "Norte",
      direccionFisica: "B",
    });
  });

  it("create llama apiPost con el payload", async () => {
    const payload = { nombre: "Centro", direccionFisica: "Av. 123" };
    (apiPost as jest.Mock).mockResolvedValue(payload);

    await bodegasService.create(payload);

    expect(apiPost).toHaveBeenCalledWith("/api/bodegas", payload);
  });

  it("update llama apiPut con el id", async () => {
    const payload = { idBodega: 1, nombre: "Centro", direccionFisica: "Av. 123" };
    (apiPut as jest.Mock).mockResolvedValue(payload);

    await bodegasService.update(1, payload);

    expect(apiPut).toHaveBeenCalledWith("/api/bodegas/1", payload);
  });

  it("remove llama apiDelete con el id", async () => {
    (apiDelete as jest.Mock).mockResolvedValue(undefined);

    await bodegasService.remove(1);

    expect(apiDelete).toHaveBeenCalledWith("/api/bodegas/1");
  });
});