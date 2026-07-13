# Plan de Pruebas — SmartLogix

> Generado el: 2026-07-13
> Arquitectura: Microservicios (Spring Boot + FastAPI + Next.js)
> Entorno base: Docker Compose local

SmartLogix es un sistema de e-commerce y logística dividido en los siguientes microservicios: `ms-autenticacion` (8085), `ms-clientes` (8082), `ms-inventario` (8081), `ms-ventas` (8083), `ms-logistica` (8084), `ms-ml-forecast` (8086) y `ms-gateway` (8080).

---

## Resumen de Prioridades

| Prioridad | Área | Justificación |
|---|---|---|
| 🔴 Crítico | Protecciones IDOR comentadas en `ms-ventas` | Cualquier usuario puede ver/cancelar pedidos ajenos |
| 🔴 Crítico | Webhook de logística sin autenticación | Cualquiera puede cambiar estados de despacho |
| 🟠 Alto | Flujos E2E de pago y despacho | Son el corazón funcional del negocio |
| 🟠 Alto | Validaciones de stock en ventas | Riesgo de overselling |
| 🟡 Medio | Pruebas de rendimiento del Gateway | Punto único de entrada |
| 🟢 Normal | ML Forecast sync y predicciones | Feature secundaria pero con dependencias frágiles |

---

## 1. Pruebas de Autenticación (`ms-autenticacion`)

> Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/auth/validate`

| ID | Caso de Prueba | Método | Endpoint | Datos de Entrada | Resultado Esperado |
|---|---|---|---|---|---|
| AU-01 | Registro exitoso | POST | `/api/auth/register` | `{correo, password, nombre}` válidos | `201 Created` + JWT token |
| AU-02 | Registro con correo duplicado | POST | `/api/auth/register` | correo ya existente | `409 Conflict` o `400` |
| AU-03 | Registro con campos vacíos | POST | `/api/auth/register` | body vacío `{}` | `400 Bad Request` |
| AU-04 | Login correcto | POST | `/api/auth/login` | credenciales válidas | `200 OK` + token JWT |
| AU-05 | Login con password incorrecto | POST | `/api/auth/login` | password erróneo | `401 Unauthorized` |
| AU-06 | Login con correo inexistente | POST | `/api/auth/login` | correo no registrado | `401 Unauthorized` |
| AU-07 | Obtener perfil autenticado | GET | `/api/auth/me` | Header `Authorization: Bearer <token>` | `200 OK` + datos usuario |
| AU-08 | Acceso a `/me` sin token | GET | `/api/auth/me` | sin header | `401 Unauthorized` |
| AU-09 | Validar token vigente | GET | `/api/auth/validate` | token válido | `200 OK` + `{authenticated: true, correo}` |
| AU-10 | Validar token expirado/inválido | GET | `/api/auth/validate` | token manipulado | `401 Unauthorized` |

### Ejemplo de Request — AU-04
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo": "usuario@test.com", "password": "Password123!"}'
```

---

## 2. Pruebas de Clientes (`ms-clientes`)

> Validaciones clave: RUT único, correo único, múltiples direcciones por cliente.

| ID | Caso de Prueba | Resultado Esperado |
|---|---|---|
| CL-01 | Crear cliente con datos válidos (RUT, nombre, correo) | `201 Created` |
| CL-02 | Crear cliente con RUT duplicado | `409 Conflict` |
| CL-03 | Crear cliente con correo duplicado | `409 Conflict` |
| CL-04 | Crear cliente con RUT inválido (formato incorrecto) | `400 Bad Request` |
| CL-05 | Obtener cliente por ID existente | `200 OK` + datos cliente |
| CL-06 | Obtener cliente por ID inexistente | `404 Not Found` |
| CL-07 | Agregar dirección de despacho a cliente existente | `201 Created` |
| CL-08 | Obtener ID de cliente por correo (uso interno de ms-ventas) | `200 OK` + ID |
| CL-09 | Actualizar datos de cliente | `200 OK` |
| CL-10 | Eliminar cliente con pedidos asociados | Error controlado o éxito (verificar comportamiento) |

