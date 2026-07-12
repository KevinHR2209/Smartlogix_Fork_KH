import json
import os

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import CatalogoPerfume, get_db
from app.schemas import PerfumeIn

router = APIRouter(prefix="/catalogo", tags=["catalogo"])

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")


def _serializar(p: CatalogoPerfume) -> dict:
    return {
        "id_producto": p.id_producto,
        "nombre": p.nombre,
        "marca": p.marca,
        "genero": p.genero,
        "familia_olfativa": p.familia_olfativa.split("|"),
        "formato": p.formato,
        "version": p.version,
        "presentacion_ml": p.presentacion_ml,
        "temporada": p.temporada.split("|"),
        "momento_uso": p.momento_uso.split("|"),
        "precio_referencia": p.precio_referencia,
    }


@router.get("")
def listar_catalogo(db: Session = Depends(get_db)):
    perfumes = db.query(CatalogoPerfume).all()
    return [_serializar(p) for p in perfumes]


@router.post("")
def cargar_catalogo_item(item: PerfumeIn, db: Session = Depends(get_db)):
    existente = db.get(CatalogoPerfume, item.id_producto)
    valores = dict(
        nombre=item.nombre,
        marca=item.marca,
        genero=item.genero,
        familia_olfativa="|".join(item.familia_olfativa),
        formato=item.formato,
        version=item.version,
        presentacion_ml=item.presentacion_ml,
        temporada="|".join(item.temporada),
        momento_uso="|".join(item.momento_uso),
        precio_referencia=item.precio_referencia,
    )
    if existente:
        for k, v in valores.items():
            setattr(existente, k, v)
    else:
        db.add(CatalogoPerfume(id_producto=item.id_producto, **valores))
    db.commit()
    return {"status": "ok", "id_producto": item.id_producto}


@router.post("/seed")
def cargar_catalogo_seed(db: Session = Depends(get_db)):
    """Carga el catalogo de las 20 fragancias base generado en app/ml/generar_catalogo.py"""
    path = os.path.join(DATA_DIR, "catalogo_perfumes.json")
    with open(path, encoding="utf-8") as f:
        catalogo = json.load(f)

    db.query(CatalogoPerfume).delete()
    for p in catalogo:
        db.add(CatalogoPerfume(
            id_producto=p["id_producto"],
            nombre=p["nombre"],
            marca=p["marca"],
            genero=p["genero"],
            familia_olfativa="|".join(p["familia_olfativa"]),
            formato=p["formato"],
            version=p["version"],
            presentacion_ml=p["presentacion_ml"],
            temporada="|".join(p["temporada"]),
            momento_uso="|".join(p["momento_uso"]),
            precio_referencia=p["precio_referencia"],
        ))
    db.commit()
    return {"status": "ok", "cargados": len(catalogo)}
