# S1-002: Configurar Base de Datos

**Sprint**: 1 | **Día**: 1-2 | **Duración**: 1 día  
**Prioridad**: Crítica | **Dependencias**: S1-001

## Objetivo
Configurar Prisma ORM con SQLite para desarrollo y definir el schema inicial de la base de datos según las especificaciones del proyecto.

## Criterios de Aceptación
- [ ] Prisma instalado y configurado
- [ ] Schema inicial creado con todos los modelos
- [ ] Primera migración ejecutada exitosamente
- [ ] Prisma Client generado
- [ ] Seed script básico funcionando
- [ ] Prisma Studio accesible

## Pasos de Implementación

### 1. Instalar Prisma
```bash
# Instalar Prisma CLI y cliente
npm install prisma @prisma/client

# Inicializar Prisma
npx prisma init --datasource-provider sqlite
```

### 2. Configurar Variables de Entorno
```bash
# .env (crear si no existe)
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. Crear Schema Completo
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Anime {
  id          String   @id @default(cuid())
  title       String
  synopsis    String
  genre       String
  year        Int?
  imageUrl    String?  @map("image_url")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  // Relaciones
  selections  Selection[]
  ratings     Rating[]
  
  @@map("animes")
}

model Session {
  id          String        @id @default(cuid())
  code        String        @unique
  status      SessionStatus @default(WAITING)
  phase       GamePhase     @default(SELECTION)
  maxUsers    Int           @default(2)
  expiresAt   DateTime      @map("expires_at")
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")
  
  // Relaciones
  users       SessionUser[]
  selections  Selection[]
  ratings     Rating[]
  
  @@map("sessions")
}

model SessionUser {
  id          String   @id @default(cuid())
  sessionId   String   @map("session_id")
  userId      String   @map("user_id")
  nickname    String
  isReady     Boolean  @default(false) @map("is_ready")
  joinedAt    DateTime @default(now()) @map("joined_at")
  
  // Relaciones
  session     Session    @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  selections  Selection[]
  ratings     Rating[]
  
  @@unique([sessionId, userId])
  @@map("session_users")
}

model Selection {
  id          String   @id @default(cuid())
  sessionId   String   @map("session_id")
  userId      String   @map("user_id")
  animeId     String   @map("anime_id")
  orderNum    Int      @map("order_num") // 1, 2, 3
  createdAt   DateTime @default(now()) @map("created_at")
  
  // Relaciones
  session     Session     @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user        SessionUser @relation(fields: [sessionId, userId], references: [sessionId, userId], onDelete: Cascade)
  anime       Anime       @relation(fields: [animeId], references: [id])
  
  @@unique([sessionId, userId, orderNum])
  @@unique([sessionId, userId, animeId])
  @@map("selections")
}

model Rating {
  id          String   @id @default(cuid())
  sessionId   String   @map("session_id")
  userId      String   @map("user_id")
  animeId     String   @map("anime_id")
  question1   Int      @map("question_1") // 1-4: Potencial de historia
  question2   Int      @map("question_2") // 1-4: Mood personal
  question3   Int      @map("question_3") // 1-4: Impulso de decisión
  isSelfRating Boolean @map("is_self")    // true: auto-calificación, false: calificación cruzada
  createdAt   DateTime @default(now()) @map("created_at")
  
  // Relaciones
  session     Session     @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  user        SessionUser @relation(fields: [sessionId, userId], references: [sessionId, userId], onDelete: Cascade)
  anime       Anime       @relation(fields: [animeId], references: [id])
  
  @@unique([sessionId, userId, animeId, isSelfRating])
  @@map("ratings")
}

enum SessionStatus {
  WAITING     // Esperando usuarios
  ACTIVE      // Juego en progreso
  COMPLETED   // Terminado
  EXPIRED     // Expirado
}

enum GamePhase {
  SELECTION   // Fase 1: Selección secreta
  MATCHING    // Fase 2: Detección de coincidencias
  RATING      // Fase 3: Evaluación cruzada
  RESULTS     // Mostrar resultados
}
```

### 4. Crear Seed Script
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const animeData = [
  {
    title: 'Attack on Titan',
    synopsis: 'La humanidad lucha por sobrevivir contra gigantes devoradores de humanos.',
    genre: 'Action,Drama,Fantasy',
    year: 2013,
  },
  {
    title: 'Death Note',
    synopsis: 'Un estudiante encuentra un cuaderno que puede matar a cualquier persona.',
    genre: 'Psychological,Supernatural,Thriller',
    year: 2006,
  },
  {
    title: 'One Piece',
    synopsis: 'Un joven pirata busca el tesoro más grande del mundo.',
    genre: 'Adventure,Comedy,Shounen',
    year: 1999,
  },
  {
    title: 'Demon Slayer',
    synopsis: 'Un joven se convierte en cazador de demonios para salvar a su hermana.',
    genre: 'Action,Supernatural,Historical',
    year: 2019,
  },
  {
    title: 'My Hero Academia',
    synopsis: 'En un mundo de superhéroes, un chico sin poderes sueña con ser héroe.',
    genre: 'Action,School,Superhero',
    year: 2016,
  },
  // Agregar más animes...
];

async function main() {
  console.log('🌱 Seeding database...');
  
  // Limpiar datos existentes
  await prisma.rating.deleteMany();
  await prisma.selection.deleteMany();
  await prisma.sessionUser.deleteMany();
  await prisma.session.deleteMany();
  await prisma.anime.deleteMany();
  
  // Crear animes
  for (const anime of animeData) {
    await prisma.anime.create({
      data: anime,
    });
  }
  
  console.log(`✅ Seeded ${animeData.length} animes`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 5. Configurar Scripts en Package.json
```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset --force"
  }
}
```

### 6. Instalar Dependencias para Seed
```bash
npm install -D tsx
```

### 7. Crear Cliente Prisma
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 8. Ejecutar Primera Migración
```bash
# Generar cliente
npx prisma generate

# Crear y ejecutar migración
npx prisma migrate dev --name init

# Ejecutar seed
npm run db:seed
```

## Validación
- [ ] `npx prisma studio` abre interface web
- [ ] Base de datos contiene tablas creadas
- [ ] Seed script ejecuta sin errores
- [ ] `npx prisma generate` funciona correctamente
- [ ] Archivo `dev.db` existe en prisma/

## Archivos a Crear/Modificar
- `prisma/schema.prisma` (schema completo)
- `prisma/seed.ts` (datos iniciales)
- `src/lib/prisma.ts` (cliente Prisma)
- `.env` (variables de entorno)
- `package.json` (scripts de BD)

## Notas Técnicas
- **SQLite para desarrollo**: Facilita setup sin dependencias externas
- **Relaciones bien definidas**: Foreign keys y constraints apropiados
- **Enums para estados**: Type safety en fases del juego
- **Cascading deletes**: Limpieza automática de datos relacionados
- **Unique constraints**: Previenen duplicación de datos

## Commit Final
```bash
git add .
git commit -m "feat: setup Prisma with initial database schema

- Install and configure Prisma ORM with SQLite
- Create complete database schema with all models
- Setup enums for SessionStatus and GamePhase
- Create seed script with initial anime data
- Configure database scripts in package.json
- Add Prisma client configuration"
```