import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.db import init_db
from app.routers import analytics, catalogo, predicciones, sync

app = FastAPI(
    title="ms-ml-forecast",
    description="Microservicio de forecasting de demanda y deteccion de riesgo de quiebre de stock para el catalogo de fragancias de SmartLogix",
    version="0.1.0",
)

app.include_router(catalogo.router)
app.include_router(sync.router)
app.include_router(predicciones.router)
app.include_router(analytics.router)

STATIC_DASHBOARD_DIR = os.path.join(os.path.dirname(__file__), "static", "dashboard")

# Ruta explícita: evita el 307 redirect que genera StaticFiles
# cuando se pide /dashboard sin barra final
@app.get("/dashboard", include_in_schema=False)
def dashboard_index():
    return FileResponse(os.path.join(STATIC_DASHBOARD_DIR, "index.html"))

# Archivos estáticos del dashboard (chart.umd.js, etc.)
app.mount("/dashboard", StaticFiles(directory=STATIC_DASHBOARD_DIR, html=True), name="dashboard")


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok", "service": "ms-ml-forecast"}