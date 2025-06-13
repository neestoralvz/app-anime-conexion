# Sprint 1: MVP Core - Funcionalidad Básica

## Información del Sprint
- **Duración**: 2.5 semanas (11 días laborales - incluye +1 día buffer)
- **Objetivo**: Implementar el flujo completo del juego con funcionalidad mínima
- **Presupuesto**: $0.00 - Stack 100% gratuito
- **Criterio de Éxito**: Flujo completo del juego funcional end-to-end

---

## Tareas del Sprint

### Semana 1: Fundaciones

#### Día 1-2: Setup y Configuración Inicial
**Tarea S1-001: Configurar proyecto base**
- [ ] Crear repositorio en GitHub
- [ ] Setup Next.js 14 con TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Setup ESLint + Prettier
- [ ] Configurar estructura de carpetas según convenciones
- [ ] **Commit**: "feat: initial project setup with Next.js, TypeScript, and Tailwind"

**Tarea S1-002: Configurar base de datos**
- [ ] Setup Prisma con SQLite local
- [ ] Crear schema inicial (Anime, Session, SessionUser, Selection, Rating)
- [ ] Ejecutar primera migración
- [ ] **Commit**: "feat: setup Prisma with initial database schema"

#### Día 3: Estructura del Proyecto
**Tarea S1-003: Organizar estructura y componentes base**
- [ ] Crear estructura de carpetas completa
- [ ] Implementar componentes base (Layout, Button, Input)
- [ ] Setup de Context para estado global
- [ ] Configurar rutas principales
- [ ] **Limpieza**: Remover archivos default de Next.js no utilizados
- [ ] **Commit**: "feat: project structure and base components"

#### Día 4-5: Sistema de Sesiones
**Tarea S1-004: Backend de sesiones**
- [ ] Implementar API endpoints para sesiones
  - `POST /api/sessions` (crear)
  - `POST /api/sessions/join` (unirse)
  - `GET /api/sessions/:id` (obtener)
- [ ] Validación con Zod
- [ ] Manejo de errores
- [ ] **Commit**: "feat: session management API endpoints"

**Tarea S1-005: Frontend de sesiones**
- [ ] Página HomePage con crear/unirse sesión
- [ ] Componente SessionLobby
- [ ] Context de Session
- [ ] Validación de formularios
- [ ] **Commit**: "feat: session creation and joining UI"

### Semana 2: Funcionalidad Core

#### Día 6-7: Base de Datos de Animes
**Tarea S1-006: Setup animes y búsqueda**
- [ ] Crear seed script con ~50 animes populares
- [ ] Implementar API de búsqueda
  - `GET /api/animes/search?q=query`
- [ ] Componente AnimeSearch con autocompletado
- [ ] Componente AnimeCard
- [ ] **Commit**: "feat: anime database and search functionality"

#### Día 8: Selección de Animes
**Tarea S1-007: Sistema de selección**
- [ ] API endpoint para selecciones
  - `POST /api/sessions/:id/selections`
- [ ] Página de selección con búsqueda
- [ ] Validación de 3 animes exactos
- [ ] Estado local de selecciones
- [ ] **Commit**: "feat: anime selection system"

#### Día 9: Sistema de Calificación
**Tarea S1-008: Implementar calificaciones**
- [ ] API endpoints para ratings
  - `POST /api/sessions/:id/ratings`
  - `GET /api/sessions/:id/ratings`
- [ ] Componente RatingForm con 3 preguntas
- [ ] Validación de escala 1-4
- [ ] **Commit**: "feat: anime rating system"

#### Día 10: Motor de Cálculo y Resultados
**Tarea S1-009: Lógica de negocio**
- [ ] Implementar motor de comparación
- [ ] Cálculo de puntuación final
- [ ] Aplicar filtro de oro
- [ ] API endpoint de resultados
  - `GET /api/sessions/:id/results`
- [ ] **Commit**: "feat: game logic and results calculation"

**Tarea S1-010: Pantalla de resultados**
- [ ] Componente ResultsDisplay
- [ ] Mostrar anime ganador
- [ ] Desglose de puntuaciones
- [ ] Opción para nueva sesión
- [ ] **Commit**: "feat: results display and game completion"

