from datetime import date, timedelta
from typing import Optional

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import CatalogoPerfume, VentaHistorica, get_db

router = APIRouter(prefix="/analytics", tags=["analytics"])

PERIODOS_VALIDOS = {"semana", "mes_anterior", "mes_actual", "anio", "personalizado"}


def rango_fechas(periodo: str, fecha_inicio: Optional[str], fecha_fin: Optional[str]):
    hoy = date.today()

    if periodo == "semana":
        return hoy - timedelta(days=7), hoy

    if periodo == "mes_actual":
        return hoy.replace(day=1), hoy

    if periodo == "mes_anterior":
        primer_dia_actual = hoy.replace(day=1)
        ultimo_dia_anterior = primer_dia_actual - timedelta(days=1)
        primer_dia_anterior = ultimo_dia_anterior.replace(day=1)
        return primer_dia_anterior, ultimo_dia_anterior

    if periodo == "anio":
        return hoy.replace(month=1, day=1), hoy

    if periodo == "personalizado":
        if not fecha_inicio or not fecha_fin:
            raise HTTPException(
                status_code=400,
                detail="periodo=personalizado requiere fecha_inicio y fecha_fin (YYYY-MM-DD)",
            )
        try:
            return date.fromisoformat(fecha_inicio), date.fromisoformat(fecha_fin)
        except ValueError:
            raise HTTPException(status_code=400, detail="fecha_inicio/fecha_fin deben ser YYYY-MM-DD")

    raise HTTPException(
        status_code=400,
        detail=f"periodo invalido. Usar uno de: {sorted(PERIODOS_VALIDOS)}",
    )


def _respuesta_vacia(periodo: str, inicio: date, fin: date) -> dict:
    return {
        "periodo": periodo,
        "rango": [inicio.isoformat(), fin.isoformat()],
        "total_unidades": 0,
        "total_ingresos": 0.0,
        "dias_con_quiebre": 0,
        "ventas_por_dia": [],
        "top_productos": [],
        "ventas_por_familia": [],
        "ventas_por_marca": [],
    }


@router.get("/ventas")
def analytics_ventas(
    periodo: str = Query("mes_actual", description="semana | mes_anterior | mes_actual | anio | personalizado"),
    fecha_inicio: Optional[str] = Query(None, description="YYYY-MM-DD, solo con periodo=personalizado"),
    fecha_fin: Optional[str] = Query(None, description="YYYY-MM-DD, solo con periodo=personalizado"),
    db: Session = Depends(get_db),
):
    inicio, fin = rango_fechas(periodo, fecha_inicio, fecha_fin)

    ventas = (
        db.query(VentaHistorica)
        .filter(VentaHistorica.fecha >= inicio, VentaHistorica.fecha <= fin)
        .all()
    )
    if not ventas:
        return _respuesta_vacia(periodo, inicio, fin)

    catalogo = {p.id_producto: p for p in db.query(CatalogoPerfume).all()}

    df = pd.DataFrame([
        {
            "fecha": v.fecha,
            "id_producto": v.id_producto,
            "unidades": v.unidades_vendidas,
            "ingreso": v.unidades_vendidas * v.precio_unitario,
            "hubo_quiebre": v.hubo_quiebre,
        }
        for v in ventas
    ])

    total_unidades = int(df["unidades"].sum())
    total_ingresos = float(df["ingreso"].sum())
    dias_con_quiebre = int(df[df["hubo_quiebre"]]["fecha"].nunique())

    ventas_por_dia = (
        df.groupby("fecha")["unidades"].sum().reset_index().sort_values("fecha")
    )
    ventas_por_dia_out = [
        {"fecha": r["fecha"].isoformat(), "unidades": int(r["unidades"])}
        for _, r in ventas_por_dia.iterrows()
    ]

    por_producto = (
        df.groupby("id_producto")
        .agg(unidades=("unidades", "sum"), ingreso=("ingreso", "sum"))
        .reset_index()
    )
    por_producto["nombre"] = por_producto["id_producto"].map(
        lambda pid: catalogo[pid].nombre if pid in catalogo else f"Producto {pid}"
    )
    por_producto["marca"] = por_producto["id_producto"].map(
        lambda pid: catalogo[pid].marca if pid in catalogo else "Sin marca"
    )
    por_producto["familia"] = por_producto["id_producto"].map(
        lambda pid: catalogo[pid].familia_olfativa if pid in catalogo else ""
    )

    top_productos = por_producto.sort_values("unidades", ascending=False).head(10)
    top_productos_out = [
        {
            "id_producto": int(r.id_producto),
            "nombre": r.nombre,
            "marca": r.marca,
            "unidades": int(r.unidades),
            "ingreso": float(r.ingreso),
        }
        for r in top_productos.itertuples()
    ]

    familia_counts: dict = {}
    for r in por_producto.itertuples():
        familias = r.familia.split("|") if r.familia else []
        for f in familias:
            familia_counts[f] = familia_counts.get(f, 0) + r.unidades
    ventas_por_familia_out = [
        {"familia": f, "unidades": int(u)}
        for f, u in sorted(familia_counts.items(), key=lambda x: -x[1])
    ]

    marca_counts = por_producto.groupby("marca")["unidades"].sum().sort_values(ascending=False)
    ventas_por_marca_out = [
        {"marca": m, "unidades": int(u)} for m, u in marca_counts.items()
    ]

    return {
        "periodo": periodo,
        "rango": [inicio.isoformat(), fin.isoformat()],
        "total_unidades": total_unidades,
        "total_ingresos": total_ingresos,
        "dias_con_quiebre": dias_con_quiebre,
        "ventas_por_dia": ventas_por_dia_out,
        "top_productos": top_productos_out,
        "ventas_por_familia": ventas_por_familia_out,
        "ventas_por_marca": ventas_por_marca_out,
    }
