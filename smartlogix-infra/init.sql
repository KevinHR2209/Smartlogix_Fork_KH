CREATE DATABASE ms_cliente;
CREATE DATABASE ms_inventario;
CREATE DATABASE ms_ventas;
CREATE DATABASE ms_logistica;
CREATE DATABASE ms_autenticacion;

-- =========================
-- ms_cliente
-- =========================

\connect ms_cliente

-- ============================================================
-- BD: ms_cliente  (ecommerce perfumes)
-- ============================================================


CREATE TABLE "region" (
  "id_region"      int PRIMARY KEY,
  "codigo_region"  varchar(10) UNIQUE,
  "nombre_region"  varchar(100) NOT NULL
);


CREATE TABLE "provincia" (
  "id_provincia"      int PRIMARY KEY,
  "id_region"         int NOT NULL,
  "nombre_provincia"  varchar(100) NOT NULL
);


CREATE TABLE "comuna" (
  "id_comuna"      int PRIMARY KEY,
  "id_provincia"   int NOT NULL,
  "nombre_comuna"  varchar(100) NOT NULL
);


CREATE TABLE "cliente" (
  "id_cliente"       bigserial PRIMARY KEY,
  "id_usuario_auth"  bigint UNIQUE,
  "rut"              varchar(12) UNIQUE,
  "nombre"           varchar(100),
  "apellido_paterno" varchar(100),
  "apellido_materno" varchar(100),
  "correo"           varchar(150) UNIQUE,
  "telefono"         varchar(20)
);


CREATE TABLE "direccion_cliente" (
  "id_direccion"  bigserial PRIMARY KEY,
  "id_cliente"    bigint NOT NULL,
  "id_comuna"     int,
  "calle"         varchar(150),
  "numero"        varchar(20),
  "detalle"       varchar(200),
  "es_principal"  boolean DEFAULT true
);


-- Claves foráneas
ALTER TABLE "provincia"        ADD FOREIGN KEY ("id_region")    REFERENCES "region"   ("id_region");
ALTER TABLE "comuna"           ADD FOREIGN KEY ("id_provincia") REFERENCES "provincia" ("id_provincia");
ALTER TABLE "direccion_cliente" ADD FOREIGN KEY ("id_cliente")  REFERENCES "cliente"  ("id_cliente");
ALTER TABLE "direccion_cliente" ADD FOREIGN KEY ("id_comuna")   REFERENCES "comuna"   ("id_comuna");


-- ============================================================
-- 1. REGION (PRIMERO)
-- ============================================================
INSERT INTO "region" ("id_region", "codigo_region", "nombre_region") VALUES
  (1,  'I',     'Arica y Parinacota'),
  (2,  'II',    'Antofagasta'),
  (3,  'III',   'Atacama'),
  (4,  'IV',    'Coquimbo'),
  (5,  'V',     'Valparaíso'),
  (6,  'VI',    'O''Higgins'),
  (7,  'VII',   'Maule'),
  (8,  'VIII',  'Biobío'),
  (9,  'IX',    'La Araucanía'),
  (10, 'X',     'Los Lagos'),
  (11, 'XI',    'Aysén'),
  (12, 'XII',   'Magallanes'),
  (13, 'RM',    'Metropolitana de Santiago'),
  (14, 'XIV',   'Los Ríos'),
  (15, 'XV',    'Arica y Parinacota'),
  (16, 'XVI',   'Ñuble');