#### Día 11: Buffer y Refinamiento
**Tarea S1-B01: Buffer para refinamiento**
- [ ] Testing adicional end-to-end
- [ ] Refinamiento de UI/UX críticos
- [ ] Resolución de bugs encontrados
- [ ] Optimización de performance básica
- [ ] **Commit**: "fix: sprint 1 refinements and bug fixes"

---

## Tareas Transversales

### Refactorización (Día 8)
**Tarea S1-R01: Refactoring mid-sprint**
- [ ] Revisar duplicación de código
- [ ] Optimizar componentes comunes
- [ ] Mejorar estructura de servicios
- [ ] Consolidar tipos TypeScript
- [ ] **Commit**: "refactor: improve code organization and reduce duplication"

### Testing (Día 9)
**Tarea S1-T01: Tests básicos**
- [ ] Unit tests para utils de cálculo
- [ ] Tests de API endpoints críticos
- [ ] Tests básicos de componentes
- [ ] **Commit**: "test: add basic unit tests for core functionality"

### Deploy y DevOps (Día 10)
**Tarea S1-D01: Setup deployment**
- [ ] Configurar Vercel para frontend
- [ ] Setup Render para backend
- [ ] Configurar PostgreSQL en Render
- [ ] Variables de entorno
- [ ] **Deploy**: Primera versión en producción
- [ ] **Commit**: "ci: setup production deployment"

### Documentación (Día 11)
**Tarea S1-DOC01: Actualizar documentación**
- [ ] Actualizar README con instrucciones de setup
- [ ] Documentar APIs implementadas
- [ ] Actualizar architecture-diagram.md con cambios
- [ ] Crear changelog inicial
- [ ] **Commit**: "docs: update documentation after MVP implementation"

### Limpieza Final (Día 11)
**Tarea S1-C01: Limpieza de código**
- [ ] Remover console.logs y debug code
- [ ] Verificar imports no utilizados
- [ ] Normalizar comentarios
- [ ] Revisar naming conventions
- [ ] Organizar estructura final de archivos
- [ ] **Commit**: "chore: code cleanup and organization"

---

## Criterios de Aceptación del Sprint

### Funcionalidad
- [ ] Usuario puede crear sesión y obtener código
- [ ] Usuario puede unirse a sesión con código
- [ ] Usuario puede buscar y seleccionar 3 animes
- [ ] Usuario puede calificar sus animes (auto-calificación)
- [ ] Usuario puede calificar animes del compañero
- [ ] Sistema calcula ganador correctamente
- [ ] Filtro de oro funciona (pregunta 3 = 1)
- [ ] Pantalla de resultados muestra ganador

### Técnico
- [ ] Aplicación deployed en Vercel + Render
- [ ] Base de datos PostgreSQL funcionando
- [ ] No hay errores críticos en consola
- [ ] APIs responden correctamente
- [ ] Validaciones funcionan en frontend y backend

### Calidad
- [ ] Código sigue convenciones establecidas
- [ ] No hay duplicación significativa
- [ ] Manejo básico de errores implementado
- [ ] Responsive en móvil y desktop
- [ ] Tests básicos pasando

---

## Riesgos y Mitigaciones

### Riesgo: Complejidad del motor de cálculo
**Mitigación**: Implementar con casos de prueba simples primero

### Riesgo: Problemas de deployment
**Mitigación**: Hacer deploy temprano (día 7) para identificar issues

### Riesgo: Tiempo insuficiente
**Mitigación**: Priorizar funcionalidad core, diferir mejoras de UI

---

## Definición de Done

### Para cada tarea:
- [ ] Funcionalidad implementada y probada manualmente
- [ ] Código committed con mensaje descriptivo
- [ ] No introduce breaking changes
- [ ] Sigue convenciones de naming

### Para el sprint completo:
- [ ] Todas las tareas core completadas
- [ ] Aplicación deployada y accesible
- [ ] Demo funcional del flujo completo
- [ ] Documentación actualizada
- [ ] Ready para Sprint 2