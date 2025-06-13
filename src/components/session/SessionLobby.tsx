'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSessionActions } from '@/hooks/useSessionActions';

export function SessionLobby() {
  const router = useRouter();
  const { state, dispatch } = useSession();
  const { leaveSession } = useSessionActions();
  const session = state.session;
  const currentUser = state.currentUser;
  const [isSimulatingJoin, setIsSimulatingJoin] = useState(false);

  // Escuchar por actualizaciones de sesión desde el mock service
  useEffect(() => {
    const handleSessionUpdate = (event: CustomEvent) => {
      const { sessionId, session: updatedSession } = event.detail;
      if (session && session.id === sessionId) {
        dispatch({
          type: 'SET_SESSION',
          payload: updatedSession
        });
        setIsSimulatingJoin(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('sessionUpdated', handleSessionUpdate as EventListener);
      return () => window.removeEventListener('sessionUpdated', handleSessionUpdate as EventListener);
    }
  }, [session, currentUser, dispatch]);

  // Iniciar simulación cuando solo hay 1 usuario
  useEffect(() => {
    if (session && session.users?.length === 1 && !isSimulatingJoin) {
      setIsSimulatingJoin(true);
    }
  }, [session, isSimulatingJoin]);

  // Auto-navegar a selección cuando la sesión esté lista
  useEffect(() => {
    if (session && session.status === 'ACTIVE' && session.users?.length >= 2) {
      const timer = setTimeout(() => {
        router.push(`/session/${session.id}/selection`);
      }, 3000); // 3 segundos de delay para mostrar el mensaje

      return () => clearTimeout(timer);
    }
  }, [session, router]);

  if (!session || !currentUser) {
    return (
      <div className="text-center">
        <Card>
          <CardContent>
            <p className="text-red-600 mb-4">Error: No hay sesión activa</p>
            <Button onClick={leaveSession} variant="secondary">
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isWaiting = session.status === 'WAITING';
  const userCount = session.users?.length || 0;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">
            Sesión: {session.code}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Estado de la sesión */}
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isWaiting 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {isWaiting ? '⏳ Esperando jugadores' : '✅ Sesión activa'}
            </div>
            <p className="text-gray-600 mt-2">
              Jugadores conectados: {userCount}/{session.maxUsers}
            </p>
          </div>

          {/* Lista de jugadores */}
          <div>
            <h3 className="font-semibold text-gray-900 text-center mb-4">Jugadores en la sesión</h3>
            <div className="space-y-2">
              {session.users?.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 rounded-lg flex items-center justify-between ${
                    user.userId === currentUser.userId
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      user.userId === currentUser.userId 
                        ? 'bg-blue-500' 
                        : 'bg-green-500'
                    }`} />
                    <span className="font-medium">
                      {user.nickname}
                    </span>
                  </div>
                  {user.userId === currentUser.userId && (
                    <span className="text-sm text-blue-600 font-medium">
                      (Tú)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instrucciones según el estado */}
          {isWaiting && userCount < session.maxUsers && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2">
                📋 Instrucciones
              </h4>
              <div className="text-amber-800 text-sm space-y-2">
                <p>
                  <strong>1.</strong> Comparte este código con tu compañero:
                </p>
                <div className="bg-white border border-amber-300 rounded px-3 py-2 text-center">
                  <span className="font-bold text-xl tracking-wider">{session.code}</span>
                </div>
                <p>
                  <strong>2.</strong> Una vez que se una, podrán comenzar a seleccionar animes
                </p>
                {isSimulatingJoin && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span className="text-blue-700 text-sm font-medium">
                        Simulando llegada de segundo jugador...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isWaiting && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <h4 className="font-semibold text-green-900 mb-2">
                🎉 ¡Todos conectados!
              </h4>
              <p className="text-green-800 text-sm mb-3">
                El juego comenzará automáticamente en unos segundos...
              </p>
              <div className="animate-pulse text-green-600 mb-4">
                Preparando la selección de animes...
              </div>
              <Button
                onClick={() => router.push(`/session/${session.id}/selection`)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Comenzar Ahora →
              </Button>
            </div>
          )}

          {/* Información de la sesión */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Información de la sesión</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Código:</span>
                <div className="font-mono font-bold">{session.code}</div>
              </div>
              <div>
                <span className="text-gray-500">Creada:</span>
                <div>{new Date(session.createdAt).toLocaleTimeString()}</div>
              </div>
              <div>
                <span className="text-gray-500">Estado:</span>
                <div className="capitalize">{session.status.toLowerCase()}</div>
              </div>
              <div>
                <span className="text-gray-500">Fase:</span>
                <div className="capitalize">{session.phase.toLowerCase()}</div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={leaveSession}
              className="flex-1"
            >
              Abandonar Sesión
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              🔄 Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}