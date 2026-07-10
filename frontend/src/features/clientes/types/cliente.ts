export interface DireccionCliente {
  idDireccion?: number;
  idCliente?: number;
  idComuna?: number;
  calle: string;
  numero: string;
  detalle?: string;
  esPrincipal?: boolean;
}

export interface DireccionPrincipalRequest {
  idComuna: number;
  calle: string;
  numero: string;
  detalle?: string;
}

export interface Cliente {
  idCliente?: number;
  idUsuarioAuth?: number;
  rut: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  telefono: string;
  region?: string;
  direcciones?: DireccionCliente[];
  direccionPrincipal?: DireccionCliente | null;
}

export interface CrearClienteRequest {
  idUsuarioAuth?: number;
  rut: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  telefono: string;
  direccionPrincipal: DireccionPrincipalRequest;
}