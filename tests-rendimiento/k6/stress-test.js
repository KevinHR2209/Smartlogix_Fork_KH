import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const latency   = new Trend('stress_latency', true);
const errorRate = new Rate('stress_error_rate');

export const options = {
  stages: [
    { duration: '30s', target: 10  },   // calentamiento
    { duration: '1m',  target: 50  },   // carga alta
    { duration: '1m',  target: 100 },   // estrés
    { duration: '30s', target: 150 },   // punto de quiebre
    { duration: '1m',  target: 0   },   // recuperación
  ],
  thresholds: {
    // thresholds más permisivos — el objetivo es observar, no pasar
    http_req_failed:    ['rate<0.20'],    // hasta 20% de errores aceptable en estrés
    http_req_duration:  ['p(95)<3000'],   // 3 segundos máximo en p95
    stress_error_rate:  ['rate<0.20'],
  },
};

const BASE = 'http://localhost:8080';

export default function () {

  // ── Endpoint más crítico: listado de productos ─────────────────────────────
  group('stress GET /api/productos', () => {
    const res = http.get(`${BASE}/api/productos`);
    latency.add(res.timings.duration);
    errorRate.add(res.status !== 200);

    check(res, {
      'responde (cualquier 2xx)': (r) => r.status >= 200 && r.status < 300,
    });
  });

  sleep(0.1);

  // ── Endpoint de escritura bajo estrés: crear pedido ────────────────────────
  group('stress POST /api/pedidos', () => {
    const payload = JSON.stringify({
      idCliente: Math.floor(Math.random() * 5) + 1,
      estadoPedido: 'PENDIENTE',
      detalles: [{
        idProducto: Math.floor(Math.random() * 5) + 1,
        cantidad: 1,
        precioUnitarioSnapshot: 9990,
      }],
    });

    const res = http.post(`${BASE}/api/pedidos`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    latency.add(res.timings.duration);
    errorRate.add(res.status !== 201 && res.status !== 200);

    check(res, {
      'pedido creado o servidor ocupado': (r) =>
        r.status === 201 || r.status === 429 || r.status === 503,
    });
  });

  sleep(0.1);

  // ── Endpoint de logística ──────────────────────────────────────────────────
  group('stress GET /api/despachos', () => {
    const res = http.get(`${BASE}/api/despachos`);
    latency.add(res.timings.duration);
    errorRate.add(res.status !== 200);

    check(res, {
      'responde (cualquier 2xx)': (r) => r.status >= 200 && r.status < 300,
    });
  });

  sleep(0.1);
}

// ── Resumen al finalizar ───────────────────────────────────────────────────────
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
    './stress-results.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data, opts) {
  // k6 imprime su propio resumen; esta función es para exportar también a JSON
  return `\n=== STRESS TEST COMPLETADO ===\nRevisa stress-results.json para el detalle completo.\n`;
}