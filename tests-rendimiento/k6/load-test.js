import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// ── Métricas personalizadas ──────────────────────────────────────────────────
const productosLatency = new Trend('productos_latency', true);
const clientesLatency  = new Trend('clientes_latency',  true);
const pedidosLatency   = new Trend('pedidos_latency',   true);
const despachosLatency = new Trend('despachos_latency', true);
const errorRate        = new Rate('error_rate');
const pedidosCreados   = new Counter('pedidos_creados');

export const options = {
  stages: [
    { duration: '30s', target: 5  },
    { duration: '1m',  target: 20 },
    { duration: '30s', target: 20 },
    { duration: '30s', target: 0  },
  ],
  thresholds: {
    http_req_failed:   ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
    productos_latency: ['p(95)<800'],
    clientes_latency:  ['p(95)<800'],
    pedidos_latency:   ['p(95)<1000'],
    despachos_latency: ['p(95)<800'],
    error_rate:        ['rate<0.05'],
  },
};

const BASE        = 'http://localhost:8080';
const HEADERS_JSON = { 'Content-Type': 'application/json' };
const CLIENT_IDS   = [1, 2, 3, 4, 5];
const PRODUCT_IDS  = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function () {

  // ── GET Productos ──────────────────────────────────────────────────────────
  group('GET /api/productos', () => {
    const res = http.get(`${BASE}/api/productos`);
    productosLatency.add(res.timings.duration);
    errorRate.add(res.status !== 200);

    check(res, {
      'status 200': (r) => r.status === 200,
      'es array JSON': (r) => {
        try { return Array.isArray(JSON.parse(r.body)); }
        catch { return false; }
      },
    });
  });

  sleep(0.3);

  // ── GET Clientes ───────────────────────────────────────────────────────────
  group('GET /api/clientes', () => {
    const res = http.get(`${BASE}/api/clientes`);
    clientesLatency.add(res.timings.duration);
    errorRate.add(res.status !== 200);

    check(res, { 'status 200': (r) => r.status === 200 });
  });

  sleep(0.3);

  // ── GET Producto por ID ────────────────────────────────────────────────────
  group('GET /api/productos/:id', () => {
    const id = randomItem(PRODUCT_IDS);
    const res = http.get(`${BASE}/api/productos/${id}`);
    productosLatency.add(res.timings.duration);
    errorRate.add(res.status !== 200);

    check(res, {
      'status 200': (r) => r.status === 200,
      'tiene idProducto': (r) => {
        try { return JSON.parse(r.body).idProducto !== undefined; }
        catch { return false; }
      },
    });
  });

  sleep(0.3);

  // ── POST Pedido ────────────────────────────────────────────────────────────
  group('POST /api/pedidos', () => {
    const idCliente  = randomItem(CLIENT_IDS);
    const idProducto = randomItem(PRODUCT_IDS);

    const payload = JSON.stringify({
      idCliente,
      estadoPedido: 'PENDIENTE',
      detalles: [{
        idProducto,
        cantidad: 1,
        precioUnitarioSnapshot: 9990,
      }],
    });

    const res = http.post(`${BASE}/api/pedidos`, payload, { headers: HEADERS_JSON });
    pedidosLatency.add(res.timings.duration);
    errorRate.add(res.status !== 201 && res.status !== 200);

    const ok = check(res, {
      'pedido creado (201)': (r) => r.status === 201,
      'tiene idPedido': (r) => {
        try { return JSON.parse(r.body).idPedido !== undefined; }
        catch { return false; }
      },
    });

    // Log de errores para diagnóstico
    if (!ok) {
      console.log(`[PEDIDO ERROR] status=${res.status} body=${res.body.substring(0, 300)}`);
    }

    if (ok) pedidosCreados.add(1);
  });

  sleep(0.3);

  // ── GET Despachos ──────────────────────────────────────────────────────────
  group('GET /api/despachos', () => {
    const res = http.get(`${BASE}/api/despachos`);
    despachosLatency.add(res.timings.duration);
    errorRate.add(res.status !== 200);

    check(res, { 'status 200': (r) => r.status === 200 });
  });

  sleep(0.5);
}