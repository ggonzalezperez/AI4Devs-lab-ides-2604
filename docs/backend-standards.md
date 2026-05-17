# Estándares de Backend — LTI Talent Tracking System

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| Node.js | >= 18 | Runtime |
| TypeScript | ^4.9.5 | Lenguaje principal |
| Express.js | ^4.19.2 | Framework HTTP |
| Prisma ORM | ^5.13.0 | Acceso a base de datos |
| PostgreSQL | 15 | Base de datos |
| Jest | ^29.7.0 | Testing unitario e integración |
| Supertest | ^7.0.0 | Testing de endpoints HTTP |
| Swagger | swagger-jsdoc + swagger-ui-express | Documentación API |
| ts-node-dev | ^1.1.6 | Hot reload en desarrollo |
| dotenv | ^16.4.5 | Variables de entorno |

## Arquitectura — Domain Driven Design (DDD)

El backend sigue una arquitectura DDD con 4 capas. **Nunca saltes capas ni crees dependencias circulares entre ellas.**

```
backend/src/
├── domain/                     # Capa de Dominio — NÚCLEO del negocio
│   ├── models/                 # Entidades del dominio (clases con lógica de negocio)
│   │   └── Candidate.ts        # Ejemplo: entidad Candidate
│   └── repositories/           # Interfaces de repositorio (NO implementaciones)
│       └── ICandidateRepository.ts
│
├── application/                # Capa de Aplicación — Casos de uso
│   ├── services/               # Servicios que orquestan la lógica de dominio
│   │   └── candidateService.ts
│   └── validator.ts            # Validación de inputs (lógica de negocio de validación)
│
├── presentation/               # Capa de Presentación — HTTP handlers
│   └── controllers/            # Controllers Express (thin handlers)
│       └── candidateController.ts
│
├── infrastructure/             # Capa de Infraestructura — Detalles técnicos
│   ├── prismaClient.ts         # Instancia singleton de Prisma
│   └── logger.ts              # Utilidades de logging
│
├── routes/                     # Definición de rutas Express
│   └── candidateRoutes.ts
│
├── middleware/                 # Middlewares Express (error handling, auth, etc.)
│
└── index.ts                   # Punto de entrada del servidor
```

### Capa de Dominio

La capa de dominio no tiene dependencias de infraestructura. Contiene:

**Entidades** — Clases TypeScript con identidad única y comportamiento:
```typescript
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

  constructor(data: {
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
  }) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.education = data.education;
    this.workExperience = data.workExperience;
    this.cvUrl = data.cvUrl;
    this.cvFileName = data.cvFileName;
  }

  async save(): Promise<Candidate> {
    const prisma = getPrismaClient();
    const created = await prisma.candidate.create({ data: { ... } as any });
    return new Candidate(created);
  }

  static async findByEmail(email: string): Promise<Candidate | null> {
    const prisma = getPrismaClient();
    const data = await prisma.candidate.findUnique({ where: { email } });
    return data ? new Candidate(data) : null;
  }

  static async findSuggestions(
    field: 'education' | 'workExperience',
    query: string
  ): Promise<string[]> {
    const prisma = getPrismaClient();
    const containsFilter = query.trim()
      ? { contains: query.trim(), mode: 'insensitive' as const }
      : undefined;
    const rows = await prisma.candidate.findMany({
      where: { [field]: { not: null, ...containsFilter } },
      select: { [field]: true },
      distinct: [field as any],
      take: 6,
      orderBy: { [field]: 'asc' },
    });
    return rows.map((r: any) => r[field]).filter((v: any): v is string => Boolean(v?.trim()));
  }
}
```

**Interfaces de Repositorio** — Contratos, no implementaciones:
```typescript
export interface ICandidateRepository {
  findById(id: number): Promise<Candidate | null>;
  findByEmail(email: string): Promise<Candidate | null>;
  save(candidate: Candidate): Promise<Candidate>;
  findAll(): Promise<Candidate[]>;
}
```

### Capa de Aplicación

