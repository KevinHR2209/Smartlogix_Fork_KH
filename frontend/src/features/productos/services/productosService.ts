import { apiGet } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { Producto } from "../types/producto";

// Interfaces de lo que nos devuelve el backend de Perfumes
interface PresentacionResponse {
    idPresentacion: number;
    sku: string;
    volumenMl: number;
    tipoEnvase: string;
    precioActual: number;
    pesoGramos: number;
    activo: boolean;
    imagenUrl?: string;
}

interface MarcaResponse {
    idMarca: number;
    nombre: string;
    paisOrigen?: string;
}

interface FamiliaOlfativaResponse {
    idFamilia: number;
    nombre: string;
    descripcion?: string;
}

interface PerfumeResponse {
    idPerfume: number;
    nombre: string;
    descripcion: string;
    estado: string;
    marca?: MarcaResponse;
    familiaOlfativa?: FamiliaOlfativaResponse;
    presentaciones: PresentacionResponse[];
}

// Interfaz de lo que nos devuelve el backend de Inventario
interface InventarioResponse {
    stockDisponible: number;
    // (Ignoramos el resto de campos como stockReservado o idBodega porque para el catálogo solo nos interesa el disponible)
}

function aplanarPerfume(perfume: PerfumeResponse): Producto[] {
    return (perfume.presentaciones ?? [])
        .filter((p) => p.activo && (perfume.estado ?? "").toUpperCase() === "ACTIVO")
        .map((p) => ({
            idProducto: p.idPresentacion, // Usamos idPresentacion como ID principal en el frontend
            sku: p.sku,
            nombre: `${perfume.nombre} ${p.volumenMl}ml`,
            descripcion: perfume.descripcion,
            precioActual: p.precioActual,
            pesoGramos: p.pesoGramos,
            dimensiones: p.tipoEnvase,
            estado: perfume.estado,
            stockTotal: 0, // Lo dejaremos en 0 temporalmente, se llena en getAll
            imagenUrl: p.imagenUrl,
            volumenMl: p.volumenMl,
            marca: perfume.marca,
            familiaOlfativa: perfume.familiaOlfativa
        }));
}

export const productosService = {
    getAll: async (): Promise<Producto[]> => {
        // 1. Traemos el catálogo base
        // Si tienes "endpoints.perfumes" úsalo, sino asumo la ruta "/api/perfumes"
        const rutaPerfumes = endpoints.perfumes || "/api/perfumes";
        const perfumes = await apiGet<PerfumeResponse[]>(rutaPerfumes);
        const productosAplanados = perfumes.flatMap(aplanarPerfume);

        // 2. Consultamos el stock real al microservicio de inventario
        const productosConStock = await Promise.all(
            productosAplanados.map(async (producto) => {
                try {
                    // Ajusta esta ruta si en tu API Gateway el endpoint se llama distinto
                    const rutaInventario = `/api/inventario/presentacion/${producto.idProducto}`;
                    const inventarios = await apiGet<InventarioResponse[]>(rutaInventario);

                    // Como puede estar en varias bodegas, sumamos el stock disponible de todas
                    const stockReal = inventarios.reduce((sum, inv) => sum + (inv.stockDisponible || 0), 0);

                    return { ...producto, stockTotal: stockReal };
                } catch (error) {
                    console.error(`Error obteniendo stock para ${producto.sku}`, error);
                    // Si el inventario falla, devolvemos 0 por seguridad para no romper la vista
                    return { ...producto, stockTotal: 0 };
                }
            })
        );

        return productosConStock;
    },

    getById: async (id: number) => {
        // Como esto llama a getAll, ya vendrá con el stock real resuelto
        const productos = await productosService.getAll();
        return productos.find((item) => item.idProducto === id) ?? null;
    },

    create: async (_producto: Omit<Producto, "idProducto">): Promise<Producto> => {
        throw new Error("No implementado");
    },
    update: async (_id: number, _producto: Producto): Promise<Producto> => {
        throw new Error("No implementado");
    },
    remove: async (_id: number): Promise<void> => {
        throw new Error("No implementado");
    },
};