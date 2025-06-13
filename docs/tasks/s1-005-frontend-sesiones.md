# S1-005: Frontend de Sesiones

**Sprint**: 1 | **Día**: 4-5 | **Duración**: 2 días  
**Prioridad**: Crítica | **Dependencias**: S1-003, S1-004

## Objetivo
Implementar la interfaz de usuario para crear y unirse a sesiones, incluyendo el lobby de espera y la validación de formularios.

## Criterios de Aceptación
- [ ] Página HomePage con opciones de crear/unirse funcionando
- [ ] Componente SessionLobby mostrando estado de sesión
- [ ] Context de Session integrado con las APIs
- [ ] Validación de formularios en tiempo real
- [ ] Manejo de errores con feedback visual
- [ ] Navegación entre estados de sesión

## Pasos de Implementación

### 1. Crear Service para APIs de Sesión
```typescript
// src/services/sessionService.ts
import { ApiResponse, Session, SessionUser } from '@/types';

export interface CreateSessionRequest {
  nickname: string;
}

export interface JoinSessionRequest {
  code: string;
  nickname: string;
}

export interface SessionResponse {
  session: Session;
  currentUser: SessionUser;
}

class SessionService {
  private baseUrl = '/api/sessions';

  async createSession(data: CreateSessionRequest): Promise<SessionResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<SessionResponse> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al crear sesión');
    }

    return result.data!;
  }

  async joinSession(data: JoinSessionRequest): Promise<SessionResponse> {
    const response = await fetch(`${this.baseUrl}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<SessionResponse> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al unirse a sesión');
    }

    return result.data!;
  }

  async getSession(sessionId: string): Promise<Session> {
    const response = await fetch(`${this.baseUrl}/${sessionId}`);
    
    const result: ApiResponse<Session> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al obtener sesión');
    }

    return result.data!;
  }
}

export const sessionService = new SessionService();
```

### 2. Crear Hook para Gestión de Sesiones
```typescript
// src/hooks/useSessionActions.ts
import { useRouter } from 'next/navigation';
import { useSession } from '@/contexts/SessionContext';
import { sessionService, CreateSessionRequest, JoinSessionRequest } from '@/services/sessionService';

