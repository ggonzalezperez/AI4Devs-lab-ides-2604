---
name: actualizar-docs
description: Úsame después de implementar un cambio que afecte al modelo de datos o a la API. Reviso qué documentación técnica necesita actualizarse y la actualizo automáticamente siguiendo los estándares del proyecto.
---

# Skill: Actualizar Documentación Técnica

## Cuándo Usarlo

- Después de añadir o modificar un modelo en `schema.prisma`
- Después de añadir o modificar un endpoint de la API
- Antes de hacer commit, como verificación final
- Cuando el agente ha terminado de implementar una tarea

## Proceso

### Paso 1: Revisar cambios
```bash
git diff HEAD -- backend/prisma/schema.prisma
git diff HEAD -- backend/src/routes/
git diff HEAD -- backend/src/presentation/controllers/
```

### Paso 2: Determinar qué actualizar

| Tipo de cambio | Documentación a actualizar |
|----------------|---------------------------|
| Nuevo modelo Prisma | `docs/modelo-datos.md` — añadir sección de la nueva entidad |
| Columna nueva en modelo | `docs/modelo-datos.md` — actualizar tabla de campos |
| Nuevo endpoint GET/POST/PUT/DELETE | `docs/api-spec.yml` — añadir el path con schema completo |
| Cambio en request/response de endpoint | `docs/api-spec.yml` — actualizar el schema afectado |
| Nueva librería instalada | `docs/backend-standards.md` o `docs/frontend-standards.md` |

### Paso 3: Actualizar `docs/modelo-datos.md`

Para cada nueva entidad, añadir sección completa:

```markdown
### [NombreEntidad]

**Descripción:** [Qué representa en el dominio]

**Tabla en BD:** `[NombreTabla]`

| Campo | Tipo | Obligatorio | Descripción | Validaciones |
|-------|------|-------------|-------------|--------------|
| id | Int | Sí (auto) | PK autoincrement | - |
| [campo] | [tipo] | [Sí/No] | [descripción] | [validaciones] |

**Relaciones:**
- [descripción de relaciones]

**Diagrama Mermaid:**
```mermaid
erDiagram
  [diagrama actualizado]
```
```

### Paso 4: Actualizar `docs/api-spec.yml`

Para cada nuevo endpoint, añadir en la sección `paths`:

```yaml
/api/[recurso]:
  post:
    summary: [Descripción corta]
    tags: [[Tag]]
    requestBody:
      required: true
      content:
        multipart/form-data:   # o application/json
          schema:
            $ref: '#/components/schemas/Create[Entidad]Request'
    responses:
      '201':
        description: [Recurso] creado correctamente
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/[Entidad]Response'
      '400':
        description: Datos de entrada inválidos
      '409':
        description: Conflicto (ej. email ya existe)
      '500':
        description: Error interno del servidor
```

Y en `components/schemas` añadir los schemas correspondientes.

### Paso 5: Verificar consistencia

Comprobar que:
- Los campos en `modelo-datos.md` coinciden exactamente con `schema.prisma`
- Los schemas en `api-spec.yml` coinciden con lo que devuelven los controllers
- El diagrama Mermaid en `modelo-datos.md` está actualizado

### Paso 6: Confirmar cambios
```bash
git diff docs/
```

Mostrar al usuario el resumen de qué documentación se ha actualizado.

## Reglas

- La documentación debe refleja el estado ACTUAL del código, no el planeado
- Si un campo es opcional en Prisma (`?`), debe marcarse como no obligatorio en la tabla
- Las validaciones documentadas deben coincidir exactamente con las de `application/validator.ts`
- El diagrama Mermaid debe incluir todas las entidades, no solo la nueva