-- ============================================================
-- 2. PROVINCIA (SEGUNDO)
-- ============================================================
INSERT INTO "provincia" ("id_provincia", "id_region", "nombre_provincia") VALUES
  -- Arica y Parinacota (I)
  (11,  1,  'Arica'),
  (12,  1,  'Parinacota'),
  
  -- Antofagasta (II)
  (21,  2,  'Antofagasta'),
  (22,  2,  'El Loa'),
  (23,  2,  'Tocopilla'),
  
  -- Atacama (III)
  (31,  3,  'Copiapó'),
  (32,  3,  'Chañaral'),
  (33,  3,  'Huasco'),
  
  -- Coquimbo (IV)
  (41,  4,  'Elqui'),
  (42,  4,  'Limarí'),
  (43,  4,  'Choapa'),
  
  -- Valparaíso (V)
  (51,  5,  'Valparaíso'),
  (52,  5,  'Isla de Pascua'),
  (53,  5,  'Los Andes'),
  (54,  5,  'Petorca'),
  (55,  5,  'Quillota'),
  (56,  5,  'San Antonio'),
  (57,  5,  'San Felipe de Aconcagua'),
  (58,  5,  'Marga Marga'),
  
  -- O'Higgins (VI)
  (61,  6,  'Cachapoal'),
  (62,  6,  'Colchagua'),
  (63,  6,  'Cardenal Caro'),
  
  -- Maule (VII)
  (71,  7,  'Talca'),
  (72,  7,  'Cachapoal'),
  (73,  7,  'Colbún'),
  (74,  7,  'Linares'),
  
  -- Biobío (VIII)
  (81,  8,  'Concepción'),
  (82,  8,  'Biobío'),
  (83,  8,  'Arauco'),
  
  -- La Araucanía (IX)
  (91,  9,  'Cautín'),
  (92,  9,  'Malleco'),
  
  -- Los Lagos (X)
  (101, 10, 'Llanquihue'),
  (102, 10, 'Chiloé'),
  (103, 10, 'Osorno'),
  (104, 10, 'Palena'),
  
  -- Aysén (XI)
  (111, 11, 'Coyhaique'),
  (112, 11, 'Aysén'),
  (113, 11, 'Capitán Prat'),
  (114, 11, 'General Carrera'),
  
  -- Magallanes (XII)
  (121, 12, 'Magallanes'),
  (122, 12, 'Antártica Chilena'),
  (123, 12, 'Tierra del Fuego'),
  (124, 12, 'Última Esperanza'),
  
  -- Metropolitana (RM)
  (131, 13, 'Santiago'),
  (132, 13, 'Cordillera'),
  (133, 13, 'Chacabuco'),
  (134, 13, 'Maipo'),
  (135, 13, 'Melipilla'),
  (136, 13, 'Talagante'),
  
  -- Los Ríos (XIV)
  (141, 14, 'Valdivia'),
  (142, 14, 'Ranco'),
  
  -- Arica y Parinacota (XV)
  (151, 15, 'Arica'),
  (152, 15, 'Parinacota'),
  
  -- Ñuble (XVI)
  (161, 16, 'Diguillín'),
  (162, 16, 'Punilla'),
  (163, 16, 'Itata');


-- ============================================================
-- 3. COMUNA (TERCERO - ANTES DE CLIENTES)
-- ============================================================
INSERT INTO "comuna" ("id_comuna", "id_provincia", "nombre_comuna") VALUES
  -- Arica (11)
  (1101, 11, 'Arica'),
  (1102, 11, 'Camarones'),
  
  -- Parinacota (12)
  (1201, 12, 'Putre'),
  (1202, 12, 'General Lagos'),
  
  -- Antofagasta (21)
  (2101, 21, 'Antofagasta'),
  (2102, 21, 'Mejillones'),
  (2103, 21, 'Sierra Gorda'),
  (2104, 21, 'Taltal'),
  
  -- El Loa (22)
  (2201, 22, 'Calama'),
  (2202, 22, 'Ollagüe'),
  (2203, 22, 'San Pedro de Atacama'),
  (2204, 22, 'Tocopilla'),
  
  -- Copiapó (31)
  (3101, 31, 'Copiapó'),
  (3102, 31, 'Caldera'),
  (3103, 31, 'Tierra Amarilla'),
  
  -- Elqui (41)
  (4101, 41, 'La Serena'),
  (4102, 41, 'Coquimbo'),
  (4103, 41, 'Andacollo'),
  (4104, 41, 'Paihuano'),
  (4105, 41, 'Vicuña'),
  
  -- Valparaíso (51)
  (5101, 51, 'Valparaíso'),
  (5102, 51, 'Casablanca'),
  (5103, 51, 'Concón'),
  (5104, 51, 'Juan Fernández'),
  (5105, 51, 'Puchuncaví'),
  (5106, 51, 'Quintero'),
  (5107, 51, 'Viña del Mar'),
  
  -- Santiago (131) - principales
  (13101, 131, 'Santiago'),
  (13102, 131, 'Cerrillos'),
  (13103, 131, 'Cerro Navia'),
  (13104, 131, 'Conchalí'),
  (13105, 131, 'El Bosque'),
  (13106, 131, 'Huechuraba'),
  (13107, 131, 'Independencia'),
  (13108, 131, 'La Cisterna'),
  (13109, 131, 'La Florida'),
  (13110, 131, 'La Granja'),
  (13111, 131, 'La Pintana'),
  (13112, 131, 'La Reina'),
  (13113, 131, 'Las Condes'),
  (13114, 131, 'Lo Barnechea'),
  (13115, 131, 'Lo Espejo'),
  (13116, 131, 'Lo Prado'),
  (13117, 131, 'Macul'),
  (13118, 131, 'Maipú'),
  (13119, 131, 'Ñuñoa'),
  (13120, 131, 'Pedro Aguirre Cerda'),
  (13121, 131, 'Peñalolén'),
  (13122, 131, 'Providencia'),
  (13123, 131, 'Pudahuel'),
  (13124, 131, 'Quilicura'),
  (13125, 131, 'Quinta Normal'),
  (13126, 131, 'Recoleta'),
  (13127, 131, 'Renca'),
  (13128, 131, 'San Joaquín'),
  (13129, 131, 'San Miguel'),
  (13130, 131, 'San Ramón'),
  (13131, 131, 'Vitacura'),
  
  -- Cordillera (132)
  (13201, 132, 'Puente Alto'),
  (13202, 132, 'Pirque'),
  (13203, 132, 'San José de Maipo'),
  
  -- Concepción (81)
  (8101, 81, 'Concepción'),
  (8102, 81, 'Coronel'),
  (8103, 81, 'Chiguayante'),
  (8104, 81, 'Florida'),
  (8105, 81, 'Hualqui'),
  (8106, 81, 'Lota'),
  (8107, 81, 'Penco'),
  (8108, 81, 'San Pedro de la Paz'),
  (8109, 81, 'Santa Juana'),
  
  -- Biobío (82)
  (8201, 82, 'Los Ángeles'),
  (8202, 82, 'Mulchén'),
  (8203, 82, 'Nacimiento'),
  (8204, 82, 'Negrete'),
  (8205, 82, 'Quilaco'),
  
  -- Llanquihue (101)
  (10101, 101, 'Puerto Montt'),
  (10102, 101, 'Calbuco'),
  (10103, 101, 'Cochamó'),
  (10104, 101, 'Maullín'),
  
  -- Chiloé (102)
  (10201, 102, 'Ancud'),
  (10202, 102, 'Castro'),
  (10203, 102, 'Chonchi'),
  (10204, 102, 'Curaco de Vélez'),
  (10205, 102, 'Dalcahue'),
  (10206, 102, 'Puqueldón'),
  (10207, 102, 'Queilén'),
  (10208, 102, 'Quellón'),
  (10209, 102, 'Quinchao'),
  
  -- Valdivia (141)
  (14101, 141, 'Valdivia'),
  (14102, 141, 'Corral'),
  (14103, 141, 'Lanco'),
  (14104, 141, 'Los Muermos'),
  (14105, 141, 'Máfil'),
  (14106, 141, 'Mariquina'),
  (14107, 141, 'Paillaco'),
  (14108, 141, 'Panguipulli');


