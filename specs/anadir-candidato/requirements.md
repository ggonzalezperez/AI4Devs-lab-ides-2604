# Requisitos Técnicos Detallados — Añadir Candidato

## Ticket ID: SCRUM-01

---

## 1. Cambios en Base de Datos

### 1.1 Nuevo Modelo Prisma: `Candidate`

Añadir en `backend/prisma/schema.prisma`:

```prisma
model Candidate {
  id             Int      @id @default(autoincrement())
  firstName      String   @db.VarChar(100)
  lastName       String   @db.VarChar(100)
  email          String   @unique @db.VarChar(255)
  phone          String?  @db.VarChar(20)
  address        String?  @db.VarChar(500)
  education      String?  @db.Text
  workExperience String?  @db.Text
  cvUrl          String?  @db.VarChar(500)
  cvFileName     String?  @db.VarChar(255)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

### 1.2 Migración

- **Nombre sugerido:** `add_candidate_model`
- **Comando:** `cd backend && npx prisma migrate dev --name add_candidate_model`
- **Impacto:** Ninguno en datos existentes (nueva tabla)

---

## 2. API Backend

### 2.1 Endpoint: POST /api/candidates

**URL:** `POST http://localhost:3010/api/candidates`  
**Content-Type:** `multipart/form-data` (para soportar carga de CV)  
**Autenticación:** Ninguna (MVP)

**Request Body (FormData):**

| Campo | Tipo | Obligatorio | Descripción | Validaciones |
|-------|------|-------------|-------------|--------------|
| firstName | string | **Sí** | Nombre del candidato | 1-100 caracteres, no vacío, sin solo espacios |
| lastName | string | **Sí** | Apellido del candidato | 1-100 caracteres, no vacío, sin solo espacios |
| email | string | **Sí** | Email del candidato | Formato email válido, único en BD |
| phone | string | No | Teléfono de contacto | Formato: `+?[\d\s\-()]{7,20}` si se provee |
| address | string | No | Dirección postal | Máx 500 caracteres si se provee |
| education | string | No | Formación académica | Texto libre, máx 5000 chars si se provee |
| workExperience | string | No | Experiencia laboral | Texto libre, máx 5000 chars si se provee |
| cv | File | No | CV del candidato | PDF o DOCX, máx 10MB |

**Responses:**

```typescript
// 201 - Candidato creado correctamente
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "Ana",
    "lastName": "García",
    "email": "ana.garcia@ejemplo.com",
    "phone": "+34 612 345 678",
    "address": "Calle Principal 1, Madrid",
    "education": "Grado en Informática - Universidad Complutense",
    "workExperience": "3 años como desarrolladora frontend en XYZ",
    "cvUrl": "uploads/1716000000000-curriculum.pdf",
    "cvFileName": "curriculum.pdf",
    "createdAt": "2026-05-17T10:00:00.000Z",
    "updatedAt": "2026-05-17T10:00:00.000Z"
  }
}

// 400 - Validación fallida
{ "success": false, "error": "El nombre es obligatorio" }
{ "success": false, "error": "El email tiene un formato inválido" }
{ "success": false, "error": "Solo se permiten archivos PDF o DOCX" }
{ "success": false, "error": "El archivo no puede superar los 10MB" }

// 409 - Email duplicado
{ "success": false, "error": "Ya existe un candidato con el email ana.garcia@ejemplo.com" }

// 500 - Error interno
{ "success": false, "error": "Error interno del servidor" }
```

---

## 3. Estructura de Ficheros Backend

### Ficheros a CREAR

```
backend/src/
├── domain/
│   └── models/
│       └── Candidate.ts                      # Entidad de dominio
├── application/
│   └── services/
│       └── candidateService.ts               # Servicio con lógica de negocio
├── presentation/
│   └── controllers/
│       └── candidateController.ts            # HTTP handler
├── infrastructure/
│   └── prismaClient.ts                       # Singleton de Prisma
├── routes/
│   └── candidateRoutes.ts                    # Rutas Express con multer
└── tests/
    ├── candidateService.test.ts              # Tests del servicio
    └── candidateValidator.test.ts           # Tests del validador
```

### Ficheros a MODIFICAR

```
backend/
├── prisma/schema.prisma                     # Añadir modelo Candidate
├── src/application/validator.ts             # Añadir validateCandidateData()
└── src/index.ts                            # Registrar candidateRoutes
```

### Dependencia a instalar

```bash
cd backend
npm install multer
npm install --save-dev @types/multer
```

---

## 4. Implementación Backend Detallada

### 4.1 infrastructure/prismaClient.ts

