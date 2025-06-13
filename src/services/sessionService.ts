import { ApiResponse, SessionWithUsers, SessionUser } from '@/types';

export interface CreateSessionRequest {
  nickname: string;
}

export interface JoinSessionRequest {
  code: string;
  nickname: string;
}

export interface SessionResponse {
  session: SessionWithUsers;
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

  async getSession(sessionId: string): Promise<SessionWithUsers> {
    const response = await fetch(`${this.baseUrl}/${sessionId}`);
    
    const result: ApiResponse<SessionWithUsers> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al obtener sesión');
    }

    return result.data!;
  }
}

export const sessionService = new SessionService();