export function useSessionActions() {
  const { state, dispatch } = useSession();
  const router = useRouter();

  const createSession = async (data: CreateSessionRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await sessionService.createSession(data);
      
      dispatch({ type: 'SET_SESSION', payload: response.session });
      dispatch({ type: 'SET_CURRENT_USER', payload: response.currentUser });
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('session', JSON.stringify({
        sessionId: response.session.id,
        userId: response.currentUser.userId,
        code: response.session.code,
      }));

      router.push(`/session/${response.session.id}`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const joinSession = async (data: JoinSessionRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await sessionService.joinSession(data);
      
      dispatch({ type: 'SET_SESSION', payload: response.session });
      dispatch({ type: 'SET_CURRENT_USER', payload: response.currentUser });
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('session', JSON.stringify({
        sessionId: response.session.id,
        userId: response.currentUser.userId,
        code: response.session.code,
      }));

      router.push(`/session/${response.session.id}`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const leaveSession = () => {
    dispatch({ type: 'RESET_SESSION' });
    localStorage.removeItem('session');
    router.push('/');
  };

  return {
    createSession,
    joinSession,
    leaveSession,
    isLoading: state.isLoading,
    error: state.error,
  };
}
```

### 3. Crear Componentes de Formulario
```typescript
// src/components/session/CreateSessionForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSessionActions } from '@/hooks/useSessionActions';

export function CreateSessionForm() {
  const [nickname, setNickname] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { createSession, isLoading, error } = useSessionActions();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!nickname.trim()) {
      newErrors.nickname = 'El nickname es requerido';
    } else if (nickname.length < 2) {
      newErrors.nickname = 'El nickname debe tener al menos 2 caracteres';
    } else if (nickname.length > 20) {
      newErrors.nickname = 'El nickname no puede exceder 20 caracteres';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(nickname)) {
      newErrors.nickname = 'Solo letras, números, guiones y guiones bajos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    createSession({ nickname: nickname.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Tu Nickname"
        value={nickname}
        onChange={(e) => {
          setNickname(e.target.value);
          if (errors.nickname) {
            setErrors(prev => ({ ...prev, nickname: '' }));
          }
        }}
        error={errors.nickname}
        placeholder="Ej: Animelover123"
        maxLength={20}
      />
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Creando...' : 'Crear Nueva Sesión'}
      </Button>
    </form>
  );
}

// src/components/session/JoinSessionForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSessionActions } from '@/hooks/useSessionActions';

export function JoinSessionForm() {
  const [formData, setFormData] = useState({
    code: '',
    nickname: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { joinSession, isLoading, error } = useSessionActions();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código de sesión es requerido';
    } else if (formData.code.length !== 6) {
      newErrors.code = 'El código debe tener 6 caracteres';
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = 'Código inválido';
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = 'El nickname es requerido';
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = 'El nickname debe tener al menos 2 caracteres';
    } else if (formData.nickname.length > 20) {
      newErrors.nickname = 'El nickname no puede exceder 20 caracteres';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.nickname)) {
      newErrors.nickname = 'Solo letras, números, guiones y guiones bajos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    joinSession({
      code: formData.code.trim().toUpperCase(),
      nickname: formData.nickname.trim(),
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Código de Sesión"
        value={formData.code}
        onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
        error={errors.code}
        placeholder="Ej: ABC123"
        maxLength={6}
      />
      
      <Input
        label="Tu Nickname"
        value={formData.nickname}
        onChange={(e) => handleInputChange('nickname', e.target.value)}
        error={errors.nickname}
        placeholder="Ej: AnimeExpert456"
        maxLength={20}
      />
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Uniéndose...' : 'Unirse a Sesión'}
      </Button>
    </form>
  );
}
```

### 4. Actualizar Página Principal
```typescript
// src/app/page.tsx
'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { CreateSessionForm } from '@/components/session/CreateSessionForm';
import { JoinSessionForm } from '@/components/session/JoinSessionForm';

export default function HomePage() {
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');

  if (mode === 'create') {
    return (
      <Layout>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Crear Nueva Sesión
            </h1>
            <p className="text-gray-600">
              Crea una sesión para invitar a tu compañero
            </p>
          </div>
          
          <CreateSessionForm />
          
          <button
            onClick={() => setMode('home')}
            className="w-full mt-4 text-center text-gray-500 hover:text-gray-700"
          >
            ← Volver al inicio
          </button>
        </div>
      </Layout>
    );
  }

  if (mode === 'join') {
    return (
      <Layout>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Unirse a Sesión
            </h1>
            <p className="text-gray-600">
              Ingresa el código de la sesión existente
            </p>
          </div>
          
          <JoinSessionForm />
          
          <button
            onClick={() => setMode('home')}
            className="w-full mt-4 text-center text-gray-500 hover:text-gray-700"
          >
            ← Volver al inicio
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          App Anime Conexión
        </h1>
        <p className="text-gray-600 mb-8">
          Encuentra el anime perfecto para ver juntos
        </p>
        
        <div className="space-y-4">
          <Button 
            className="w-full"
            onClick={() => setMode('create')}
          >
            Crear Nueva Sesión
          </Button>
          
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => setMode('join')}
          >
            Unirse a Sesión
          </Button>
        </div>
      </div>
    </Layout>
  );
}
```

### 5. Crear Componente SessionLobby
```typescript
// src/components/session/SessionLobby.tsx
'use client';

import { useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/Button';
import { useSessionActions } from '@/hooks/useSessionActions';

export function SessionLobby() {
  const { state } = useSession();
  const { leaveSession } = useSessionActions();
  const session = state.session;
  const currentUser = state.currentUser;

  if (!session || !currentUser) {
    return (
      <div className="text-center">
        <p className="text-red-600">Error: No hay sesión activa</p>
        <Button onClick={leaveSession} variant="secondary" className="mt-4">
          Volver al Inicio
        </Button>
      </div>
    );
  }

  const isWaiting = session.status === 'WAITING';
  const userCount = session.users?.length || 0;

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Sesión: {session.code}
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Estado: {isWaiting ? 'Esperando jugadores' : 'Activa'}
          </p>
          <p className="text-gray-600">
            Jugadores: {userCount}/{session.maxUsers}
          </p>
        </div>

        <div className="space-y-2 mb-6">
          <h3 className="font-semibold text-gray-900">Jugadores:</h3>
          {session.users?.map((user) => (
            <div
              key={user.id}
              className={`p-2 rounded ${
                user.userId === currentUser.userId
                  ? 'bg-primary-light text-primary-dark'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {user.nickname} {user.userId === currentUser.userId && '(Tú)'}
            </div>
          ))}
        </div>

        {isWaiting && userCount < session.maxUsers && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">
              Comparte este código con tu compañero: <br />
              <span className="font-bold text-lg">{session.code}</span>
            </p>
          </div>
        )}

        {!isWaiting && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 font-semibold">
              ¡Todos los jugadores se han unido!
            </p>
            <p className="text-green-700 text-sm mt-1">
              El juego comenzará automáticamente...
            </p>
          </div>
        )}
      </div>

      <Button
        variant="secondary"
        onClick={leaveSession}
        className="w-full"
      >
        Abandonar Sesión
      </Button>
    </div>
  );
}
```

### 6. Crear Página de Sesión
```typescript
// src/app/session/[id]/page.tsx
'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { SessionLobby } from '@/components/session/SessionLobby';
import { useSession } from '@/contexts/SessionContext';
import { sessionService } from '@/services/sessionService';

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const { state, dispatch } = useSession();

  useEffect(() => {
    // Cargar sesión si no está en el estado
    if (!state.session && sessionId) {
      loadSession();
    }
  }, [sessionId, state.session]);

  const loadSession = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const session = await sessionService.getSession(sessionId);
      dispatch({ type: 'SET_SESSION', payload: session });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar sesión';
      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  if (state.isLoading) {
    return (
      <Layout>
        <div className="text-center">
          <p>Cargando sesión...</p>
        </div>
      </Layout>
    );
  }

  if (state.error) {
    return (
      <Layout>
        <div className="text-center">
          <p className="text-red-600 mb-4">{state.error}</p>
          <a href="/" className="text-primary hover:underline">
            Volver al inicio
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SessionLobby />
    </Layout>
  );
}
```

## Validación
- [ ] Formulario de crear sesión funciona y valida correctamente
- [ ] Formulario de unirse a sesión valida códigos y nicknames
- [ ] SessionLobby muestra estado correcto de la sesión
- [ ] Navegación entre páginas funciona sin errores
- [ ] Manejo de errores muestra mensajes apropiados
- [ ] Context mantiene estado de sesión correctamente

## Archivos a Crear
- `src/services/sessionService.ts` (cliente API)
- `src/hooks/useSessionActions.ts` (lógica de sesiones)
- `src/components/session/CreateSessionForm.tsx` (formulario crear)
- `src/components/session/JoinSessionForm.tsx` (formulario unirse)
- `src/components/session/SessionLobby.tsx` (lobby de espera)
- `src/app/session/[id]/page.tsx` (página de sesión)

## Commit Final
```bash
git add .
git commit -m "feat: session creation and joining UI

- Implement CreateSessionForm with validation
- Implement JoinSessionForm with real-time validation
- Create SessionLobby component for waiting room
- Add sessionService for API communication
- Create useSessionActions hook for session management
- Setup session page with dynamic routing
- Integrate SessionContext with UI components"
```

## Notas Técnicas
- **Real-time Validation**: Validación en tiempo real con feedback inmediato
- **Error Handling**: Manejo robusto de errores con mensajes user-friendly
- **LocalStorage**: Persistencia de sesión para reconexión
- **Context Integration**: Estado global sincronizado con UI
- **Dynamic Routing**: Páginas de sesión con parámetros dinámicos