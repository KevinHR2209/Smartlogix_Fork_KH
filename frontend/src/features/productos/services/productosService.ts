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
    imagenUrl?: string;
}

interface PerfumeResponse {
    idPerfume: number;
    nombre: string;
    descripcion: string;
    estado: string;
    marca?: { idMarca: number; nombre: string; paisOrigen?: string };
    familiaOlfativa?: { idFamilia: number; nombre: string; descripcion?: string };
    presentaciones: PresentacionResponse[];
}

// Extrae "http://localhost:8080" de tus endpoints para hacer llamadas directas si no hay proxy
const getBaseUrl = () => {
    return endpoints.perfumes ? endpoints.perfumes.split('/api/')[0] : "http://localhost:8080";
};

function aplanarPerfume(perfume: PerfumeResponse): Producto[] {
    return (perfume.presentaciones ?? [])
        // Mantenemos tu lógica original: oculta los que están inactivos
        .filter((p) => p.activo && (perfume.estado ?? "").toUpperCase() === "ACTIVO")
        .map((p) => ({
            idProducto: p.idPresentacion,
            idPerfume: perfume.idPerfume, // Fundamental para poder editar
            sku: p.sku,
            nombre: `${perfume.nombre} ${p.volumenMl}ml`,
            descripcion: perfume.descripcion,
            precioActual: p.precioActual,
            pesoGramos: p.pesoGramos,
            dimensiones: p.tipoEnvase,
            estado: perfume.estado,
            stockTotal: 0, // Se llenará dinámicamente en getAll()
            imagenUrl: p.imagenUrl,
            volumenMl: p.volumenMl,
            marca: perfume.marca,
            familiaOlfativa: perfume.familiaOlfativa
        }));
}

export const productosService = {
    getAll: async (): Promise<Producto[]> => {
        const rutaPerfumes = endpoints.perfumes || "/api/perfumes";

        // 1. Obtenemos el catálogo
        const perfumes = await apiGet<PerfumeResponse[]>(rutaPerfumes);
        const productosAplanados = perfumes.flatMap(aplanarPerfume);

        // 2. Buscamos el stock real usando tu apiGet para mantener tokens y configuración
        const productosConStock = await Promise.all(
            productosAplanados.map(async (producto) => {
                try {
                    // Reemplaza inteligentemente la ruta base para ir a inventario
                    const inventarioUrl = rutaPerfumes.replace('/perfumes', `/inventario/presentacion/${producto.idProducto}`);

                    const inventarios = await apiGet<any[]>(inventarioUrl);

                    // Suma todo el stock disponible en las distintas bodegas
                    const stockReal = inventarios.reduce((sum: number, inv: any) => sum + (inv.stockDisponible || 0), 0);

                    return { ...producto, stockTotal: stockReal };
                } catch (error) {
                    console.error(`No hay inventario registrado para ${producto.sku}. Asumiendo 0.`);
                    return { ...producto, stockTotal: 0 };
                }
            })
        );

        return productosConStock;
    },

    getById: async (id: number) => {
        // Al usar getAll, ya incluye el stock real calculado
        const productos = await productosService.getAll();
        return productos.find((item) => item.idProducto === id) ?? null;
    },

    create: async (productoData: any): Promise<void> => {
        const baseUrl = getBaseUrl();

        // 1. Crear Perfume Base
        const perfumeRes = await fetch(`${baseUrl}/api/perfumes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idMarca: productoData.marcaId ? Number(productoData.marcaId) : 1,
                idFamilia: productoData.familiaId ? Number(productoData.familiaId) : null,
                nombre: productoData.nombre,
                descripcion: productoData.descripcion,
                estado: productoData.estado || "ACTIVO"
            })
        });
        if (!perfumeRes.ok) throw new Error("Error al crear perfume en la base de datos.");
        const perfumeCreado = await perfumeRes.json();

        // 2. Crear Presentación (SKU, Foto, Precio)
        const presRes = await fetch(`${baseUrl}/api/presentaciones`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idPerfume: perfumeCreado.idPerfume,
                sku: productoData.sku,
                volumenMl: productoData.volumenMl || 100,
                tipoEnvase: productoData.dimensiones || "spray",
                precioActual: productoData.precioActual,
                pesoGramos: productoData.pesoGramos || 0,
                imagenUrl: productoData.imagenUrl,
                activo: true
            })
        });
        if (!presRes.ok) throw new Error("Error al crear la presentación.");
    },

    update: async (idPresentacion: number, productoData: any): Promise<void> => {
        const baseUrl = getBaseUrl();

        // 1. Actualizar Perfume
        if (productoData.idPerfume) {
            const perfRes = await fetch(`${baseUrl}/api/perfumes/${productoData.idPerfume}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idMarca: productoData.marcaId || productoData.marca?.idMarca || 1,
                    idFamilia: productoData.familiaId || productoData.familiaOlfativa?.idFamilia || null,
                    nombre: productoData.nombre,
                    descripcion: productoData.descripcion,
                    estado: productoData.estado || "ACTIVO"
                })
            });
            if (!perfRes.ok) throw new Error("Error al actualizar el perfume base.");
        }

        // 2. Actualizar Presentación
        const presRes = await fetch(`${baseUrl}/api/presentaciones/${idPresentacion}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idPerfume: productoData.idPerfume,
                sku: productoData.sku,
                volumenMl: productoData.volumenMl || 100,
                tipoEnvase: productoData.dimensiones || "spray",
                precioActual: productoData.precioActual,
                pesoGramos: productoData.pesoGramos || 0,
                imagenUrl: productoData.imagenUrl,
                // Si el estado es "INACTIVO", apagamos la presentación también
                activo: (productoData.estado || "ACTIVO").toUpperCase() === "ACTIVO"
            })
        });
        if (!presRes.ok) throw new Error("Error al actualizar la presentación.");
    },

    remove: async (idPresentacion: number): Promise<void> => {
        // === SOFT DELETE EXACTO COMO PEDISTE ===
        // 1. Buscamos la data actual del producto
        const current = await productosService.getById(idPresentacion);
        if (!current) throw new Error("Producto no encontrado para eliminar.");

        // 2. Hacemos un "update" cambiando su estado a "INACTIVO"
        await productosService.update(idPresentacion, {
            ...current,
            estado: "INACTIVO"
        });
        // Al quedar en INACTIVO, la función 'aplanarPerfume' lo filtrará automáticamente
        // y desaparecerá del catálogo público, sin borrarse jamás de la BD.
    }
};