---

## 3. Pruebas de Inventario (`ms-inventario`)

> Entidades: Producto, Bodega, ProductoBodega (stock por bodega).

| ID | Caso de Prueba | Resultado Esperado |
|---|---|---|
| IN-01 | Crear producto con SKU único | `201 Created` |
| IN-02 | Crear producto con SKU duplicado | `409 Conflict` |
| IN-03 | Crear producto con precio negativo | `400 Bad Request` |
| IN-04 | Crear producto con stock = 0 | `201 Created` (stock 0 válido) |
| IN-05 | Listar todos los productos | `200 OK` + lista |
| IN-06 | Obtener producto por ID | `200 OK` |
| IN-07 | Obtener producto inexistente | `404 Not Found` |
| IN-08 | Crear bodega | `201 Created` |
| IN-09 | Asignar stock de producto a bodega | `201 Created` |
| IN-10 | Reducir stock al crear pedido (integración con ms-ventas) | Stock decrementado correctamente |
| IN-11 | Intentar vender producto con stock insuficiente | `400 Bad Request` o error controlado |
| IN-12 | Actualizar precio de producto | `200 OK` + precio nuevo |

---

## 4. Pruebas de Ventas (`ms-ventas`) — ⚠️ Alta Prioridad

> Núcleo del sistema. Integra clientes, inventario y MercadoPago.

### 4.1 Pedidos

| ID | Caso de Prueba | Notas críticas |
|---|---|---|
| VE-01 | Crear pedido con cliente e ítems válidos | `201 Created` |
| VE-02 | Crear pedido con producto sin stock suficiente | `400 Bad Request` |
| VE-03 | Crear pedido con `idCliente` inexistente | Error controlado (ms-clientes responde 404) |
| VE-04 | Crear pedido con `idProducto` inexistente | Error controlado |
| VE-05 | Crear pedido con lista de ítems vacía | `400 Bad Request` |
| VE-06 | Listar todos los pedidos (`GET /api/pedidos`) | `200 OK` — ⚠️ endpoint público sin autenticación |
| VE-07 | Obtener pedido propio con JWT válido | `200 OK` |
| VE-08 | **IDOR**: Obtener pedido de otro cliente con JWT ajeno | `403 Forbidden` |
| VE-09 | Listar pedidos por cliente con JWT ajeno (`/cliente/{idCliente}`) | ⚠️ Protección IDOR comentada → actualmente devuelve datos sin verificar |
| VE-10 | Cancelar pedido propio | `200 OK` |
| VE-11 | **IDOR**: Cancelar pedido ajeno | ⚠️ Protección IDOR comentada → actualmente no protegido |
| VE-12 | Cambiar estado de pedido vía `PUT /{id}/estado` sin autenticación | ⚠️ Endpoint sin protección documentada |

> ### 🔴 Hallazgo Crítico de Seguridad
> En `PedidoController.java`, las protecciones IDOR en `POST /api/pedidos`, `GET /cliente/{idCliente}` y `PUT /{id}/cancelar` están **comentadas**.
> Esto significa que actualmente:
> - Cualquier usuario autenticado puede crear pedidos a nombre de otro usuario.
> - Cualquier usuario autenticado puede ver el historial de pedidos de cualquier otro cliente.
> - Cualquier usuario autenticado puede cancelar pedidos que no le pertenecen.
>
> **Acción requerida:** Descomentar y reactivar los bloques de protección IDOR en `PedidoController.java`.

### 4.2 Pagos y MercadoPago

| ID | Caso de Prueba | Resultado Esperado |
|---|---|---|
| PA-01 | Crear preferencia de pago MercadoPago para pedido válido | URL de pago generada |
| PA-02 | Crear pago sin `MERCADOPAGO_ACCESS_TOKEN` configurado | Error controlado (no `500 Internal Server Error`) |
| PA-03 | Webhook de MercadoPago con pago aprobado | Estado pedido → `PAGADO` |
| PA-04 | Webhook con pago rechazado | Estado pedido → `CANCELADO` o `PENDIENTE` |
| PA-05 | Webhook con payload inválido/manipulado | `400 Bad Request` |