-- ============================================================
-- 4. CLIENTES (AHORA SÍ - DESPUÉS DE COMUNAS)
-- ============================================================
INSERT INTO "cliente" ("id_usuario_auth", "rut", "nombre", "apellido_paterno", "apellido_materno", "correo", "telefono") VALUES
  (1,  '12345678-K',    'Christian', 'Pérez',      'Valenzuela', 'christian.perez@smartlogix.cl', '+56912345678'),
  (2,  '13456789-3',    'María',     'González',   'Flores',     'maria.gonzalez@smartlogix.cl',  '+56923456789'),
  (3,  '14567890-5',    'Carlos',    'Silva',      'Morales',    'carlos.silva@smartlogix.cl',    '+56934567890'),
  (4,  '15678901-7',    'Andrea',    'Muñoz',      'Soto',       'andrea.munoz@smartlogix.cl',    '+56945678901'),
  (5,  '16789012-9',    'Roberto',   'Díaz',       'Pérez',      'roberto.diaz@smartlogix.cl',    '+56956789012'),
  (6,  '17890123-1',    'Fernanda',  'Torres',     'García',     'fernanda.torres@smartlogix.cl', '+56967890123'),
  (7,  '18901234-2',    'Javier',    'Rojas',      'López',      'javier.rojas@smartlogix.cl',    '+56978901234'),
  (8,  '19012345-4',    'Valentina', 'López',      'Martínez',   'valentina.lopez@smartlogix.cl', '+56989012345'),
  (9,  '20123456-6',    'Diego',     'Ramírez',    'Sánchez',    'diego.ramirez@smartlogix.cl',   '+56990123456'),
  (10, '21234567-8',    'Camila',    'Herrera',    'Ruiz',       'camila.herrera@smartlogix.cl',  '+56901234567'),
  (11, '22345678-0',    'Sebastián', 'Castro',     'Ortega',     'sebastian.castro@smartlogix.cl', '+56911234567'),
  (12, '23456789-2',    'Isidora',   'Vargas',     'Romero',     'isidora.vargas@smartlogix.cl',  '+56922345678'),
  (13, '24567890-4',    'Admin',     'User',       'Test',       'admin@smartlogix.cl',           '+56933445566'),
  (14, '25678901-6',    'Cliente',   'Demo',       'Test',       'cliente@smartlogix.cl',         '+56944556677');


