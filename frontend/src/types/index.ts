export interface Producto {
  idProducto?: number;
  sku: string;
  nombre: string;
  descripcion: string;
  precioActual: number;
  pesoGramos: number;
  dimensiones: string;
  estado: string;
}

export interface Cliente {
  idCliente?: number;
  rut: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  telefono: string;
}

export interface Transportista {
  idTransportista?: number;
  nombreCompleto: string;
  patenteVehiculo: string;
  telefonoContacto: string;
  estado: string;
}

export interface CartItem extends Producto {
  cantidad: number;
}

export interface DetallePedido {
  idDetalle?: number;
  idProducto: number;
  cantidad: number;
  precioUnitarioSnapshot: number;
}

export interface Pedido {
  idPedido?: number;
  idCliente: number;
  fechaCreacion?: string;
  montoTotal: number;
  estadoPedido: string;
  detalles?: DetallePedido[];
}