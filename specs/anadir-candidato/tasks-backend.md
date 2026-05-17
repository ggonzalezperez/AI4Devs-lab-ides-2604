# Plan Técnico Backend — Añadir Candidato (SCRUM-01)

**Rama a crear:** `feature/anadir-candidato-backend`  
**Agente responsable:** backend-developer  
**Dependencias:** Ninguna  
**Referencia completa:** [requirements.md](requirements.md)

---

## Paso 0: Preparar el entorno

- [ ] 0.1 Crear la rama de feature
  ```bash
  git checkout main
  git pull origin main
  git checkout -b feature/anadir-candidato-backend
  ```

- [ ] 0.2 Instalar dependencias necesarias
  ```bash
  cd backend
  npm install multer
  npm install --save-dev @types/multer
  ```

- [ ] 0.3 Añadir `uploads/` al `.gitignore` del backend (si no está)
  ```
  # Añadir en backend/.gitignore o raíz .gitignore
  uploads/
  ```

---

## Paso 1: Migración de Base de Datos

- [ ] 1.1 Añadir el modelo `Candidate` en `backend/prisma/schema.prisma`
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

- [ ] 1.2 Ejecutar migración
  ```bash
  cd backend
  npx prisma migrate dev --name add_candidate_model
  ```
  Resultado esperado: "Your database is now in sync with your schema."

- [ ] 1.3 Regenerar Prisma Client
  ```bash
  npx prisma generate
  ```

- [ ] 1.4 Verificar con Prisma Studio (opcional)
  ```bash
  npx prisma studio
  # Abrir http://localhost:5555 y verificar tabla Candidate
  ```

---

## Paso 2: Infraestructura — Prisma Client Singleton

- [ ] 2.1 Crear `backend/src/infrastructure/prismaClient.ts`
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

---

## Paso 3: Tests (TDD — escribir ANTES de implementar)

- [ ] 3.1 Crear `backend/src/tests/candidateValidator.test.ts`
  
  Tests a incluir:
  - `should_pass_validation_when_all_required_fields_are_valid`
  - `should_throw_when_firstName_is_empty_string`
  - `should_throw_when_firstName_is_only_whitespace`
  - `should_throw_when_firstName_exceeds_100_characters`
  - `should_throw_when_lastName_is_empty`
  - `should_throw_when_email_has_no_at_symbol`
  - `should_throw_when_email_has_no_domain`
  - `should_throw_when_email_is_empty`
  - `should_not_throw_when_phone_is_undefined`
  - `should_throw_when_phone_has_letters`
  - `should_not_throw_when_phone_has_valid_format`
  - `should_throw_when_address_exceeds_500_characters`
  - `should_not_throw_when_address_is_undefined`

- [ ] 3.2 Crear `backend/src/tests/candidateService.test.ts`
  
  Mockear `Candidate.findByEmail` y `Candidate.prototype.save`. Tests a incluir:
  - `should_create_candidate_when_all_required_fields_valid`
  - `should_create_candidate_with_only_required_fields`
  - `should_create_candidate_with_cv_file_data`
  - `should_throw_validation_error_when_firstName_empty`
  - `should_throw_when_email_already_exists_in_database`
  - `should_call_findByEmail_before_saving`
  - `should_call_save_on_candidate_instance`

- [ ] 3.3 Verificar que los tests FALLAN (aún no hay implementación)
  ```bash
  cd backend && npm test
  ```
  Resultado esperado: múltiples errores "Cannot find module" o "is not a function"

---

## Paso 4: Dominio — Entidad Candidate

- [ ] 4.1 Crear directorio `backend/src/domain/models/`

- [ ] 4.2 Crear `backend/src/domain/models/Candidate.ts`
  
  Implementar clase con:
  - Constructor que recibe `CandidateData`
  - Método `save(): Promise<Candidate>` — usa Prisma para persistir
  - Método estático `findByEmail(email: string): Promise<Candidate | null>`
  
  Ver pseudocódigo completo en [requirements.md § 4.2](requirements.md)

---

## Paso 5: Aplicación — Validador

