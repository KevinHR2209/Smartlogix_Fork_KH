export const endpoints = {
  productos: "/api/productos",
  clientes: "/api/clientes",
  pedidos: "/api/pedidos",
  transportistas: "/api/transportistas",
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    me: "/api/auth/me",
  },
} as const;