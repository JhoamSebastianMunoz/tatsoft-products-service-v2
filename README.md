# TATSoft Products Service v2

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/JhoamSebastianMunoz/tatsoft-products-service-v2)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com/)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)

Microservicio RESTful para la gestión de productos en plataformas de e-commerce. Construido con **Express**, **TypeScript** y **Supabase (PostgreSQL)**, con autenticación JWT, autorización basada en roles, almacenamiento de imágenes en Supabase Storage y documentación interactiva con Scalar.

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y configuración](#instalación-y-configuración)
- [Scripts disponibles](#scripts-disponibles)
- [Documentación de la API](#documentación-de-la-api)
- [Endpoints de la API (v2)](#endpoints-de-la-api-v2)
- [Autenticación y autorización](#autenticación-y-autorización)
- [Base de datos y almacenamiento](#base-de-datos-y-almacenamiento)
- [Caché y rate limiting](#caché-y-rate-limiting)
- [Manejo de errores](#manejo-de-errores)
- [Despliegue](#despliegue)
- [Pruebas](#pruebas)
- [Calidad de código](#calidad-de-código)
- [Repositorios relacionados](#repositorios-relacionados)
- [Contacto](#contacto)

---

## Descripción general

**TATSoft Products Service v2** es una API lista para producción que permite gestionar productos, categorías, imágenes, inventario de stock y reportes. Sigue los **principios SOLID** con una arquitectura limpia **Repositorio–Servicio–Controlador**, usa **Supabase** como plataforma backend (Base de datos PostgreSQL + Storage + Auth) y está preparada para desplegarse en **Vercel Serverless Functions**.

### Características principales

- **API RESTful v2** con métodos HTTP correctos y URLs basadas en recursos.
- **Autenticación JWT** mediante tokens Bearer.
- **Control de acceso basado en roles** (rol `ADMINISTRADOR` para operaciones de escritura).
- **Supabase Storage** para la carga de imágenes de productos.
- **Documentación interactiva** con Scalar en `/api-docs`.
- **Caché inteligente** (TTL de 5 minutos) con invalidación automática en escrituras.
- **Rate limiting** (100 peticiones por minuto por usuario).
- **Validación robusta** con express-validator.
- **Respuestas de error estandarizadas** con mapeo de códigos de error de Supabase.
- **Despliegue serverless** en Vercel.
- **Pruebas** con Jest + Supertest.

---

## Stack tecnológico

| Categoría | Tecnologías |
|-----------|-------------|
| **Runtime** | Node.js 20+, TypeScript 5.2 |
| **Framework** | Express.js 4.18 |
| **Base de datos** | Supabase (PostgreSQL) vía `pg` y `@supabase/supabase-js` |
| **Almacenamiento** | Supabase Storage |
| **Autenticación** | JWT (`jsonwebtoken`), bcryptjs |
| **Validación** | express-validator 7.0 |
| **Documentación API** | Scalar (`@scalar/express-api-reference`), OpenAPI 3.0 (YAML) |
| **Seguridad** | Helmet, CORS, Morgan (logging) |
| **Carga de archivos** | Multer |
| **Pruebas** | Jest 29, Supertest, ts-jest |
| **Calidad de código** | ESLint, TypeScript ESLint |
| **Despliegue** | Vercel Serverless Functions |
| **Utilidades** | UUID, dotenv, yamljs, axios |

---

## Arquitectura

El proyecto sigue una **arquitectura limpia** con **principios SOLID**:

```
┌─────────────────────────────────────────────────────────────┐
│                        Capa API                              │
│  Routes → Controllers → Middleware (Auth/Validación)         │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                    Capa de Servicios                         │
│  ProductService → ProductImageService → CategoriaService     │
│  StockService → ReportsService → ImageService                │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                   Capa de Repositorios                       │
│  ProductRepository → CategoriaRepository → StockRepository   │
│  ProductImageRepository → ReportsRepository                  │
│                    (Cliente Supabase)                        │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                    Plataforma Supabase                       │
│  Base de datos PostgreSQL + Storage + Auth                   │
└─────────────────────────────────────────────────────────────┘
```

### Patrones de diseño

- **Repository Pattern**: abstracción del acceso a datos.
- **Service Layer**: encapsulamiento de la lógica de negocio.
- **DTOs (Data Transfer Objects)**: contratos de petición/respuesta tipados.
- **Middleware Pipeline**: autenticación, validación y manejo de errores.
- **Dependency Inversion**: los servicios dependen de interfaces de repositorio.

---

## Estructura del proyecto

```
tatsoft-products-service-v2/
├── api/
│   └── index.ts                  # Punto de entrada serverless de Vercel
├── config/
│   └── config-supabaseStorage.ts # Configuración del cliente Supabase
├── controllers/
│   ├── productController/        # Controladores CRUD de productos
│   ├── categoryController/       # Controladores CRUD de categorías
│   ├── imageController/          # Controladores de carga/eliminación de imágenes
│   ├── InventoryController/      # Controladores de gestión de stock
│   ├── reportsController/        # Controladores de reportes
│   └── microservicePresaleController/
├── Dto/
│   ├── productDto/               # DTOs de producto (Create, Update, Get, Delete)
│   └── imageDto/                 # DTOs de imagen
├── Helpers/
│   ├── generateToken.ts          # Generación de tokens JWT
│   ├── generateHash.ts           # Hashing de contraseñas
│   └── ImageUploadHelper.ts      # Utilidades de carga de imágenes
├── middleware/
│   ├── verifyToken.ts            # Verificación de JWT
│   ├── checkRoleAndPermission.ts # Autorización por roles
│   ├── validationMiddleware.ts   # Manejo de errores de validación
│   ├── productValidators.ts      # Reglas de validación de productos
│   ├── productMiddleware/        # Validadores específicos de productos
│   ├── imageMiddleware/          # Validadores específicos de imágenes
│   ├── categoryMiddleware/       # Validadores de categorías
│   ├── cacheMiddleware.ts        # Caché de respuestas
│   └── errorHandler.ts           # Manejo global de errores
├── repositories/
│   ├── ProductRepository.ts      # Acceso a datos de productos
│   ├── CategoriaRepository.ts    # Acceso a datos de categorías
│   ├── ProductImageRepository.ts # Acceso a datos de imágenes
│   ├── stockRepository.ts        # Acceso a datos de stock
│   ├── ReportsRepository.ts      # Acceso a datos de reportes
│   ├── MicroservicePresaleRepository.ts
│   └── SupabaseImageRepository.ts # Operaciones de Supabase Storage
├── routes/
│   └── v2/                       # Rutas de la API v2
│       ├── products.ts
│       ├── categories.ts
│       ├── images.ts
│       ├── stock.ts
│       └── reports.ts
├── services/
│   ├── ProductService.ts         # Lógica de negocio de productos
│   ├── ProductImageService.ts    # Lógica de negocio de imágenes
│   ├── categoriaService.ts       # Lógica de negocio de categorías
│   ├── stockService.ts           # Lógica de negocio de stock
│   ├── ReportsService.ts         # Lógica de negocio de reportes
│   ├── ImageService.ts           # Lógica de negocio de imágenes
│   ├── optimizedProductService.ts
│   ├── productStrategies.ts
│   └── MicroservicePresaleService.ts
├── dist/                         # JavaScript compilado
├── docs/
│   └── API_DOCUMENTATION.md      # Documentación detallada de la API
├── app.ts                        # Configuración de la app Express
├── swagger.yaml                  # Especificación OpenAPI 3.0
├── swagger-v2.yaml               # Especificación OpenAPI alternativa
├── vercel.json                   # Configuración de despliegue en Vercel
├── tsconfig.json                 # Configuración de TypeScript
├── package.json
├── .env.example                  # Plantilla de variables de entorno
└── README.md
```

---

## Requisitos previos

- **Node.js** 20 o superior.
- **npm** o **yarn**.
- **Cuenta de Supabase** (para la base de datos PostgreSQL y el Storage).
- **Git**.
- **Vercel CLI** (opcional, para despliegue).

---

## Variables de entorno

Copia `.env.example` a `.env` y completa tus valores:

```env
# Configuración del servidor
PORT=10102
NODE_ENV=development

# Configuración de Supabase (Requerido)
SUPABASE_URL=tu_supabase_project_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=tu_storage_bucket_name

# Conexión PostgreSQL de Supabase (alternativa a los parámetros individuales)
DATABASE_URL=postgresql://usuario:password@host:puerto/base_de_datos

# O parámetros PostgreSQL individuales:
DB_HOST=tu_db_host
DB_PORT=5432
DB_DATABASE=tu_db_name
DB_USERNAME=tu_db_user
DB_PASSWORD=tu_db_password
DB_SSL=true
```

### Variables requeridas

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `SUPABASE_URL` | URL del proyecto Supabase | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de rol de servicio para operaciones admin | Sí |
| `SUPABASE_STORAGE_BUCKET` | Nombre del bucket de Storage para imágenes | Sí |
| `PORT` | Puerto del servidor (por defecto: 10102) | No |
| `NODE_ENV` | Entorno (`development`/`production`) | No |

> [!WARNING]
> Nunca subas tu archivo `.env` al repositorio. Añade todas las variables sensibles como variables de entorno en Vercel antes de desplegar a producción.

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/JhoamSebastianMunoz/tatsoft-products-service-v2.git
cd tatsoft-products-service-v2
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env con tus credenciales de Supabase
```

### 4. Configurar la base de datos en Supabase

Ejecuta el esquema SQL en el SQL Editor de tu proyecto Supabase:

```bash
# El esquema está en microservice_product.sql
# Ejecútalo en Supabase Dashboard → SQL Editor
```

### 5. Compilar TypeScript

```bash
npm run build
```

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El servidor estará disponible en: `http://localhost:10102`

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con recarga en caliente (ts-node-dev) |
| `npm run build` | Compila TypeScript a JavaScript (`dist/`) |
| `npm start` | Ejecuta el servidor de producción desde `dist/` |
| `npm test` | Ejecuta todas las pruebas con Jest |
| `npm run test:unit` | Ejecuta solo las pruebas unitarias |
| `npm run test:integration` | Ejecuta solo las pruebas de integración |
| `npm run test:watch` | Ejecuta las pruebas en modo watch |
| `npm run test:coverage` | Ejecuta las pruebas con reporte de cobertura |
| `npm run lint` | Ejecuta ESLint sobre los archivos fuente |
| `npm run lint:fix` | Ejecuta ESLint con corrección automática |

---

## Documentación de la API

### Documentación interactiva (Scalar)

Accede a la documentación interactiva en:

- **Local**: `http://localhost:10102/api-docs`
- **Producción**: `https://microservice-backend-products-v2.vercel.app/api-docs`

### Especificación OpenAPI

- **YAML**: `GET /swagger.yaml`
- **JSON**: `GET /api-docs-json`

> [!TIP]
> Puedes consumir el JSON de OpenAPI (`/api-docs-json`) desde Postman, Insomnia o cualquier cliente que importe especificaciones OpenAPI 3.0.

---

## Endpoints de la API (v2)

Todos los endpoints tienen el prefijo `/api/v2`.

### Endpoints públicos (sin autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/products` | Lista de productos con paginación, filtros y ordenamiento |
| `GET` | `/products/:id` | Obtiene un producto con sus imágenes |
| `GET` | `/categories` | Lista todas las categorías |
| `GET` | `/categories/:id` | Obtiene una categoría |
| `GET` | `/images/:id` | Obtiene información de una imagen |
| `GET` | `/stock/:productId` | Obtiene el stock de un producto |
| `GET` | `/stock/history` | Historial de movimientos de stock |

### Endpoints protegidos (requieren rol `ADMINISTRADOR`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/products` | Crea un producto (multipart/form-data con imágenes) |
| `PUT` | `/products/:id` | Actualiza un producto (multipart/form-data) |
| `DELETE` | `/products/:id` | Elimina un producto |
| `POST` | `/categories` | Crea una categoría |
| `PUT` | `/categories/:id` | Actualiza una categoría |
| `DELETE` | `/categories/:id` | Elimina una categoría |
| `POST` | `/images/upload` | Sube una imagen a Supabase Storage |
| `DELETE` | `/images/:id` | Elimina una imagen |
| `POST` | `/stock/:productId` | Registra ingreso de stock (calcula el precio automáticamente) |
| `GET` | `/reports/low-stock` | Reporte de stock bajo (umbral por query param) |

### Parámetros de consulta (Productos)

```
GET /api/v2/products?page=1&limit=20&id_categoria=1&precio_min=10&precio_max=100&nombre=laptop&sort=precio&order=DESC
```

| Parámetro | Tipo | Por defecto | Descripción |
|-----------|------|-------------|-------------|
| `page` | number | 1 | Número de página |
| `limit` | number | 20 (máx 100) | Resultados por página |
| `id_categoria` | number | - | Filtra por ID de categoría |
| `precio_min` | number | - | Precio mínimo |
| `precio_max` | number | - | Precio máximo |
| `nombre` | string | - | Búsqueda parcial por nombre |
| `sort` | string | nombre_producto | Campo de ordenamiento |
| `order` | string | ASC | `ASC` o `DESC` |

---

## Autenticación y autorización

### Token JWT

Incluye el token en la cabecera `Authorization`:

```
Authorization: Bearer <tu_token_jwt>
```

### Acceso basado en roles

- **Público**: todos los endpoints `GET` (solo lectura).
- **ADMINISTRADOR**: requerido para todas las operaciones `POST`, `PUT` y `DELETE`.

La cadena de middleware:

1. `verifyToken` – valida la firma y expiración del JWT.
2. `checkRoleAndPermission(["ADMINISTRADOR"])` – verifica el rol de administrador.

---

## Base de datos y almacenamiento

### Supabase PostgreSQL

- **Tablas**: `productos`, `categorias`, `producto_imagenes`, `stock`, `ingresos_stock`.
- **Relaciones**: claves foráneas con borrado en cascada.
- **Cliente**: `@supabase/supabase-js` v2.

### Supabase Storage

- **Bucket**: se configura mediante `SUPABASE_STORAGE_BUCKET`.
- **Estructura**: `productos/{product_id}/{filename}`.
- **Características**: URLs públicas y limpieza automática al eliminar productos o imágenes.

### Repositorios clave

- `ProductRepository` – CRUD de productos con joins de categoría.
- `CategoriaRepository` – gestión de categorías.
- `ProductImageRepository` – gestión de metadatos de imágenes.
- `StockRepository` – ingresos de stock e historial.
- `ReportsRepository` – reportes de stock bajo.
- `SupabaseImageRepository` – operaciones directas sobre Storage.

---

## Caché y rate limiting

### Caché de respuestas

- **TTL**: 5 minutos (configurable).
- **Alcance**: todos los endpoints `GET`.
- **Cabeceras**: `X-Cache: HIT|MISS` indica el estado de la caché.
- **Invalidación**: automática en operaciones de escritura (`POST`, `PUT`, `DELETE`).

### Rate limiting

- **Límite**: 100 peticiones por minuto por usuario.
- **Cabeceras**:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

---

## Manejo de errores

### Respuesta de error estandarizada

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "CODIGO_DE_ERROR",
  "details": "Contexto adicional (solo en desarrollo)"
}
```

### Error de validación (422)

```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "nombre_producto",
      "message": "El nombre del producto debe tener entre 2 y 120 caracteres",
      "value": "A"
    }
  ]
}
```

### Códigos HTTP comunes

| Código | Descripción |
|--------|-------------|
| 200 | Éxito |
| 201 | Creado |
| 400 | Petición incorrecta / Error de validación |
| 401 | No autorizado (token inválido o ausente) |
| 403 | Prohibido (permisos insuficientes) |
| 404 | No encontrado |
| 409 | Conflicto (duplicado / violación de restricción) |
| 422 | Entidad no procesable (validación fallida) |
| 500 | Error interno del servidor |

### Códigos de error de Supabase

| Código | Descripción | Estado HTTP |
|--------|-------------|-------------|
| `PGRST116` | Recurso no encontrado | 404 |
| `23505` | Violación de restricción única | 409 |
| `23503` | Violación de clave foránea | 400 |
| `22P02` | Tipo de dato inválido | 400 |

---

## Despliegue

### Vercel Serverless (recomendado)

El proyecto está configurado para un despliegue sin configuración en Vercel.

#### Requisitos

- Cuenta de Vercel.
- Vercel CLI instalado (`npm i -g vercel`).

#### Pasos de despliegue

```bash
# 1. Iniciar sesión en Vercel
vercel login

# 2. Desplegar (preview)
vercel

# 3. Configurar variables de entorno en el panel de Vercel
# Settings → Environment Variables → Añade todas las de .env

# 4. Desplegar a producción
vercel --prod
```

#### Variables de entorno requeridas en Vercel

| Variable | Entorno |
|----------|---------|
| `SUPABASE_URL` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Production |
| `SUPABASE_STORAGE_BUCKET` | Production |
| `NODE_ENV` | Production (valor: `production`) |
| `DATABASE_URL` | Production (opcional, alternativa a los parámetros individuales) |

#### Post-deploy: actualizar CORS

Tras el primer despliegue, añade tu URL de Vercel a `allowedOrigins` en `app.ts`:

```typescript
const allowedOrigins = [
  'http://localhost:10102',
  'http://localhost:5173',
  'https://tu-proyecto.vercel.app'  // Añadir esta
];
```

Después vuelve a desplegar: `vercel --prod`

### Servidor tradicional

```bash
npm run build
npm start
```

> [!NOTE]
> Existe una guía de despliegue ampliada en [`DEPLOY.md`](DEPLOY.md).

---

## Pruebas

### Estructura de pruebas

```
tests/
├── unit/           # Pruebas unitarias (servicios, repositorios)
├── integration/    # Pruebas de integración (endpoints de la API)
└── setup.ts        # Configuración de las pruebas
```

### Ejecutar pruebas

```bash
# Todas las pruebas
npm test

# Solo pruebas unitarias
npm run test:unit

# Solo pruebas de integración
npm run test:integration

# Modo watch
npm run test:watch

# Con cobertura
npm run test:coverage
```

### Configuración de pruebas

- **Framework**: Jest 29 con preset `ts-jest`.
- **Entorno**: Node.js.
- **Cobertura**: reportes text, LCOV y HTML.
- **Test Match**: archivos `**/*.test.ts` dentro de `tests/`.

---

## Calidad de código

### Linting

```bash
# Comprobar problemas
npm run lint

# Corregir problemas automáticamente
npm run lint:fix
```

### TypeScript

- **Target**: ES6.
- **Module**: CommonJS.
- **Modo estricto**: activado.
- **Configuración**: `tsconfig.json` en la raíz.

---

## Repositorios relacionados

- **Versión legacy**: [JhoamSebastianMunoz/tatsoft-products-service](https://github.com/JhoamSebastianMunoz/tatsoft-products-service) — implementación anterior de este microservicio.
- **Versión actual (v2)**: [JhoamSebastianMunoz/tatsoft-products-service-v2](https://github.com/JhoamSebastianMunoz/tatsoft-products-service-v2) — este repositorio.

---

## Contacto

- **Autor**: Development Team
- **GitHub**: [JhoamSebastianMunoz/tatsoft-products-service-v2](https://github.com/JhoamSebastianMunoz/tatsoft-products-service-v2)
- **Email**: jhoamsebastian68@gmail.com
- **API Docs**: [Documentación Scalar en producción](https://microservice-backend-products-v2.vercel.app/api-docs)

---

**Construido con Express, TypeScript, Supabase y Vercel.**
