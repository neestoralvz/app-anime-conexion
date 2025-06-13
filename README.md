# App Anime Conexión

A collaborative anime selection web application that helps couples choose anime to watch together through a gamified rating system.

## 🌐 Live Demo

**Production URL**: [https://app-anime-henna.vercel.app](https://app-anime-henna.vercel.app)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application locally.

## Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Database**: Prisma ORM with SQLite (development)
- **Deployment**: Vercel (Production)
- **Development**: ESLint, Prettier, TypeScript strict mode

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - TypeScript validation

### Database
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Populate database with sample data
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:reset` - Reset database (destructive)

## Project Status

✅ Sprint 1 Task 1: Base project configuration completed
- Next.js 14 with App Router
- TypeScript strict mode
- Tailwind CSS with custom theme
- ESLint + Prettier configuration
- Project structure following conventions

✅ Sprint 1 Task 2: Database configuration completed
- Prisma ORM with SQLite setup
- Complete database schema with all models
- Seed script with 20 anime records
- Database migrations and client generation
- Prisma Studio for database management