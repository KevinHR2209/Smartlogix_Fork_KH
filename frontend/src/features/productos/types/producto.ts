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
}

export interface ProductFiltersState {
  search: string;
  onlyStock: boolean;
}