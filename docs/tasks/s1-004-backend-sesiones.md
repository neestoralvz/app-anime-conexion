# S1-004: Backend de Sesiones

**Sprint**: 1 | **Día**: 4-5 | **Duración**: 2 días  
**Prioridad**: Crítica | **Dependencias**: S1-002, S1-003

## Objetivo
Implementar las API endpoints para la gestión de sesiones (crear, unirse, obtener estado) con validación robusta y manejo de errores.

## Criterios de Aceptación
- [ ] API POST /api/sessions (crear sesión) funcionando
- [ ] API POST /api/sessions/join (unirse a sesión) funcionando  
- [ ] API GET /api/sessions/[id] (obtener sesión) funcionando
- [ ] Validación con Zod implementada
- [ ] Manejo de errores estructurado
- [ ] Generación de códigos únicos de sesión
- [ ] Expiración automática de sesiones

## Pasos de Implementación

### 1. Instalar Dependencias de Validación
```bash
npm install zod
npm install -D @types/uuid uuid
```

### 2. Crear Schemas de Validación
```typescript
// src/lib/validations.ts
import { z } from 'zod';

export const createSessionSchema = z.object({
  nickname: z.string()
    .min(2, 'El nickname debe tener al menos 2 caracteres')
    .max(20, 'El nickname no puede exceder 20 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, guiones y guiones bajos'),
});

export const joinSessionSchema = z.object({
  code: z.string()
    .length(6, 'El código debe tener 6 caracteres')
    .regex(/^[A-Z0-9]+$/, 'Código inválido'),
  nickname: z.string()
    .min(2, 'El nickname debe tener al menos 2 caracteres')
    .max(20, 'El nickname no puede exceder 20 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, guiones y guiones bajos'),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type JoinSessionInput = z.infer<typeof joinSessionSchema>;
```

### 3. Crear Utilidades para Sesiones
```typescript
// src/lib/session-utils.ts
import { v4 as uuidv4 } from 'uuid';

export function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateUserId(): string {
  return uuidv4();
}

export function createSessionExpiry(): Date {
  const now = new Date();
  return new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 horas
}

export function isSessionExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function isSessionFull(userCount: number, maxUsers: number = 2): boolean {
  return userCount >= maxUsers;
}
```

### 4. Crear Middleware de Manejo de Errores
```typescript
// src/lib/api-response.ts
import { NextResponse } from 'next/server';

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function createErrorResponse(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.code,
        message: error.message,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: 'Error desconocido',
    },
    { status: 500 }
  );
}

export function createSuccessResponse<T>(data: T, statusCode: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: statusCode }
  );
}
```

### 5. Implementar API de Crear Sesión
```typescript
// src/app/api/sessions/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionSchema } from '@/lib/validations';
import { 
  generateSessionCode, 
  generateUserId, 
  createSessionExpiry 
} from '@/lib/session-utils';
import { createErrorResponse, createSuccessResponse, AppError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar entrada
    const validatedData = createSessionSchema.parse(body);
    
    // Generar código único
    let sessionCode: string;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      sessionCode = generateSessionCode();
      const existingSession = await prisma.session.findUnique({
        where: { code: sessionCode }
      });
      
      if (!existingSession) break;
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw new AppError('CODE_GENERATION_FAILED', 'No se pudo generar un código único', 500);
      }
    } while (attempts < maxAttempts);
    
    // Crear sesión y usuario en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear sesión
      const session = await tx.session.create({
        data: {
          code: sessionCode,
          expiresAt: createSessionExpiry(),
        },
      });
      
      // Crear usuario creador
      const userId = generateUserId();
      const user = await tx.sessionUser.create({
        data: {
          sessionId: session.id,
          userId,
          nickname: validatedData.nickname,
        },
      });
      
      return { session, user };
    });
    
    // Respuesta con datos necesarios
    const responseData = {
      session: {
        id: result.session.id,
        code: result.session.code,
        status: result.session.status,
        phase: result.session.phase,
        maxUsers: result.session.maxUsers,
        expiresAt: result.session.expiresAt,
        createdAt: result.session.createdAt,
      },
      currentUser: {
        id: result.user.id,
        userId: result.user.userId,
        nickname: result.user.nickname,
        isReady: result.user.isReady,
        joinedAt: result.user.joinedAt,
      },
    };
    
    return createSuccessResponse(responseData, 201);
    
  } catch (error) {
    return createErrorResponse(error);
  }
}
```