- [ ] 5.1 Crear/actualizar `backend/src/application/validator.ts`
  
  Añadir:
  - Interface `CreateCandidateDto` con los campos del candidato
  - Función `validateCandidateData(data: CreateCandidateDto): void`
  
  Reglas de validación:
  - `firstName`: no vacío, no solo espacios, máx 100 chars → Error: "El nombre es obligatorio" / "no puede superar los 100 caracteres"
  - `lastName`: idem → Error: "El apellido es obligatorio"
  - `email`: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` → Error: "El email tiene un formato inválido"
  - `phone` (si existe): regex `/^\+?[\d\s\-()]{7,20}$/` → Error: "El teléfono tiene un formato inválido"
  - `address` (si existe): máx 500 chars → Error: "La dirección no puede superar los 500 caracteres"

---

## Paso 6: Aplicación — Servicio

- [ ] 6.1 Crear directorio `backend/src/application/services/`

- [ ] 6.2 Crear `backend/src/application/services/candidateService.ts`
  
  Implementar:
  - Interface `CandidateWithFile` (extiende `CreateCandidateDto` con `cvUrl?` y `cvFileName?`)
  - Objeto exportado `candidateService` con método `addCandidate(data: CandidateWithFile): Promise<Candidate>`
  
  Flujo del método:
  1. Llamar `validateCandidateData(data)` — lanza error si inválido
  2. Llamar `Candidate.findByEmail(data.email)` — si existe, lanzar error
  3. Crear `new Candidate(data)` y llamar `.save()`
  4. Retornar el candidato guardado

---

## Paso 7: Presentación — Controller

- [ ] 7.1 Crear directorio `backend/src/presentation/controllers/`

- [ ] 7.2 Crear `backend/src/presentation/controllers/candidateController.ts`
  
  Implementar función `addCandidate(req: Request, res: Response): Promise<void>`:
  - Extraer datos de `req.body`
  - Si hay `req.file`, añadir `cvUrl` y `cvFileName`
  - Llamar `candidateService.addCandidate(data)`
  - 201 con el candidato si OK
  - 400 si el error contiene "inválid", "obligatori" o "superar"
  - 409 si el error contiene "ya existe"
  - 500 para cualquier otro error (con console.error)

---

## Paso 8: Presentación — Rutas

- [ ] 8.1 Crear directorio `backend/src/routes/` (si no existe)

- [ ] 8.2 Crear `backend/src/routes/candidateRoutes.ts`
  
  Configurar:
  - `multer.diskStorage` con `destination: 'uploads/'` y nombre único con timestamp
  - `multer` con límite 10MB y filtro de tipo (PDF/DOCX)
  - `Router` con `router.post('/', upload.single('cv'), addCandidate)`

---

## Paso 9: Registrar Rutas en index.ts

- [ ] 9.1 Modificar `backend/src/index.ts`:
  - Importar `candidateRoutes`
  - Importar `path` y `fs`
  - Crear carpeta `uploads/` si no existe al arrancar
  - Añadir `app.use('/api/candidates', candidateRoutes)`

- [ ] 9.2 Verificar servidor arranca sin errores
  ```bash
  npm run dev
  # Verificar que aparece: Server running at http://localhost:3010
  ```

---

## Paso 10: Verificar Tests

- [ ] 10.1 Ejecutar todos los tests
  ```bash
  cd backend && npm test
  ```
  Resultado esperado: TODOS LOS TESTS PASAN (verde)

- [ ] 10.2 Verificar cobertura
  ```bash
  cd backend && npm run test:coverage
  ```
  Resultado esperado: branches, functions, lines, statements >= 90%

- [ ] 10.3 Si algún test falla, corregir antes de continuar

---

## Paso 11: Prueba Manual con curl

- [ ] 11.1 Asegurarse de que el servidor está corriendo: `npm run dev`

- [ ] 11.2 Prueba happy path — crear candidato sin CV
  ```bash
  curl -X POST http://localhost:3010/api/candidates \
    -F "firstName=Ana" \
    -F "lastName=García" \
    -F "email=ana.garcia@ejemplo.com" \
    -F "phone=+34612345678" \
    -F "address=Calle Principal 1, Madrid" \
    -F "education=Grado en Informática" \
    -F "workExperience=3 años como desarrolladora"
  ```
  Resultado esperado: `{"success":true,"data":{"id":1,...}}`

- [ ] 11.3 Prueba campos obligatorios faltantes
  ```bash
  curl -X POST http://localhost:3010/api/candidates \
    -F "lastName=García" \
    -F "email=test@test.com"
  ```
  Resultado esperado: `{"success":false,"error":"El nombre es obligatorio"}` (400)

- [ ] 11.4 Prueba email duplicado (después del paso 11.2)
  ```bash
  curl -X POST http://localhost:3010/api/candidates \
    -F "firstName=Otro" \
    -F "lastName=Usuario" \
    -F "email=ana.garcia@ejemplo.com"
  ```
  Resultado esperado: `{"success":false,"error":"Ya existe un candidato..."}` (409)

- [ ] 11.5 Prueba email inválido
  ```bash
  curl -X POST http://localhost:3010/api/candidates \
    -F "firstName=Test" \
    -F "lastName=User" \
    -F "email=no-es-un-email"
  ```
  Resultado esperado: `{"success":false,"error":"El email tiene un formato inválido"}` (400)

- [ ] 11.6 Prueba con CV (PDF)
  ```bash
  # Necesitas un archivo PDF de prueba
  curl -X POST http://localhost:3010/api/candidates \
    -F "firstName=Con" \
    -F "lastName=CV" \
    -F "email=con.cv@test.com" \
    -F "cv=@/ruta/al/archivo.pdf"
  ```
  Resultado esperado: `{"success":true,"data":{"id":...,"cvUrl":"uploads/...","cvFileName":"..."}}`

---

## Paso 12: Actualizar Documentación

- [ ] 12.1 Actualizar `docs/modelo-datos.md`:
  - Mover `Candidate` de "Pendientes" a "Entidades Actuales"
  - Actualizar el diagrama Mermaid

- [ ] 12.2 Crear o actualizar `docs/api-spec.yml`:
  - Añadir path `POST /api/candidates`
  - Añadir schemas `CreateCandidateRequest` y `CandidateResponse`

- [ ] 12.3 Generar reporte de tests en `specs/anadir-candidato/reportes/YYYY-MM-DD-tests-backend.md`

---

## Paso 13: Commit

- [ ] 13.1 Revisar todos los cambios
  ```bash
  git status
  git diff
  ```

- [ ] 13.2 Añadir archivos relevantes al staging
  ```bash
  git add backend/prisma/schema.prisma
  git add backend/prisma/migrations/
  git add backend/src/
  git add backend/package.json backend/package-lock.json
  git add docs/modelo-datos.md docs/api-spec.yml
  git add specs/anadir-candidato/
  ```

- [ ] 13.3 Crear commit
  ```bash
  git commit -m "feat(candidates): add POST /api/candidates endpoint

  - Adds Candidate Prisma model with migration
  - Implements DDD architecture: domain entity, service, controller, routes
  - Handles CV file upload (PDF/DOCX, max 10MB) with multer
  - Adds input validation with descriptive error messages
  - 13 unit tests with 92%+ coverage
  - Updates docs/modelo-datos.md and docs/api-spec.yml"
  ```

---

## Checklist Final

- [ ] Schema Prisma actualizado y migración ejecutada exitosamente
- [ ] `npm test` — todos los tests pasan
- [ ] Cobertura >= 90% en todos los metrics
- [ ] `npm run build` — sin errores de TypeScript
- [ ] `curl POST /api/candidates` con datos válidos devuelve 201
- [ ] `curl POST /api/candidates` con email duplicado devuelve 409
- [ ] `curl POST /api/candidates` con datos inválidos devuelve 400
- [ ] `docs/modelo-datos.md` actualizado
- [ ] `docs/api-spec.yml` actualizado
- [ ] `uploads/` en `.gitignore`
- [ ] Reporte en `specs/anadir-candidato/reportes/`
- [ ] Commit creado en rama `feature/anadir-candidato-backend`
