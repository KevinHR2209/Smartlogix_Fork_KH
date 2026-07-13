"use client";

import { useState, useRef, useEffect } from "react";

interface ProductFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    onlyStock: boolean;
    setOnlyStock: (value: boolean) => void;
}

export function ProductFilters({ searchTerm, setSearchTerm, onlyStock, setOnlyStock }: ProductFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Cerrar al hacer click afuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 border border-black px-4 py-2 text-xs uppercase tracking-widest font-bold text-black hover:bg-black hover:text-white transition-colors"
            >
                <span>Filtros</span>
                <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-black shadow-2xl p-5 flex flex-col gap-5 z-50">
                    {/* BÚSQUEDA */}
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2">
                            Buscar
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: Sauvage..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border-b border-gray-300 py-2 text-xs text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors bg-transparent"
                        />
                    </div>

                    {/* SOLO STOCK */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="onlyStock"
                            checked={onlyStock}
                            onChange={(e) => setOnlyStock(e.target.checked)}
                            className="w-3 h-3 rounded-none accent-black border-gray-300 cursor-pointer"
                        />
                        <label htmlFor="onlyStock" className="text-[10px] uppercase tracking-widest font-bold text-black cursor-pointer select-none mt-0.5">
                            Mostrar solo disponibles
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}