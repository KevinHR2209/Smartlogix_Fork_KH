import os
import random
from datetime import date

import joblib
import pandas as pd
from sqlalchemy.orm import Session

from app.db import CatalogoPerfume, VentaHistorica
from app.ml.features import FEATURES_DEMANDA, FEATURES_QUIEBRE

MODELOS_DIR = os.path.join(os.path.dirname(__file__), "modelos")

TEMPORADA_POR_MES = {
    12: "verano", 1: "verano", 2: "verano",
    3: "entretiempo", 4: "entretiempo", 5: "entretiempo",
    6: "invierno", 7: "invierno", 8: "invierno",
    9: "entretiempo", 10: "entretiempo", 11: "entretiempo",
}


def _cargar_modelo(nombre):
    path = os.path.join(MODELOS_DIR, nombre)
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"No existe {nombre}. Llama primero a POST /entrenar."
        )
    return joblib.load(path)


def _features_actuales(db: Session, id_producto: int) -> dict:
    hoy = date.today()
    producto = db.get(CatalogoPerfume, id_producto)
    if producto is None:
        raise ValueError(f"id_producto {id_producto} no existe en el catalogo")

    ultimas = (
        db.query(VentaHistorica)
        .filter(VentaHistorica.id_producto == id_producto)
        .order_by(VentaHistorica.fecha.desc())
        .limit(7)
        .all()
    )
    media_movil_7d = (
        sum(v.unidades_vendidas for v in ultimas) / len(ultimas) if ultimas else 0.0
    )
    # El stock_fin_dia del ultimo registro historico es, por definicion, el
    # stock disponible ahora mismo (equivalente al stock_inicio_dia de "hoy",
    # que es el dato que existiria en tiempo real al momento de predecir)
    stock_inicio_dia = ultimas[0].stock_fin_dia if ultimas else 0
    ruido_medicion = random.gauss(1.0, 0.20)
    dias_cobertura = (stock_inicio_dia / (media_movil_7d + 1)) * ruido_medicion

    temporada_actual = TEMPORADA_POR_MES[hoy.month]
    coincide_temporada = 1 if temporada_actual in producto.temporada.split("|") else 0

    return {
        "mes": hoy.month,
        "dia_semana": hoy.weekday(),
        "es_finde": int(hoy.weekday() >= 5),
        "coincide_temporada": coincide_temporada,
        "media_movil_7d": media_movil_7d,
        "precio_unitario": producto.precio_referencia,
        "dias_cobertura": dias_cobertura,
        "nombre": producto.nombre,
    }


def predecir_demanda(db: Session, id_producto: int) -> float:
    modelo = _cargar_modelo("modelo_demanda.joblib")
    feats = _features_actuales(db, id_producto)
    X = pd.DataFrame([{k: feats[k] for k in FEATURES_DEMANDA}])
    return float(modelo.predict(X)[0])


def predecir_quiebre(db: Session, id_producto: int) -> float:
    modelo = _cargar_modelo("modelo_quiebre.joblib")
    feats = _features_actuales(db, id_producto)
    X = pd.DataFrame([{k: feats[k] for k in FEATURES_QUIEBRE}])
    return float(modelo.predict_proba(X)[0][1])


def nivel_riesgo(probabilidad: float) -> str:
    if probabilidad >= 0.66:
        return "alto"
    if probabilidad >= 0.33:
        return "medio"
    return "bajo"
