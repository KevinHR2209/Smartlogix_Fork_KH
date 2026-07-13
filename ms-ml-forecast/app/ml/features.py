"""
Construye el dataframe de features a partir del catalogo + ventas historicas.
Usado tanto para entrenar como para predecir en produccion.
"""
import json
import os

import pandas as pd

BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")


def cargar_catalogo_df():
    with open(os.path.join(BASE_DIR, "catalogo_perfumes.json"), encoding="utf-8") as f:
        catalogo = json.load(f)
    df = pd.DataFrame(catalogo)
    df["familia_olfativa_str"] = df["familia_olfativa"].apply(lambda x: "|".join(x))
    df["temporada_str"] = df["temporada"].apply(lambda x: "|".join(x))
    df["momento_uso_str"] = df["momento_uso"].apply(lambda x: "|".join(x))
    return df


def cargar_ventas_df():
    with open(os.path.join(BASE_DIR, "ventas_historicas.json"), encoding="utf-8") as f:
        ventas = json.load(f)
    df = pd.DataFrame(ventas)
    df["fecha"] = pd.to_datetime(df["fecha"])
    return df


def construir_features(ventas_df: pd.DataFrame, catalogo_df: pd.DataFrame) -> pd.DataFrame:
    df = ventas_df.merge(catalogo_df, on="id_producto", how="left")

    df["mes"] = df["fecha"].dt.month
    df["dia_semana"] = df["fecha"].dt.dayofweek
    df["es_finde"] = (df["dia_semana"] >= 5).astype(int)

    temporada_mes = {
        12: "verano", 1: "verano", 2: "verano",
        3: "entretiempo", 4: "entretiempo", 5: "entretiempo",
        6: "invierno", 7: "invierno", 8: "invierno",
        9: "entretiempo", 10: "entretiempo", 11: "entretiempo",
    }
    df["temporada_actual"] = df["mes"].map(temporada_mes)
    df["coincide_temporada"] = df.apply(
        lambda r: 1 if r["temporada_actual"] in r["temporada"] else 0, axis=1
    )

    # ventana movil de ventas por producto (rolling, ordenado por fecha)
    df = df.sort_values(["id_producto", "fecha"])
    df["media_movil_7d"] = (
        df.groupby("id_producto")["unidades_vendidas"]
        .transform(lambda s: s.shift(1).rolling(7, min_periods=1).mean())
    )
    df["dias_desde_ultimo_quiebre"] = (
        df.groupby("id_producto")["hubo_quiebre"]
        .transform(lambda s: s.shift(1).fillna(False))
    )

    # dias de cobertura: cuantos dias de stock quedan al ritmo de venta actual.
    # Se le agrega ruido de medicion (+-20%) porque en sistemas reales el
    # conteo de stock casi nunca es perfectamente exacto en tiempo real
    # (mermas, conteos manuales, desfases de sincronizacion con bodega).
    import numpy as np
    ruido_medicion = np.random.default_rng(7).normal(1.0, 0.20, size=len(df))
    df["dias_cobertura"] = (
        df["stock_inicio_dia"] / (df["media_movil_7d"] + 1) * ruido_medicion
    )

    # target: va a haber quiebre en alguno de los proximos 7 dias (no hoy).
    # Esto obliga al modelo a anticipar una tendencia en vez de leer el
    # stock del mismo dia que ya casi define la respuesta.
    df["riesgo_quiebre_7d"] = (
        df.groupby("id_producto")["hubo_quiebre"]
        .transform(lambda s: s.shift(-1).rolling(7, min_periods=1).max())
        .fillna(0)
        .astype(int)
    )

    df["familia_olfativa_str"] = df["familia_olfativa_str"].fillna("")
    df["genero"] = df["genero"].fillna("unisex")
    df["formato"] = df["formato"].fillna("EDT")

    return df


FEATURES_DEMANDA = [
    "mes", "dia_semana", "es_finde", "coincide_temporada",
    "media_movil_7d", "precio_unitario",
]

FEATURES_QUIEBRE = [
    "mes", "dia_semana", "es_finde", "dias_cobertura",
    "media_movil_7d", "coincide_temporada",
]
TARGET_QUIEBRE = "riesgo_quiebre_7d"