Los servicios orquestan el flujo, delegando lógica de dominio a las entidades:
```typescript
export class CandidateService {
  async addCandidate(data: CreateCandidateDto): Promise<Candidate> {
    // 1. Validar inputs
    validateCandidateData(data);

    // 2. Verificar reglas de negocio (email único)
    const existing = await Candidate.findByEmail(data.email);
    if (existing) {
      throw new Error(`Ya existe un candidato con el email ${data.email}`);
    }

    // 3. Crear entidad de dominio y persistir
    const candidate = new Candidate(data);
    return candidate.save();
  }
}
```

**Validaciones** — En `application/validator.ts`, nunca en el controller:
```typescript
export function validateCandidateData(data: Partial<CandidateDto>): string | null {
  if (!data.firstName?.trim()) return 'El nombre es obligatorio';
  if (data.firstName.trim().length > 100) return 'El nombre no puede superar los 100 caracteres';

  if (!data.lastName?.trim()) return 'El apellido es obligatorio';
  if (data.lastName.trim().length > 100) return 'El apellido no puede superar los 100 caracteres';

  if (!data.email?.trim()) return 'El email es obligatorio';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return 'El email tiene un formato inválido';
  if (data.email.trim().length > 255) return 'El email no puede superar los 255 caracteres';

  // Teléfono: formato internacional, 7-15 dígitos totales
  if (data.phone?.trim()) {
    const phone = data.phone.trim();
    if (/[^\d\s\+\-\(\)]/.test(phone)) return 'El teléfono tiene un formato inválido';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) return 'El teléfono tiene un formato inválido';
  }

  if (data.address?.trim().length > 500) return 'La dirección no puede superar los 500 caracteres';

  return null;
}
```

El teléfono acepta formatos como `+34 612345678`, `+1 555-123-4567`, `612345678`. El valor enviado por el componente `PhoneField` siempre tiene el prefijo `+código_país`.

### Capa de Presentación

Los controllers son thin handlers — solo gestionan HTTP:
```typescript
export const addCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateData = req.body;
    if (req.file) {
      candidateData.cvUrl = req.file.path;
      candidateData.cvFileName = req.file.originalname;
    }
    const candidate = await candidateService.addCandidate(candidateData);
    res.status(201).json({ success: true, data: candidate });
  } catch (error) {
    if (error instanceof Error && error.message.includes('inválid')) {
      res.status(400).json({ success: false, error: error.message });
    } else if (error instanceof Error && error.message.includes('ya existe')) {
      res.status(409).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
};
```

### Infraestructura — Prisma Client Singleton

```typescript
// infrastructure/prismaClient.ts
import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) prismaInstance = new PrismaClient();
  return prismaInstance;
}
```

Usar siempre `getPrismaClient()` (función) en las entidades del dominio, **nunca** instanciar `new PrismaClient()` directamente.

## API Design Standards

### Convenciones RESTful

| Acción | Método | URL | Respuesta |
|--------|--------|-----|-----------|
| Sugerencias autocompletado | GET | `/api/candidates/suggestions` | 200 + string[] |
| Crear | POST | `/api/candidates` | 201 + objeto creado |
| Listar | GET | `/api/candidates` | 200 + array |
| Obtener uno | GET | `/api/candidates/:id` | 200 + objeto |
| Actualizar | PUT | `/api/candidates/:id` | 200 + objeto actualizado |
| Eliminar | DELETE | `/api/candidates/:id` | 204 |

> **Importante:** La ruta `/suggestions` debe registrarse **antes** de `/:id` en el router para evitar que Express interprete `suggestions` como un parámetro de ruta.

### Estructura de Respuesta Estándar

```typescript
// Éxito
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "Mensaje descriptivo del error" }
```

### Configuración de Rutas

```typescript
// routes/candidateRoutes.ts
import { Router } from 'express';
import multer from 'multer';
import { addCandidate, getCandidates, getCandidateById } from '../presentation/controllers/candidateController';

const router = Router();
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.get('/', getCandidates);
router.get('/:id', getCandidateById);
router.post('/', upload.single('cv'), addCandidate);

export default router;
```

### Registro de Rutas en index.ts

```typescript
// Después de los middlewares globales
app.use('/api/candidates', candidateRoutes);
```

## Estándares de Testing

### Estructura de Archivos de Test

