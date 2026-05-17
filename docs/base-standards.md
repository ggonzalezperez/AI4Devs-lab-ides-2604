# Principios Core del Proyecto LTI

Este documento es la fuente única de verdad para los principios y convenciones de desarrollo del proyecto LTI.

## Filosofía de Desarrollo

- **Pasos pequeños** — Una tarea a la vez. Nunca combinar cambios no relacionados en un mismo commit.
- **TDD (Test-Driven Development)** — Escribe el test antes que el código. Verifica que falla. Implementa. Verifica que pasa.
- **DRY (Don't Repeat Yourself)** — Abstrae lo que se repite. Una única fuente de verdad para cada lógica.
- **YAGNI (You Ain't Gonna Need It)** — No implementes funcionalidades que no se necesitan ahora.
- **SOLID** — Aplica los cinco principios en todo el código.
- **Type Safety** — TypeScript strict mode siempre. Sin `any`. Tipado explícito.
- **Clean Code** — Nombres descriptivos, funciones pequeñas, una responsabilidad por función.

## Estándares por Área

- **Backend:** Ver [docs/backend-standards.md](backend-standards.md)
- **Frontend:** Ver [docs/frontend-standards.md](frontend-standards.md)
- **Documentación:** Ver [docs/documentacion-standards.md](documentacion-standards.md)

## Convenciones de Nombres

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Variables y funciones | camelCase | `candidateService`, `findById` |
| Clases e interfaces | PascalCase | `CandidateService`, `IRepository` |
| Constantes | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_BASE_URL` |
| Archivos de componentes React | PascalCase | `AddCandidateForm.tsx` |
| Archivos de servicios/utilidades | camelCase | `candidateService.ts` |
| Nombres de ramas Git | kebab-case | `feature/anadir-candidato-backend` |
| Mensajes de commit | Imperativo en inglés | `feat: add candidate creation endpoint` |

## Idioma

- **Código** (variables, funciones, clases, comentarios inline): **inglés**
- **Documentación técnica** (docs/, specs/, CLAUDE.md): **castellano**
- **Mensajes de commit**: **inglés** siguiendo Conventional Commits
- **Tests** (describe/it blocks): **inglés**

## Git Workflow

1. Crea rama desde `main`: `feature/[ticket-id]-[descripcion]-backend` o `-frontend`
2. Implementa la funcionalidad siguiendo TDD
3. Pasa todos los tests (cobertura mínima 90%)
4. Actualiza la documentación técnica afectada
5. Genera commit descriptivo con el skill `/commit`
6. Crea Pull Request hacia `main`

### Formato de Commit (Conventional Commits)

```
<tipo>(<scope>): <descripción corta>

<cuerpo opcional con más detalle>
```

Tipos: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

Ejemplo:
```
feat(candidates): add POST /api/candidates endpoint with file upload

- Implements Candidate domain entity with Prisma
- Adds CandidateService with validation layer
- Includes 12 unit tests with 92% coverage
- Updates api-spec.yml and modelo-datos.md
```

## Seguridad

- **Nunca** commitear secretos, passwords ni API keys
- Usar siempre variables de entorno para configuración sensible
- Validar y sanitizar todos los inputs del usuario en la capa de aplicación
- Implementar manejo de errores adecuado (nunca exponer stack traces en producción)
- Proteger endpoints con autenticación cuando sea necesario

## Testing

- **Cobertura mínima: 90%** (branches, functions, lines, statements)
- Patrón AAA (Arrange-Act-Assert) en todos los tests
- Nombres descriptivos: `should_[resultado]_when_[condición]`
- Mockear dependencias externas (base de datos, APIs externas, filesystem)
- Tests deben ser idempotentes (pueden ejecutarse en cualquier orden)

## Modelo de Planificación

Antes de implementar cualquier ticket:
1. Lee el documento `specs/[feature]/feature.md` para entender el contexto
2. Lee `specs/[feature]/requirements.md` para los requisitos detallados
3. Sigue el plan de `specs/[feature]/tasks-backend.md` o `tasks-frontend.md`
4. Genera un reporte de testing en `specs/[feature]/reportes/`
5. Actualiza la documentación técnica afectada

## Herramientas de Desarrollo

| Propósito | Herramienta |
|-----------|-------------|
| ORM Base de Datos | Prisma |
| Testing Backend | Jest + Supertest |
| Testing Frontend | Jest + React Testing Library |
| Testing E2E | Cypress |
| Linting | ESLint |
| Formateo | Prettier (`singleQuote: true`, `trailingComma: all`) |
| Documentación API | Swagger/OpenAPI 3.0 |
