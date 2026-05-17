# Feature: Añadir Candidato al Sistema

## Contexto del Negocio

El sistema LTI es una herramienta ATS (Applicant Tracking System) que permite a los reclutadores gestionar el ciclo de vida de los candidatos. En el estado actual del MVP, no existe ninguna forma de añadir candidatos al sistema desde la interfaz web.

Esta feature es la funcionalidad más básica e importante del sistema: permitir que un reclutador registre un nuevo candidato con su información personal, formación, experiencia y CV.

## Problema que Resuelve

Los reclutadores necesitan digitalizar la información de los candidatos para:
- Centralizar los datos de todos los candidatos en un único sistema
- Poder buscarlos y filtrarlos posteriormente
- Adjuntar su CV para referencia rápida
- Iniciar el proceso de seguimiento del candidato

## Historia de Usuario Original

**Como** reclutador,  
**Quiero** tener la capacidad de añadir candidatos al sistema ATS,  
**Para que** pueda gestionar sus datos y procesos de selección de manera eficiente.

## Alcance de este Feature

Esta primera iteración incluye:
- ✅ Modelo de datos del candidato (base de datos)
- ✅ Endpoint de API para crear candidato (POST /api/candidates)
- ✅ Formulario web para introducir los datos del candidato
- ✅ Carga del CV en formato PDF o DOCX

**Fuera de alcance (futuras iteraciones):**
- ❌ Listado/búsqueda de candidatos
- ❌ Edición de candidatos existentes
- ❌ Eliminación de candidatos
- ❌ Autenticación/autorización
- ❌ Almacenamiento en cloud (S3, etc.) del CV
- ❌ Envío de emails de confirmación

## Decisiones Técnicas Clave

1. **Almacenamiento del CV:** Se guarda en el sistema de archivos local (`uploads/`) por simplicidad del MVP. En producción se usaría S3 o similar.
2. **Autenticación:** No se implementa en esta fase. El endpoint es público.
3. **Arquitectura backend:** DDD con 4 capas (Domain, Application, Presentation, Infrastructure) usando Prisma ORM.
4. **Frontend:** React 18 + TypeScript + React Bootstrap. Componente de formulario separado.

## Especificaciones Detalladas

Ver:
- `specs/anadir-candidato/requirements.md` — Requisitos técnicos detallados
- `specs/anadir-candidato/tasks-backend.md` — Plan de implementación backend
- `specs/anadir-candidato/tasks-frontend.md` — Plan de implementación frontend

## Criterios de Éxito

1. Un reclutador puede navegar a un formulario de añadir candidato desde la pantalla principal
2. El formulario captura todos los campos relevantes del candidato
3. El formulario valida los datos antes de enviar
4. El backend procesa y persiste el candidato en PostgreSQL
5. El CV se almacena correctamente y la referencia queda en la BD
6. Se muestra confirmación al usuario al crear el candidato
7. Los errores (validación, servidor) se muestran de forma clara al usuario
8. El código tiene cobertura de tests >= 90%
