# ms-ml-forecast

Microservicio de machine learning para el catálogo de fragancias de SmartLogix. Cubre **80 fragancias** de marcas reales (Dior, Chanel, YSL, Armani, Versace, Tom Ford, Guerlain, etc), con distintos formatos, versiones y familias olfativas. Predice demanda diaria por producto y calcula probabilidad de quiebre de stock a 7 dias, siguiendo el mismo patrón de arquitectura (referencia lógica por ID, esquema propio en el Postgres compartido) que el resto de los microservicios del proyecto.

## Por qué Python en un stack Java/Spring

El resto de SmartLogix está en Spring Boot. Este servicio es Python + FastAPI porque el ecosistema de ML (scikit-learn, pandas) es nativo de ese lenguaje. Se comunica con `ms-ventas` y `ms-inventario` por REST síncrono, igual que ya hacen esos dos servicios entre sí — no requiere que el resto del stack cambie de tecnología.

## Estructura

```
ms-ml-forecast/
├── app/
│   ├── main.py              # entrypoint FastAPI
│   ├── db.py                 # modelos SQLAlchemy + conexión Postgres
│   ├── etl.py                 # sync con ms-ventas / ms-inventario (con fallback)
│   ├── schemas.py            # schemas Pydantic
│   ├── routers/
│   │   ├── catalogo.py        # CRUD del catálogo de fragancias
│   │   ├── sync.py            # /sync y /entrenar
│   │   └── predicciones.py    # /predicciones/demanda, /alertas/quiebre
│   └── ml/
│       ├── generar_catalogo.py  # genera las 20 fragancias base
│       ├── generar_dataset.py   # genera 1 año de ventas sintéticas
│       ├── features.py          # feature engineering compartido
│       ├── entrenar.py          # entrena los 2 modelos
│       ├── predecir.py          # inferencia en producción
│       └── modelos/             # modelos .joblib entrenados (se generan, no se versionan)
├── data/                       # catalogo_perfumes.json, ventas_historicas.json (generados)
├── Dockerfile
├── requirements.txt
├── schema.sql                  # documentación del esquema (se crea solo via SQLAlchemy)
└── docker-compose.snippet.yml  # fragmento para pegar en el docker-compose.yml raíz
```

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/health` | healthcheck |
| GET | `/catalogo` | lista el catálogo cargado |
| POST | `/catalogo` | crea/actualiza una fragancia |
| POST | `/catalogo/seed` | carga las 80 fragancias base generadas |
| POST | `/sync` | trae ventas desde `ms-ventas` (si no responde, usa el dataset sintético como fallback) |
| POST | `/entrenar` | reentrena ambos modelos con los datos actuales en BD |
| GET | `/predicciones/demanda/{id_producto}` | demanda diaria estimada |
| GET | `/alertas/quiebre` | ranking de SKUs por riesgo de quiebre |
| GET | `/analytics/ventas?periodo=...` | ventas agregadas por período: `semana`, `mes_anterior`, `mes_actual`, `anio`, o `personalizado` (con `fecha_inicio`/`fecha_fin`) — totales, ventas por día, top 10 productos, ventas por familia olfativa y por marca |
| GET | `/dashboard/` | dashboard visual (HTML + Chart.js) que consume `/analytics/ventas` — filtros de período, KPIs, gráfico de línea de ventas por día, tabla de top productos, y dos gráficos de dona (familia olfativa / marca) |

## Cómo correrlo

**Con Docker (dentro del stack completo):**
1. Copiar la carpeta `ms-ml-forecast/` a la raíz del repo, junto a `ms-ventas`, `ms-inventario`, etc.
2. Agregar el contenido de `docker-compose.snippet.yml` al `docker-compose.yml` raíz
3. Agregar `CREATE DATABASE ms_ml_forecast;` al `init.sql`
4. `docker compose up ms-ml-forecast`
5. Llamar en orden: `POST /catalogo/seed` → `POST /sync` → `POST /entrenar`

**Local sin Docker (para desarrollo):**
```bash
pip install -r requirements.txt
python -m app.ml.generar_catalogo
python -m app.ml.generar_dataset
DATABASE_URL="postgresql://postgres:password@localhost:5432/ms_ml_forecast" uvicorn app.main:app --reload --port 8086
```

## El dataset es sintético — léelo antes de usarlo en un informe

`app/ml/generar_dataset.py` genera un año de ventas simuladas (365 dias x 80 SKUs = 29.200 registros) con reglas de negocio conocidas (estacionalidad por familia olfativa, eventos como Navidad/Cyber Monday, ruido aleatorio, y ~20 productos con ventana de riesgo de quiebre forzada a propósito para que el clasificador tenga ejemplos positivos). **No son ventas reales.** Un modelo entrenado sobre esto aprende las reglas que se le inyectaron, no un patrón de demanda real. Sirve como prueba de concepto de la arquitectura end-to-end; para producción real habría que reemplazar `generar_dataset.py` por el ETL real desde `ms-ventas` una vez que ese servicio tenga suficiente historial.

**Nota sobre fechas:** el dataset siempre termina en la fecha en que se ejecuta `generar_dataset.py` (retrocede 365 días desde "hoy"), no en una fecha fija. Esto es importante para que los filtros del dashboard (`semana`, `mes_actual`, etc) siempre tengan datos — pero significa que si pasa mucho tiempo sin regenerar el dataset, el "hoy" del dashboard se va a alejar del final de los datos. Si eso pasa, correr `python -m app.ml.generar_dataset` de nuevo.

## Dashboard de ventas

`GET /dashboard/` sirve una página HTML standalone (Chart.js vía CDN, sin build step) con:
- Filtros: última semana, mes anterior, mes actual, año, o rango personalizado
- KPIs: unidades vendidas, ingresos, producto más vendido, días con quiebre de stock en el período
- Gráfico de línea: ventas por día
- Tabla: top 10 productos más vendidos
- Dos gráficos de dona: ventas por familia olfativa y por marca

Todo lo consume desde `/analytics/ventas`, mismo origen (sin CORS). Si se prefiere que el dashboard viva en el frontend Next.js en vez de como página standalone del microservicio, `/analytics/ventas` ya está listo para que el frontend lo consuma directamente — no haría falta tocar el backend, solo agregar la página en `frontend/`.

## Cómo se corrigió el AUC de 0.999

La primera versión tenía dos problemas apilados:

1. **Fuga de datos**: usaba `stock_fin_dia` (stock *después* de las ventas del día) como feature, casi la respuesta disfrazada de pregunta.
2. **Problema demasiado determinista**: incluso corrigiendo eso, el generador sintético forzaba el quiebre de forma tan limpia que la relacion seguia siendo casi tautologica.

La correccion, en `generar_dataset.py`, `features.py` y `entrenar.py`:

- **`stock_inicio_dia`** en vez de `stock_fin_dia`: el dato que existiria al momento real de predecir, no el resultado ya conocido.
- **Target a 7 dias adelante** (`riesgo_quiebre_7d`) en vez de si hay quiebre hoy: obliga al modelo a anticipar una tendencia, no leer el stock actual.
- **Ruido de medicion** (+-20% en `dias_cobertura`, porque el conteo de stock real rara vez es exacto) **+ ruido de etiqueta** (4% de casos invertidos, representando factores no capturados como atrasos de proveedor o errores de bodega).

Con esto el AUC bajo de 0.999 a un rango creible entre **~0.76 y 0.82** dependiendo del volumen de datos (el ruido de etiqueta se recalibro al escalar el catalogo de 20 a 80 fragancias), para un clasificador de riesgo de quiebre que solo usa datos internos de inventario.

## Integración con el resto de SmartLogix

- `id_producto` en `catalogo_perfumes` es una referencia lógica al `producto.id_producto` real de `ms-inventario` — sin FK real en base de datos, igual que las demás referencias cruzadas del proyecto.
- El servicio no escribe en los esquemas de otros microservicios, solo lee vía REST.
- `ms-gateway` puede enrutar `/ml/*` hacia este servicio agregando `URL_MS_ML` a sus variables de entorno.
