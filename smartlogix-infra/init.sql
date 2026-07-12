CREATE DATABASE ms_cliente;
CREATE DATABASE ms_inventario;
CREATE DATABASE ms_ventas;
CREATE DATABASE ms_logistica;
CREATE DATABASE ms_autenticacion;

-- =========================
-- ms_cliente
-- =========================
\connect ms_cliente

CREATE TABLE "region" (
                          "id_region" int PRIMARY KEY,
                          "nombre_region" varchar(100)
);

CREATE TABLE "provincia" (
                             "id_provincia" int PRIMARY KEY,
                             "id_region" int,
                             "nombre_provincia" varchar(100)
);

CREATE TABLE "comuna" (
                          "id_comuna" int PRIMARY KEY,
                          "id_provincia" int,
                          "nombre_comuna" varchar(100)
);

CREATE TABLE "cliente" (
                           "id_cliente" bigserial PRIMARY KEY,
                           "rut" varchar(12) UNIQUE,
                           "nombre" varchar(100),
                           "apellido_paterno" varchar(100),
                           "apellido_materno" varchar(100),
                           "correo" varchar(150) UNIQUE,
                           "telefono" varchar(20)
);

CREATE TABLE "direccion_cliente" (
                                     "id_direccion" bigserial PRIMARY KEY,
                                     "id_cliente" bigint,
                                     "id_comuna" int,
                                     "calle" varchar(150),
                                     "numero" varchar(20),
                                     "detalle" varchar(200),
                                     "es_principal" boolean DEFAULT true
);

-- =========================
-- ms_inventario (Esquema de Perfumes)
-- =========================
\connect ms_inventario

CREATE TABLE "marca" (
                         "id_marca" serial PRIMARY KEY,
                         "nombre" varchar(100) NOT NULL,
                         "pais_origen" varchar(100)
);

CREATE TABLE "familia_olfativa" (
                                    "id_familia" serial PRIMARY KEY,
                                    "nombre" varchar(100) NOT NULL,
                                    "descripcion" text
);

CREATE TABLE "perfume" (
                           "id_perfume" bigserial PRIMARY KEY,
                           "id_marca" int NOT NULL,
                           "id_familia" int,
                           "nombre" varchar(150) NOT NULL,
                           "descripcion" text,
                           "concentracion" varchar(50),
                           "genero" varchar(20),
                           "temporada" varchar(30),
                           "momento_uso" varchar(20),
                           "estado" varchar(30) DEFAULT 'activo'
);

CREATE TABLE "presentacion_perfume" (
                                        "id_presentacion" bigserial PRIMARY KEY,
                                        "id_perfume" bigint NOT NULL,
                                        "sku" varchar(50) UNIQUE NOT NULL,
                                        "codigo_barras" varchar(50) UNIQUE,
                                        "volumen_ml" int NOT NULL,
                                        "tipo_envase" varchar(50),
                                        "precio_actual" numeric(10,2) NOT NULL,
                                        "peso_gramos" int,
                                        "imagen_url" varchar(500),
                                        "activo" boolean DEFAULT true
);

CREATE TABLE "region" (
                          "id_region" serial PRIMARY KEY,
                          "codigo_region" varchar(10) UNIQUE,
                          "nombre_region" varchar(100) NOT NULL
);

CREATE TABLE "provincia" (
                             "id_provincia" serial PRIMARY KEY,
                             "id_region" int NOT NULL,
                             "nombre_provincia" varchar(100) NOT NULL
);

CREATE TABLE "comuna" (
                          "id_comuna" serial PRIMARY KEY,
                          "id_provincia" int NOT NULL,
                          "nombre_comuna" varchar(100) NOT NULL
);

CREATE TABLE "direccion_bodega" (
                                    "id_direccion_bodega" serial PRIMARY KEY,
                                    "id_comuna" int NOT NULL,
                                    "calle" varchar(150) NOT NULL,
                                    "numero" varchar(20),
                                    "detalle" varchar(200)
);

CREATE TABLE "bodega" (
                          "id_bodega" serial PRIMARY KEY,
                          "nombre" varchar(100) NOT NULL,
                          "id_direccion_bodega" int NOT NULL,
                          "activa" boolean DEFAULT true
);

CREATE TABLE "inventario" (
                              "id_inventario" bigserial PRIMARY KEY,
                              "id_bodega" int NOT NULL,
                              "id_presentacion" bigint NOT NULL,
                              "stock_disponible" int DEFAULT 0,
                              "stock_reservado" int DEFAULT 0,
                              "stock_minimo" int DEFAULT 5,
                              "ultima_actualizacion" timestamptz DEFAULT now(),
                              UNIQUE ("id_bodega", "id_presentacion")
);

CREATE TABLE "movimiento_inventario" (
                                         "id_movimiento" bigserial PRIMARY KEY,
                                         "tipo_movimiento" varchar(30) NOT NULL,
                                         "id_presentacion" bigint NOT NULL,
                                         "id_bodega_origen" int,
                                         "id_bodega_destino" int,
                                         "cantidad" int NOT NULL,
                                         "id_pedido" bigint,
                                         "observacion" text,
                                         "fecha_movimiento" timestamptz DEFAULT now(),
                                         "usuario_responsable" varchar(100)
);

-- =========================
-- ms_ventas
-- =========================
\connect ms_ventas

CREATE TABLE "pedido" (
                          "id_pedido" bigserial PRIMARY KEY,
                          "id_cliente" bigint,
                          "fecha_creacion" timestamptz DEFAULT now(),
                          "monto_total" int,
                          "estado_pedido" varchar(50)
);

CREATE TABLE "detalle_pedido" (
                                  "id_detalle" bigserial PRIMARY KEY,
                                  "id_pedido" bigint,
                                  "id_presentacion" bigint, -- CORREGIDO: Ahora es id_presentacion
                                  "cantidad" int,
                                  "precio_unitario_snapshot" int
);

CREATE TABLE "pago" ( -- AGREGADO: Tabla de pagos
                        "id_pago" bigserial PRIMARY KEY,
                        "id_pedido" bigint,
                        "monto_transaccion" int,
                        "metodo_pago" varchar(50),
                        "estado_pago" varchar(50),
                        "fecha_pago" timestamptz,
                        "token_transaccion" varchar(255)
);

-- =========================
-- ms_logistica
-- =========================
\connect ms_logistica

CREATE TABLE "transportista" (
                                 "id_transportista" serial PRIMARY KEY,
                                 "rut_empresa" varchar(12),
                                 "nombre_empresa" varchar(150)
);

CREATE TABLE "despacho" (
                            "id_despacho" bigserial PRIMARY KEY,
                            "id_pedido" bigint,
                            "id_transportista" int,
                            "codigo_seguimiento" varchar(100),
                            "estado_despacho" varchar(50),
                            "destinatario_nombre" varchar(200),
                            "despacho_calle" varchar(150),
                            "despacho_numero" varchar(20),
                            "despacho_comuna" varchar(100),
                            "despacho_region" varchar(100)
);

-- =========================
-- ms_autenticacion
-- =========================
\connect ms_autenticacion

CREATE TABLE usuarios (
                          id_usuario BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                          nombre VARCHAR(100) NOT NULL,
                          correo VARCHAR(150) NOT NULL UNIQUE,
                          password VARCHAR(255) NOT NULL,
                          rol VARCHAR(30) NOT NULL,
                          activo BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO usuarios (nombre, correo, password, rol, activo)
VALUES
    ('Administrador', 'admin@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'ADMIN', true),
    ('Cliente Demo', 'cliente@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'CLIENTE', true);