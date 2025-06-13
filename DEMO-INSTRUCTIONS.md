# 🎮 App Anime Conexión - Instrucciones de Demo

## 🌟 URL de la Aplicación
**Producción:** https://app-anime-conexion.vercel.app

---

## 🎯 Cómo Navegar por la Demo Completa

### 1. **Página de Inicio**
- Visita: https://app-anime-conexion.vercel.app
- Haz clic en **"Crear Nueva Sesión"**
- Ingresa cualquier nickname (ej: "TestUser")
- Se creará una sesión automáticamente

### 2. **Sala de Espera (Lobby)**
- Verás el código de sesión generado
- La aplicación simulará que se unió un segundo usuario
- Haz clic en **"Comenzar Ahora →"** para avanzar

### 3. **Selección de Animes**
- **URL directa:** `/session/[codigo]/selection`
- Busca animes en el panel derecho
- Selecciona exactamente 3 animes
- Califica cada uno en las 3 preguntas (escala 1-4)
- Haz clic en **"Confirmar Selecciones"**

### 4. **Calificación Cruzada**
- **URL directa:** `/session/[codigo]/rating`
- Califica los 3 animes del "compañero"
- Navega entre animes con los botones numerados
- Completa las 3 preguntas para cada anime
- Haz clic en **"Finalizar Calificaciones"**

### 5. **Resultados**
- **URL directa:** `/session/[codigo]/results`
- Ve el anime ganador (Death Note en la demo)
- Revisa el desglose completo de puntuaciones
- Explora las estadísticas del juego
- Opciones para nueva sesión o compartir

---

## 🔗 URLs Directas para Testing

### Páginas Principales
- **Inicio:** https://app-anime-conexion.vercel.app
- **Selección:** https://app-anime-conexion.vercel.app/session/demo-session/selection
- **Calificación:** https://app-anime-conexion.vercel.app/session/demo-session/rating
- **Resultados:** https://app-anime-conexion.vercel.app/session/demo-session/results

---

## 🎬 Funcionalidades de Demo

### ✅ Completamente Funcionales
- ✅ **Creación de sesiones** con nicknames
- ✅ **Búsqueda de animes** en tiempo real
- ✅ **Selección de 3 animes** con validación
- ✅ **Sistema de calificación** (3 preguntas, escala 1-4)
- ✅ **Calificación cruzada** de animes del compañero
- ✅ **Cálculo de resultados** con algoritmo completo
- ✅ **Navegación automática** entre fases
- ✅ **Responsive design** para móvil y desktop

### 🎭 Datos de Demo
- **15 animes populares** con imágenes y sinopsis
- **Usuarios simulados:** "AnimeLover123" y "OtakuMaster"
- **Resultados pre-calculados** con Death Note como ganador
- **Puntuaciones realistas** en todas las categorías

---

## 🛠️ Características Técnicas

### 🔧 Modo Demo
- Activado automáticamente en producción
- Variable de entorno: `NEXT_PUBLIC_DEMO_MODE=true`
- Simula respuestas de backend con delays realistas

### 📱 UX Features
- **Loading states** con spinners
- **Error handling** con mensajes claros
- **Progress tracking** visual
- **Transitions** suaves entre páginas
- **Local storage** para persistencia

---

## 🎯 Casos de Uso para Demostrar

### 👥 Para Stakeholders
1. **Flujo completo** desde inicio hasta resultados
2. **Experiencia de usuario** gamificada
3. **Algoritmo de selección** colaborativa

### 🔧 Para Desarrolladores
1. **Arquitectura de componentes** modular
2. **Estado global** con Context + Reducer
3. **TypeScript** estricto y bien tipado
4. **Responsive design** con Tailwind CSS

### 📊 Para Testing
1. **Búsqueda de animes** con diferentes términos
2. **Selección y calificación** de diferentes combinaciones
3. **Navegación** entre todas las pantallas

---

## 🚀 Próximos Pasos

Una vez satisfecho con la demo, continuar con:
1. **S1-004:** Backend de sesiones (APIs reales)
2. **S1-006:** Setup animes y búsqueda (base de datos)
3. **S1-007:** Sistema de selección (persistencia)
4. **S1-008:** Implementar calificaciones (backend)
5. **S1-009:** Lógica de negocio (motor de cálculo)

¡La aplicación demo está completamente funcional y lista para presentar! 🎉