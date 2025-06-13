# App Anime Conexión - Visión del Proyecto

## Descripción General
Una aplicación web que facilita la selección colaborativa de animes para ver en pareja/grupo mediante un sistema de puntuación secreta y cruzada.

## Objetivo Principal
Eliminar la indecisión al elegir qué anime ver juntos, creando un proceso divertido, justo y ocasionalmente sorprendente.

## Flujo de Usuario Core

### Fase 1: Selección Secreta (`SELECTION`)
- Cada usuario ingresa 3 animes de forma privada
- Auto-calificación usando 3 preguntas clave (escala 1-4):
  1. **Potencial de Historia**: ¿La sinopsis genera intriga genuina?
  2. **Mood Personal**: ¿Qué tanto se ajusta a tu estado de ánimo actual?
  3. **Impulso de Decisión**: ¿Qué tan fuerte es tu deseo de ver ESTE anime específico?

### Fase 2: Detección de Coincidencias (`MATCHING`)
- **Conexión Directa**: Si ambos eligieron el mismo anime → Ganador automático
- **Sin Conexión**: Proceder a Fase 3

### Fase 3: Evaluación Cruzada (`RATING`)
- Intercambio de listas (solo animes no coincidentes)
- Calificación cruzada usando las mismas 3 preguntas
- **Cálculo Final**: Suma de auto-calificación + calificación del compañero
- **Filtro de Oro**: Descarta animes con Pregunta 3 = 1 por cualquier usuario
- **Ganador**: Anime con mayor puntuación total que pase el filtro

## Características Técnicas Esenciales

### Funcionalidades Core
- Sistema de sesiones privadas para 2 usuarios
- Interfaz de selección de anime con búsqueda
- Formulario de calificación (3 preguntas × escala 1-4)
- Motor de comparación y cálculo automático
- Pantalla de resultados con puntuación detallada

### Estados de la Aplicación
1. **Lobby**: Crear/unirse a sesión
2. **Selección**: Ingreso privado de 3 animes + auto-calificación
3. **Espera**: Confirmación de que ambos terminaron (`WAITING`)
4. **Coincidencias**: Mostrar matches directos si existen (`MATCHING`)
5. **Evaluación**: Calificar animes del compañero (`RATING`)
6. **Resultados**: Ganador final con breakdown de puntuación (`RESULTS`)

## Criterios de Éxito
- Proceso completo en < 10 minutos
- Interfaz intuitiva sin explicaciones extensas
- Resultados percibidos como justos por ambos usuarios
- Experiencia divertida que invite a repetir

## Alcance Mínimo Viable
- Aplicación web responsive
- Sesiones temporales (sin persistencia compleja)
- Base de datos simple de animes con títulos y sinopsis
- Interfaz limpia y funcional

## Posibles Extensiones Futuras
- Grupos de 3+ personas
- Historial de animes vistos
- Integración con APIs de anime (MyAnimeList, etc.)
- Sistema de favoritos/listas personales