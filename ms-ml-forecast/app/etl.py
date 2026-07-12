"""
ETL que sincroniza datos reales desde ms-ventas y ms-inventario hacia el
esquema local ms_ml_forecast, siguiendo el mismo patron de referencia
logica (por id) que ya usa ms-ventas para llamar a ms-clientes/ms-inventario.

Si los servicios no estan disponibles (por ejemplo en desarrollo local sin
el resto del stack levantado), cae de vuelta al dataset sintetico generado
en app/ml/generar_dataset.py, para que el microservicio siga siendo
utilizable de forma aislada.
"""
import json
import os
from datetime import date

import httpx
from sqlalchemy.orm import Session

from app.db import VentaHistorica

URL_MS_VENTAS = os.getenv("URL_MS_VENTAS", "http://ms-ventas:8083")
URL_MS_INVENTARIO = os.getenv("URL_MS_INVENTARIO", "http://ms-inventario:8081")

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


async def sync_desde_microservicios(db: Session) -> dict:
    """Intenta traer pedidos/detalle_pedido reales. Si falla, usa el dataset
    sintetico local como fallback para que el servicio no quede bloqueado."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp_pedidos = await client.get(f"{URL_MS_VENTAS}/detalle_pedido")
            resp_pedidos.raise_for_status()
            detalle = resp_pedidos.json()
            registros_insertados = _procesar_detalle_pedido(db, detalle)
            return {"fuente": "ms-ventas", "registros": registros_insertados}
    except (httpx.HTTPError, httpx.ConnectError, httpx.TimeoutException) as exc:
        registros_insertados = _cargar_dataset_sintetico(db)
        return {
            "fuente": "dataset_sintetico_fallback",
            "motivo": str(exc),
            "registros": registros_insertados,
        }


def _procesar_detalle_pedido(db: Session, detalle: list) -> int:
    # Punto de extension: aqui se agregarian por fecha/producto los
    # unidades_vendidas reales una vez que ms-ventas exponga ese endpoint.
    return 0


def _cargar_dataset_sintetico(db: Session) -> int:
    path = os.path.join(DATA_DIR, "ventas_historicas.json")
    if not os.path.exists(path):
        return 0

    with open(path, encoding="utf-8") as f:
        ventas = json.load(f)

    db.query(VentaHistorica).delete()
    for v in ventas:
        db.add(VentaHistorica(
            fecha=date.fromisoformat(v["fecha"]),
            id_producto=v["id_producto"],
            unidades_vendidas=v["unidades_vendidas"],
            unidades_demandadas=v["unidades_demandadas"],
            stock_inicio_dia=v.get("stock_inicio_dia", 0),
            stock_fin_dia=v["stock_fin_dia"],
            hubo_quiebre=v["hubo_quiebre"],
            precio_unitario=v["precio_unitario"],
        ))
    db.commit()
    return len(ventas)
