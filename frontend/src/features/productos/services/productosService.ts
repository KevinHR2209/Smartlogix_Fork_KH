import { apiGet } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Producto } from "../types/producto";

interface PresentacionResponse {
  idPresentacion: number;
  sku: string;
  volumenMl: number;
  tipoEnvase: string;
  precioActual: number;
  pesoGramos: number;
  activo: boolean;
}

interface PerfumeResponse {
  idPerfume: number;
  nombre: string;
  descripcion: string;
  estado: string;
  presentaciones: PresentacionResponse[];
}

// El backend real expone /api/perfumes (cada perfume trae sus presentaciones
// anidadas) en vez del antiguo /api/productos plano. Cada presentacion se
// aplana a un "Producto" para no tener que tocar el resto de la UI (carrito,
// grillas, etc), que ya asume esa forma de dato.
//
// Simplificacion deliberada: no se llama a /api/inventario por presentacion
// para traer el stock real (serian N llamadas extra por cada presentacion).
// stockTotal queda fijo en un valor > 0 para que el catalogo se vea
// "disponible" en la demo. Si se necesita el stock real, hay que agregar esa
// llamada aqui.
function aplanarPerfume(perfume: PerfumeResponse): Producto[] {
  return (perfume.presentaciones ?? [])
    .filter((p) => p.activo && (perfume.estado ?? "").toUpperCase() === "ACTIVO")
    .map((p) => ({
      idProducto: p.idPresentacion,
      sku: p.sku,
      nombre: `${perfume.nombre} ${p.volumenMl}ml`,
      descripcion: perfume.descripcion,
      precioActual: p.precioActual,
      pesoGramos: p.pesoGramos,
      dimensiones: p.tipoEnvase,
      estado: perfume.estado,
      stockTotal: 999,
    }));
}

export const productosService = {
  getAll: async (): Promise<Producto[]> => {
    const perfumes = await apiGet<PerfumeResponse[]>(endpoints.perfumes);
    return perfumes.flatMap(aplanarPerfume);
  },

  getById: async (id: number) => {
    const productos = await productosService.getAll();
    return productos.find((item) => item.idProducto === id) ?? null;
  },

  // TODO: el admin de productos (crear/editar/eliminar) todavia asume el
  // viejo modelo plano de "producto". El backend real ahora separa
  // perfume (nombre, marca, familia olfativa) de presentacion (sku, precio,
  // volumen), asi que estos 3 metodos necesitan repensarse (probablemente
  // 2 formularios separados) en vez de una migracion 1 a 1. Fuera de
  // alcance de esta sesion — no se toco el admin, solo se evito que
  // rompiera la compilacion.
  create: async (_producto: Omit<Producto, "idProducto">): Promise<Producto> => {
    throw new Error(
      "Crear producto no esta implementado con el nuevo modelo perfume/presentacion todavia"
    );
  },
  update: async (_id: number, _producto: Producto): Promise<Producto> => {
    throw new Error(
      "Editar producto no esta implementado con el nuevo modelo perfume/presentacion todavia"
    );
  },
  remove: async (_id: number): Promise<void> => {
    throw new Error(
      "Eliminar producto no esta implementado con el nuevo modelo perfume/presentacion todavia"
    );
  },
};