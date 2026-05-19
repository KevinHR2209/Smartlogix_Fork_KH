# SmartLogix - E-commerce & Logistics Platform

SmartLogix es una plataforma de e-commerce y gestión logística construida sobre una arquitectura de microservicios. Este proyecto demuestra la separación de dominios de negocio, comunicación a través de un API Gateway y un frontend moderno y reactivo.

## 🏗️ Arquitectura del Sistema

El proyecto está compuesto por los siguientes módulos:
- **Frontend (`/frontend`)**: Interfaz de usuario SPA construida con Next.js y Tailwind CSS.
- **API Gateway (`/ms-gateway`)**: Punto de entrada centralizado (Puerto 8080) construido con Spring Cloud Gateway.
- **Microservicios (Spring Boot - Java 17)**:
  - `ms_inventario`: Gestión del catálogo de productos.
  - `ms-clientes`: Directorio y perfiles de usuarios.
  - `ms-ventas`: Núcleo transaccional (Pedidos y Pagos).
  - `ms-logistica`: Gestión de flota de transportistas y estados de despacho.
- **Persistencia (`/smartlogix-infra`)**: Bases de datos PostgreSQL aisladas por servicio (Patrón *Database per Service*) orquestadas con Docker.

---

## 🚀 Requisitos Previos

Para ejecutar este proyecto en tu entorno local, necesitas tener instalado:
- **Docker** y **Docker Compose** (Para levantar las bases de datos).
- **Java 17** o superior (Para compilar y correr los microservicios).
- **Node.js** (v18+ recomendado) y **npm** (Para el frontend).

---

## 🛠️ Guía de Ejecución Paso a Paso

Sigue estos pasos en orden para levantar todo el ecosistema correctamente. Te recomendamos abrir varias pestañas en tu terminal.

### Paso 1: Levantar la Infraestructura (Bases de Datos)
Las bases de datos deben estar corriendo antes de iniciar cualquier microservicio.
1. Abre una terminal y navega a la carpeta de infraestructura:
   ```bash
   cd smartlogix-infra
   
   (Opcional) Si estás en macOS/Linux, asegúrate de que el script de inicialización tenga permisos de ejecución:

    Bash
    chmod +x init-multiple-dbs.sh
    Levanta los contenedores en segundo plano:

    Bash
    docker compose up -d
    
### Paso 2: Levantar los Microservicios (Backend)
    Debes ejecutar cada servicio de forma independiente. Abre una nueva pestaña en tu terminal para cada uno de los siguientes directorios y ejecuta el Maven Wrapper.

    Nota: El comando mostrado es para macOS/Linux (./mvnw). Si usas Windows, utiliza .\mvnw.cmd.

    1. API Gateway:

    Bash
    cd ms-gateway
    ./mvnw spring-boot:run
    2. MS Inventario:

    Bash
    cd ms_inventario
    ./mvnw spring-boot:run
    3. MS Clientes:

    Bash
    cd ms-clientes
    ./mvnw spring-boot:run
    4. MS Ventas:

    Bash
    cd ms-ventas
    ./mvnw spring-boot:run
    5. MS Logística:

    Bash
    cd ms-logistica
    ./mvnw spring-boot:run
    (Espera a que todos los servicios reporten que han iniciado correctamente antes de pasar al frontend).

### Paso 3: Levantar el Frontend
    Abre una última terminal para inicializar la interfaz de usuario.

    Entra a la carpeta del frontend:

    Bash
    cd frontend
    Instala las dependencias:

    Bash
    npm install
    Inicia el servidor de desarrollo:

    Bash
    npm run dev
    Abre tu navegador y visita: http://localhost:3000

### 📱 Flujos Disponibles en la Aplicación
    La interfaz de usuario está dividida en dos grandes áreas para demostrar el funcionamiento integral de la arquitectura:

    1. Tienda (Simulador de Cliente) - Ruta: /
    Simula la experiencia de compra de un usuario final.

    Catálogo Dinámico: Visualización de productos obtenidos desde el MS Inventario.

    Carrito de Compras: Panel lateral (Side Drawer) para agregar múltiples productos y calcular totales.

    Checkout Simulado: Permite seleccionar un cliente registrado y confirmar la compra. Esto se comunica con el MS Ventas para generar el Pedido y descontar lógicamente el total.

    2. Panel de Administración (Backoffice) - Ruta: /admin/*
    Barra lateral oscura que permite gestionar todos los dominios del sistema y simular procesos de negocio:

    📦 Inventario: CRUD completo de productos. Permite crear, editar (nombre, precio, descripción) y eliminar artículos del catálogo.

    👥 Clientes: Directorio interactivo para registrar compradores de prueba, editar su información de contacto y gestionarlos. (Es necesario crear al menos un cliente aquí antes de realizar una compra en la Tienda).

    🚚 Flota: Panel para registrar vehículos y conductores (transportistas) en el sistema logístico.

    📋 Transacciones: Monitor en tiempo real de los pedidos generados en la tienda. Permite a los administradores actualizar el ciclo de vida del pedido, cambiando su estado a "DESPACHADO".