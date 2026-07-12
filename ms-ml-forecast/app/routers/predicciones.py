from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import CatalogoPerfume, get_db
from app.ml.predecir import nivel_riesgo, predecir_demanda, predecir_quiebre

router = APIRouter(tags=["predicciones"])


@router.get("/predicciones/demanda/{id_producto}")
def prediccion_demanda(id_producto: int, db: Session = Depends(get_db)):
    try:
        demanda = predecir_demanda(db, id_producto)
    except (FileNotFoundError, ValueError) as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"id_producto": id_producto, "demanda_predicha_dia": round(demanda, 2)}


@router.get("/alertas/quiebre")
def alertas_quiebre(db: Session = Depends(get_db)):
    productos = db.query(CatalogoPerfume).all()
    alertas = []
    for p in productos:
        try:
            prob = predecir_quiebre(db, p.id_producto)
        except (FileNotFoundError, ValueError):
            continue
        alertas.append({
            "id_producto": p.id_producto,
            "nombre": p.nombre,
            "probabilidad_quiebre": round(prob, 3),
            "nivel_riesgo": nivel_riesgo(prob),
        })
    alertas.sort(key=lambda a: a["probabilidad_quiebre"], reverse=True)
    return alertas
