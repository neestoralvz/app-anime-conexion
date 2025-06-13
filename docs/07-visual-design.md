# Diseño Visual - App Anime Conexión

## Principios de Diseño

### Filosofía de Diseño
- **Simplicidad**: Interfaz limpia sin distracciones
- **Claridad**: Estados del juego siempre evidentes
- **Diversión**: Elementos que refuercen la experiencia lúdica
- **Rapidez**: Flujo visual que facilite decisiones rápidas
- **Responsive**: Funcional en móvil y desktop

---

## Sistema de Colores

### Paleta Principal
```css
:root {
  /* Colores primarios */
  --primary: #6366f1;        /* Indigo 500 - Acción principal */
  --primary-dark: #4f46e5;   /* Indigo 600 - Hover estados */
  --primary-light: #a5b4fc;  /* Indigo 300 - Backgrounds suaves */
  
  /* Colores secundarios */
  --secondary: #10b981;      /* Emerald 500 - Éxito/Confirmación */
  --secondary-dark: #059669; /* Emerald 600 - Hover */
  --secondary-light: #6ee7b7; /* Emerald 300 - Backgrounds */
  
  /* Colores de estado */
  --success: #10b981;        /* Verde - Conexiones, completado */
  --warning: #f59e0b;        /* Ámbar - Advertencias */
  --error: #ef4444;          /* Rojo - Errores */
  --info: #3b82f6;           /* Azul - Información */
  
  /* Colores neutros */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  /* Colores específicos del juego */
  --anime-card: #ffffff;
  --anime-selected: #eef2ff;
  --phase-indicator: #ddd6fe;
  --rating-scale: #fef3c7;
}
```

### Uso de Colores por Contexto
- **Primario**: Botones principales, enlaces, fases activas
- **Secundario**: Confirmaciones, selecciones correctas
- **Éxito**: Coincidencias encontradas, anime ganador
- **Advertencia**: Tiempo límite, validaciones
- **Error**: Errores de conexión, campos inválidos

---

## Tipografía

### Fuentes
```css
/* Fuente principal */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
}
```

### Escala Tipográfica
```css
:root {
  /* Títulos */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  
  /* Pesos */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Jerarquía Tipográfica
- **H1**: Título principal de la app (`text-3xl`, `font-bold`)
- **H2**: Títulos de fase (`text-2xl`, `font-semibold`)
- **H3**: Subtítulos de sección (`text-xl`, `font-medium`)
- **Body**: Texto general (`text-base`, `font-normal`)
- **Caption**: Texto secundario (`text-sm`, `font-normal`)
- **Code**: Códigos de sesión (`font-mono`, `font-medium`)

---

## Componentes UI

### Botones
```css
/* Botón primario */
.btn-primary {
  @apply bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors;
}

/* Botón secundario */
.btn-secondary {
  @apply bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border border-gray-300 transition-colors;
}

/* Botón de éxito */
.btn-success {
  @apply bg-secondary hover:bg-secondary-dark text-white font-medium py-3 px-6 rounded-lg transition-colors;
}

/* Botón peligroso */
.btn-danger {
  @apply bg-error hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors;
}
```

### Cards de Anime
```css
.anime-card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer;
}

.anime-card.selected {
  @apply bg-anime-selected border-primary shadow-md;
}

