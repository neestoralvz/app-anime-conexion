# Convenciones de Código - App Anime Conexión

## Principios Generales
- **Inglés**: Todos los nombres en inglés para consistencia
- **Descriptivo**: El nombre debe indicar claramente su propósito
- **Consistente**: Misma convención para elementos similares
- **Corto pero claro**: Evitar abreviaciones confusas

## Archivos y Carpetas

### Estructura de Carpetas
```
src/
├── components/          # Componentes reutilizables
├── pages/              # Páginas/vistas principales
├── hooks/              # Custom hooks
├── services/           # Lógica de negocio y API calls
├── types/              # Definiciones de TypeScript
├── utils/              # Funciones utilitarias
└── constants/          # Constantes y configuraciones
```

### Archivos de Componentes
- **Formato**: `PascalCase.tsx`
- **Ejemplos**: 
  - `AnimeCard.tsx`
  - `SessionLobby.tsx`
  - `RatingForm.tsx`
  - `ResultsDisplay.tsx`

### Archivos de Documentación
- **Formato**: `kebab-case.md`
- **Ejemplos**:
  - `coding-conventions.md`
  - `api-documentation.md`
  - `deployment-guide.md`

### Archivos de Páginas
- **Formato**: `PascalCase.tsx`
- **Ejemplos**:
  - `HomePage.tsx`
  - `SessionPage.tsx`
  - `SelectionPage.tsx`
  - `ResultsPage.tsx`

### Archivos de Hooks
- **Formato**: `use + PascalCase.ts`
- **Ejemplos**:
  - `useSession.ts`
  - `useAnimeSelection.ts`
  - `useRating.ts`

### Archivos de Services
- **Formato**: `camelCase.ts`
- **Ejemplos**:
  - `animeService.ts`
  - `sessionService.ts`
  - `ratingService.ts`

### Archivos de Types
- **Formato**: `camelCase.ts`
- **Ejemplos**:
  - `anime.ts`
  - `session.ts`
  - `rating.ts`

### Archivos de Utils
- **Formato**: `camelCase.ts`
- **Ejemplos**:
  - `calculations.ts`
  - `validation.ts`
  - `storage.ts`

## Variables y Funciones

### Variables
- **Formato**: `camelCase`
- **Ejemplos**:
  - `selectedAnimes`
  - `currentSession`
  - `userRating`
  - `finalScore`

### Funciones
- **Formato**: `camelCase` + verbo descriptivo
- **Ejemplos**:
  - `calculateFinalScore()`
  - `validateRating()`
  - `findMatches()`
  - `submitSelection()`

### Constantes
- **Formato**: `UPPER_SNAKE_CASE`
- **Ejemplos**:
  - `MAX_ANIME_SELECTIONS`
  - `RATING_SCALE_MIN`
  - `RATING_SCALE_MAX`
  - `SESSION_TIMEOUT`

## Componentes React

### Props Interfaces
- **Formato**: `ComponentName + Props`
- **Ejemplos**:
  - `AnimeCardProps`
  - `RatingFormProps`
  - `SessionLobbyProps`

### State Variables
- **Formato**: `camelCase` + estado descriptivo
- **Ejemplos**:
  - `isLoading`
  - `hasError`
  - `isSubmitted`
  - `selectedAnimes`

## Base de Datos

### Tablas
- **Formato**: `snake_case` + plural
- **Ejemplos**:
  - `animes`
  - `sessions`
  - `user_selections`
  - `ratings`

### Campos
- **Formato**: `snake_case`
- **Ejemplos**:
  - `anime_id`
  - `session_id`
  - `user_id`
  - `created_at`
  - `updated_at`

## CSS/Styling

### Clases CSS
- **Formato**: `kebab-case` + BEM si es necesario
- **Ejemplos**:
  - `anime-card`
  - `rating-form`
  - `session-lobby`
  - `results-display`

### CSS Modules
- **Formato**: `ComponentName.module.css`
- **Ejemplos**:
  - `AnimeCard.module.css`
  - `RatingForm.module.css`

## Rutas y Endpoints

### Rutas Frontend
- **Formato**: `kebab-case`
- **Ejemplos**:
  - `/`
  - `/session/:id`
  - `/selection`
  - `/results`

### Endpoints API
- **Formato**: REST + `kebab-case`
- **Ejemplos**:
  - `GET /api/animes`
  - `POST /api/sessions`
  - `PUT /api/sessions/:id/selections`
  - `GET /api/sessions/:id/results`

## Ejemplos Completos

### Estructura de Archivo Típica
```typescript
// src/components/AnimeCard.tsx
interface AnimeCardProps {
  anime: Anime;
  onSelect: (anime: Anime) => void;
  isSelected: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  onSelect,
  isSelected
}) => {
  // Implementación
};
```

### Service Example
```typescript
// src/services/animeService.ts
export const animeService = {
  searchAnimes: async (query: string): Promise<Anime[]> => {
    // Implementación
  },
  
  getAnimeById: async (id: string): Promise<Anime> => {
    // Implementación
  }
};
```

## Reglas de Oro
1. **Consistencia**: Si empiezas con una convención, manténla
2. **Claridad**: Prefiere nombres largos y claros sobre abreviaciones
3. **Contexto**: El nombre debe tener sentido dentro de su contexto
4. **Evolución**: Estas convenciones pueden ajustarse según el proyecto crezca