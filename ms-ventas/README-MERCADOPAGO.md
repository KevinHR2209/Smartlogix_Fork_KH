# Integración Mercado Pago (simulación de pasarela de pago) — ms-ventas

Guía paso a paso para configurar y probar la integración de Mercado Pago
agregada a `ms-ventas` en este fork. Usa **credenciales de prueba** de
Mercado Pago (las que empiezan con `TEST-`), que simulan pagos reales sin
mover dinero. No se necesita tarjeta de crédito real ni cuenta de comercio
verificada.

> ⚠️ Disclaimer honesto: este código Java no se pudo compilar ni ejecutar
> en el entorno donde se escribió (sin acceso a Maven Central). Se escribió
> revisando a fondo el código real de `ms-ventas` de este fork (JWT,
> protección IDOR, `idPresentacion`, orquestación de stock/despacho en
> `PedidoService`) y reutilizando esa lógica en vez de duplicarla, pero
> **tienes que compilarlo y probarlo tú antes de confiar en que
> funciona.** Ver la sección "Verificar que compila" más abajo.

## Decisión de diseño: no se tocó nada existente

`PagoController`, `PagoService`, `PedidoController` y `PedidoService`
quedaron exactamente como estaban. El flujo manual que ya tenías
(`POST /api/pagos` con JWT, que marca el pago "APROBADO" al toque) sigue
funcionando igual — no se reemplazó, se agregó un camino alternativo.

Lo nuevo vive en `com.smartlogix.msventas.mercadopago` (paquete separado) y
**reutiliza** la orquestación que ya existe en `PedidoService`:
- Cuando Mercado Pago confirma un pago aprobado → se llama a
  `pedidoService.procesarPagoExitoso(idPedido)` (el mismo método que ya
  descuenta stock definitivo, obtiene la dirección del cliente, crea el
  despacho en `ms-logistica` y marca el pedido `PAGADO`)
- Cuando Mercado Pago confirma un rechazo → se llama a
  `pedidoService.cancelarPedidoYLiberarStock(idPedido)` (el mismo método
  que ya libera el stock reservado y marca `CANCELADO`)

No se duplicó esa lógica de negocio en ningún lado nuevo.

## Qué se agregó

En `ms-ventas/src/main/java/com/smartlogix/msventas/mercadopago/`:
- `client/MercadoPagoClient.java` — llama directo a la API REST de Mercado
  Pago, mismo patrón que `InventarioClient`/`ClienteClient`/`LogisticaClient`
- `dto/MercadoPagoDto.java` — records del contrato JSON de Mercado Pago
- `service/MercadoPagoService.java` — crea la preferencia, procesa el
  webhook, delega en `PedidoService` para la orquestación real
- `controller/MercadoPagoController.java` — expone los 3 endpoints nuevos

Y se modificó:
- `repository/PagoRepository.java` — 2 métodos de búsqueda nuevos (antes
  estaba vacío)
- `application.yml` — sección `mercadopago:`
- `docker-compose.yml` (raíz) — variables de entorno para `ms-ventas`, y
  `URL_MS_ML` para `ms-gateway`
- `.gitignore` / `.env.example` (raíz) — igual que en el resto del proyecto

## Endpoints nuevos

| Método | Ruta | Qué hace |
|---|---|---|
| POST | `/api/pagos/mercadopago/preferencia/{idPedido}` | Crea la preferencia de pago en Mercado Pago para un pedido en estado `PENDIENTE_PAGO`. Devuelve `initPoint`/`sandboxInitPoint`. |
| POST | `/api/pagos/mercadopago/webhook` | Lo llama Mercado Pago (no tú). Dispara `procesarPagoExitoso` o `cancelarPedidoYLiberarStock` según el resultado. |
| GET | `/api/pagos/mercadopago/estado/{idPedido}` | Consulta el último `Pago` local sin llamar a Mercado Pago. |

**Nota de seguridad:** a diferencia de `PedidoController`/`PagoController`,
estos 3 endpoints **no piden JWT**. Es intencional por ahora — el mismo
código base ya tiene la protección IDOR comentada/deshabilitada en varios
lugares de `PedidoController` (revisa `crear`, `listarPorCliente`,
`cancelarPedido`), así que esto sigue el mismo nivel de madurez actual del
proyecto. Si más adelante activan la protección IDOR en el resto, agregar
la misma validación acá (queda comentado en el código dónde iría).

---

## Paso 1: crear una aplicación y credenciales de prueba

1. https://www.mercadopago.cl/developers/panel → crear/entrar con una
   cuenta de Mercado Pago (personal, no hace falta ser comercio real)
2. Crear una aplicación → modelo de integración **Checkout Pro**
3. Dentro de la app, ir a **Credenciales de prueba** (no las de
   producción) y copiar el **Access Token de prueba** (`TEST-...`)

## Paso 2: crear cuentas de prueba (comprador y vendedor)

1. En el panel, dentro de tu aplicación → **Cuentas de prueba**
2. Crear una cuenta de **vendedor** y otra de **comprador** (no pueden ser
   la misma), país Chile
3. Guardar ambas credenciales

## Paso 3: configurar variables de entorno

```bash
cp .env.example .env
```

Pega tu `MERCADOPAGO_ACCESS_TOKEN` de prueba. Los `MERCADOPAGO_BACK_URL_*`
puedes dejarlos con el valor por defecto. `MERCADOPAGO_NOTIFICATION_URL`
déjala vacía por ahora (se configura en el Paso 6 si quieres probar el
webhook real).

