from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.etl import sync_desde_microservicios
from app.ml.entrenar import main as entrenar_modelos

router = APIRouter(tags=["sync"])


@router.post("/sync")
async def sync(db: Session = Depends(get_db)):
    resultado = await sync_desde_microservicios(db)
    return resultado


@router.post("/entrenar")
def entrenar(db: Session = Depends(get_db)):
    metricas = entrenar_modelos()
    return {"status": "ok", "metricas": metricas}
