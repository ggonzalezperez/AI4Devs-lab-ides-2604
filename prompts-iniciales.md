# Prompts Iniciales — LTI Talent Tracking System

**Alumno:** germanGP  
**Fecha:** 2026-05-17  
**Ejercicio:** Definición y desarrollo del primer ticket del proyecto LTI

---

## Contexto y Metodología

Este documento recoge los prompts utilizados para configurar el entorno de Spec Driven Development (SDD) en el proyecto y para enriquecer y planificar el ticket de "Añadir Candidato al Sistema".

La metodología aplicada es **Spec Driven Development** inspirada en el repositorio [lidr-specboot](https://github.com/Fission-AI/OpenSpec), adaptada al proyecto y en castellano. Consiste en:

1. **Preparar el contexto** — Documentar el stack, la arquitectura y las convenciones del equipo
2. **Enriquecer el ticket** — Transformar la historia de usuario en un contrato técnico exhaustivo
3. **Planificar** — Generar un plan paso a paso con TDD, antes de tocar código
4. **Implementar** — Seguir el plan con el agente especializado
5. **Revisar y documentar** — Actualizar la documentación técnica y generar reportes

---

## Prompt 1: Análisis del Proyecto Base

**Propósito:** Entender el estado actual del proyecto para poder adaptar correctamente la infraestructura SDD.

```
Analiza a fondo la estructura completa del proyecto. Necesito saber:
1. Estructura de carpetas completa (frontend, backend, docs, config files)
2. Tecnologías usadas (package.json de frontend y backend)
3. Modelos de datos existentes (schema.prisma)
4. Endpoints de API existentes
5. Estructura de archivos de frontend
6. Archivos de configuración del IDE existentes

Dame un reporte detallado de todo lo que encuentres.
```

---

## Prompt 2: Setup de Infraestructura SDD

**Propósito:** Crear toda la estructura de carpetas y archivos necesarios para aplicar Spec Driven Development al proyecto, en castellano y adaptada al stack específico (Express + Prisma + React).

```
Analiza el proyecto OpenSpec de ejemplo en [ruta] y adapta su estructura 
de Spec Driven Development a este proyecto LTI. Quiero que me añadas 
lo necesario de carpetas y specs adaptadas a este proyecto y en castellano.

Estructura a crear:
- CLAUDE.md: configuración principal para el asistente de IA
- docs/: estándares técnicos (base, backend, frontend, documentación, modelo de datos, guía de desarrollo)
- ai-specs/agents/: agentes especializados (backend-developer, frontend-developer)
- ai-specs/skills/: skills reutilizables (enriquecer-historia, commit, actualizar-docs)
- specs/anadir-candidato/: especificaciones del ticket actual

El stack del proyecto es:
- Backend: Express + TypeScript + Prisma ORM + PostgreSQL + Jest
- Frontend: React 18 + TypeScript + Create React App + React Bootstrap
- Arquitectura: DDD (Domain Driven Design) con 4 capas
```

---

## Prompt 3: Enriquecimiento de la Historia de Usuario

**Propósito:** Transformar la historia de usuario básica en un ticket técnico detallado y autocontenido usando el skill `enriquecer-historia`.

**Input (historia original):**
```
Historia de Usuario: Añadir Candidato al Sistema

Como reclutador,
Quiero tener la capacidad de añadir candidatos al sistema ATS,
Para que pueda gestionar sus datos y procesos de selección de manera eficiente.

Criterios de Aceptación:
- Accesibilidad de la función: Debe haber un botón o enlace claramente visible 
  para añadir un nuevo candidato desde la página principal del dashboard.
- Formulario de ingreso de datos: Al seleccionar la opción de añadir candidato, 
  se debe presentar un formulario que incluya: nombre, apellido, correo electrónico, 
  teléfono, dirección, educación y experiencia laboral.
- Validación de datos: El formulario debe validar los datos ingresados para asegurar 
  que son completos y correctos.
- Carga de documentos: El reclutador debe tener la opción de cargar el CV del 
  candidato en formato PDF o DOCX.
- Confirmación de añadido: Una vez completado el formulario y enviada la información, 
  debe aparecer un mensaje de confirmación.
- Errores y manejo de excepciones: En caso de error, el sistema debe mostrar un 
  mensaje adecuado al usuario.
- Accesibilidad y compatibilidad: La funcionalidad debe ser accesible y compatible 
  con diferentes dispositivos y navegadores web.
```

**Prompt utilizado (skill `/enriquecer-historia`):**
```
/enriquecer-historia

Analiza el contexto del proyecto leyendo:
- docs/base-standards.md
- docs/backend-standards.md  
- docs/frontend-standards.md
- docs/modelo-datos.md
- backend/prisma/schema.prisma

Luego enriquece esta historia de usuario convirtiéndola en un ticket técnico 
detallado y autocontenido que incluya:
1. Cambios necesarios en la base de datos (modelo Prisma)
2. Especificación del endpoint de API (método, URL, request body, responses)
3. Lista de ficheros a crear/modificar con descripción
4. Pseudocódigo de la implementación principal
5. Validaciones requeridas (backend y frontend)
6. Tests unitarios esperados (casos de test concretos)
7. Consideraciones de seguridad
8. Definition of Done completo

Historia de usuario: [pegar texto arriba]

Guarda el resultado en specs/anadir-candidato/requirements.md
```

---

## Prompt 4: Plan Técnico Backend (Agente backend-developer)

**Propósito:** Generar el plan detallado de implementación backend paso a paso, siguiendo TDD y DDD.

```
Actúa como el agente backend-developer definido en ai-specs/agents/backend-developer.md.

Lee los siguientes documentos en orden:
1. docs/backend-standards.md — arquitectura DDD y estándares
2. docs/modelo-datos.md — modelo de datos actual
3. specs/anadir-candidato/requirements.md — requisitos detallados del ticket

Genera el plan técnico de implementación backend en specs/anadir-candidato/tasks-backend.md.
El plan debe:
- Seguir el orden: rama → tests (primero) → dominio → aplicación → presentación → rutas → index
- Incluir los comandos exactos en cada paso
- Incluir el pseudocódigo/código de los tests unitarios
- Incluir el código completo de cada fichero a crear
- Incluir los comandos curl para prueba manual
- Terminar con un checklist de Definition of Done
- Cobertura mínima de tests: 90%

No implementes nada, solo genera el plan.
```

---

## Prompt 5: Plan Técnico Frontend (Agente frontend-developer)

**Propósito:** Generar el plan detallado de implementación frontend con React Bootstrap y React Router.

```
Actúa como el agente frontend-developer definido en ai-specs/agents/frontend-developer.md.

Lee los siguientes documentos:
1. docs/frontend-standards.md — estándares de componentes React
2. specs/anadir-candidato/requirements.md — requisitos del ticket
3. specs/anadir-candidato/tasks-backend.md — para entender el contrato de la API

Genera el plan técnico de implementación frontend en specs/anadir-candidato/tasks-frontend.md.
El plan debe incluir:
- Tipos TypeScript compartidos (interfaces)
- Servicio de API con axios y manejo de errores
- Tests del componente con React Testing Library (primero — TDD)
- Componente AddCandidateForm con todos los campos y validaciones
- Actualización de App.tsx con React Router
- Prueba manual en navegador paso a paso
- Checklist de Definition of Done

No implementes nada, solo genera el plan.
```

---

## Prompt 6: Implementar Backend (cuando estés listo para ejecutar)

**Propósito:** Ejecutar el plan técnico de backend usando el agente especializado.

```
Actúa como el agente backend-developer.

Lee el plan en specs/anadir-candidato/tasks-backend.md y ejecútalo paso a paso.

Reglas obligatorias:
1. Primero escribe los tests (paso 3), verifica que FALLAN, luego implementa
2. Sigue el orden exacto del plan
3. Después de implementar, ejecuta npm test y verifica cobertura >= 90%
4. Al finalizar, actualiza docs/modelo-datos.md y docs/api-spec.yml
5. Genera reporte en specs/anadir-candidato/reportes/YYYY-MM-DD-tests-backend.md
6. Prepara el commit pero no lo ejecutes hasta mi confirmación

Empieza por el Paso 0: crear la rama feature/anadir-candidato-backend.
```

---

## Prompt 7: Implementar Frontend (cuando el backend esté listo)

**Propósito:** Ejecutar el plan técnico de frontend usando el agente especializado.

```
Actúa como el agente frontend-developer.

El backend ya está implementado. Verifica que funciona:
curl -X POST http://localhost:3010/api/candidates \
  -F "firstName=Test" -F "lastName=Test" -F "email=test.frontend@verify.com"

Luego lee el plan en specs/anadir-candidato/tasks-frontend.md y ejecútalo.

Reglas obligatorias:
1. Primero escribe los tests (paso 3), verifica que FALLAN, luego implementa el componente
2. Sigue el orden exacto del plan
3. Verifica la prueba manual en el navegador
4. Genera reporte en specs/anadir-candidato/reportes/YYYY-MM-DD-tests-frontend.md
5. Prepara el commit pero no lo ejecutes hasta mi confirmación

Empieza por el Paso 0: crear la rama feature/anadir-candidato-frontend.
```

---

## Prompt 8: Meta-Prompt (Técnica avanzada)

**Propósito:** Generar un prompt más preciso para un caso específico usando el LLM como experto en prompting.

```
Eres un experto en prompt engineering para LLMs especializados en código.

Mi objetivo es: [DESCRIBE TU OBJETIVO AQUÍ]
El resultado que espero: [DESCRIBE EL OUTPUT ESPERADO]
El contexto del proyecto: Sistema LTI con stack Express+Prisma backend y React frontend.

Genera el prompt óptimo que debería usar para conseguir exactamente este resultado.
El prompt debe:
- Incluir el rol del agente
- Incluir el contexto necesario del proyecto
- Ser específico sobre el formato del output
- Incluir los documentos de referencia relevantes del proyecto
```

---

## Prompt 9: Preguntar al Experto (Técnica de clarificación)

**Propósito:** Usar el LLM como consultor antes de empezar a implementar funcionalidades complejas o en áreas donde no eres experto.

```
Eres un experto en [ÁREA: base de datos / arquitectura / seguridad / UX / etc.].

Contexto del proyecto LTI:
- Stack: Express + TypeScript + Prisma + PostgreSQL (backend), React (frontend)
- Objetivo que quiero conseguir: [TU OBJETIVO]

Analiza el proyecto leyendo los documentos relevantes y pregúntame cualquier cosa 
que consideres necesaria antes de proponer una solución. 
No proporciones soluciones todavía — solo haz las preguntas que necesitas para 
aclarar requisitos ambiguos o que podrían tener múltiples enfoques válidos.
```

---

## Estructura de Archivos Creados (SDD Infrastructure)

```
AI4Devs-lab-ides-2604/
├── CLAUDE.md                                    # ← Punto de entrada para el asistente
│
├── docs/
│   ├── base-standards.md                       # Principios core, git workflow, naming
│   ├── backend-standards.md                    # DDD, Express, Prisma, testing 90%
│   ├── frontend-standards.md                   # React, Bootstrap, servicios, testing
│   ├── documentacion-standards.md              # Cuándo y cómo actualizar docs
│   ├── modelo-datos.md                         # Entidades BD actuales y pendientes
│   └── guia-desarrollo.md                      # Setup, comandos, solución de problemas
│
├── ai-specs/
│   ├── agents/
│   │   ├── backend-developer.md               # Agente DDD + Prisma + Jest
│   │   └── frontend-developer.md              # Agente React + Bootstrap + Testing
│   └── skills/
│       ├── enriquecer-historia/SKILL.md       # Transforma tickets básicos en contratos técnicos
│       ├── commit/SKILL.md                    # Genera commits descriptivos
│       └── actualizar-docs/SKILL.md           # Actualiza docs tras implementar
│
└── specs/
    └── anadir-candidato/
        ├── feature.md                          # Contexto y decisiones de negocio
        ├── requirements.md                     # Requisitos técnicos completos + pseudocódigo
        ├── tasks-backend.md                    # Plan backend paso a paso (13 pasos)
        ├── tasks-frontend.md                   # Plan frontend paso a paso (10 pasos)
        └── reportes/                           # Reportes de tests (se generan al implementar)
```

---

## Cómo Usar Este Setup

1. **Para implementar el ticket actual:**
   - Abre tu IDE con IA (Cursor, Claude Code, GitHub Copilot)
   - El asistente leerá `CLAUDE.md` automáticamente
   - Pega el **Prompt 6** para empezar el backend
   - Una vez terminado y verificado, usa el **Prompt 7** para el frontend

2. **Para futuros tickets:**
   - Escribe la historia de usuario básica
   - Usa el **Prompt 3** (skill enriquecer-historia) para obtener el contrato técnico
   - Usa el **Prompt 4** para el plan backend
   - Usa el **Prompt 5** para el plan frontend
   - Revisa los planes y entonces implementa

3. **Para áreas fuera de tu expertise:**
   - Usa el **Prompt 9** (Preguntar al Experto) para aclarar dudas antes de implementar

4. **Para mejorar prompts:**
   - Usa el **Prompt 8** (Meta-Prompt) para generar prompts más precisos para casos específicos
