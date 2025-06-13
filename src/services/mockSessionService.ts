import { SessionWithUsers, SessionUser, SessionStatus, GamePhase } from '@/types';
import { generateMockCode, generateMockId, mockSession } from '@/data/mockData';
import { CreateSessionRequest, JoinSessionRequest, SessionResponse } from './sessionService';

// Simulación de delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockSessionService {
  private sessions: Map<string, SessionWithUsers> = new Map();
  private sessionsByCode: Map<string, string> = new Map(); // code -> sessionId

  constructor() {
    // Inicializar con una sesión de ejemplo
    this.sessions.set(mockSession.id, mockSession);
    this.sessionsByCode.set(mockSession.code, mockSession.id);
  }

  async createSession(data: CreateSessionRequest): Promise<SessionResponse> {
    await delay(800); // Simular delay de red

    const sessionId = generateMockId();
    const sessionCode = generateMockCode();
    const userId = generateMockId();

    const newUser: SessionUser = {
      id: generateMockId(),
      sessionId,
      userId,
      nickname: data.nickname,
      isReady: false,
      joinedAt: new Date(),
    };

    const newSession: SessionWithUsers = {
      id: sessionId,
      code: sessionCode,
      status: SessionStatus.WAITING,
      phase: GamePhase.SELECTION,
      maxUsers: 2,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
      createdAt: new Date(),
      updatedAt: new Date(),
      users: [newUser],
    };

    this.sessions.set(sessionId, newSession);
    this.sessionsByCode.set(sessionCode, sessionId);

    // Simular que se une automáticamente un segundo usuario después de 3 segundos
    setTimeout(async () => {
      await this.simulateSecondUserJoin(sessionId);
    }, 3000);

    return {
      session: newSession,
      currentUser: newUser,
    };
  }

  async joinSession(data: JoinSessionRequest): Promise<SessionResponse> {
    await delay(600); // Simular delay de red

    const sessionId = this.sessionsByCode.get(data.code.toUpperCase());
    
    if (!sessionId) {
      throw new Error('Sesión no encontrada. Verifica el código e intenta nuevamente.');
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    if (session.users.length >= session.maxUsers) {
      throw new Error('La sesión está llena');
    }

    // Verificar nickname duplicado
    const nicknameExists = session.users.some(
      user => user.nickname.toLowerCase() === data.nickname.toLowerCase()
    );
    
    if (nicknameExists) {
      throw new Error('Ese nickname ya está en uso en esta sesión');
    }

    const userId = generateMockId();
    const newUser: SessionUser = {
      id: generateMockId(),
      sessionId,
      userId,
      nickname: data.nickname,
      isReady: false,
      joinedAt: new Date(),
    };

    session.users.push(newUser);

    // Si la sesión se llena, cambiar estado
    if (session.users.length >= session.maxUsers) {
      session.status = SessionStatus.ACTIVE;
    }

    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);

    return {
      session,
      currentUser: newUser,
    };
  }

  async getSession(sessionId: string): Promise<SessionWithUsers> {
    await delay(400); // Simular delay de red

    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    return session;
  }

  // Métodos adicionales para demo
  async advanceToNextPhase(sessionId: string): Promise<SessionWithUsers> {
    await delay(300);

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Sesión no encontrada');
    }

    // Avanzar a la siguiente fase
    switch (session.phase) {
      case GamePhase.SELECTION:
        session.phase = GamePhase.MATCHING;
        break;
      case GamePhase.MATCHING:
        session.phase = GamePhase.RATING;
        break;
      case GamePhase.RATING:
        session.phase = GamePhase.RESULTS;
        break;
      default:
        // Ya está en RESULTS, no hacer nada
        break;
    }

    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);

    return session;
  }

  // Para pruebas, obtener sesión por código
  async getSessionByCode(code: string): Promise<SessionWithUsers> {
    await delay(300);
    
    const sessionId = this.sessionsByCode.get(code.toUpperCase());
    if (!sessionId) {
      throw new Error('Sesión no encontrada');
    }

    return this.getSession(sessionId);
  }

  // Simular que se une automáticamente un segundo usuario
  private async simulateSecondUserJoin(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.users.length >= session.maxUsers) {
      return;
    }

    // Crear segundo usuario simulado
    const simulatedUser: SessionUser = {
      id: generateMockId(),
      sessionId,
      userId: generateMockId(),
      nickname: 'AnimeLover123', // Usuario simulado para demo
      isReady: false,
      joinedAt: new Date(),
    };

    session.users.push(simulatedUser);
    session.status = SessionStatus.ACTIVE; // Activar sesión cuando se llena
    session.updatedAt = new Date();

    this.sessions.set(sessionId, session);

    // Disparar evento personalizado para notificar a los componentes que escuchan
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('sessionUpdated', {
        detail: { sessionId, session }
      });
      window.dispatchEvent(event);
    }
  }
}

export const mockSessionService = new MockSessionService();