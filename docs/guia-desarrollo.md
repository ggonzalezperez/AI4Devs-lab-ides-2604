# Guía de Desarrollo — LTI Talent Tracking System

## Descripción del Proyecto

LTI (Talent Tracking System) es un sistema ATS (Applicant Tracking System) interno para gestionar posiciones de empleo abiertas y candidatos en proceso de selección.

**Objetivo:** Digitalizar y centralizar el flujo de reclutamiento, desde la publicación de posiciones hasta el seguimiento de candidatos en las diferentes fases del proceso.

## Prerrequisitos

- Node.js >= 18
- npm >= 9
- Docker y Docker Compose (para PostgreSQL local)
- Git

## Setup Inicial

### 1. Clonar el repositorio

```bash
git clone https://github.com/[tu-fork]/AI4Devs-lab-ides
cd AI4Devs-lab-ides
```

### 2. Arrancar la base de datos (Docker)

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Esto arranca PostgreSQL en el puerto `5432`.

### 3. Configurar variables de entorno

```bash
# Backend
cp backend/.env.example backend/.env  # Si existe
# O crear manualmente backend/.env con:
```

```env
DATABASE_URL="postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb"
PORT=3010
NODE_ENV=development
```

> **Importante:** `dotenv` no expande variables de shell (`${VAR}`). Usar siempre valores literales en `DATABASE_URL`.

```bash
# Frontend (opcional)
# Crear frontend/.env si necesitas URL de API personalizada
echo "REACT_APP_API_URL=http://localhost:3010" > frontend/.env
```

### 4. Instalar dependencias

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 5. Ejecutar migraciones de base de datos

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 6. Arrancar en desarrollo

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Servidor disponible en http://localhost:3010
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
# App disponible en http://localhost:3000
```

## Verificar que todo funciona

```bash
# Backend health check
curl http://localhost:3010/
# Devuelve: "Hola LTI!"

# Probar endpoint de sugerencias
curl "http://localhost:3010/api/candidates/suggestions?field=education&q="
# Devuelve: { "success": true, "data": [...] }

# Frontend
# Abrir en navegador: http://localhost:3000
# Navegar a: http://localhost:3000/candidates/new  (formulario de candidato)
```

## Comandos Disponibles

### Backend (`cd backend`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Compilar TypeScript → dist/ |
| `npm start` | Ejecutar versión compilada |
| `npm test` | Ejecutar tests con Jest |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npx prisma migrate dev` | Crear y ejecutar nueva migración |
| `npx prisma migrate deploy` | Ejecutar migraciones pendientes (CI/prod) |
| `npx prisma generate` | Regenerar Prisma Client |
| `npx prisma studio` | Interfaz web para explorar la BD |
| `npx prisma db seed` | Poblar BD con datos de ejemplo |

### Frontend (`cd frontend`)

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo (puerto 3000) |
| `npm run build` | Build de producción |
| `npm test` | Ejecutar tests en modo watch |
| `npm run test:coverage` | Tests con reporte de cobertura |

## Estructura General del Proyecto

```
AI4Devs-lab-ides-2604/
├── backend/                  # API REST con Express + TypeScript + Prisma
│   ├── prisma/
│   │   ├── schema.prisma     # Definición del modelo de datos
│   │   └── migrations/       # Historial de migraciones SQL
│   └── src/
│       ├── domain/           # Entidades y contratos del dominio
│       ├── application/      # Servicios y validaciones
│       ├── presentation/     # Controllers HTTP
│       ├── infrastructure/   # Prisma client, logger
│       ├── routes/           # Definición de rutas Express
│       ├── middleware/       # Middlewares globales
│       └── index.ts          # Punto de entrada
│
├── frontend/                 # SPA React + TypeScript
│   └── src/
│       ├── components/       # Componentes reutilizables
│       ├── pages/            # Páginas completas
│       ├── services/         # Capa de comunicación con API
│       ├── types/            # Tipos TypeScript compartidos
│       └── App.tsx           # Componente raíz + rutas
│
├── docs/                     # Documentación técnica (fuente de verdad)
│   ├── base-standards.md
│   ├── backend-standards.md
│   ├── frontend-standards.md
│   ├── documentacion-standards.md
│   ├── modelo-datos.md
│   └── guia-desarrollo.md
│
├── ai-specs/                 # Agentes y skills para IA
│   ├── agents/
│   └── skills/
│
├── specs/                    # Especificaciones de features
│   └── [nombre-feature]/
│
├── CLAUDE.md                 # Configuración para Claude Code
├── docker-compose.yml        # PostgreSQL local
└── README.md                 # Documentación general
```

## Flujo de Trabajo para Nuevas Features

1. **Leer** el ticket en `specs/[feature]/feature.md`
2. **Planificar** con el agente backend: revisar `specs/[feature]/tasks-backend.md`
3. **Crear rama**: `git checkout -b feature/[ticket]-backend`
4. **Implementar** siguiendo el plan paso a paso (TDD: test → código → verify)
5. **Verificar**: `npm test` con cobertura >= 90%
6. **Actualizar docs**: `docs/modelo-datos.md` y/o `docs/api-spec.yml` si procede
7. **Commit** con el skill `/commit` o manualmente siguiendo las convenciones
8. **Repetir** para el frontend en rama `feature/[ticket]-frontend`
9. **Pull Requests** hacia `main`

## Solución de Problemas Comunes

### Error de conexión a PostgreSQL

```bash
# Verificar que Docker está corriendo
docker ps
docker-compose up -d

# Verificar la cadena de conexión en backend/.env
# La DATABASE_URL debe apuntar a localhost:5432
```

### Error en migraciones Prisma

```bash
# Resetear la base de datos (cuidado: borra todos los datos)
cd backend
npx prisma migrate reset

# Si hay conflictos de migración
npx prisma migrate resolve --rolled-back [nombre-migracion]
```

### Puerto ya en uso

```bash
# Backend (puerto 3010)
netstat -ano | findstr :3010  # Windows
lsof -i :3010                  # Mac/Linux
# Matar el proceso o cambiar PORT en .env

# Frontend (puerto 3000)
# CRA automáticamente sugiere un puerto alternativo
```

### TypeScript no encuentra los tipos de Prisma

```bash
cd backend
npx prisma generate
```

## Variables de Entorno — Referencia Completa

### backend/.env

```env
DATABASE_URL="postgresql://LTIdbUser:<contraseña>@localhost:5432/LTIdb"
PORT=3010
NODE_ENV=development
```

### frontend/.env (opcional)

```env
REACT_APP_API_URL=http://localhost:3010
```
