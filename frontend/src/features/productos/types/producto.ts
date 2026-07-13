export interface Producto {
  idProducto?: number;
  sku: string;
  nombre: string;
  descripcion: string;
  precioActual: number;
  pesoGramos: number;
  dimensiones: string;
  estado: string;
  stockTotal?: number;
  // Campos rescatados del aplanamiento:
  imagenUrl?: string;
  volumenMl?: number;
  marca?: {
    idMarca: number;
    nombre: string;
  };
  familiaOlfativa?: {
    idFamilia: number;
    nombre: string;
  };
}

export interface ProductFiltersState {
  search: string;
  onlyStock: boolean;
}