import { CommonApiService } from "./CommonApiService";
import type {
  ApiResponse,
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ResendOTPRequest,
} from "../types/auth.types";

class OTPService extends CommonApiService {
  /**
   * Send OTP to phone number or email
   * POST /v1/common/otp/send
   * Does NOT require authentication
   */
  async sendOTP(request: SendOTPRequest): Promise<ApiResponse<SendOTPResponse>> {
    const response = await this.post<ApiResponse<SendOTPResponse>>(
      "/common/otp/send",
      request as unknown as Record<string, unknown>,
      { "Skip-Auth": "true" }
    );

    if (!response) {
      throw new Error("Failed to send OTP");
    }

    return response;
  }

  /**
   * Verify OTP code
   * POST /v1/common/otp/verify
   * Does NOT require authentication
   */
  async verifyOTP(request: VerifyOTPRequest): Promise<ApiResponse<VerifyOTPResponse>> {
    const response = await this.post<ApiResponse<VerifyOTPResponse>>(
      "/common/otp/verify",
      request as unknown as Record<string, unknown>,
      { "Skip-Auth": "true" }
    );

    if (!response) {
      throw new Error("Failed to verify OTP");
    }

    return response;
  }

  /**
   * Resend OTP
   * POST /v1/common/otp/resend
   * Does NOT require authentication
   */
  async resendOTP(request: ResendOTPRequest): Promise<ApiResponse<SendOTPResponse>> {
    const response = await this.post<ApiResponse<SendOTPResponse>>(
      "/common/otp/resend",
      request as unknown as Record<string, unknown>,
      { "Skip-Auth": "true" }
    );

    if (!response) {
      throw new Error("Failed to resend OTP");
    }

    return response;
  }
}

export const otpService = new OTPService();