```typescript
import { PrismaClient as PrismaClientLib } from '@prisma/client';

let prismaInstance: PrismaClientLib | null = null;

export const getPrismaClient = (): PrismaClientLib => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClientLib();
  }
  return prismaInstance;
};
```

### 4.2 domain/models/Candidate.ts

```typescript
import { getPrismaClient } from '../../infrastructure/prismaClient';

export interface CandidateData {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: string;
  workExperience?: string;
  cvUrl?: string;
  cvFileName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Candidate {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: string;
  workExperience?: string;
  cvUrl?: string;
  cvFileName?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: CandidateData) {
    Object.assign(this, data);
  }

  async save(): Promise<Candidate> {
    const prisma = getPrismaClient();
    const saved = await prisma.candidate.create({
      data: {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        address: this.address,
        education: this.education,
        workExperience: this.workExperience,
        cvUrl: this.cvUrl,
        cvFileName: this.cvFileName,
      },
    });
    return new Candidate(saved);
  }

  static async findByEmail(email: string): Promise<Candidate | null> {
    const prisma = getPrismaClient();
    const data = await prisma.candidate.findUnique({ where: { email } });
    return data ? new Candidate(data) : null;
  }
}
```

### 4.3 application/validator.ts (añadir función)

```typescript
export interface CreateCandidateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: string;
  workExperience?: string;
}

export function validateCandidateData(data: CreateCandidateDto): void {
  if (!data.firstName || data.firstName.trim().length === 0) {
    throw new Error('El nombre es obligatorio');
  }
  if (data.firstName.trim().length > 100) {
    throw new Error('El nombre no puede superar los 100 caracteres');
  }
  if (!data.lastName || data.lastName.trim().length === 0) {
    throw new Error('El apellido es obligatorio');
  }
  if (data.lastName.trim().length > 100) {
    throw new Error('El apellido no puede superar los 100 caracteres');
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new Error('El email tiene un formato inválido');
  }
  if (data.phone && !/^\+?[\d\s\-()]{7,20}$/.test(data.phone)) {
    throw new Error('El teléfono tiene un formato inválido');
  }
  if (data.address && data.address.length > 500) {
    throw new Error('La dirección no puede superar los 500 caracteres');
  }
}
```

### 4.4 application/services/candidateService.ts

```typescript
import { Candidate } from '../../domain/models/Candidate';
import { validateCandidateData, CreateCandidateDto } from '../validator';

export interface CandidateWithFile extends CreateCandidateDto {
  cvUrl?: string;
  cvFileName?: string;
}

export const candidateService = {
  async addCandidate(data: CandidateWithFile): Promise<Candidate> {
    // 1. Validar datos de entrada
    validateCandidateData(data);

    // 2. Verificar unicidad del email
    const existing = await Candidate.findByEmail(data.email);
    if (existing) {
      throw new Error(`Ya existe un candidato con el email ${data.email}`);
    }

    // 3. Crear y persistir
    const candidate = new Candidate(data);
    return candidate.save();
  },
};
```

### 4.5 presentation/controllers/candidateController.ts

```typescript
import { Request, Response } from 'express';
import { candidateService } from '../../application/services/candidateService';

export const addCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.cvUrl = req.file.path;
      data.cvFileName = req.file.originalname;
    }

    const candidate = await candidateService.addCandidate(data);
    res.status(201).json({ success: true, data: candidate });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    if (message.includes('inválid') || message.includes('obligatori') || message.includes('superar')) {
      res.status(400).json({ success: false, error: message });
    } else if (message.includes('ya existe')) {
      res.status(409).json({ success: false, error: message });
    } else {
      console.error('Error en addCandidate:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
};
```

### 4.6 routes/candidateRoutes.ts

```typescript
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { addCandidate } from '../presentation/controllers/candidateController';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF o DOCX'));
    }
  },
});

const router = Router();
router.post('/', upload.single('cv'), addCandidate);

export default router;
```

### 4.7 Actualizar index.ts

Añadir después de los middlewares existentes:
```typescript
import candidateRoutes from './routes/candidateRoutes';
import path from 'path';
import fs from 'fs';

// Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Registrar rutas
app.use('/api/candidates', candidateRoutes);
```

---

## 5. Tests Unitarios Backend

### 5.1 Tests del Servicio (candidateService.test.ts)

Los siguientes casos deben estar cubiertos:

