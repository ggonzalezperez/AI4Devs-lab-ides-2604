---
name: commit
description: Úsame cuando hayas terminado una tarea y quieras crear un commit descriptivo. Analizo los cambios en git, genero el mensaje de commit siguiendo Conventional Commits y te propongo el staging correcto (solo archivos relevantes a la tarea).
---

# Skill: Commit Descriptivo

## Cuándo Usarlo

- Al finalizar la implementación de una tarea (backend o frontend)
- Cuando quieres un commit bien formado siguiendo las convenciones del proyecto
- Antes de crear un Pull Request

## Proceso

### Paso 1: Analizar cambios
```bash
git status
git diff --staged
git diff
```

### Paso 2: Identificar archivos relevantes

Seleccionar solo los archivos que pertenecen a la tarea actual:
- Excluir archivos de otras tareas que no deberían commitear
- Excluir archivos sensibles (`.env`, `uploads/`)
- Incluir archivos de tests asociados
- Incluir documentación actualizada

### Paso 3: Generar mensaje de commit

Formato Conventional Commits:
```
<tipo>(<scope>): <descripción corta en imperativo>

<cuerpo: qué se hizo y por qué, si procede>

<notas: breaking changes, referencias a tickets>
```

**Tipos:**
- `feat` — nueva funcionalidad
- `fix` — corrección de bug
- `test` — añadir/modificar tests
- `docs` — documentación
- `refactor` — refactorización sin cambio funcional
- `chore` — tareas de mantenimiento, dependencias

**Scope:** nombre del módulo afectado (candidates, auth, frontend, etc.)

### Paso 4: Proponer el comando

```bash
git add [archivos específicos]
git commit -m "feat(candidates): add POST /api/candidates endpoint

- Implements Candidate domain entity with Prisma ORM
- Adds CandidateService with full validation layer
- Handles CV file upload (PDF/DOCX, max 10MB)
- 14 unit tests with 93% coverage
- Updates docs/modelo-datos.md and docs/api-spec.yml"
```

### Paso 5: Confirmar con el usuario

No ejecutar automáticamente. Mostrar el comando propuesto y esperar confirmación.

## Reglas

- **Nunca** añadir `.env`, `node_modules/`, `uploads/`, `dist/` al commit
- **Siempre** incluir archivos de tests junto con el código que testean
- **Siempre** incluir documentación actualizada en el mismo commit
- El mensaje de commit describe el **qué y el por qué**, no el **cómo**
- Primera línea máximo 72 caracteres
- El cuerpo explica el contexto y las decisiones relevantes
