import { CommonApiService } from "../services/CommonApiService";
import { SessionManager } from "@/lib/utils/session";
import type {
  ApiResponse,
  SignupRequest,
  SignupResponse,
  User,
  LoginRequest,
  LoginResponse,
  SocialLoginRequest,
} from "../types/auth.types";

class AuthService extends CommonApiService {
  /**
   * Create a new account (Signup)
   * POST {{baseUrl}}/common/users/signup
   *
   * Note: User must have verified OTP before calling this endpoint
   * The secretCode from OTP verification is required
   */
  async signup(request: SignupRequest): Promise<ApiResponse<User>> {
    const response = await this.post<ApiResponse<User>>(
      "/common/users/signup",
      request as unknown as Record<string, unknown>,
      { "Skip-Auth": "true" } // No auth required for signup
    );

    if (!response) {
      throw new Error("Failed to create account");
    }

    // Store user data and token
    if (response.data?.loginToken) {
      this.sessionManager.setToken(response.data.loginToken);
    }

    if (response.data?.email) {
      this.sessionManager.setEmail(response.data.email);
    }

    this.sessionManager.setUser(response.data);

    return response;
  }

  /**
   * Get current user details
   * GET {{baseUrl}}/common/users/
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.get<ApiResponse<User>>("/common/users/");

    if (!response) {
      throw new Error("Failed to get user details");
    }

    // Update stored user data
    this.sessionManager.setUser(response.data);

    return response;
  }

  /**
   * Logout user
   * POST {{baseUrl}}/common/users/logout
   */
  async logout(fcmToken?: string): Promise<ApiResponse<null>> {
    const response = await this.post<ApiResponse<null>>(
      "/common/users/logout",
      { token: fcmToken || "" }
    );

    // Clear all session data
    this.sessionManager.clearAll();

    return response || { status: 200, message: "Logged out", data: null };
  }

  /**
   * Update FCM token for push notifications
   * POST {{baseUrl}}/common/users/fcm
   */
  async updateFCMToken(token: string): Promise<ApiResponse<null>> {
    const response = await this.post<ApiResponse<null>>(
      "/common/users/fcm",
      { token }
    );

    if (!response) {
      throw new Error("Failed to update FCM token");
    }

    return response;
  }

  /**
   * Login with email/phone and password
   * POST {{baseUrl}}/common/users/login
   */
  async login(request: LoginRequest): Promise<ApiResponse<User>> {
    const response = await this.post<ApiResponse<User>>(
      "/common/users/login",
      request as unknown as Record<string, unknown>,
      { "Skip-Auth": "true" } // No auth required for login
    );

    if (!response) {
      throw new Error("Failed to login");
    }

    // Store user data and token
    if (response.data?.loginToken) {
      this.sessionManager.setToken(response.data.loginToken);
    }

    if (response.data?.email) {
      this.sessionManager.setEmail(response.data.email);
    }

    this.sessionManager.setUser(response.data);

    return response;
  }

  /**
   * Sign in or sign up with social provider (Google/Apple)
   * This method handles Firebase authentication and then creates/updates user on backend
   */
  async socialLogin(
    uid: string,
    email: string | null,
    displayName: string | null,
    photoURL: string | null,
    provider: "google" | "apple",
    idToken: string
  ): Promise<ApiResponse<User>> {
    // For social login, we use the Firebase ID token directly
    // The backend will verify it and create/update the user
    const response = await this.post<ApiResponse<User>>(
      "/common/users/social-login",
      {
        uid,
        email,
        displayName,
        photoURL,
        provider,
        idToken,
      } as unknown as Record<string, unknown>,
      { "Skip-Auth": "true" }
    );

    if (!response) {
      throw new Error("Failed to complete social login");
    }

    // Store user data and token
    if (response.data?.loginToken) {
      this.sessionManager.setToken(response.data.loginToken);
    }

    if (response.data?.email) {
      this.sessionManager.setEmail(response.data.email);
    }

    this.sessionManager.setUser(response.data);

    return response;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }> | null> {
    try {
      // This would typically call a refresh endpoint
      // For now, we'll return null and let the ApiService handle token refresh
      return null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