| Test | Descripción | Resultado esperado |
|------|-------------|-------------------|
| `should_create_candidate_when_all_required_fields_valid` | Datos válidos completos | Candidato creado con id |
| `should_create_candidate_without_optional_fields` | Solo campos obligatorios | Candidato creado, opcionales null |
| `should_create_candidate_with_cv_file` | Con CV file path | cvUrl y cvFileName guardados |
| `should_throw_when_firstName_is_empty` | firstName = "" | Error: "El nombre es obligatorio" |
| `should_throw_when_firstName_has_only_spaces` | firstName = "   " | Error: "El nombre es obligatorio" |
| `should_throw_when_lastName_is_empty` | lastName = "" | Error: "El apellido es obligatorio" |
| `should_throw_when_email_has_invalid_format` | email = "no-es-email" | Error: "formato inválido" |
| `should_throw_when_email_is_empty` | email = "" | Error: "formato inválido" |
| `should_throw_when_email_already_exists` | Email ya en BD | Error: "ya existe un candidato" |
| `should_throw_when_phone_has_invalid_format` | phone = "abc" | Error: "teléfono tiene un formato inválido" |
| `should_not_throw_when_phone_has_valid_format` | phone = "+34612345678" | Sin error |
| `should_throw_when_address_exceeds_500_chars` | address de 501 chars | Error: "500 caracteres" |

### 5.2 Tests del Validador (candidateValidator.test.ts)

Testear `validateCandidateData()` directamente con todos los casos de validación.

---

## 6. Frontend

### 6.1 Estructura de Ficheros Frontend

**Ficheros a CREAR:**
```
frontend/src/
├── types/
│   └── candidate.ts                         # Interfaces TypeScript
├── services/
│   └── candidateService.ts                  # Comunicación con API
├── components/
│   └── AddCandidateForm/
│       ├── AddCandidateForm.tsx             # Componente formulario
│       └── AddCandidateForm.css             # Estilos del formulario
└── tests/
    └── AddCandidateForm.test.tsx            # Tests del componente
```

**Ficheros a MODIFICAR:**
```
frontend/src/
└── App.tsx                                 # Añadir ruta y botón de navegación
```

**Dependencias a instalar:**
```bash
cd frontend
npm install react-bootstrap bootstrap axios react-router-dom
npm install --save-dev @types/react-router-dom
```

### 6.2 Campos del Formulario

| Campo | Input Type | Label | Placeholder | Obligatorio |
|-------|-----------|-------|-------------|-------------|
| firstName | text | Nombre * | Nombre del candidato | **Sí** |
| lastName | text | Apellido * | Apellido del candidato | **Sí** |
| email | email | Email * | email@ejemplo.com | **Sí** |
| phone | tel | Teléfono | +34 600 000 000 | No |
| address | text | Dirección | Calle, Ciudad... | No |
| education | textarea | Educación | Describe tu formación... | No |
| workExperience | textarea | Experiencia Laboral | Describe tu experiencia... | No |
| cv | file | CV (PDF o DOCX, máx. 10MB) | - | No |

### 6.3 Flujo de Navegación

```
Dashboard (/) 
  → Botón "Añadir Candidato" 
  → Formulario (/candidates/add)
  → Submit OK 
  → Mensaje de éxito (en el mismo form o redirigir a /)
```

---

## 7. Criterios de Aceptación Técnicos

### Backend
- [ ] `POST /api/candidates` devuelve 201 con el candidato creado cuando los datos son válidos
- [ ] `POST /api/candidates` devuelve 400 cuando falta firstName o lastName o email
- [ ] `POST /api/candidates` devuelve 400 cuando el email tiene formato inválido
- [ ] `POST /api/candidates` devuelve 409 cuando el email ya existe en la BD
- [ ] `POST /api/candidates` acepta y guarda el CV en `uploads/`
- [ ] `POST /api/candidates` rechaza archivos que no sean PDF o DOCX con 400
- [ ] `POST /api/candidates` rechaza archivos mayores de 10MB con 400
- [ ] Todos los tests unitarios pasan con cobertura >= 90%

### Frontend
- [ ] Existe un botón/enlace visible desde la pantalla principal para añadir candidato
- [ ] El formulario muestra todos los campos definidos
- [ ] Los campos obligatorios muestran error si están vacíos al submit
- [ ] El campo email muestra error si el formato es inválido
- [ ] El campo CV valida tipo (PDF/DOCX) y tamaño (10MB) antes de enviar
- [ ] El botón de submit se deshabilita mientras se procesa la petición
- [ ] Se muestra un mensaje de éxito al crear el candidato correctamente
- [ ] Se muestra el error del servidor (ej: email duplicado) de forma clara
- [ ] La interfaz es responsiva y accesible (labels, aria attributes)

### General
- [ ] Los cambios están en la rama `feature/anadir-candidato-backend` y `feature/anadir-candidato-frontend`
- [ ] `docs/modelo-datos.md` actualizado con la entidad Candidate
- [ ] `docs/api-spec.yml` actualizado con el endpoint POST /api/candidates
- [ ] `uploads/` está en `.gitignore`
- [ ] Reporte de tests en `specs/anadir-candidato/reportes/`
