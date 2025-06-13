# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

App Anime Conexión is a collaborative anime selection web application that helps couples/pairs choose anime to watch together through a gamified rating system. The app implements a 3-phase game flow: Selection → Matching → Rating → Results.

## Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Node.js with Express.js, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Hosting**: Vercel (frontend), Render (backend + database) - 100% free tier
- **Real-time**: Socket.io for session management

## Architecture

### Core Game Flow
1. **SELECTION**: Users privately select 3 animes and self-rate them (3 questions, 1-4 scale)
2. **MATCHING**: System checks for direct matches between selections  
3. **RATING**: Users rate each other's non-matching animes using same criteria
4. **RESULTS**: Calculate winner using combined scores + "Gold Filter" (question 3 = 1 discards)

### Project Structure
```
src/
├── components/     # React components (PascalCase.tsx)
├── pages/         # Next.js pages (PascalCase.tsx) 
├── hooks/         # Custom hooks (use + PascalCase.ts)
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
npx prisma studio          # Open database GUI
npx prisma migrate dev      # Run migrations  
npx prisma db seed         # Seed anime data
npx prisma migrate reset   # Reset database
npm run db:generate        # Generate Prisma client
npm run db:migrate         # Run migrations (alias)
npm run db:seed           # Run seed script (alias)
npm run db:studio         # Open Prisma Studio (alias)
npm run db:reset          # Reset database (alias)
```

### Development
```bash
npm run dev                # Start development server
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Run ESLint
npm run lint:fix          # Fix linting issues
npm run type-check        # TypeScript validation
```

### Testing
```bash
npm run test              # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Generate coverage report
npm test -- ComponentName # Run specific test
```

## API Endpoints

Core endpoints following RESTful conventions:
- `POST /api/sessions` - Create new session
- `POST /api/sessions/join` - Join existing session  
- `PUT /api/sessions/:id/selections` - Submit anime selections
- `POST /api/sessions/:id/ratings` - Submit ratings
- `GET /api/sessions/:id/results` - Get game results
- `GET /api/animes/search` - Search anime database

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
- Sessions expire after set time
- Real-time updates via Socket.io rooms
- State persistence in localStorage for reconnection

## Coding Conventions

### Naming
- Components: `PascalCase.tsx` (AnimeCard, RatingForm)
- Hooks: `use + PascalCase.ts` (useSession, useAnimeSelection)  
- Services: `camelCase.ts` (animeService, sessionService)
- Database: `snake_case` tables and fields
- CSS: `kebab-case` classes

### TypeScript
- Strict mode enabled
- Interface definitions in dedicated `types/` files
- Zod schemas for API validation
- Prisma client for type-safe database access

## Development Workflow

### Sprint Structure
Project organized in 4 sprints with detailed task breakdowns:
1. **Sprint 1**: MVP Core (11 days + 1 buffer) - Complete game flow implementation
2. **Sprint 2**: UX/UI Enhancement (10 days) - Design system and user experience
3. **Sprint 3**: Robustness (12 days + 2 buffer) - Testing, performance, deployment
4. **Sprint 4**: Advanced Features (10 days) - User profiles, history, personalization

Current status: Pre-implementation with complete task specifications in `/docs/tasks/`

### Git Workflow
Each feature includes structured commits:
- `feat:` for new functionality
- `fix:` for bug fixes  
- `refactor:` for code improvements
- `test:` for testing additions
- `docs:` for documentation
- `chore:` for maintenance

## Key Constraints

- **Budget**: $0.00 - All services must remain in free tiers
- **Scope**: 2-user sessions only (extensible to groups later)
- **Performance**: < 3 second load times, works on mobile
- **Pragmatic**: Avoid over-engineering, prioritize shipping

## Implementation Tasks

Detailed implementation tasks available in `/docs/tasks/` folder:
- `s1-001-configurar-proyecto-base.md` - Complete Next.js setup with TypeScript/Tailwind
- `s1-002-configurar-base-datos.md` - Prisma ORM setup with database schema
- `s1-003-organizar-estructura-componentes.md` - Project structure and base components
- `s1-004-backend-sesiones.md` - Session management API endpoints
- `s1-005-frontend-sesiones.md` - Session UI components and forms
- `s1-009-logica-negocio.md` - Game engine and results calculation

Each task includes step-by-step implementation details, code examples, validation criteria, and commit messages.

## Documentation

Comprehensive docs in `/docs/` folder with sprint plans, architecture decisions, and coding standards. Reference `docs/00-project-analysis-report.md` for detailed project status and `docs/sprint-01-mvp-core.md` for current implementation roadmap.