```
backend/src/
└── tests/
    ├── candidateService.test.ts    # Tests del servicio
    ├── candidateController.test.ts # Tests del controller
    └── candidateValidator.test.ts  # Tests de validación
```

### Configuración Jest (backend/jest.config.js)

```javascript
module.exports = {
  roots: ['<rootDir>/src'],
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'],
  coverageThreshold: {
    global: { branches: 90, functions: 90, lines: 90, statements: 90 },
  },
};
```

### Patrón AAA y Naming

```typescript
// Patrón: describe('Componente - método') > describe('escenario') > it('debería...')
describe('CandidateService - addCandidate', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('when data is valid', () => {
    it('should_create_candidate_and_return_it', async () => {
      // Arrange
      const dto = { firstName: 'Ana', lastName: 'García', email: 'ana@test.com' };
      jest.spyOn(Candidate.prototype, 'save').mockResolvedValue(new Candidate({ id: 1, ...dto }));

      // Act
      const result = await candidateService.addCandidate(dto);

      // Assert
      expect(result.id).toBe(1);
      expect(result.email).toBe('ana@test.com');
    });
  });

  describe('when email is invalid', () => {
    it('should_throw_error_with_descriptive_message', async () => {
      // Arrange
      const dto = { firstName: 'Ana', lastName: 'García', email: 'email-invalido' };

      // Act & Assert
      await expect(candidateService.addCandidate(dto)).rejects.toThrow('formato inválido');
    });
  });
});
```

### Mocking

- Mockear Prisma Client con `jest.mock`
- Mockear métodos estáticos de las entidades del dominio
- Nunca conectar a la base de datos real en tests unitarios
- Usar `supertest` para tests de integración de endpoints

```typescript
// Mock del Prisma Client — patrón getPrismaClient()
jest.mock('../infrastructure/prismaClient', () => ({
  getPrismaClient: jest.fn().mockReturnValue({
    candidate: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  }),
}));

import { getPrismaClient } from '../infrastructure/prismaClient';
const mockPrisma = getPrismaClient() as any;
```

## Manejo de Archivos (CV Upload)

Para carga de ficheros (CV en PDF/DOCX):

1. Instalar `multer`: `npm install multer @types/multer`
2. Configurar multer en las rutas con límites y filtros de tipo
3. Almacenar en carpeta `uploads/` (en `.gitignore`)
4. Guardar ruta relativa y nombre original en BD
5. Validar tamaño (máx 10MB) y tipo (PDF, DOCX)

## Seguridad

- Validar todos los inputs en la capa de aplicación
- Nunca exponer mensajes de error internos al cliente
- Usar variables de entorno para DATABASE_URL y secretos
- Configurar CORS adecuadamente
- Sanitizar datos antes de persistir en BD
- Nunca commitear archivos `.env`
- Añadir `uploads/` a `.gitignore`

## Scripts Disponibles

```bash
npm run dev             # Servidor de desarrollo con hot reload (puerto 3010)
npm run build           # Compilar TypeScript a dist/
npm start               # Ejecutar desde dist/ (producción)
npm test                # Ejecutar tests con Jest
npm run test:coverage   # Tests con reporte de cobertura
npm run prisma:generate # Generar Prisma client después de cambiar schema
npm run prisma:migrate  # Crear y ejecutar nueva migración
```

## Variables de Entorno

Ver archivo `backend/.env` (nunca commitear). Variables necesarias:
- `DATABASE_URL` — Cadena de conexión a PostgreSQL
- `PORT` — Puerto del servidor (default: 3010)
- `NODE_ENV` — development | production | test

## Checklist Antes de Hacer Commit

- [ ] Todos los tests pasan (`npm test`)
- [ ] Cobertura >= 90% (`npm run test:coverage`)
- [ ] Sin errores de TypeScript (`npm run build`)
- [ ] Sin errores de linting (`npm run lint`)
- [ ] `docs/modelo-datos.md` actualizado si se añadió/modificó una entidad
- [ ] `docs/api-spec.yml` actualizado si se añadió/modificó un endpoint
- [ ] Archivos de BD en `.gitignore` (`uploads/`, `.env`)
