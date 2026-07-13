export interface Marca {
  idMarca: number;
  nombre: string;
  paisOrigen?: string;
}

export interface FamiliaOlfativa {
  idFamilia: number;
  nombre: string;
  descripcion?: string;
}

export interface Producto {
  idProducto?: number; // Este es tu idPresentacion
  idPerfume?: number;
  sku: string;
  nombre: string;
  descripcion: string;
  precioActual: number;
  pesoGramos: number;
  dimensiones: string;
  estado: string;
  stockTotal?: number;
  imagenUrl?: string;
  volumenMl?: number;
  marca?: Marca;
  familiaOlfativa?: FamiliaOlfativa;
}

export interface ProductFiltersState {
  search: string;
  onlyStock: boolean;
}