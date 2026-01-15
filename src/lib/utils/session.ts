export class SessionManager {
  private static instance: SessionManager;

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Token management
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  async getCurrentToken(): Promise<string | null> {
    return this.getToken();
  }

  clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Firebase refresh token management
  setFirebaseRefreshToken(refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('firebase_refresh_token', refreshToken);
    }
  }

  getFirebaseRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('firebase_refresh_token');
    }
    return null;
  }

  clearFirebaseRefreshToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('firebase_refresh_token');
    }
  }

  // Email management
  setEmail(email: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_email', email);
    }
  }

  getEmail(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_email');
    }
    return null;
  }

  clearEmail(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_email');
    }
  }

  // User data management
  setUser(user: unknown): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_data', JSON.stringify(user));
    }
  }

  getUser<T>(): T | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  clearUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data');
    }
  }

  // Clear all session data
  clearAll(): void {
    this.clearToken();
    this.clearFirebaseRefreshToken();
    this.clearEmail();
    this.clearUser();
  }
}
