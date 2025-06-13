# Historias de Usuario - App Anime Conexión

## Epic: Sistema de Selección Colaborativa de Animes

### Historia Principal
**Como** pareja/dupla que quiere ver anime juntos  
**Quiero** un sistema justo y divertido para elegir qué anime ver  
**Para** evitar la indecisión y descubrir nuevos animes que ambos disfrutemos

---

## Fase 1: Selección Secreta (`SELECTION`)

### US-001: Crear Sesión
**Como** usuario iniciador  
**Quiero** crear una nueva sesión de selección  
**Para** invitar a mi compañero a participar

**Criterios de Aceptación:**
- Genero un código/link único de sesión
- Puedo compartir el código con mi compañero
- La sesión expira después de un tiempo determinado

### US-002: Unirse a Sesión
**Como** usuario invitado  
**Quiero** unirme a una sesión existente usando un código  
**Para** participar en la selección de anime

**Criterios de Aceptación:**
- Ingreso el código de sesión
- Confirmo mi participación
- Veo que estoy conectado a la sesión

### US-003: Buscar y Seleccionar Animes
**Como** usuario participante  
**Quiero** buscar y seleccionar 3 animes de forma privada  
**Para** proponer mis candidatos sin que mi compañero los vea

**Criterios de Aceptación:**
- Busco animes por título
- Veo información básica (sinopsis, género)
- Selecciono exactamente 3 animes
- Mis selecciones permanecen ocultas

### US-004: Auto-calificar Selecciones
**Como** usuario participante  
**Quiero** calificar mis 3 animes seleccionados  
**Para** expresar mi nivel de interés en cada uno

**Criterios de Aceptación:**
- Respondo 3 preguntas por cada anime (escala 1-4):
  1. Potencial de historia e intriga
  2. Afinidad con mi mood actual
  3. Impulso de querer verlo ya
- Puedo modificar mis calificaciones antes de enviar
- Confirmo mi selección final

---

## Fase 2: Detección de Coincidencias (`MATCHING`)

### US-005: Comparar Selecciones
**Como** sistema  
**Quiero** comparar automáticamente las listas de ambos usuarios  
**Para** detectar coincidencias directas

**Criterios de Aceptación:**
- Comparo los 6 animes seleccionados
- Identifico matches exactos por título
- Determino si hay conexión directa

### US-006: Mostrar Resultado de Conexión
**Como** usuario participante  
**Quiero** ver si hubo coincidencias en nuestras selecciones  
**Para** saber si ya tenemos un ganador

**Criterios de Aceptación:**
- Veo claramente si hay conexión directa
- Si hay múltiples matches, veo cuál tiene mayor puntuación
- Si no hay matches, procedo a la siguiente fase

---

## Fase 3: Evaluación Cruzada (`RATING`)

### US-007: Ver Selecciones del Compañero
**Como** usuario participante  
**Quiero** ver los animes que mi compañero seleccionó (que no coincidieron)  
**Para** evaluarlos y calificarlos

**Criterios de Aceptación:**
- Veo solo los animes no coincidentes del compañero
- Accedo a la información completa de cada anime
- Puedo proceder a calificarlos

### US-008: Calificar Animes del Compañero
**Como** usuario participante  
**Quiero** calificar los animes de mi compañero usando los mismos criterios  
**Para** contribuir al cálculo final de puntuación

**Criterios de Aceptación:**
- Uso las mismas 3 preguntas y escala 1-4
- Califico todos los animes del compañero
- Confirmo mis calificaciones finales

### US-009: Calcular Ganador Final
**Como** sistema  
**Quiero** calcular automáticamente el anime ganador  
**Para** determinar qué verán los usuarios

**Criterios de Aceptación:**
- Sumo auto-calificación + calificación cruzada para cada anime
- Aplico filtro de oro (descarto animes con pregunta 3 = 1)
- Determino el anime con mayor puntuación total
- Manejo empates con criterios claros

### US-010: Mostrar Resultados Finales
**Como** usuario participante  
**Quiero** ver el anime ganador con el desglose de puntuación  
**Para** entender por qué ganó y preparar la sesión de viewing

**Criterios de Aceptación:**
- Veo el anime ganador destacado
- Accedo al desglose detallado de puntuaciones
- Veo información completa del anime a ver
- Puedo iniciar una nueva sesión si quiero

---

## Historias de Soporte

### US-011: Validación de Entrada
**Como** sistema  
**Quiero** validar todas las entradas del usuario  
**Para** evitar errores y mantener la integridad del juego

### US-012: Manejo de Desconexiones
**Como** usuario participante  
**Quiero** poder reconectarme si pierdo la conexión  
**Para** no perder mi progreso en la sesión

### US-013: Responsividad Mobile
**Como** usuario en dispositivo móvil  
**Quiero** una experiencia fluida en mi teléfono  
**Para** poder jugar desde cualquier lugar

### US-014: Feedback Visual
**Como** usuario participante  
**Quiero** feedback visual claro en cada acción  
**Para** entender el estado actual del juego

---

## Historias Futuras (Backlog)

### US-015: Grupos de 3+ Personas
**Como** grupo de amigos  
**Quiero** poder jugar con más de 2 personas  
**Para** elegir anime en grupo grande

### US-016: Historial de Sesiones
**Como** usuario recurrente  
**Quiero** ver el historial de animes que hemos elegido  
**Para** evitar repeticiones y recordar buenos animes

### US-017: Integración con APIs Externas
**Como** usuario  
**Quiero** acceso a información actualizada de animes  
**Para** tener más opciones y mejor información