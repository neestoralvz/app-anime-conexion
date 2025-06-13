# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

App Anime Conexión is a collaborative anime selection web application that helps couples/pairs choose anime to watch together through a gamified rating system. The app implements a 3-phase game flow: Selection → Matching → Rating → Results.

## Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Database**: Prisma ORM with SQLite (development), PostgreSQL (production)
- **Deployment**: Vercel (Production) - https://app-anime-henna.vercel.app
- **Development**: ESLint, Prettier, TypeScript strict mode

## Development Commands

### Quick Start
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Database Operations
```bash
npm run db:generate        # Generate Prisma client
npm run db:migrate         # Run migrations
npm run db:seed           # Populate with 20 anime records
npm run db:studio         # Open Prisma Studio GUI at localhost:5555
npm run db:reset          # Reset database (destructive)
```

### Development Workflow
```bash
npm run dev                # Start development server at localhost:3000
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Run ESLint
npm run lint:fix          # Fix linting issues
npm run type-check        # TypeScript validation
```

## Architecture

### Core Game Flow
1. **SELECTION**: Users privately select 3 animes and self-rate them (3 questions, 1-4 scale)
2. **MATCHING**: System checks for direct matches between selections  
3. **RATING**: Users rate each other's non-matching animes using same criteria
4. **RESULTS**: Calculate winner using combined scores + "Gold Filter" (question 3 = 1 discards)

### State Management Architecture
The application uses a centralized state management approach:

- **SessionContext**: Global state using useReducer pattern
- **State Structure**: `{ session, currentUser, selectedAnimes, selfRatings, crossRatings, isLoading, error, currentPhase }`
- **Actions**: Typed actions for state updates (SET_SESSION, SET_LOADING, etc.)
- **Provider**: Wraps entire app in `src/app/layout.tsx`

### Component Architecture
Components are organized in three categories:

#### UI Components (`src/components/ui/`)
- **Button**: 4 variants (primary, secondary, success, danger) with 3 sizes
- **Input**: Form inputs with label, error, and helper text support
- **Card**: Modular card system (Card, CardHeader, CardTitle, CardContent)

#### Layout Components (`src/components/layout/`)  
- **Layout**: Main page container with configurable max-width
- **PageHeader**: Standardized page titles and subtitles
- **LoadingSpinner**: Loading indicators with size variants

#### Game Components (`src/components/game/`)
- **AnimeCard**: Displays anime info with genre tags and selection state
- **RatingStars**: Interactive 1-4 star rating component
- **SessionCode**: Displays session codes with copy functionality

### Database Schema (Prisma)
Key models: `Anime`, `Session`, `SessionUser`, `Selection`, `Rating`
- Sessions have unique 6-character alphanumeric codes
- Game phases: SELECTION → MATCHING → RATING → RESULTS
- Session status: WAITING → ACTIVE → COMPLETED → EXPIRED
- Rating system: 3 questions per anime, 1-4 scale

## Type System Architecture

### Prisma-First Approach
- All base types imported from `@prisma/client`
- Custom types derived using TypeScript utilities (Pick, Omit, etc.)
- Enum values use Prisma-generated enums for consistency

### Key Type Patterns
- **Relations**: `AnimeWithSelections`, `SessionWithUsers`
- **Form Data**: `CreateSessionData`, `JoinSessionData`, `RatingFormData`
- **UI Types**: Derived types for specific component needs
- **Helper Functions**: `getSessionStatusLabel()`, `getGamePhaseLabel()`

## Business Logic Key Points

### Rating System
Each anime gets 3 questions (1-4 scale):
1. Story potential and intrigue
2. Personal mood alignment  
3. Immediate viewing impulse

### Calculation Logic
- Final score = self-rating + cross-rating (6-24 points possible)
- "Gold Filter": Any anime with question 3 = 1 from either user is discarded
- Winner: Highest total score that passes Gold Filter

### Session Management
- Sessions expire after 24 hours
- 2-user sessions only (extensible to groups later)
- Real-time state synchronization (future: Socket.io)

## Implementation Status

### Completed Tasks (Sprint 1)
- ✅ **S1-001**: Base project configuration (Next.js, TypeScript, Tailwind)
- ✅ **S1-002**: Database configuration (Prisma, SQLite, 20 anime seed data)
- ✅ **S1-003**: Component structure (13 components, SessionContext, utilities)

### Next Tasks
- **S1-004**: Backend de sesiones (API endpoints)
- **S1-005**: Frontend de sesiones (UI/UX)
- **S1-006**: Setup animes y búsqueda
- **S1-007-010**: Selection, rating, calculation, and results systems

### Current Architecture Ready For
- API endpoint implementation (Prisma client configured)
- Component composition (base UI system implemented)
- State management (SessionContext with reducer ready)
- Form validation (utility functions implemented)

## Coding Conventions

### Naming
- Components: `PascalCase.tsx` (AnimeCard, RatingForm)
- Hooks: `usePascalCase.ts` (useSession, useAnimeSelection)  
- Services: `camelCase.ts` (animeService, sessionService)
- Database: `snake_case` tables and fields
- CSS: `kebab-case` classes

### TypeScript
- Strict mode enabled
- Prisma-generated types as source of truth
- Type definitions in dedicated `types/` files organized by domain
- Import aliases configured (`@/*` maps to `src/*`)

### Utilities
- **cn()**: Combines clsx and tailwind-merge for className utilities
- **Validation**: Functions for rating, session codes, nicknames
- **Constants**: Game configuration and rating questions in Spanish

## Key Constraints

- **Budget**: $0.00 - All services must remain in free tiers
- **Scope**: 2-user sessions only (extensible to groups later)
- **Performance**: < 3 second load times, works on mobile
- **Pragmatic**: Avoid over-engineering, prioritize shipping

## Git Workflow

Each feature includes structured commits:
- `feat:` for new functionality
- `fix:` for bug fixes  
- `refactor:` for code improvements
- `test:` for testing additions
- `docs:` for documentation
- `chore:` for maintenance

All commits include Claude Code attribution:
```
🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

## Implementation Tasks Reference

Detailed task specifications in `/docs/tasks/` folder with step-by-step implementation guides. Current progress tracked in `/docs/verificacion-sprint-1-progreso.md` and `/docs/sprint-01-mvp-core.md`.

Key documents:
- `docs/sprint-01-mvp-core.md` - Sprint roadmap with task breakdown
- `docs/verificacion-sprint-1-progreso.md` - Detailed progress verification
- `docs/00-project-analysis-report.md` - Complete project analysis