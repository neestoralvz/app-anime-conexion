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