---

## 5. Pruebas de Logística (`ms-logistica`)

> Gestiona Despachos, Transportistas y el ciclo PENDIENTE → EN_RUTA → ENTREGADO.

| ID | Caso de Prueba | Resultado Esperado |
|---|---|---|
| LO-01 | Crear despacho asociado a pedido existente | `201 Created` |
| LO-02 | Crear despacho con `idPedido` inexistente | Error controlado |
| LO-03 | Crear despacho duplicado para el mismo pedido | Error o actualización controlada |
| LO-04 | Cambiar estado: `PENDIENTE → EN_RUTA` | `200 OK` |
| LO-05 | Cambiar estado: `EN_RUTA → ENTREGADO` | `200 OK` |
| LO-06 | Cambiar estado con valor inválido (ej: `"VOLANDO"`) | `400 Bad Request` |
| LO-07 | Obtener despacho por ID de pedido | `200 OK` |
| LO-08 | **Webhook externo** sin autenticación (`/webhook/actualizacion-estado`) | ⚠️ Endpoint público — verificar que no sea explotable |
| LO-09 | Webhook con `idPedido` inválido | Error controlado |
| LO-10 | Asignar transportista a despacho | `200 OK` |

> ### ⚠️ Riesgo: Webhook Público
> El endpoint `POST /api/despachos/webhook/actualizacion-estado` no requiere autenticación.
> Cualquier agente externo podría enviar estados de despacho falsos.
> **Acción requerida:** Implementar validación por token secreto o firma HMAC en el webhook.

---

## 6. Pruebas del API Gateway (`ms-gateway`)

> Único punto de entrada público. Gestiona CORS y enrutamiento a todos los microservicios internos.

| ID | Caso de Prueba | Resultado Esperado |
|---|---|---|
| GW-01 | Request válido a ruta de inventario | Enruta correctamente al puerto 8081 |
| GW-02 | Request a ruta no definida | `404 Not Found` |
| GW-03 | Request sin JWT a endpoint protegido | `401 Unauthorized` |
| GW-04 | JWT válido propagado a microservicio interno | Microservicio recibe el header `Authorization` |
| GW-05 | CORS: request desde `localhost:3000` | Permitido |
| GW-06 | CORS: request desde origen no permitido | `403 Forbidden` |
| GW-07 | Microservicio interno caído (ej: ms-inventario apagado) | Respuesta de error controlada (no `500` genérico) |

---

## 7. Pruebas del Microservicio ML (`ms-ml-forecast`)

> Microservicio Python/FastAPI. Routers: `analytics`, `catalogo`, `predicciones`, `sync`.

| ID | Caso de Prueba | Resultado Esperado |
|---|---|---|
| ML-01 | `POST /sync` — sincronizar datos de ventas e inventario | Datos importados correctamente |
| ML-02 | `GET /predicciones/{id_producto}` — predecir demanda con datos históricos | `200 OK` + predicción numérica |
| ML-03 | Predicción con producto sin historial de ventas | Respuesta controlada (no crash) |
| ML-04 | `GET /analytics` — métricas de ventas | `200 OK` + datos agregados |
| ML-05 | Acceso con ms-ventas o ms-inventario caído durante sync | Error controlado, no `500` |
| ML-06 | Predecir con `id_producto` inexistente | `404 Not Found` |
| ML-07 | Catálogo de productos disponible desde el ML | `200 OK` + lista de productos |

---

## 8. Pruebas de Integración End-to-End

> Flujos completos que cruzan múltiples microservicios a través del API Gateway.

