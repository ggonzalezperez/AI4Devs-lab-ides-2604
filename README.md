# LTI — Talent Tracking System

Sistema ATS (Applicant Tracking System) para gestionar posiciones de empleo abiertas y candidatos en proceso de selección.

**Stack:** Node.js · TypeScript · Express · Prisma ORM · PostgreSQL · React 18 · CSS Custom Properties

---

## Índice

- [Requisitos previos](#requisitos-previos)
- [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
- [Funcionalidades implementadas](#funcionalidades-implementadas)
- [API Endpoints](#api-endpoints)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Comandos disponibles](#comandos-disponibles)
- [Tests](#tests)
- [Uso con asistentes de IA](#uso-con-asistentes-de-ia)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)

---

## Requisitos previos

- Node.js >= 18
- npm >= 9
- Docker y Docker Compose (para PostgreSQL local)
- Git

---

## Instalación y puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/[usuario]/AI4Devs-lab-ides
cd AI4Devs-lab-ides
```

### 2. Arrancar la base de datos

```bash
docker-compose up -d
```

### 3. Configurar variables de entorno

Crear `backend/.env` con:

```env
DATABASE_URL="postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb"
PORT=3010
NODE_ENV=development
```

> **Importante:** `dotenv` no expande variables de shell. Usar siempre valores literales en `DATABASE_URL`.

### 4. Instalar dependencias

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 5. Ejecutar migraciones

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 6. Arrancar en desarrollo

**Terminal 1 — Backend** (http://localhost:3010):
```bash
cd backend && npm run dev
```

**Terminal 2 — Frontend** (http://localhost:3000):
```bash
cd frontend && npm start
```

### 7. Verificar que todo funciona

```bash
# Backend health check
curl http://localhost:3010/
# → "Hola LTI!"

# Total de candidatos
curl http://localhost:3010/api/candidates/count
# → { "success": true, "data": { "count": N } }

# Sugerencias de autocompletado
curl "http://localhost:3010/api/candidates/suggestions?field=education&q="
# → { "success": true, "data": [...] }
```

Abre el navegador en `http://localhost:3000`.

---

## Funcionalidades implementadas

### SCRUM-01 — Añadir candidato al sistema

**Dashboard** (`/`):
- Panel de reclutamiento con contador real de candidatos totales (llamada a `/api/candidates/count`).
- Acceso rápido al formulario de alta de candidatos.

**Formulario de alta** (`/candidates/new`):
- **Datos personales:** nombre, apellido, email con validación de formato.
- **Barra de progreso** de campos obligatorios completados (en tiempo real).
- **Contacto:** teléfono multipais con selector de país (25 países, flag emoji + código) y validación de 7–15 dígitos; dirección postal.
- **Perfil profesional:** educación y experiencia laboral con **autocompletado inteligente**:
  - Llamada debounced (350 ms) al endpoint `/api/candidates/suggestions`.
  - Fallback a sugerencias estáticas si la API no tiene datos.
  - Navegación con teclado (↑ ↓ Enter Escape) y highlight de coincidencias.
- **Documentos:** zona de arrastrar y soltar para CV (PDF o DOCX, máx. 10 MB).
- Validación en cliente y en servidor. Mensajes de éxito y error claros.

---

## API Endpoints

| Método | URL | Descripción | Respuesta |
|--------|-----|-------------|-----------|
| `GET` | `/api/candidates/count` | Número total de candidatos | `{ success, data: { count } }` |
| `GET` | `/api/candidates/suggestions` | Sugerencias de autocompletado | `{ success, data: string[] }` |
| `POST` | `/api/candidates` | Crear candidato (multipart/form-data) | `{ success, data: Candidate }` |

### GET /api/candidates/suggestions — parámetros

| Param | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `field` | `education` \| `workExperience` | Sí | Campo a sugerir |
| `q` | string | No | Texto de búsqueda (case-insensitive) |

### POST /api/candidates — campos

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| `firstName` | string | Sí |
| `lastName` | string | Sí |
| `email` | string | Sí (único) |
| `phone` | string | No — formato `+[código] [número]`, 7–15 dígitos |
| `address` | string | No |
| `education` | string | No |
| `workExperience` | string | No |
| `cv` | File (PDF/DOCX) | No — máx. 10 MB |

---

## Estructura del proyecto

```
AI4Devs-lab-ides/
│
├── backend/                        # API REST
│   ├── prisma/
│   │   ├── schema.prisma           # Modelo de datos (fuente de verdad)
│   │   └── migrations/             # Historial de migraciones SQL
│   └── src/
│       ├── domain/
│       │   └── models/Candidate.ts # Entidad: save, findByEmail, findSuggestions, count
│       ├── application/
│       │   ├── services/           # addCandidate, getSuggestions, getCandidateCount
│       │   └── validator.ts        # Validación de inputs (firstName, lastName, email, phone)
│       ├── presentation/
│       │   └── controllers/        # addCandidateHandler, getSuggestionsHandler, getCandidateCountHandler
│       ├── infrastructure/
│       │   └── prismaClient.ts     # Singleton getPrismaClient()
│       ├── routes/
│       │   └── candidateRoutes.ts  # GET /count, GET /suggestions, POST /
│       └── index.ts               # Punto de entrada + CORS + multer
│
├── frontend/                       # SPA React 18
│   └── src/
│       ├── components/
│       │   ├── AddCandidateForm/   # Formulario completo de alta de candidato
│       │   ├── AutocompleteField/  # Textarea con dropdown de sugerencias
│       │   └── PhoneField/         # Input de teléfono con selector de país (25 países)
│       ├── services/
│       │   └── candidateService.ts # addCandidate, getCandidateCount, getSuggestions
│       ├── types/
│       │   └── candidate.ts        # Candidate, CreateCandidateDto
│       ├── tests/                  # Tests con React Testing Library
│       ├── App.tsx                 # Dashboard + rutas (BrowserRouter)
│       ├── App.css                 # Shell, navbar, dashboard, stats
│       └── index.css               # Design tokens (CSS custom properties)
│
├── docs/                           # Documentación técnica (fuente de verdad)
│   ├── base-standards.md
│   ├── backend-standards.md
│   ├── frontend-standards.md
│   ├── documentacion-standards.md
│   ├── modelo-datos.md             # Entidades y endpoints de la BD
│   └── guia-desarrollo.md
│
├── ai-specs/                       # Configuración para asistentes de IA
│   └── agents/
│       ├── backend-developer.md
│       └── frontend-developer.md
│
├── specs/                          # Especificaciones de features
│   └── anadir-candidato/          # SCRUM-01 (implementado)
│
├── CLAUDE.md                       # Configuración para Claude Code
├── .cursorrules                    # Reglas para Cursor
└── docker-compose.yml              # PostgreSQL local
```

---

## Comandos disponibles

### Backend (`cd backend`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Compilar TypeScript → `dist/` |
| `npm start` | Ejecutar versión compilada |
| `npm test` | Ejecutar tests con Jest |
| `npm run test:coverage` | Tests con reporte de cobertura (≥ 90%) |
| `npx prisma migrate dev` | Crear y ejecutar nueva migración |
| `npx prisma generate` | Regenerar Prisma Client |
| `npx prisma studio` | Explorador visual de la BD (http://localhost:5555) |

### Frontend (`cd frontend`)

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo (puerto 3000) |
| `npm test` | Tests en modo watch |
| `npm run build` | Build de producción |
| `npm run test:coverage` | Tests con reporte de cobertura |

---

## Tests

| Capa | Suites | Tests |
|------|--------|-------|
| Backend | 8 | 51 |
| Frontend | 2 | 11 |
| **Total** | **10** | **62** |

```bash
# Backend (desde /backend)
npm test
npm run test:coverage    # cobertura ≥ 90 % en branches/functions/lines/statements

# Frontend (desde /frontend)
npx jest --no-coverage
```

**Cobertura backend** — excluye `src/index.ts` (punto de entrada). Thresholds en `jest.config.js`.

---

## Uso con asistentes de IA

### Claude Code

El archivo `CLAUDE.md` en la raíz configura automáticamente el asistente con el contexto del proyecto. Al abrir Claude Code, el agente tiene acceso a todos los estándares y puede actuar como `backend-developer` o `frontend-developer`.

### Cursor

El archivo `.cursorrules` en la raíz contiene las reglas del proyecto.

### GitHub Copilot / otros

Los documentos en `docs/` son compatibles con cualquier asistente.

---

## Variables de entorno

### `backend/.env` (no commitear)

```env
DATABASE_URL="postgresql://LTIdbUser:<contraseña>@localhost:5432/LTIdb"
PORT=3010
NODE_ENV=development
```

### `frontend/.env` (opcional)

```env
REACT_APP_API_URL=http://localhost:3010
```

---

## Base de datos

El proyecto usa **PostgreSQL** levantado con Docker.

```bash
# Arrancar
docker-compose up -d

# Parar
docker-compose down

# Explorar visualmente
cd backend && npx prisma studio
```

**Conexión:**

| Parámetro | Valor |
|-----------|-------|
| Host | localhost |
| Puerto | 5432 |
| Usuario | LTIdbUser |
| Base de datos | LTIdb |

---

## Arquitectura backend (DDD)

El backend sigue **Domain Driven Design** con 4 capas:

```
HTTP Request
    ↓
routes/          → define las rutas Express
presentation/    → controllers thin (solo gestiona req/res)
application/     → services (lógica de negocio) + validator (validación de inputs)
domain/          → entidades con lógica de dominio
infrastructure/  → Prisma client singleton (getPrismaClient)
    ↓
PostgreSQL
```

**Principios:** SOLID · DRY · TDD · Clean Code · TypeScript strict

---

## Licencia

MIT © 2024 LiDR AI4Dev
