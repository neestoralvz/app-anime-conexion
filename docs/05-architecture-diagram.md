# Diagrama de Arquitectura - App Anime Conexión

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/Next.js)               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Pages    │  │ Components  │  │   Hooks     │        │
│  │             │  │             │  │             │        │
│  │ HomePage    │  │ AnimeCard   │  │ useSession  │        │
│  │ SessionPage │  │ RatingForm  │  │ useAnime    │        │
│  │ ResultsPage │  │ SessionList │  │ useRating   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Services   │  │    Types    │  │    Utils    │        │
│  │             │  │             │  │             │        │
│  │ apiService  │  │ Anime       │  │ validation  │        │
│  │ wsService   │  │ Session     │  │ calculation │        │
│  │ storage     │  │ Rating      │  │ helpers     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/WebSocket
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js/Express)              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Routes    │  │ Controllers │  │  Services   │        │
│  │             │  │             │  │             │        │
│  │ /api/anime  │  │ AnimeCtrl   │  │ animeService│        │
│  │ /api/session│  │ SessionCtrl │  │ sessionSvc  │        │
│  │ /api/rating │  │ RatingCtrl  │  │ ratingService│       │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Middleware  │  │   Models    │  │   Utils     │        │
│  │             │  │             │  │             │        │
│  │ validation  │  │ Anime       │  │ calculations│        │
│  │ auth        │  │ Session     │  │ validation  │        │
│  │ errorHandler│  │ Rating      │  │ helpers     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                                │
                                │ SQL Queries
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE (PostgreSQL)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   animes    │  │  sessions   │  │   ratings   │        │
│  │             │  │             │  │             │        │
│  │ id          │  │ id          │  │ id          │        │
│  │ title       │  │ code        │  │ session_id  │        │
│  │ synopsis    │  │ status      │  │ user_id     │        │
│  │ genre       │  │ created_at  │  │ anime_id    │        │
│  │ year        │  │ expires_at  │  │ question_1  │        │
│  │ image_url   │  └─────────────┘  │ question_2  │        │
│  │ created_at  │                   │ question_3  │        │
│  └─────────────┘                   │ is_self     │        │
│                                     │ created_at  │        │
│                                     └─────────────┘        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐                         │
│  │session_users│  │ selections  │                         │
│  │             │  │             │                         │
│  │ session_id  │  │ id          │                         │
│  │ user_id     │  │ session_id  │                         │
│  │ nickname    │  │ user_id     │                         │
│  │ is_ready    │  │ anime_id    │                         │
│  │ joined_at   │  │ order_num   │                         │
│  └─────────────┘  │ created_at  │                         │
│                    └─────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Datos

### 1. Crear Sesión
```
Frontend → POST /api/sessions → Backend → Database
        ←    session_code    ←        ←
```

### 2. Unirse a Sesión
```
Frontend → POST /api/sessions/join → Backend → Database
        ←     session_data      ←        ←
```

### 3. Seleccionar Animes
```
Frontend → POST /api/sessions/:id/selections → Backend → Database
        ←          success                   ←        ←
```

### 4. Obtener Resultados
```
Frontend → GET /api/sessions/:id/results → Backend → Database
        ←       results_data           ←        ←
```

## Componentes Principales

### Frontend Components

#### Pages
- **HomePage**: Landing page con creación/unión de sesión
- **SessionPage**: Página principal del juego con fases
- **SelectionPage**: Selección y calificación de animes
- **ResultsPage**: Mostrar ganador y desglose

#### Core Components
- **AnimeCard**: Mostrar información de anime
- **AnimeSearch**: Buscador con autocompletado
- **RatingForm**: Formulario de calificación (3 preguntas)
- **SessionLobby**: Sala de espera de usuarios
- **ResultsDisplay**: Mostrar resultados finales
- **PhaseIndicator**: Indicador de fase actual

#### Hooks
- **useSession**: Manejo de estado de sesión
- **useAnimeSearch**: Búsqueda y selección de animes
- **useRating**: Manejo de calificaciones
- **useWebSocket**: Comunicación en tiempo real

### Backend Services

#### Core Services
- **sessionService**: Lógica de sesiones
- **animeService**: Búsqueda y gestión de animes
- **ratingService**: Cálculos de puntuación
- **calculationService**: Motor de comparación y resultados

#### Controllers
- **SessionController**: Endpoints de sesión
- **AnimeController**: Endpoints de anime
- **RatingController**: Endpoints de calificación

## Comunicación en Tiempo Real

```
┌─────────────┐     WebSocket     ┌─────────────┐
│  Frontend   │ ←──────────────→  │  Backend    │
│  (React)    │                   │ (Socket.io) │
└─────────────┘                   └─────────────┘
```

### Eventos WebSocket
- **user_joined**: Usuario se une a sesión
- **user_ready**: Usuario completa selección
- **phase_change**: Cambio de fase del juego
- **results_ready**: Resultados calculados

## Base de Datos

### Relaciones
```
sessions 1─────────────┐
   │                   │
   │ 1                 │ *
   │                   │
   ▼ *                 ▼
session_users     selections
   │                   │
   │ 1                 │ *
   │                   │
   ▼ *                 ▼
ratings            animes
```

### Índices Importantes
- `sessions.code` (unique)
- `session_users.session_id`
- `selections.session_id, user_id`
- `ratings.session_id, user_id, anime_id`
- `animes.title` (text search)

## Tecnologías y Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **WebSocket**: Socket.io-client
- **Forms**: React Hook Form
- **Validation**: Zod

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **WebSocket**: Socket.io
- **Database ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT (futuro)

### Database
- **Development**: SQLite (gratuito)
- **Production**: PostgreSQL en Render (1GB gratuito) o Supabase (500MB gratuito)
- **Migrations**: Prisma Migrate (gratuito)

### DevOps
- **Package Manager**: npm (gratuito)
- **Build Tool**: Next.js build (gratuito)
- **Testing**: Jest + React Testing Library (gratuito)
- **Linting**: ESLint + Prettier (gratuito)
- **Type Checking**: TypeScript (gratuito)
- **Hosting**: Vercel + Render (100% gratuito)

## Consideraciones de Arquitectura

### Escalabilidad
- Sesiones en memoria con TTL
- Base de datos indexada correctamente
- WebSocket con rooms por sesión

### Performance
- Lazy loading de componentes
- Optimistic updates en UI
- Cache de búsquedas de anime

### Seguridad
- Validación en frontend y backend
- Rate limiting en endpoints
- Sanitización de inputs

### Monitoreo
- Logs estructurados
- Métricas de uso
- Error tracking