// API Response structure
export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T;
}

// User types
export interface User {
  id: string;
  uniqueId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string;
  balance: number;
  type: UserType;
  storeName?: string;
  phoneNumber: string;
  deliveryMethod?: DeliveryMethod;
  verified: boolean;
  hasPassword: boolean;
  reviews: {
    count: number;
    average: number;
  };
  authProviders: {
    emailProvider: boolean;
    googleProvider: boolean;
    appleProvider: boolean;
  };
  loginToken?: string;
}

export type UserType = "SUPPLIER" | "COURIER" | "CUSTOMER";
export type DeliveryMethod = "WALKING" | "BIKE" | "CAR" | "MOTORCYCLE";
export type IdentifierType = "PHONE" | "EMAIL";
export type OTPReason = "SIGNUP" | "LOGIN" | "RESET_PASSWORD";

// OTP Types
export interface SendOTPRequest {
  identifier: string;
  identifierType: IdentifierType;
  reason: OTPReason;
}

export interface SendOTPResponse {
  code: string; // The OTP code identifier
}

export interface VerifyOTPRequest {
  code: string; // The code from SendOTPResponse
  otp: string; // The actual OTP entered by user
}

export interface VerifyOTPResponse {
  secretCode: string; // Base64 encoded secret code for signup
}

export interface ResendOTPRequest {
  code: string;
}

// Signup Types
export interface SignupRequest {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
  storeName: string;
  type: UserType;
  gov?: string;
  deliveryMethod?: DeliveryMethod;
  uid?: string;
  secretCode: string; // From VerifyOTPResponse
}

export interface SignupResponse {
  user: User;
}

// Social Login Types
export interface SocialLoginRequest {
  uid: string; // Firebase UID
  email?: string;
  displayName?: string;
  photoURL?: string;
  provider: "google" | "apple";
  idToken: string; // Firebase ID token
}

export interface LoginRequest {
  identifier: string; // Email or phone
  password: string;
}

export interface LoginResponse {
  user: User;
}
