import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],        // menos de 1% de errores
    http_req_duration: ['p(95)<500'],      // 95% de requests bajo 500ms
  },
};

const BASE_GATEWAY = 'http://localhost:8080';

export default function () {

  // ── ms-inventario ──────────────────────────────────────────────────────────
  const productos = http.get(`${BASE_GATEWAY}/api/productos`);
  check(productos, {
    '[productos] status 200': (r) => r.status === 200,
    '[productos] body no vacío': (r) => r.body.length > 0,
    '[productos] responde en <500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.5);

  // ── ms-clientes ────────────────────────────────────────────────────────────
  const clientes = http.get(`${BASE_GATEWAY}/api/clientes`);
  check(clientes, {
    '[clientes] status 200': (r) => r.status === 200,
    '[clientes] body no vacío': (r) => r.body.length > 0,
    '[clientes] responde en <500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.5);

  // ── ms-ventas ──────────────────────────────────────────────────────────────
  const pedidos = http.get(`${BASE_GATEWAY}/api/pedidos`);
  check(pedidos, {
    '[pedidos] status 200': (r) => r.status === 200,
    '[pedidos] responde en <500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.5);

  // ── ms-logistica ───────────────────────────────────────────────────────────
  const despachos = http.get(`${BASE_GATEWAY}/api/despachos`);
  check(despachos, {
    '[despachos] status 200': (r) => r.status === 200,
    '[despachos] responde en <500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}