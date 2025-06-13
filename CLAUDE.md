# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

App Anime Conexión is a collaborative anime selection web application that helps couples/pairs choose anime to watch together through a gamified rating system. The app implements a 3-phase game flow: Selection → Matching → Rating → Results.

## Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Database**: Prisma ORM with SQLite (development), PostgreSQL (production)
- **Deployment**: Vercel (Production) - https://app-anime-henna.vercel.app
- **Development**: ESLint, Prettier, TypeScript strict mode

## Architecture

### Core Game Flow
1. **SELECTION**: Users privately select 3 animes and self-rate them (3 questions, 1-4 scale)
2. **MATCHING**: System checks for direct matches between selections  
3. **RATING**: Users rate each other's non-matching animes using same criteria
4. **RESULTS**: Calculate winner using combined scores + "Gold Filter" (question 3 = 1 discards)

### Project Structure
```
src/
├── app/           # Next.js App Router pages and layouts
├── components/    # React components (PascalCase.tsx)
├── hooks/         # Custom hooks (usePascalCase.ts)
├── lib/           # Shared libraries and configurations
├── services/      # API clients and business logic (camelCase.ts)
├── types/         # TypeScript definitions (camelCase.ts)
├── utils/         # Helper functions (camelCase.ts)
└── constants/     # App constants (camelCase.ts)
```

### Database Schema (Prisma)
Key models: `Anime`, `Session`, `SessionUser`, `Selection`, `Rating`
- Sessions have unique codes for joining
- Game phases: SELECTION → MATCHING → RATING → RESULTS
- Session status: WAITING → ACTIVE → COMPLETED → EXPIRED

## Development Commands

### Setup
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

### Development
```bash
npm run dev                # Start development server at localhost:3000
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Run ESLint
npm run lint:fix          # Fix linting issues
npm run type-check        # TypeScript validation
```

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
- Unique 6-character alphanumeric codes for joining
- 2-user sessions only (extensible to groups later)

## Type System Architecture

### Prisma-First Approach
- All base types are imported from `@prisma/client`
- Custom types are derived using TypeScript utilities (Pick, Omit, etc.)
- Enum values use Prisma-generated enums for consistency

### Key Type Patterns
- `AnimeWithSelections`, `SessionWithUsers` - For relations
- `CreateSessionData`, `JoinSessionData` - For form inputs
- `RatingFormData` - For rating submissions
- Helper functions: `getSessionStatusLabel()`, `getGamePhaseLabel()`

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

## Implementation Status

### Completed Tasks (Sprint 1)
- ✅ S1-001: Base project configuration (Next.js, TypeScript, Tailwind)
- ✅ S1-002: Database configuration (Prisma, SQLite, seed data)

### Current Architecture Decisions
- SQLite for development (no external dependencies)
- Vercel for deployment (100% free tier)
- Type-safe database access through Prisma
- Component-first development approach

## Key Constraints

- **Budget**: $0.00 - All services must remain in free tiers
- **Scope**: 2-user sessions only (extensible to groups later)
- **Performance**: < 3 second load times, works on mobile
- **Pragmatic**: Avoid over-engineering, prioritize shipping

## Implementation Tasks

Detailed implementation tasks available in `/docs/tasks/` folder:
- `s1-001-configurar-proyecto-base.md` - ✅ Complete Next.js setup with TypeScript/Tailwind
- `s1-002-configurar-base-datos.md` - ✅ Prisma ORM setup with database schema
- `s1-003-organizar-estructura-componentes.md` - Project structure and base components
- `s1-004-backend-sesiones.md` - Session management API endpoints
- `s1-005-frontend-sesiones.md` - Session UI components and forms
- `s1-009-logica-negocio.md` - Game engine and results calculation

Each task includes step-by-step implementation details, code examples, validation criteria, and commit messages.

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

## Documentation

Comprehensive docs in `/docs/` folder with sprint plans, architecture decisions, and coding standards. Reference `docs/00-project-analysis-report.md` for detailed project status and `docs/sprint-01-mvp-core.md` for current implementation roadmap.