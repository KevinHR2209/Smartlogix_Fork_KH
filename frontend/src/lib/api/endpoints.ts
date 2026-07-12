export const endpoints = {
  productos: "/api/productos",
  perfumes: "/api/perfumes",
  clientes: "/api/clientes",
  bodegas: "/api/bodegas",
  pedidos: "/api/pedidos",
  inventario: "/api/inventario",
  transportistas: "/api/transportistas",
  pagos: {
    mercadopagoPreferencia: (idPedido: number) =>
      `/api/pagos/mercadopago/preferencia/${idPedido}`,
    mercadopagoEstado: (idPedido: number) => `/api/pagos/mercadopago/estado/${idPedido}`,
  },
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    me: "/api/auth/me",
  },
} as const;