### 6. Implementar API de Unirse a Sesión
```typescript
// src/app/api/sessions/join/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { joinSessionSchema } from '@/lib/validations';
import { generateUserId, isSessionExpired, isSessionFull } from '@/lib/session-utils';
import { createErrorResponse, createSuccessResponse, AppError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar entrada
    const validatedData = joinSessionSchema.parse(body);
    
    // Buscar sesión
    const session = await prisma.session.findUnique({
      where: { code: validatedData.code },
      include: {
        users: true,
      },
    });
    
    if (!session) {
      throw new AppError('SESSION_NOT_FOUND', 'Sesión no encontrada', 404);
    }
    
    // Verificar que no esté expirada
    if (isSessionExpired(session.expiresAt)) {
      throw new AppError('SESSION_EXPIRED', 'La sesión ha expirado', 410);
    }
    
    // Verificar que no esté llena
    if (isSessionFull(session.users.length, session.maxUsers)) {
      throw new AppError('SESSION_FULL', 'La sesión está llena', 409);
    }
    
    // Verificar que el nickname no esté en uso
    const nicknameExists = session.users.some(
      user => user.nickname.toLowerCase() === validatedData.nickname.toLowerCase()
    );
    
    if (nicknameExists) {
      throw new AppError('NICKNAME_TAKEN', 'El nickname ya está en uso en esta sesión', 409);
    }
    
    // Crear usuario
    const userId = generateUserId();
    const user = await prisma.sessionUser.create({
      data: {
        sessionId: session.id,
        userId,
        nickname: validatedData.nickname,
      },
    });
    
    // Actualizar estado de sesión si se llena
    let updatedSession = session;
    if (session.users.length + 1 >= session.maxUsers) {
      updatedSession = await prisma.session.update({
        where: { id: session.id },
        data: { status: 'ACTIVE' },
      });
    }
    
    // Respuesta con datos necesarios
    const responseData = {
      session: {
        id: updatedSession.id,
        code: updatedSession.code,
        status: updatedSession.status,
        phase: updatedSession.phase,
        maxUsers: updatedSession.maxUsers,
        expiresAt: updatedSession.expiresAt,
        createdAt: updatedSession.createdAt,
      },
      currentUser: {
        id: user.id,
        userId: user.userId,
        nickname: user.nickname,
        isReady: user.isReady,
        joinedAt: user.joinedAt,
      },
    };
    
    return createSuccessResponse(responseData, 200);
    
  } catch (error) {
    return createErrorResponse(error);
  }
}
```

### 7. Implementar API de Obtener Sesión
```typescript
// src/app/api/sessions/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSessionExpired } from '@/lib/session-utils';
import { createErrorResponse, createSuccessResponse, AppError } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    
    if (!sessionId) {
      throw new AppError('MISSING_SESSION_ID', 'ID de sesión requerido', 400);
    }
    
    // Buscar sesión con usuarios
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        users: {
          select: {
            id: true,
            userId: true,
            nickname: true,
            isReady: true,
            joinedAt: true,
          },
        },
      },
    });
    
    if (!session) {
      throw new AppError('SESSION_NOT_FOUND', 'Sesión no encontrada', 404);
    }
    
    // Verificar si está expirada y actualizar estado
    if (isSessionExpired(session.expiresAt) && session.status !== 'EXPIRED') {
      await prisma.session.update({
        where: { id: sessionId },
        data: { status: 'EXPIRED' },
      });
      
      session.status = 'EXPIRED';
    }
    
    // Respuesta con datos de sesión
    const responseData = {
      id: session.id,
      code: session.code,
      status: session.status,
      phase: session.phase,
      maxUsers: session.maxUsers,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      users: session.users,
    };
    
    return createSuccessResponse(responseData);
    
  } catch (error) {
    return createErrorResponse(error);
  }
}
```

### 8. Crear Tests de API (Opcional pero Recomendado)
```typescript
// src/lib/__tests__/session-utils.test.ts
import { generateSessionCode, isSessionExpired, isSessionFull } from '../session-utils';

describe('Session Utils', () => {
  test('generateSessionCode creates 6-character code', () => {
    const code = generateSessionCode();
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Z0-9]+$/);
  });
  
  test('isSessionExpired works correctly', () => {
    const futureDate = new Date(Date.now() + 1000000);
    const pastDate = new Date(Date.now() - 1000000);
    
    expect(isSessionExpired(futureDate)).toBe(false);
    expect(isSessionExpired(pastDate)).toBe(true);
  });
  
  test('isSessionFull works correctly', () => {
    expect(isSessionFull(0, 2)).toBe(false);
    expect(isSessionFull(1, 2)).toBe(false);
    expect(isSessionFull(2, 2)).toBe(true);
    expect(isSessionFull(3, 2)).toBe(true);
  });
});
```

## Validación
- [ ] POST /api/sessions retorna sesión creada con código único
- [ ] POST /api/sessions/join permite unirse con código válido
- [ ] GET /api/sessions/[id] retorna datos completos de sesión
- [ ] Validación Zod rechaza datos inválidos
- [ ] Manejo de errores retorna responses consistentes
- [ ] Códigos de sesión son únicos y válidos
- [ ] Sesiones expiradas se manejan correctamente

## Archivos a Crear
- `src/lib/validations.ts` (schemas Zod)
- `src/lib/session-utils.ts` (utilidades de sesión)
- `src/lib/api-response.ts` (manejo de responses)
- `src/app/api/sessions/route.ts` (crear sesión)
- `src/app/api/sessions/join/route.ts` (unirse a sesión)
- `src/app/api/sessions/[id]/route.ts` (obtener sesión)

## Commit Final
```bash
git add .
git commit -m "feat: session management API endpoints

- Implement POST /api/sessions for session creation
- Implement POST /api/sessions/join for joining sessions
- Implement GET /api/sessions/[id] for session retrieval
- Add Zod validation schemas for all inputs
- Create robust error handling and response utilities
- Add session utilities for code generation and validation
- Include session expiry and capacity management"
```

## Notas Técnicas
- **Zod Validation**: Type-safe validation con mensajes en español
- **Unique Code Generation**: Retry logic para códigos únicos
- **Transaction Safety**: Uso de transacciones para consistencia
- **Error Handling**: Responses estructuradas y códigos HTTP apropiados
- **Session States**: Manejo automático de estados y expiración