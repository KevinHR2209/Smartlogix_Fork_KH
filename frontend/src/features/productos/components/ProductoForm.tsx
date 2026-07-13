"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Producto } from "@/features/productos/types/producto";
// import { productosService } from "@/features/productos/services/productosService";

export function ProductoForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre: "",
        sku: "",
        descripcion: "",
        precioActual: "",
        volumenMl: "",
        pesoGramos: "",
        tipoEnvase: "spray",
        marcaId: "",
        familiaId: "",
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            let uploadedImageUrl = "";

            // 1. SUBIDA DE IMAGEN AL BUCKET VÍA MICROSERVICIO
            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append("archivo", imageFile); // "archivo" debe coincidir con el @RequestParam en Java

                // Asegúrate de que esta ruta apunte a tu API Gateway o al microservicio correcto
                const uploadRes = await fetch("/api/archivos/subir", {
                    method: "POST",
                    body: uploadData
                });

                if (!uploadRes.ok) {
                    throw new Error("Error al subir la imagen al servidor.");
                }

                // El backend devuelve la URL como texto plano en nuestro ejemplo
                uploadedImageUrl = await uploadRes.text();
            }

            // 2. CREACIÓN DEL PRODUCTO EN LA BASE DE DATOS
            const nuevoProducto = {
                nombre: formData.nombre,
                sku: formData.sku,
                descripcion: formData.descripcion,
                precioActual: Number(formData.precioActual),
                volumenMl: Number(formData.volumenMl),
                pesoGramos: Number(formData.pesoGramos),
                dimensiones: formData.tipoEnvase,
                estado: "activo",
                imagenUrl: uploadedImageUrl, // Aquí va la URL real del bucket
                // marcaId y familiaId se envían según lo que espere tu backend
            };

            // Descomenta esto cuando actualices tu productosService.create
            // await productosService.create(nuevoProducto);

            // 3. REDIRECCIÓN
            // router.push("/admin/productos");
            alert("Producto creado exitosamente con la imagen: " + uploadedImageUrl);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Hubo un error al crear el producto.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white border border-gray-200 p-6 md:p-10 text-black">
            <div className="mb-8 border-b border-gray-100 pb-6">
                <h2 className="text-2xl font-bold uppercase tracking-tighter text-black">Crear Nuevo Perfume</h2>
                <p className="text-xs uppercase tracking-widest text-gray-500 mt-2 font-semibold">
                    Ingresa los datos y sube la imagen de la presentación.
                </p>
            </div>

            {error && (
                <div className="mb-6 border border-red-200 bg-red-50 p-4 text-xs uppercase tracking-widest font-bold text-red-600">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* COLUMNA IZQUIERDA: DATOS GENERALES */}
                <div className="flex flex-col space-y-5">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">Nombre del Perfume</label>
                        <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm rounded-none focus:outline-none focus:border-black transition-colors" placeholder="Ej: Sauvage EDP" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">SKU</label>
                            <input required type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm rounded-none focus:outline-none focus:border-black transition-colors" placeholder="Ej: DIO-SAU-100" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">Precio ($)</label>
                            <input required type="number" name="precioActual" value={formData.precioActual} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm rounded-none focus:outline-none focus:border-black transition-colors" placeholder="Ej: 89990" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">Volumen (ML)</label>
                            <input required type="number" name="volumenMl" value={formData.volumenMl} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm rounded-none focus:outline-none focus:border-black transition-colors" placeholder="Ej: 100" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">Peso (Gramos)</label>
                            <input required type="number" name="pesoGramos" value={formData.pesoGramos} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm rounded-none focus:outline-none focus:border-black transition-colors" placeholder="Ej: 250" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">Descripción</label>
                        <textarea required name="descripcion" value={formData.descripcion} onChange={handleChange} rows={4} className="w-full border border-gray-300 p-3 text-sm rounded-none focus:outline-none focus:border-black transition-colors resize-none" placeholder="Aromático y especiado..." />
                    </div>
                </div>

                {/* COLUMNA DERECHA: IMAGEN Y EXTRAS */}
                <div className="flex flex-col space-y-5">
                    {/* ZONA DE CARGA DE IMAGEN ESTÉTICA */}
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">Imagen de Presentación</label>

                        <div className="relative border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center aspect-[4/5] w-full cursor-pointer overflow-hidden group">

                            {imagePreview ? (
                                <>
                                    <Image src={imagePreview} alt="Vista previa" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs uppercase tracking-widest font-bold">Cambiar Imagen</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-6">
                                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Haz clic para subir foto</p>
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">Tipo de Envase</label>
                        <select name="tipoEnvase" value={formData.tipoEnvase} onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm rounded-none focus:outline-none focus:border-black transition-colors bg-white">
                            <option value="spray">Spray</option>
                            <option value="splash">Splash</option>
                            <option value="roll-on">Roll-on</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 text-sm uppercase tracking-widest font-bold transition-all rounded-none border-2 border-black bg-black text-white hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Guardando y subiendo..." : "Crear Producto"}
                </button>
            </div>
        </form>
    );
}