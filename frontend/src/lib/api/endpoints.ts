// frontend/src/lib/api/endpoints.ts
export const endpoints = {
  productos: "/api/productos",
  perfumes: "/api/perfumes",
  clientes: "/api/clientes",
  bodegas: "/api/bodegas",
  pedidos: "/api/pedidos",
  inventario: "/api/inventario",
  pagos: {
    mercadopagoPreferencia: (idPedido: number) =>
      `/api/pagos/mercadopago/preferencia/${idPedido}`,
    mercadopagoEstado: (idPedido: number) =>
      `/api/pagos/mercadopago/estado/${idPedido}`,
    mercadopagoConfirmar: (paymentId: string) =>
      `/api/pagos/mercadopago/confirmar?paymentId=${encodeURIComponent(paymentId)}`,
  },
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    me: "/api/auth/me",
  },
  regiones: "/api/regiones",
  provincias: {
    porRegion: (idRegion: number) => `/api/provincias/region/${idRegion}`,
  },
  comunas: {
    porProvincia: (idProvincia: number) => `/api/comunas/provincia/${idProvincia}`,
  },
} as const;