-- ============================================================
-- 5. DIRECCIONES DE CLIENTE (AHORA SÍ - CON COMUNAS EXISTENTES)
-- ============================================================
INSERT INTO "direccion_cliente" ("id_cliente", "id_comuna", "calle", "numero", "detalle", "es_principal") VALUES
  -- Christian Pérez - Santiago Centro (13101 existe)
  (1,  13101, 'Av. Libertador Bernardo O''Higgins', '1234', 'Depto 501', true),
  
  -- María González - Las Condes (13113 existe)
  (2,  13113, 'Av. Apoquindo', '4567', 'Oficina 302', true),
  
  -- Carlos Silva - Viña del Mar (5107 existe)
  (3,  5107, 'Esmeralda', '890', 'Piso 2', true),
  
  -- Andrea Muñoz - Concepción (8101 existe)
  (4,  8101, 'Av. Pedro de Valdivia', '1234', 'Casa A', true),
  
  -- Roberto Díaz - Puente Alto (13201 existe)
  (5,  13201, 'Av. Concha y Toro', '5678', 'Depto 1001', true),
  
  -- Fernanda Torres - Valparaíso (5101 existe)
  (6,  5101, 'Esmeralda', '910', 'Piso 3', true),
  
  -- Javier Rojas - La Serena (4101 existe)
  (7,  4101, 'Av. Francisco de Aguirre', '2345', 'Casa B', true),
  
  -- Valentina López - Antofagasta (2101 existe)
  (8,  2101, 'Av. Brasil', '3456', 'Depto 201', true),
  
  -- Diego Ramírez - Providencia (13122 existe)
  (9,  13122, 'Av. Providencia', '4567', 'Oficina 501', true),
  
  -- Camila Herrera - Quilicura (13124 existe)
  (10, 13124, 'Av. El Salto', '5678', 'Casa 10', true),
  
  -- Sebastián Castro - Maipú (13118 existe)
  (11, 13118, 'Av. Pajaritos', '6789', 'Depto 301', true),
  
  -- Isidora Vargas - Viña del Mar (5107 existe)
  (12, 5107, 'Av. San Martín', '7890', 'Piso 4', true),
  
  -- Admin User - Santiago (13101 existe)
  (13, 13101, 'Alameda', '1111', 'Oficina 101', true),
  
  -- Cliente Demo - Las Condes (13113 existe)
  (14, 13113, 'Av. Las Condes', '2222', 'Depto 401', true);
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

INSERT INTO "marca" ("nombre", "pais_origen") VALUES
  ('Dior', 'Francia'),
  ('Chanel', 'Francia'),
  ('Yves Saint Laurent', 'Francia'),
  ('Giorgio Armani', 'Italia'),
  ('Dolce & Gabbana', 'Italia'),
  ('Versace', 'Italia'),
  ('Calvin Klein', 'EE.UU.'),
  ('Ralph Lauren', 'EE.UU.'),
  ('Hugo Boss', 'Alemania'),
  ('Carolina Herrera', 'España'),
  ('Paco Rabanne', 'Francia'),
  ('Jean Paul Gaultier', 'Francia'),
  ('Montblanc', 'Alemania'),
  ('Bvlgari', 'Italia'),
  ('Tom Ford', 'EE.UU.');

-- ============================================================
-- 2. FAMILIAS OLFATIVAS
-- ============================================================
INSERT INTO "familia_olfativa" ("nombre", "descripcion") VALUES
  ('Cítrica', 'Notas frescas de limón, naranja, bergamota y pomelo. Ideales para día y verano.'),
  ('Floral', 'Aromas de flores como rosa, jazmín, lavanda. романтиcos y femeninos.'),
  ('Amaderada', 'Maderas, sándalo, cedro, vetiver. Cálidos y duraderos.'),
  ('Oriental', 'Especias, vainilla, ámbar, resinas. Intensos y sensuales.'),
  ('Fougère', 'Helecho, lavanda, musgo de roble. Clásicos masculinos.'),
  ('Chipre', 'Musgo de roble, pachulí, bergamota. Sofisticados y atemporales.'),
  ('Cítrico-Aromático', 'Combinación de cítricos con hierbas aromáticas.'),
  ('Amaderada-Especiado', 'Maderas con notas de pimienta, canela, cardamomo.'),
  ('Floral-Frutal', 'Flores con toques frutales dulces.'),
  ('Acuático', 'Notas de mar, brisa marina, algas. Frescos y modernos.');

