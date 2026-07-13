export type AppRole = "ADMIN" | "CLIENTE";
export type EntityStatus = string;

export type { Cliente, CrearClienteRequest, DireccionCliente, DireccionPrincipalRequest } from "@/features/clientes/types/cliente";
export type { Producto, ProductFiltersState } from "@/features/productos/types/producto";
export type { Pedido, DetallePedido, CrearPedidoPayload, CrearPedidoDetallePayload } from "@/features/pedidos/types/pedido";
export type { Transportista } from "@/features/transportistas/types/transportista";