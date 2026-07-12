-- Esquema de referencia de ms_ml_forecast.
-- No hace falta ejecutarlo a mano: app/db.py -> init_db() crea estas tablas
-- automaticamente al levantar el servicio (Base.metadata.create_all).
-- Se deja aqui como documentacion y para poder aplicarlo manualmente si
-- se prefiere migrar con Flyway/Liquibase mas adelante, igual que el resto
-- de los microservicios del proyecto.

CREATE TABLE IF NOT EXISTS catalogo_perfumes (
    id_producto        INTEGER PRIMARY KEY,   -- referencia logica a producto.id_producto en ms-inventario
    nombre              VARCHAR NOT NULL,
    marca               VARCHAR NOT NULL,
    genero              VARCHAR NOT NULL,
    familia_olfativa    VARCHAR NOT NULL,      -- valores separados por "|", ej: "amaderada|citrica"
    formato             VARCHAR NOT NULL,      -- EDT, EDP, Parfum, Cologne
    version             VARCHAR NOT NULL,
    presentacion_ml     INTEGER NOT NULL,
    temporada           VARCHAR NOT NULL,      -- "verano|invierno|entretiempo"
    momento_uso         VARCHAR NOT NULL,      -- "dia|noche"
    precio_referencia   DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS ventas_historicas (
    id                   SERIAL PRIMARY KEY,
    fecha                DATE NOT NULL,
    id_producto          INTEGER NOT NULL,     -- referencia logica a catalogo_perfumes.id_producto
    unidades_vendidas    INTEGER NOT NULL,
    unidades_demandadas  INTEGER NOT NULL,     -- demanda real, incluso si no se pudo satisfacer
    stock_inicio_dia    INTEGER NOT NULL DEFAULT 0,  -- stock disponible ANTES de las ventas del dia (usado por el clasificador de quiebre, sin fuga de datos)
    stock_fin_dia        INTEGER NOT NULL,
    hubo_quiebre         BOOLEAN NOT NULL DEFAULT FALSE,
    precio_unitario      DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS predicciones_demanda (
    id                   SERIAL PRIMARY KEY,
    id_producto          INTEGER NOT NULL,
    fecha                DATE NOT NULL,
    demanda_predicha     DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS alertas_quiebre (
    id                    SERIAL PRIMARY KEY,
    id_producto           INTEGER NOT NULL,
    fecha                 DATE NOT NULL,
    probabilidad_quiebre  DOUBLE PRECISION NOT NULL
);