-- ============================================================
-- 3. PERFUMES (20 productos reales)
-- ============================================================
INSERT INTO "perfume" ("id_marca", "id_familia", "nombre", "descripcion", "concentracion", "genero", "temporada", "momento_uso", "estado") VALUES
  (1,  4,  'Sauvage', 'Aromático y especiado, con bergamota de Calabria y notas amaderadas.', 'EDP', 'Hombre', 'Todo_anio', 'Dia_Noche', 'activo'),
  (2,  2,  'Bleu de Chanel', 'Cítrico amaderado con incienso y jengibre. Elegante y versátil.', 'EDP', 'Hombre', 'Todo_anio', 'Dia_Noche', 'activo'),
  (3,  4,  'Y Le Parfum', 'Intenso y misterioso, con haba tonka y vetiver.', 'Parfum', 'Hombre', 'Invierno', 'Noche', 'activo'),
  (4,  3,  'Acqua di Giò', 'Fresco y acuático, inspirado en el Mediterráneo.', 'EDT', 'Hombre', 'Verano', 'Dia', 'activo'),
  (5,  8,  'The One', 'Especiado oriental con tabaco y jengibre. Cálido y seductor.', 'EDP', 'Hombre', 'Otoño', 'Noche', 'activo'),
  (6,  1,  'Eros', 'Cítrico y fresco con menta y manzana verde. Energético.', 'EDT', 'Hombre', 'Primavera', 'Dia', 'activo'),
  (7,  3,  'Eternity', 'Amaderado clásico con notas de enebro y sándalo.', 'EDP', 'Hombre', 'Todo_anio', 'Dia', 'activo'),
  (8,  2,  'Polo Blue', 'Aromático y floral con lavanda y geranio.', 'EDT', 'Hombre', 'Verano', 'Dia', 'activo'),
  (9,  5,  'Boss Bottled', 'Fougère clásico con manzana y especias.', 'EDP', 'Hombre', 'Otoño', 'Dia', 'activo'),
  (10, 4,  '1 Million', 'Oriental especiado con cuero y ámbar. Impactante.', 'EDP', 'Hombre', 'Invierno', 'Noche', 'activo'),
  (11, 8,  '1 Million Lucky', 'Madera de avellano y haba tonka. Dulce y adictivo.', 'EDP', 'Hombre', 'Otoño', 'Dia_Noche', 'activo'),
  (12, 2,  'Le Male', 'Floral aromático con lavanda y vainilla.', 'EDT', 'Hombre', 'Invierno', 'Noche', 'activo'),
  (13, 3,  'Explorer', 'Amaderado con bergamota y pachulí. Aventura pura.', 'EDP', 'Hombre', 'Todo_anio', 'Dia', 'activo'),
  (14, 10, 'Aqva Pour Homme', 'Acuático intenso con algas y neroli.', 'EDT', 'Hombre', 'Verano', 'Dia', 'activo'),
  (15, 4,  'Tobacco Vanille', 'Oriental especiado con tabaco y vainilla. Luxe.', 'Parfum', 'Unisex', 'Invierno', 'Noche', 'activo'),
  (1,  2,  'J''adore', 'Floral exuberante con jazmín y rosa. Femenino.', 'EDP', 'Mujer', 'Todo_anio', 'Dia_Noche', 'activo'),
  (2,  9,  'Coco Mademoiselle', 'Floral-frutal con naranja y pachulí. Chic.', 'EDP', 'Mujer', 'Primavera', 'Dia', 'activo'),
  (3,  2,  'Mon Paris', 'Floral con peonía y jazmín. Romántico.', 'EDP', 'Mujer', 'Verano', 'Dia', 'activo'),
  (4,  7,  'Light Blue', 'Cítrico-aromático con limón de Sicilia. Fresco.', 'EDT', 'Mujer', 'Verano', 'Dia', 'activo'),
  (5,  2,  'Dolce', 'Floral con gardenia y neroli. Delicado y dulce.', 'EDP', 'Mujer', 'Primavera', 'Dia', 'activo');

