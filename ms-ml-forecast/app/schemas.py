from typing import List

from pydantic import BaseModel


class PerfumeIn(BaseModel):
    id_producto: int
    nombre: str
    marca: str
    genero: str
    familia_olfativa: List[str]
    formato: str
    version: str
    presentacion_ml: int
    temporada: List[str]
    momento_uso: List[str]
    precio_referencia: float


class PerfumeOut(PerfumeIn):
    class Config:
        from_attributes = True


class PrediccionDemandaOut(BaseModel):
    id_producto: int
    demanda_predicha_7d: float
    unidad: str = "unidades/dia (promedio proxima semana)"


class AlertaQuiebreOut(BaseModel):
    id_producto: int
    nombre: str
    probabilidad_quiebre: float
    nivel_riesgo: str
