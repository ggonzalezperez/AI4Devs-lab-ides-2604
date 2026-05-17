---
name: enriquecer-historia
description: Úsame cuando tengas una historia de usuario básica y necesites transformarla en un ticket técnico detallado y autocontenido. Input: ID de Jira o texto de la historia. Output: ticket enriquecido con criterios de aceptación técnicos, pseudocódigo, ficheros a modificar, tests esperados y definition of done.
---

# Skill: Enriquecer Historia de Usuario

## Objetivo

Transformar una historia de usuario genérica (unas pocas líneas) en un ticket técnico exhaustivo que permita al desarrollador (humano o IA) ser completamente autónomo durante la implementación sin necesidad de hacer preguntas adicionales.

## Cuándo Usarlo

- Tienes un ticket de Jira, Trello o cualquier gestor de tareas con poca información técnica
- Quieres preparar el input para el agente `backend-developer` o `frontend-developer`
- Necesitas un contrato claro entre producto y tecnología

## Input Esperado

```
/enriquecer-historia [ID-TICKET o texto de la historia]
```

Ejemplos:
- `/enriquecer-historia SCRUM-1`
- `/enriquecer-historia "Como reclutador, quiero añadir candidatos al sistema..."`

## Proceso de Enriquecimiento

### Paso 1: Analizar el proyecto
Lee los siguientes documentos para entender el contexto:
- `docs/base-standards.md` — principios del equipo
- `docs/backend-standards.md` — arquitectura DDD
- `docs/frontend-standards.md` — stack React
- `docs/modelo-datos.md` — modelo de datos actual
- `backend/prisma/schema.prisma` — schema actual

### Paso 2: Analizar la historia

Para cada historia de usuario, analiza:

1. **¿Qué flujo de usuario desencadena?** — desde qué pantalla, qué acciones, qué resultado
2. **¿Qué entidades de dominio están involucradas?** — nueva entidad, relación con existentes
3. **¿Qué endpoints de API son necesarios?** — métodos HTTP, URLs, request/response
4. **¿Qué validaciones son necesarias?** — campos obligatorios, formatos, reglas de negocio
5. **¿Qué cambios de base de datos se necesitan?** — nuevas tablas, columnas, índices, constraints
6. **¿Qué componentes frontend son necesarios?** — form, tabla, modal, etc.
7. **¿Qué casos de error hay que manejar?** — validación, duplicados, servidor caído, etc.
8. **¿Qué consideraciones de seguridad aplican?** — autenticación, autorización, sanitización
9. **¿Qué tests unitarios son necesarios?** — happy path, casos de error, edge cases

### Paso 3: Generar el ticket enriquecido

Produce un documento en formato Markdown con la siguiente estructura:

