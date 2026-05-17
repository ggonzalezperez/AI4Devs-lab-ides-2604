# Setup SDD (Spec Driven Development) - Plan de Implementación

> **Para trabajadores agénticos:** Usar superpowers:executing-plans para implementar tarea a tarea.

**Objetivo:** Adaptar la infraestructura de Spec Driven Development del proyecto lidr-specboot a este proyecto LTI, en castellano, y preparar el ticket enriquecido de "Añadir Candidato" para que el desarrollador pueda ejecutarlo.

**Arquitectura:** Carpeta `docs/` como fuente de verdad de estándares técnicos. Carpeta `ai-specs/` para agentes y skills. Carpeta `specs/` para especificaciones de tareas. CLAUDE.md como punto de entrada que referencia todo.

**Stack:** Express + TypeScript + Prisma + PostgreSQL + Jest (backend) | React 18 + TypeScript + CRA (frontend)

---

## Ficheros a Crear/Modificar

### Nuevos
- `CLAUDE.md` — Configuración principal para Claude Code
- `docs/base-standards.md` — Principios core del proyecto
- `docs/backend-standards.md` — Estándares backend DDD
- `docs/frontend-standards.md` — Estándares frontend React
- `docs/documentacion-standards.md` — Reglas de documentación
- `docs/modelo-datos.md` — Modelo de datos actual
- `docs/guia-desarrollo.md` — Guía de setup y desarrollo
- `ai-specs/agents/backend-developer.md` — Agente backend especializado
- `ai-specs/agents/frontend-developer.md` — Agente frontend especializado
- `ai-specs/skills/enriquecer-historia/SKILL.md` — Skill para enriquecer user stories
- `ai-specs/skills/commit/SKILL.md` — Skill para commits descriptivos
- `ai-specs/skills/actualizar-docs/SKILL.md` — Skill para actualizar documentación
- `specs/anadir-candidato/feature.md` — Descripción del feature
- `specs/anadir-candidato/requirements.md` — Requisitos detallados
- `specs/anadir-candidato/tasks-backend.md` — Plan técnico backend
- `specs/anadir-candidato/tasks-frontend.md` — Plan técnico frontend
- `prompts-iniciales.md` — Registro de prompts usados (entregable)

---

## Tarea 1: Crear CLAUDE.md principal

- [ ] Escribir CLAUDE.md referenciando todos los docs de estándares

## Tarea 2: Crear estándares de documentación (docs/)

- [ ] docs/base-standards.md
- [ ] docs/backend-standards.md
- [ ] docs/frontend-standards.md
- [ ] docs/documentacion-standards.md
- [ ] docs/modelo-datos.md
- [ ] docs/guia-desarrollo.md

## Tarea 3: Crear agentes especializados (ai-specs/agents/)

- [ ] ai-specs/agents/backend-developer.md
- [ ] ai-specs/agents/frontend-developer.md

## Tarea 4: Crear skills reutilizables (ai-specs/skills/)

- [ ] ai-specs/skills/enriquecer-historia/SKILL.md
- [ ] ai-specs/skills/commit/SKILL.md
- [ ] ai-specs/skills/actualizar-docs/SKILL.md

## Tarea 5: Crear especificaciones del ticket

- [ ] specs/anadir-candidato/feature.md
- [ ] specs/anadir-candidato/requirements.md
- [ ] specs/anadir-candidato/tasks-backend.md
- [ ] specs/anadir-candidato/tasks-frontend.md

## Tarea 6: Crear prompts-iniciales.md

- [ ] prompts-iniciales.md en raíz del proyecto
