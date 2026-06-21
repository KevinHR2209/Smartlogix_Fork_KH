# SmartLogix

SmartLogix es un sistema integral de comercio electrónico y gestión logística construido bajo una arquitectura de Microservicios. El proyecto utiliza Java 21 con Spring Boot para el backend, Next.js para el frontend y PostgreSQL como base de datos relacional, todo orquestado localmente mediante Docker Compose.

---

## Arquitectura y Microservicios

El sistema está dividido en pequeños servicios independientes, cada uno con una responsabilidad única y su propia base de datos lógica. 

* **API Gateway (`ms-gateway` - Puerto 8080):** Es el único punto de acceso público del ecosistema. Construido con Spring Cloud Gateway, recibe las peticiones del frontend, maneja las políticas de CORS globales y enruta el tráfico hacia los microservicios internos.

* **Inventario (`ms-inventario` - Puerto 8081):** Se encarga del catálogo de productos, control de stock y gestión de bodegas.

* **Clientes (`ms-clientes` - Puerto 8082):** Administra el registro y perfilamiento de los clientes, validando datos únicos como el RUT y el correo electrónico.

* **Ventas (`ms-ventas` - Puerto 8083):** Procesa el carrito de compras, registrando los pedidos, los detalles de compra (ítems) y la validación de pagos.

* **Logística (`ms-logistica` - Puerto 8084):** Gestiona la última milla. Crea despachos asociados a los pedidos, asigna transportistas y cambia los estados de entrega (Pendiente, En Ruta, Entregado).

* **Frontend (`smartlogix-frontend` - Puerto 3000):** Interfaz de usuario construida con Next.js (Node 20), React y Tailwind CSS.

* **Base de Datos (`smartlogix-postgres` - Puerto 5432):** Instancia única de PostgreSQL 15 que se inicializa automáticamente creando esquemas separados para cada microservicio gracias al script `init.sql`.

## Base de datos y persistencia

SmartLogix aplica el patrón de **Base de Datos por Microservicio** (Database-per-service) para garantizar un bajo acoplamiento. Físicamente, todas residen en un mismo contenedor de **PostgreSQL 15**, pero están separadas lógicamente.

La inicialización de las bases de datos se realiza de forma automática a través del archivo `smartlogix-infra/init.sql`, el cual es ejecutado por Docker al crear el volumen por primera vez:

    CREATE DATABASE ms_cliente;
    CREATE DATABASE ms_inventario;
    CREATE DATABASE ms_ventas;
    CREATE DATABASE ms_logistica;
    
**Tecnologías de Persistencia (JPA e Hibernate)**

La interacción con la base de datos se maneja a través de Spring Data JPA e Hibernate.

La creación de tablas y columnas (DDL) es gestionada automáticamente por Hibernate en base a las clases Java (anotadas con @Entity, @Table, @Column).

Las operaciones CRUD se exponen mediante interfaces que heredan de JpaRepository<T, ID>, evitando la escritura de consultas SQL manuales para las transacciones estándar.

Las llaves primarias utilizan @GeneratedValue(strategy = GenerationType.IDENTITY) delegando el autoincremento a PostgreSQL.

**Modelado por Microservicio**
1. **Microservicio de Inventario (ms_inventario)**
Encargado del almacenamiento físico y catálogo.

**Producto:** Representa los artículos vendibles del catálogo (precio, stock disponible, SKU).

**Bodega:** Ubicaciones físicas de almacenamiento.

**ProductoBodega:** Tabla intermedia/entidad que maneja el stock específico de un producto dentro de una bodega concreta.

**Repositorios:** ProductoRepository (extiende JpaRepository<Producto, Long>).

2. **Microservicio de Clientes (ms_cliente)**
Almacena el perfilado de los compradores.

**Cliente:** 
Información personal, contacto y rut (único).

**DireccionCliente:** Múltiples direcciones de despacho asociadas a un mismo cliente.

**Repositorios:** ClienteRepository, DireccionRepository.

3. **Microservicio de Ventas (ms_ventas)**
Núcleo del proceso de compra.

**Pedido:** Cabecera de la transacción. Almacena la fecha, el total, el estado del pedido y el idCliente (referencia lógica al ms-clientes, sin llave foránea dura).

**DetallePedido:** Ítems comprados dentro de un pedido (referencia lógica al idProducto del ms-inventario).

**Pago:** Transacciones financieras asociadas a un pedido.

**Repositorios:** PedidoRepository, PagoRepository.

4. Microservicio de Logística (ms_logistica)
Gestión de última milla y entregas.

**Despacho:** Cabecera del envío. Contiene la dirección, el estado (PENDIENTE, EN_RUTA, ENTREGADO) y la referencia lógica al idPedido del ms-ventas.

**Transportista:** Entidad asignable (@ManyToOne) a un despacho, con los datos de la empresa o persona que realiza la entrega.

**Repositorios:** DespachoRepository, TransportistaRepository.

Para mantener la independencia de los microservicios, no existen llaves foráneas (Foreign Keys) entre diferentes bases de datos. Las relaciones inter-dominio (ej: Un Pedido con un Cliente) se manejan guardando el ID como un campo numérico simple (referencia lógica) y los datos completos se cruzan vía peticiones de red a través del API Gateway o clientes internos.

##  Puesta en marcha local del proyecto

Este proyecto utiliza herramientas de contenedorización para no tener que instalar Java, Node o PostgreSQL en tu máquina local.

### Prerrequisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.

### Instrucciones de ejecución

1. Abre tu terminal favorita en la carpeta raíz del proyecto (donde se encuentra el archivo `docker-compose.yml`).
2. Ejecuta el siguiente comando para borrar cachés antiguos e iniciar el modo de desarrollo en vivo:
   ```bash
   docker compose down -v
   docker compose watch
