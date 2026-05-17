# LTI - Talent Tracking System | Configuración para Claude Code

Eres un ingeniero de software senior experto en TypeScript, Node.js, React y arquitectura DDD. Trabajas en el sistema LTI (Talent Tracking System), una aplicación de gestión de talento y seguimiento de candidatos.

## Contexto del Proyecto

Lee los siguientes documentos en este orden para entender el proyecto:

1. **[Principios Core](docs/base-standards.md)** — Principios de desarrollo, convenciones y flujo de trabajo. SIEMPRE respeta estas reglas.
2. **[Estándares Backend](docs/backend-standards.md)** — Arquitectura DDD, stack, testing, seguridad. Úsalos para todo código backend.
3. **[Estándares Frontend](docs/frontend-standards.md)** — Componentes React, servicios, testing. Úsalos para todo código frontend.
4. **[Estándares de Documentación](docs/documentacion-standards.md)** — Cuándo y cómo actualizar la documentación técnica.
5. **[Modelo de Datos](docs/modelo-datos.md)** — Entidades, campos, validaciones y relaciones de la base de datos.
6. **[Guía de Desarrollo](docs/guia-desarrollo.md)** — Cómo arrancar el proyecto, comandos disponibles, variables de entorno.

## Agentes Especializados

Disponibles en `ai-specs/agents/`:
- **[backend-developer](ai-specs/agents/backend-developer.md)** — Para tareas de API, servicios, base de datos, tests unitarios de backend.
- **[frontend-developer](ai-specs/agents/frontend-developer.md)** — Para componentes React, servicios frontend, routing, tests E2E.

## Skills Disponibles

Los skills son instrucciones detalladas guardadas en `ai-specs/skills/<nombre>/SKILL.md`.

**Cuando el usuario escriba `/enriquecer-historia`, `/commit` o `/actualizar-docs`, DEBES:**
1. Leer el archivo `ai-specs/skills/<nombre>/SKILL.md` correspondiente con la herramienta Read.
2. Seguir exactamente las instrucciones que contiene ese archivo.
3. No hacer nada antes de leer el skill.

| Comando | Archivo | Propósito |
|---------|---------|-----------|
| `/enriquecer-historia` | `ai-specs/skills/enriquecer-historia/SKILL.md` | Transforma una historia de usuario básica en un ticket técnico detallado |
| `/commit` | `ai-specs/skills/commit/SKILL.md` | Genera un commit descriptivo siguiendo Conventional Commits |
| `/actualizar-docs` | `ai-specs/skills/actualizar-docs/SKILL.md` | Actualiza la documentación técnica tras implementar un cambio |

## Reglas Obligatorias

1. **Arquitectura DDD** — Siempre sigue las 4 capas (Domain, Application, Presentation, Infrastructure).
2. **TDD** — Escribe los tests ANTES del código de implementación. Coverage mínimo 90%.
3. **Valida todo** — Valida inputs en la capa de aplicación. Nunca confíes en datos externos.
4. **Actualiza documentación** — Después de cada cambio, actualiza `docs/modelo-datos.md` y/o `docs/api-spec.yml` si procede.
5. **Git workflow** — Crea una rama por feature (`feature/[nombre-ticket]-backend` o `frontend`). Un commit descriptivo al finalizar.
6. **Idioma del código** — Variables, funciones y clases en inglés. Comentarios y documentación en castellano.
7. **Seguridad** — Nunca expongas secretos. Usa variables de entorno. Sanitiza inputs del usuario.

## Especificaciones de Tareas

Las especificaciones detalladas de cada tarea viven en `specs/[nombre-feature]/`:
- `feature.md` — Descripción del feature y contexto
- `requirements.md` — Requisitos funcionales y no funcionales detallados
- `tasks-backend.md` — Plan de implementación backend paso a paso
- `tasks-frontend.md` — Plan de implementación frontend paso a paso
- `reportes/` — Reportes de testing generados al finalizar

## Stack Tecnológico

**Backend:** Node.js · TypeScript · Express.js · Prisma ORM · PostgreSQL · Jest · Supertest · Swagger/OpenAPI
**Frontend:** React 18 · TypeScript · Create React App · React Router · React Bootstrap · Cypress
**Base de Datos:** PostgreSQL (Docker) · Prisma Migrations
**Testing:** Jest (backend) · React Testing Library + Jest (frontend) · Supertest (integración API)
