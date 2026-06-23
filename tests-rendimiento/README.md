# Tests de Rendimiento — Smartlogix

Utilizamos **k6** para los tests de rendimiento con visualización en **Grafana + InfluxDB**.

## Tipos de test

| Test | Archivo | Usuarios | Duración | Objetivo |
|---|---|---|---|---|
| Smoke | `smoke-test.js` | 1 VU | 30s | Verificar que los endpoints responden |
| Load | `load-test.js` | hasta 20 VUs | ~2m30s | Simular carga realista |
| Stress | `stress-test.js` | hasta 150 VUs | ~3m30s | Detectar punto de quiebre |

## Requisitos

- Docker Desktop corriendo
- Proyecto Smartlogix levantado (`docker compose up` en la raíz)

## Ejecución

### Sin Docker (k6 instalado localmente)

```bash
# Smoke test
k6 run k6/smoke-test.js

# Load test
k6 run k6/load-test.js

# Stress test
k6 run k6/stress-test.js
```

### Con Docker + Grafana (recomendado)

```bash
cd tests-rendimiento

# 1. Levantar InfluxDB y Grafana
docker compose -f docker-compose.k6.yml up -d influxdb grafana

# 2. Esperar ~10s y abrir Grafana en http://localhost:3001
#    Dashboard: "k6 Load Testing Results" (ID: 2587)

# 3. Correr el test deseado
docker compose -f docker-compose.k6.yml --profile smoke  up k6-smoke
docker compose -f docker-compose.k6.yml --profile load   up k6-load
docker compose -f docker-compose.k6.yml --profile stress up k6-stress
```

## Thresholds definidos

| Métrica | Smoke | Load | Stress |
|---|---|---|---|
| Error rate | < 1% | < 5% | < 20% |
| p95 latencia | < 500ms | < 1000ms | < 3000ms |