.anime-card.winner {
  @apply bg-secondary-light border-secondary shadow-lg;
}
```

### Formularios
```css
.form-input {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.form-error {
  @apply text-error text-sm mt-1;
}
```

### Indicadores de Estado
```css
.phase-indicator {
  @apply flex items-center space-x-4 mb-8;
}

.phase-step {
  @apply flex items-center space-x-2 px-4 py-2 rounded-full;
}

.phase-step.active {
  @apply bg-primary text-white;
}

.phase-step.completed {
  @apply bg-secondary text-white;
}

.phase-step.pending {
  @apply bg-gray-200 text-gray-600;
}
```

---

## Layout y Espaciado

### Grid System
```css
/* Contenedor principal */
.container {
  @apply max-w-6xl mx-auto px-4 sm:px-6 lg:px-8;
}

/* Grids comunes */
.grid-anime-cards {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.grid-rating-form {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}
```

### Espaciado
```css
:root {
  /* Espaciado estándar */
  --space-xs: 0.25rem;    /* 4px */
  --space-sm: 0.5rem;     /* 8px */
  --space-md: 1rem;       /* 16px */
  --space-lg: 1.5rem;     /* 24px */
  --space-xl: 2rem;       /* 32px */
  --space-2xl: 3rem;      /* 48px */
  --space-3xl: 4rem;      /* 64px */
}
```

---

## Estados de Interfaz

### Loading States
```css
.loading-spinner {
  @apply animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-primary;
}

.loading-skeleton {
  @apply bg-gray-200 animate-pulse rounded;
}

.loading-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}
```

### Estados de Conexión
```css
.connection-status {
  @apply fixed top-4 right-4 px-3 py-2 rounded-full text-sm font-medium;
}

.connection-status.connected {
  @apply bg-secondary text-white;
}

.connection-status.disconnected {
  @apply bg-error text-white;
}

.connection-status.connecting {
  @apply bg-warning text-white;
}
```

---

## Páginas Específicas

### Home Page
```css
.hero-section {
  @apply min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light to-primary;
}

.hero-card {
  @apply bg-white rounded-2xl shadow-xl p-8 max-w-md w-full;
}
```

### Session Page
```css
.session-container {
  @apply min-h-screen bg-gray-50 py-8;
}

.session-header {
  @apply bg-white shadow-sm border-b border-gray-200 px-6 py-4;
}

.session-content {
  @apply max-w-4xl mx-auto px-6 py-8;
}
```

### Results Page
```css
.results-hero {
  @apply text-center py-12 bg-gradient-to-r from-secondary to-secondary-dark text-white;
}

.results-breakdown {
  @apply bg-white rounded-xl shadow-sm p-6 mt-8;
}
```

---

## Animaciones y Transiciones

### Transiciones Base
```css
.transition-base {
  @apply transition-all duration-200 ease-in-out;
}

.transition-slow {
  @apply transition-all duration-300 ease-in-out;
}
```

### Animaciones Específicas
```css
/* Entrada de cards */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in-up {
  animation: slideInUp 0.3s ease-out;
}

/* Pulso para elementos importantes */
@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse-soft {
  animation: pulse-soft 2s ease-in-out infinite;
}

/* Celebración para el ganador */
@keyframes celebration {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.animate-celebration {
  animation: celebration 0.6s ease-in-out 3;
}
```

---

## Responsive Design

### Breakpoints
```css
/* Tailwind default breakpoints */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
/* 2xl: 1536px */
```

### Componentes Responsive
```css
/* Anime cards responsive */
.anime-card {
  @apply p-3 sm:p-4;
}

.anime-card h3 {
  @apply text-lg sm:text-xl;
}

/* Botones responsive */
.btn {
  @apply py-2 px-4 sm:py-3 sm:px-6;
}

/* Formularios responsive */
.form-input {
  @apply py-2 sm:py-3;
}
```

---

## Iconografía

### Icon System
```css
.icon {
  @apply w-5 h-5 flex-shrink-0;
}

.icon-sm {
  @apply w-4 h-4;
}

.icon-lg {
  @apply w-6 h-6;
}

.icon-xl {
  @apply w-8 h-8;
}
```

### Iconos Específicos
- **Search**: Búsqueda de animes
- **Heart**: Favoritos/Me gusta
- **Star**: Calificaciones
- **Users**: Usuarios en sesión
- **Check**: Completado/Éxito
- **X**: Cerrar/Error
- **Arrow**: Navegación
- **Refresh**: Reconectar/Reintentar

---

## Dark Mode (Futuro)

### Variables CSS para Dark Mode
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --bg-secondary: #1f2937;
    --text-primary: #f9fafb;
    --text-secondary: #d1d5db;
    --border-color: #374151;
  }
}
```

---

## Consideraciones de Accesibilidad

### Contraste
- Todos los textos cumplen WCAG AA (4.5:1)
- Elementos interactivos tienen contraste 3:1 mínimo

### Focus States
```css
.focus-visible {
  @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
}
```

### Estados de Carga
- Indicadores visuales claros
- Mensajes de estado legibles
- Skip links para navegación por teclado

Este sistema de diseño está optimizado para:
- **Desarrollo rápido** con Tailwind CSS
- **Consistencia visual** en toda la aplicación
- **Experiencia móvil** fluida
- **Escalabilidad** para futuras funcionalidades