```markdown
# [Título del ticket]

## Contexto del Negocio
[Por qué existe este ticket, qué problema resuelve]

## Historia de Usuario Original
Como [rol], quiero [objetivo], para [beneficio].

## Criterios de Aceptación Funcionales
- [ ] CA1: [criterio medible y verificable]
- [ ] CA2: ...

## Criterios de Aceptación No Funcionales
- [ ] Performance: [respuesta en < X ms]
- [ ] Seguridad: [qué medidas se aplican]
- [ ] Accesibilidad: [WCAG 2.1 AA, labels, etc.]

## Cambios en Base de Datos

### Nuevo modelo Prisma: [Entidad]
```prisma
model Entidad {
  id   Int    @id @default(autoincrement())
  ...
}
```

### Migración necesaria
- Nombre sugerido: `add_[entidad]_model`
- Impacto: sin datos existentes afectados / [descripción]

## API Endpoint(s)

### POST /api/[recurso]
**Content-Type:** `multipart/form-data` | `application/json`

**Request Body:**
```typescript
interface CreateEntidadDto {
  campo1: string;        // Obligatorio, max 100 chars
  campo2?: string;       // Opcional
}
```

**Responses:**
| Código | Situación | Body |
|--------|-----------|------|
| 201 | Creado correctamente | `{ success: true, data: { id, ... } }` |
| 400 | Validación fallida | `{ success: false, error: "mensaje" }` |
| 409 | Conflicto (ej: email duplicado) | `{ success: false, error: "mensaje" }` |
| 500 | Error servidor | `{ success: false, error: "Error interno" }` |

## Ficheros a Modificar/Crear

### Backend
- **CREAR** `backend/src/domain/models/[Entidad].ts` — clase de dominio con save/findOne
- **CREAR** `backend/src/application/services/[entidad]Service.ts` — lógica de negocio
- **CREAR** `backend/src/presentation/controllers/[entidad]Controller.ts` — HTTP handler
- **CREAR** `backend/src/routes/[entidad]Routes.ts` — rutas Express
- **MODIFICAR** `backend/prisma/schema.prisma` — añadir modelo
- **MODIFICAR** `backend/src/application/validator.ts` — añadir validaciones
- **MODIFICAR** `backend/src/index.ts` — registrar nuevas rutas
- **CREAR** `backend/src/tests/[entidad]Service.test.ts` — tests unitarios

### Frontend
- **CREAR** `frontend/src/types/[entidad].ts` — interfaces TypeScript
- **CREAR** `frontend/src/services/[entidad]Service.ts` — servicio API
- **CREAR** `frontend/src/components/[NombreForm]/[NombreForm].tsx` — componente form
- **CREAR** `frontend/src/components/[NombreForm]/[NombreForm].css` — estilos
- **MODIFICAR** `frontend/src/App.tsx` — añadir ruta y enlace de navegación
- **CREAR** `frontend/src/tests/[NombreForm].test.tsx` — tests del componente

### Documentación
- **ACTUALIZAR** `docs/modelo-datos.md` — nueva entidad
- **ACTUALIZAR** `docs/api-spec.yml` — nuevo endpoint

## Validaciones Requeridas

### Backend (application/validator.ts)
| Campo | Validación | Error Message |
|-------|-----------|---------------|
| firstName | Obligatorio, 1-100 chars | "El nombre es obligatorio" |
| email | Formato email válido, único | "El email tiene un formato inválido" |

### Frontend (componente)
| Campo | Validación | Cuándo validar |
|-------|-----------|----------------|
| firstName | Required | onBlur |
| email | Formato email | onChange |

## Tests Unitarios Esperados

### backend/src/tests/[entidad]Service.test.ts
- [ ] `should_create_[entidad]_when_all_data_is_valid`
- [ ] `should_throw_error_when_firstName_is_empty`
- [ ] `should_throw_error_when_email_is_invalid_format`
- [ ] `should_throw_error_when_email_already_exists`
- [ ] `should_handle_optional_fields_gracefully`
- [ ] `should_handle_cv_file_upload`

### frontend/src/tests/[NombreForm].test.tsx
- [ ] `should_render_all_required_fields`
- [ ] `should_show_success_message_after_successful_submit`
- [ ] `should_show_error_when_required_field_is_empty`
- [ ] `should_show_api_error_when_server_returns_error`
- [ ] `should_disable_submit_button_while_loading`

## Consideraciones de Seguridad
- [ ] Validar tipo y tamaño del CV en backend (no confiar en validación cliente)
- [ ] Sanitizar strings de texto libre (trim)
- [ ] El endpoint no requiere autenticación en esta fase (MVP)
- [ ] No exponer rutas internas de archivo al cliente
- [ ] Añadir `uploads/` a `.gitignore`

## Definition of Done

- [ ] Schema Prisma actualizado y migración ejecutada
- [ ] Endpoint POST /api/[recurso] funciona con curl
- [ ] Todos los tests unitarios pasan (`npm test`)
- [ ] Cobertura >= 90% (`npm run test:coverage`)
- [ ] Formulario frontend visible y funcional en http://localhost:3000
- [ ] Validaciones de cliente funcionan (campos obligatorios, formato email)
- [ ] Mensaje de éxito se muestra al crear correctamente
- [ ] Mensaje de error se muestra cuando falla la API
- [ ] `docs/modelo-datos.md` actualizado
- [ ] `docs/api-spec.yml` actualizado con el nuevo endpoint
- [ ] Reporte de tests en `specs/[feature]/reportes/`
- [ ] Commit descriptivo creado con la rama correspondiente
```

## Output

Guarda el ticket enriquecido en `specs/[nombre-del-feature]/requirements.md` y notifica al usuario.

Luego sugiere el siguiente paso: crear el plan técnico con el agente backend-developer.
