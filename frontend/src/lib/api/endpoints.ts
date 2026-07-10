export const endpoints = {
  productos: "/api/productos",
  clientes: "/api/clientes",
  bodegas: "/api/bodegas",
  pedidos: "/api/pedidos",
  inventario: "/api/inventario",
  transportistas: "/api/transportistas",
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    me: "/api/auth/me",
  },
} as const;