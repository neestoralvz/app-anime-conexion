'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Layout, PageHeader } from '@/components/layout/Layout';
import { SessionLobby } from '@/components/session/SessionLobby';
import { LoadingSpinner } from '@/components/layout/LoadingSpinner';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, state.session]);

  const loadSession = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const session = await sessionService.getSession(sessionId);
      dispatch({ type: 'SET_SESSION', payload: session });
      
      // Intentar recuperar usuario actual del localStorage
      const savedSession = localStorage.getItem('session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.sessionId === sessionId) {
          // Buscar el usuario en la sesión cargada
          const currentUser = session.users?.find(u => u.userId === parsed.userId);
          if (currentUser) {
            dispatch({ type: 'SET_CURRENT_USER', payload: currentUser });
          }
        }
      }
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar sesión';
      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  if (state.isLoading) {
    return (
      <Layout maxWidth="md">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando sesión...</p>
        </div>
      </Layout>
    );
  }

  if (state.error) {
    return (
      <Layout maxWidth="md">
        <PageHeader
          title="Error"
          subtitle="No se pudo cargar la sesión"
        />
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600 mb-4">{state.error}</p>
          <div className="space-x-3">
            <a 
              href="/" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
            >
              Volver al inicio
            </a>
            <button
              onClick={loadSession}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!state.session) {
    return (
      <Layout maxWidth="md">
        <PageHeader
          title="Sesión no encontrada"
          subtitle="La sesión solicitada no existe o ha expirado"
        />
        <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800 mb-4">
            No se pudo encontrar la sesión con ID: {sessionId}
          </p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            Crear nueva sesión
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout maxWidth="lg">
      <PageHeader
        title="Sala de Espera"
        subtitle={`Sesión ${state.session.code} - ${state.session.users?.length || 0}/${state.session.maxUsers} jugadores`}
      />
      
      <SessionLobby />
    </Layout>
  );
}