-- ============================================================
-- 4. PRESENTACIONES (con SKUs reales)
-- ============================================================
INSERT INTO "presentacion_perfume" ("id_perfume", "sku", "codigo_barras", "volumen_ml", "tipo_envase", "precio_actual", "peso_gramos", "imagen_url", "activo") VALUES
  (1,  'DIO-SAU-EDP-100', '3348901453205', 100, 'Botella spray', 89990, 250, 'https://images.unsplash.com/photo-1541643600914-78b084683601', true),
  (1,  'DIO-SAU-EDP-50',  '3348901453212', 50,  'Botella spray', 59990, 180, 'https://images.unsplash.com/photo-1541643600914-78b084683601', true),
  (2,  'CHA-BLE-EDP-100', '3145891232015', 100, 'Botella spray', 94990, 260, 'https://images.unsplash.com/photo-1523293188086-b589b9e012cf', true),
  (3,  'YSL-PAR-100',     '3145891232022', 100, 'Botella spray', 79990, 240, 'https://images.unsplash.com/photo-1594035910387-fea477942698', true),
  (4,  'ARM-ACQ-EDT-100', '3365462222333', 100, 'Botella spray', 72990, 230, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539', true),
  (5,  'DG-ONE-EDP-100',  '3348901232111', 100, 'Botella spray', 69990, 250, 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad', true),
  (6,  'VER-ERO-EDT-100', '3348901232222', 100, 'Botella spray', 64990, 240, 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d', true),
  (7,  'CK-ETE-EDP-100',  '3348901232333', 100, 'Botella spray', 54990, 220, 'https://images.unsplash.com/photo-1588405764423-7271432914a5', true),
  (8,  'RL-POL-EDT-100',  '3348901232444', 100, 'Botella spray', 59990, 230, 'https://images.unsplash.com/photo-1592945566403-ab6f3177775d', true),
  (9,  'HUG-BOT-EDP-100', '3348901232555', 100, 'Botella spray', 62990, 240, 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d', true),
  (10, 'CH-1M-EDP-100',   '3348901232666', 100, 'Botella spray', 74990, 260, 'https://images.unsplash.com/photo-1541643600914-78b084683601', true),
  (11, 'CH-1ML-EDP-100',  '3348901232777', 100, 'Botella spray', 79990, 260, 'https://images.unsplash.com/photo-1523293188086-b589b9e012cf', true),
  (12, 'JPG-LEM-EDT-100', '3348901232888', 100, 'Botella spray', 67990, 250, 'https://images.unsplash.com/photo-1594035910387-fea477942698', true),
  (13, 'MON-EXP-EDP-100', '3348901232999', 100, 'Botella spray', 69990, 240, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539', true),
  (14, 'BVL-AQV-EDT-100', '3348901233001', 100, 'Botella spray', 64990, 230, 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad', true),
  (15, 'TF-TV-100',       '3348901233112', 100, 'Botella spray', 149990, 280, 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d', true),
  (16, 'DIO-JAD-EDP-100', '3348901233223', 100, 'Botella spray', 99990, 260, 'https://images.unsplash.com/photo-1541643600914-78b084683601', true),
  (17, 'CHA-COC-EDP-100', '3348901233334', 100, 'Botella spray', 104990, 270, 'https://images.unsplash.com/photo-1523293188086-b589b9e012cf', true),
  (18, 'YSL-MON-EDP-100', '3348901233445', 100, 'Botella spray', 84990, 250, 'https://images.unsplash.com/photo-1594035910387-fea477942698', true),
  (19, 'ARM-LDB-EDT-100', '3348901233556', 100, 'Botella spray', 69990, 230, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539', true),
  (20, 'DG-DOL-EDP-100',  '3348901233667', 100, 'Botella spray', 74990, 250, 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad', true);

-- ============================================================
-- 5. BODEGAS (con direcciones reales)
-- ============================================================
INSERT INTO "direccion_bodega" ("id_comuna", "calle", "numero", "detalle") VALUES
  (13101, 'Av. Libertador Bernardo O''Higgins', '1234', 'Santiago Centro'),
  (13201, 'Av. Concha y Toro', '5678', 'Puente Alto'),
  (5101, 'Esmeralda', '910', 'Valparaíso'),
  (8101, 'Av. Pedro de Valdivia', '1112', 'Concepción'),
  (13113, 'Av. Apoquindo', '3333', 'Las Condes');

INSERT INTO "bodega" ("nombre", "id_direccion_bodega", "activa") VALUES
  ('Bodega Central Santiago', 1, true),
  ('Bodega Puente Alto', 2, true),
  ('Bodega Valparaíso', 3, true),
  ('Bodega Concepción', 4, true),
  ('Bodega Las Condes', 5, true);

-- ============================================================
-- 6. INVENTARIO INICIAL (stock distribuido por región)
-- ============================================================
INSERT INTO "inventario" ("id_bodega", "id_presentacion", "stock_disponible", "stock_reservado", "stock_minimo") VALUES
  -- Bodega Central (1)
  (1, 1, 150, 10, 5),
  (1, 2, 80,  5,  5),
  (1, 3, 120, 8,  5),
  (1, 4, 90,  6,  5),
  (1, 5, 100, 7,  5),
  
  -- Bodega Puente Alto (2)
  (2, 1, 70,  5,  5),
  (2, 2, 40,  3,  5),
  (2, 6, 60,  4,  5),
  (2, 7, 50,  3,  5),
  
  -- Bodega Valparaíso (3)
  (3, 1, 45,  3,  5),
  (3, 8, 35,  2,  5),
  (3, 9, 40,  3,  5),
  
  -- Bodega Concepción (4)
  (4, 1, 30,  2,  5),
  (4, 10, 25, 2,  5),
  (4, 11, 20, 1,  5),
  
  -- Bodega Las Condes (5)
  (5, 15, 15,  1,  5),
  (5, 16, 12,  1,  5),
  (5, 17, 10,  1,  5),
  (5, 18, 8,   1,  5),
  (5, 19, 10,  1,  5),
  (5, 20, 7,   1,  5);

INSERT INTO "region" ("id_region", "codigo_region", "nombre_region") VALUES
  (1,  'I',     'Arica y Parinacota'),
  (2,  'II',    'Antofagasta'),
  (3,  'III',   'Atacama'),
  (4,  'IV',    'Coquimbo'),
  (5,  'V',     'Valparaíso'),
  (6,  'VI',    'O''Higgins'),
  (7,  'VII',   'Maule'),
  (8,  'VIII',  'Biobío'),
  (9,  'IX',    'La Araucanía'),
  (10, 'X',     'Los Lagos'),
  (11, 'XI',    'Aysén'),
  (12, 'XII',   'Magallanes'),
  (13, 'RM',    'Metropolitana de Santiago'),
  (14, 'XIV',   'Los Ríos'),
  (15, 'XV',    'Arica y Parinacota'),
  (16, 'XVI',   'Ñuble');

-- ============================================================
-- 2. PROVINCIA (56 provincias)
-- ============================================================
INSERT INTO "provincia" ("id_provincia", "id_region", "nombre_provincia") VALUES
  -- Arica y Parinacota (I)
  (11,  1,  'Arica'),
  (12,  1,  'Parinacota'),
  
  -- Antofagasta (II)
  (21,  2,  'Antofagasta'),
  (22,  2,  'El Loa'),
  (23,  2,  'Tocopilla'),
  
  -- Atacama (III)
  (31,  3,  'Copiapó'),
  (32,  3,  'Chañaral'),
  (33,  3,  'Huasco'),
  
  -- Coquimbo (IV)
  (41,  4,  'Elqui'),
  (42,  4,  'Limarí'),
  (43,  4,  'Choapa'),
  
  -- Valparaíso (V)
  (51,  5,  'Valparaíso'),
  (52,  5,  'Isla de Pascua'),
  (53,  5,  'Los Andes'),
  (54,  5,  'Petorca'),
  (55,  5,  'Quillota'),
  (56,  5,  'San Antonio'),
  (57,  5,  'San Felipe de Aconcagua'),
  (58,  5,  'Marga Marga'),
  
  -- O'Higgins (VI)
  (61,  6,  'Cachapoal'),
  (62,  6,  'Colchagua'),
  (63,  6,  'Cardenal Caro'),
  
  -- Maule (VII)
  (71,  7,  'Talca'),
  (72,  7,  'Cachapoal'),
  (73,  7,  'Colbún'),
  (74,  7,  'Linares'),
  
  -- Biobío (VIII)
  (81,  8,  'Concepción'),
  (82,  8,  'Biobío'),
  (83,  8,  'Arauco'),
  
  -- La Araucanía (IX)
  (91,  9,  'Cautín'),
  (92,  9,  'Malleco'),
  
  -- Los Lagos (X)
  (101, 10, 'Llanquihue'),
  (102, 10, 'Chiloé'),
  (103, 10, 'Osorno'),
  (104, 10, 'Palena'),
  
  -- Aysén (XI)
  (111, 11, 'Coyhaique'),
  (112, 11, 'Aysén'),
  (113, 11, 'Capitán Prat'),
  (114, 11, 'General Carrera'),
  
  -- Magallanes (XII)
  (121, 12, 'Magallanes'),
  (122, 12, 'Antártica Chilena'),
  (123, 12, 'Tierra del Fuego'),
  (124, 12, 'Última Esperanza'),
  
  -- Metropolitana (RM)
  (131, 13, 'Santiago'),
  (132, 13, 'Cordillera'),
  (133, 13, 'Chacabuco'),
  (134, 13, 'Maipo'),
  (135, 13, 'Melipilla'),
  (136, 13, 'Talagante'),
  
  -- Los Ríos (XIV)
  (141, 14, 'Valdivia'),
  (142, 14, 'Ranco'),
  
  -- Arica y Parinacota (XV) - duplicada por codificación INE
  (151, 15, 'Arica'),
  (152, 15, 'Parinacota'),
  
  -- Ñuble (XVI)
  (161, 16, 'Diguillín'),
  (162, 16, 'Punilla'),
  (163, 16, 'Itata');

-- ============================================================
-- 3. COMUNA (346 comunas - muestra de las principales)
-- ============================================================
INSERT INTO "comuna" ("id_comuna", "id_provincia", "nombre_comuna") VALUES
  -- Arica (11)
  (1101, 11, 'Arica'),
  (1102, 11, 'Camarones'),
  
  -- Parinacota (12)
  (1201, 12, 'Putre'),
  (1202, 12, 'General Lagos'),
  
  -- Antofagasta (21)
  (2101, 21, 'Antofagasta'),
  (2102, 21, 'Mejillones'),
  (2103, 21, 'Sierra Gorda'),
  (2104, 21, 'Taltal'),
  
  -- El Loa (22)
  (2201, 22, 'Calama'),
  (2202, 22, 'Ollagüe'),
  (2203, 22, 'San Pedro de Atacama'),
  (2204, 22, 'Tocopilla'),
  
  -- Copiapó (31)
  (3101, 31, 'Copiapó'),
  (3102, 31, 'Caldera'),
  (3103, 31, 'Tierra Amarilla'),
  
  -- Elqui (41)
  (4101, 41, 'La Serena'),
  (4102, 41, 'Coquimbo'),
  (4103, 41, 'Andacollo'),
  (4104, 41, 'Paihuano'),
  (4105, 41, 'Vicuña'),
  
  -- Valparaíso (51)
  (5101, 51, 'Valparaíso'),
  (5102, 51, 'Casablanca'),
  (5103, 51, 'Concón'),
  (5104, 51, 'Juan Fernández'),
  (5105, 51, 'Puchuncaví'),
  (5106, 51, 'Quintero'),
  (5107, 51, 'Viña del Mar'),
  
  -- Santiago (131) - principales
  (13101, 131, 'Santiago'),
  (13102, 131, 'Cerrillos'),
  (13103, 131, 'Cerro Navia'),
  (13104, 131, 'Conchalí'),
  (13105, 131, 'El Bosque'),
  (13106, 131, 'Huechuraba'),
  (13107, 131, 'Independencia'),
  (13108, 131, 'La Cisterna'),
  (13109, 131, 'La Florida'),
  (13110, 131, 'La Granja'),
  (13111, 131, 'La Pintana'),
  (13112, 131, 'La Reina'),
  (13113, 131, 'Las Condes'),
  (13114, 131, 'Lo Barnechea'),
  (13115, 131, 'Lo Espejo'),
  (13116, 131, 'Lo Prado'),
  (13117, 131, 'Macul'),
  (13118, 131, 'Maipú'),
  (13119, 131, 'Ñuñoa'),
  (13120, 131, 'Pedro Aguirre Cerda'),
  (13121, 131, 'Peñalolén'),
  (13122, 131, 'Providencia'),
  (13123, 131, 'Pudahuel'),
  (13124, 131, 'Quilicura'),
  (13125, 131, 'Quinta Normal'),
  (13126, 131, 'Recoleta'),
  (13127, 131, 'Renca'),
  (13128, 131, 'San Joaquín'),
  (13129, 131, 'San Miguel'),
  (13130, 131, 'San Ramón'),
  (13131, 131, 'Vitacura'),
  
  -- Cordillera (132)
  (13201, 132, 'Puente Alto'),
  (13202, 132, 'Pirque'),
  (13203, 132, 'San José de Maipo'),
  
  -- Concepción (81)
  (8101, 81, 'Concepción'),
  (8102, 81, 'Coronel'),
  (8103, 81, 'Chiguayante'),
  (8104, 81, 'Florida'),
  (8105, 81, 'Hualqui'),
  (8106, 81, 'Lota'),
  (8107, 81, 'Penco'),
  (8108, 81, 'San Pedro de la Paz'),
  (8109, 81, 'Santa Juana'),
  
  -- Concepción repetido (82) - Biobío
  (8201, 82, 'Los Ángeles'),
  (8202, 82, 'Mulchén'),
  (8203, 82, 'Nacimiento'),
  (8204, 82, 'Negrete'),
  (8205, 82, 'Quilaco'),
  
  -- Llanquihue (101)
  (10101, 101, 'Puerto Montt'),
  (10102, 101, 'Calbuco'),
  (10103, 101, 'Cochamó'),
  (10104, 101, 'Maullín'),
  
  -- Chiloé (102)
  (10201, 102, 'Ancud'),
  (10202, 102, 'Castro'),
  (10203, 102, 'Chonchi'),
  (10204, 102, 'Curaco de Vélez'),
  (10205, 102, 'Dalcahue'),
  (10206, 102, 'Puqueldón'),
  (10207, 102, 'Queilén'),
  (10208, 102, 'Quellón'),
  (10209, 102, 'Quinchao'),
  
  -- Valdivia (141)
  (14101, 141, 'Valdivia'),
  (14102, 141, 'Corral'),
  (14103, 141, 'Lanco'),
  (14104, 141, 'Los Muermos'),
  (14105, 141, 'Máfil'),
  (14106, 141, 'Mariquina'),
  (14107, 141, 'Paillaco'),
  (14108, 141, 'Panguipulli');

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

INSERT INTO "pedido" ("id_cliente", "fecha_creacion", "monto_total", "estado_pedido") VALUES
  (1,  NOW() - INTERVAL '2 days', 149990, 'COMPLETADO'),
  (2,  NOW() - INTERVAL '1 day',  89990,  'ENVIADO'),
  (1,  NOW() - INTERVAL '3 hours', 79990, 'PENDIENTE_PAGO');

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

INSERT INTO usuarios ("id_usuario", "nombre", "correo", "password", "rol", "activo") VALUES
  (1, 'Christian Pérez', 'christian.perez@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'CLIENTE', true),
  (2, 'María González', 'maria.gonzalez@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'CLIENTE', true),
  (3, 'Carlos Silva', 'carlos.silva@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'CLIENTE', true),
  (4, 'Andrea Muñoz', 'andrea.munoz@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'CLIENTE', true),
  (5, 'Roberto Díaz', 'roberto.diaz@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'CLIENTE', true),
  (6, 'Fernanda Torres', 'fernanda.torres@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'CLIENTE', true),
  (7, 'Javier Rojas', 'javier.rojas@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'CLIENTE', true),
  (8, 'Valentina López', 'valentina.lopez@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'CLIENTE', true),
  (9, 'Diego Ramírez', 'diego.ramirez@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'CLIENTE', true),
  (10, 'Camila Herrera', 'camila.herrera@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'CLIENTE', true),
  (11, 'Sebastián Castro', 'sebastian.castro@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'CLIENTE', true),
  (12, 'Isidora Vargas', 'isidora.vargas@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'CLIENTE', true),
  (13, 'Admin User', 'admin@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'ADMIN', true),
  (14, 'Cliente Demo', 'cliente@smartlogix.cl', '$2a$10$F6p8JeVuBHD2GBWX3FHz5eqqNjZJJqy346x8ogucU8oZofIoa2A0i', 'CLIENTE', true);