| ID | Flujo | Servicios Involucrados |
|---|---|---|
| E2E-01 | Registro → Login → Ver catálogo → Crear pedido → Ver estado | Auth + Clientes + Inventario + Ventas |
| E2E-02 | Crear pedido → Pago aprobado MercadoPago → Crear despacho → Estado ENTREGADO | Ventas + Logística |
| E2E-03 | Crear pedido → Verificar que el stock de inventario se reduce | Ventas + Inventario |
| E2E-04 | Sync ML → Predecir demanda de producto más vendido | Ventas + Inventario + ML |
| E2E-05 | Usuario A no puede ver ni cancelar pedidos de Usuario B | Auth + Ventas (IDOR) |

### Ejemplo flujo E2E-01 con curl
```bash
# 1. Registro
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"correo":"kevin@test.com","password":"Test1234!","nombre":"Kevin"}'

# 2. Login → guardar token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"kevin@test.com","password":"Test1234!"}' | jq -r '.token')

# 3. Ver catálogo
curl http://localhost:8080/api/productos -H "Authorization: Bearer $TOKEN"

# 4. Crear pedido
curl -X POST http://localhost:8080/api/pedidos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"idCliente": 1, "items": [{"idProducto": 1, "cantidad": 2}]}'
```

---

## 9. Pruebas de Rendimiento

> El repositorio ya contiene `stress-results.json` y la carpeta `tests-rendimiento` con resultados previos.

| ID | Escenario | Herramienta sugerida | Umbral aceptable |
|---|---|---|---|
| PF-01 | 100 usuarios concurrentes creando pedidos | Artillery / k6 | P95 < 500ms |
| PF-02 | 500 requests/s al API Gateway | k6 | Sin errores 5xx |
| PF-03 | Sincronización ML con 10.000 registros de venta | Python script | Completar en < 30s |
| PF-04 | Listar todos los pedidos con 1.000 registros en BD | curl / k6 | P95 < 200ms |
| PF-05 | Login simultáneo de 50 usuarios | Artillery | P99 < 1000ms |

### Ejemplo con k6 (PF-02)
```javascript
// stress-gateway.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:8080/api/productos');
  check(res, { 'status 200': (r) => r.status === 200 });
}
```

---

## 10. Pruebas de Infraestructura Docker

| ID | Caso de Prueba | Comando / Verificación |
|---|---|---|
| DO-01 | `docker compose up` levanta todos los servicios | Todos los contenedores en estado `healthy`/`running` |
| DO-02 | Base de datos inicializa las 4 DBs correctamente | `docker exec smartlogix-postgres psql -U postgres -l` |
| DO-03 | `docker compose watch` recarga al cambiar código fuente | Hot-reload funcional en menos de 10s |
| DO-04 | Gateway espera a que microservicios estén disponibles | Sin errores de conexión en startup |
| DO-05 | Volumen `pgdata` persiste datos tras `docker compose restart` | Datos no se pierden al reiniciar (sin flag `-v`) |
| DO-06 | Credenciales de BD no expuestas en logs | `docker logs smartlogix-postgres` no muestra `password` en texto plano |
| DO-07 | Variables de entorno cargadas desde `.env` correctamente | `docker compose config` refleja los valores del `.env` |

---

## 11. Checklist de Seguridad

- [ ] 🔴 Reactivar protecciones IDOR en `PedidoController.java` (líneas comentadas en crear, listar por cliente y cancelar)
- [ ] 🔴 Implementar autenticación/firma HMAC en webhook `POST /api/despachos/webhook/actualizacion-estado`
- [ ] 🟠 Proteger `GET /api/pedidos` (listar todos) con rol de administrador
- [ ] 🟠 Proteger `PUT /api/pedidos/{id}/estado` con autenticación de sistema interno
- [ ] 🟡 Rotar credenciales de BD antes de despliegue en producción (actualmente `password` en `docker-compose.yml`)
- [ ] 🟡 Configurar `MERCADOPAGO_ACCESS_TOKEN` como secreto real en producción
- [ ] 🟢 Agregar rate limiting en el API Gateway para endpoints de autenticación