## Paso 4: levantar el stack y crear un usuario de prueba

```bash
docker compose up ms-gateway ms-autenticacion ms-clientes ms-inventario ms-ventas ms-logistica postgres
```

**4.1 — Registrar un usuario/cliente** (esto crea el usuario en
`ms-autenticacion` Y el cliente en `ms-clientes` en un solo paso, según
como está armado `AuthService`):

```bash
curl -X POST http://localhost:8085/api/auth/register -H "Content-Type: application/json" -d '{
  "nombre": "Test",
  "correo": "testmp@ejemplo.cl",
  "password": "Test1234!",
  "rol": "CLIENTE",
  "rut": "9-9",
  "apellidoPaterno": "Comprador",
  "apellidoMaterno": "Prueba",
  "telefono": "+56900000000",
  "direccionPrincipal": {
    "idComuna": 13101,
    "calle": "Alameda",
    "numero": "1000"
  }
}'
```

**4.2 — Iniciar sesión y guardar el token:**

```bash
TOKEN=$(curl -s -X POST http://localhost:8085/api/auth/login -H "Content-Type: application/json" -d '{
  "correo": "testmp@ejemplo.cl", "password": "Test1234!"
}' | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")
echo $TOKEN
```

**4.3 — Averiguar el idCliente** que te asignó (lo necesitas para el pedido):

```bash
curl -s http://localhost:8082/api/clientes/correo/testmp@ejemplo.cl
```

**4.4 — Crear un pedido** (ajusta `idPresentacion` a una que exista — el
`init.sql` de este repo carga presentaciones con id 1 al 21 para los 20
perfumes de ejemplo):

```bash
curl -X POST http://localhost:8083/api/pedidos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{
    "idCliente": 1,
    "detalles": [
      {"idPresentacion": 1, "cantidad": 1}
    ]
  }'
```

(Reemplaza `"idCliente": 1` por el id real que te devolvió el paso 4.3.)
Anota el `idPedido` de la respuesta — el pedido queda en `PENDIENTE_PAGO`
y ya reservó el stock en `ms-inventario`.

## Paso 5: iniciar el pago y simularlo con tarjeta de prueba

```bash
curl -X POST http://localhost:8083/api/pagos/mercadopago/preferencia/1
```

(reemplaza `1` por tu `idPedido`). Vas a recibir `initPoint` y
`sandboxInitPoint`.

1. Abre el `sandboxInitPoint` en una **ventana de incógnito**
2. Inicia sesión con la **cuenta de prueba del comprador** (Paso 2)
3. Paga con una **tarjeta de prueba** — los números exactos y qué nombre
   de titular simula cada resultado (aprobado/rechazado) están acá, porque
   cambian por país y no quiero pasarte datos que se puedan haber
   actualizado:
   👉 https://www.mercadopago.cl/developers/es/docs/checkout-api/integration-test/test-cards
4. El patrón general (esto sí es estable): el nombre del titular que
   pongas determina el resultado — nombres como `APRO` simulan aprobado,
   otros como `OTHE` simulan rechazado. Nombres exactos en el link de arriba.

## Paso 6: verificar que el pedido se actualizó

**Sin webhook** (verificación directa contra Mercado Pago):
```bash
curl -H "Authorization: Bearer TEST-tu-access-token" \
  "https://api.mercadopago.com/v1/payments/search?external_reference=pedido-1"
```

**Con webhook** (flujo real, necesita ngrok porque Mercado Pago no puede
llamar a tu `localhost`):

```bash
ngrok http 8083
```

1. Pon la URL de ngrok en `.env`:
   `MERCADOPAGO_NOTIFICATION_URL=https://TU-URL.ngrok-free.app/api/pagos/mercadopago/webhook`
2. `docker compose restart ms-ventas`
3. Crea una preferencia **nueva** (la notification_url se fija al crear la
   preferencia, no sirve para preferencias creadas antes de este paso)
4. Paga con tarjeta de prueba
5. Verifica:
   ```bash
   curl http://localhost:8083/api/pagos/mercadopago/estado/1
   ```
   Debería mostrar `"estadoPago": "aprobado"` y el pedido debería estar en
   `PAGADO`:
   ```bash
   curl http://localhost:8083/api/pedidos/1
   ```

También puedes simular el webhook manualmente sin ngrok (usando un id de
pago real que exista en tu cuenta de prueba, sacado del Paso 6 sin webhook):

```bash
curl -X POST http://localhost:8083/api/pagos/mercadopago/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "payment", "data": {"id": "TU_ID_DE_PAGO_REAL"}}'
```

---

## Verificar que compila

```bash
cd ms-ventas
mvn clean compile
mvn test
```

Si hay errores, pégamelos y los reviso — son mucho más rápidos de arreglar
que rediseñar la lógica.

## Ir a producción (fuera del alcance de esta simulación)

Solo para que sepas qué cambiaría — no lo hagas si esto sigue siendo un
proyecto académico/demo:
- Access token de **producción** (requiere cuenta de comercio verificada)
- `back_urls`/`notification_url` públicas HTTPS reales, no `localhost`
- Validar la firma del webhook (Mercado Pago la incluye en el header
  `x-signature`) en vez de confiar solo en volver a consultar la API
