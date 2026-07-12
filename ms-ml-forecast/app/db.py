import os

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    Float,
    Integer,
    String,
    create_engine,
)
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv(
    "SPRING_DATASOURCE_URL_PY",
    os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:password@postgres:5432/ms_ml_forecast",
    ),
)
# Si viene en formato JDBC (jdbc:postgresql://...), lo normalizamos a formato SQLAlchemy
if DATABASE_URL.startswith("jdbc:"):
    DATABASE_URL = DATABASE_URL.replace("jdbc:", "", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class CatalogoPerfume(Base):
    __tablename__ = "catalogo_perfumes"

    id_producto = Column(Integer, primary_key=True)
    nombre = Column(String, nullable=False)
    marca = Column(String, nullable=False)
    genero = Column(String, nullable=False)
    familia_olfativa = Column(String, nullable=False)  # separado por "|"
    formato = Column(String, nullable=False)
    version = Column(String, nullable=False)
    presentacion_ml = Column(Integer, nullable=False)
    temporada = Column(String, nullable=False)  # separado por "|"
    momento_uso = Column(String, nullable=False)  # separado por "|"
    precio_referencia = Column(Float, nullable=False)


class VentaHistorica(Base):
    __tablename__ = "ventas_historicas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fecha = Column(Date, nullable=False)
    id_producto = Column(Integer, nullable=False)
    unidades_vendidas = Column(Integer, nullable=False)
    unidades_demandadas = Column(Integer, nullable=False)
    stock_inicio_dia = Column(Integer, nullable=False, default=0)
    stock_fin_dia = Column(Integer, nullable=False)
    hubo_quiebre = Column(Boolean, nullable=False, default=False)
    precio_unitario = Column(Float, nullable=False)


class PrediccionDemanda(Base):
    __tablename__ = "predicciones_demanda"

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_producto = Column(Integer, nullable=False)
    fecha = Column(Date, nullable=False)
    demanda_predicha = Column(Float, nullable=False)


class AlertaQuiebre(Base):
    __tablename__ = "alertas_quiebre"

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_producto = Column(Integer, nullable=False)
    fecha = Column(Date, nullable=False)
    probabilidad_quiebre = Column(Float, nullable=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
