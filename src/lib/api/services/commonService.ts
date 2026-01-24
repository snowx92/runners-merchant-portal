import { CommonApiService } from "./CommonApiService";
import type { ApiResponse } from "../types/auth.types";
import type {
    Faq,
    UserProfile,
    UpdateProfileRequest,
    Review,
    VerificationRequest,
    Address,
    NotificationsResponse,
    Transaction,
    TransactionsResponse,
    BalanceResponse,
    DepositRequest,
    DepositResponse,
    PayoutRequest,
    PayoutResponse
} from "../types/common.types";

class CommonService extends CommonApiService {
    /**
     * Get FAQs
     * GET /v1/common/faqs
     */
    async getFaqs(): Promise<ApiResponse<Faq[]>> {
        const response = await this.get<ApiResponse<Faq[]>>("/common/faqs");
        if (!response) throw new Error("Failed to fetch FAQs");
        return response;
    }

    /**
     * Get User Profile
     * GET /v1/common/users/
     */
    async getUserProfile(): Promise<ApiResponse<UserProfile>> {
        const response = await this.get<ApiResponse<UserProfile>>("/common/users/");
        if (!response) throw new Error("Failed to fetch user profile");
        return response;
    }

    /**
     * Update User Profile
     * PUT /v1/common/users/profile
     */
    async updateUserProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
        const response = await this.put<ApiResponse<UserProfile>>("/common/users/profile", data);
        if (!response) throw new Error("Failed to update profile");
        return response;
    }

    /**
     * Delete User Account
     * DELETE /v1/common/users
     */
    async deleteAccount(): Promise<ApiResponse<void>> {
        const response = await this.delete<ApiResponse<void>>("/common/users");
        if (!response) throw new Error("Failed to delete account");
        return response;
    }

    /**
     * Get Policy
     * GET /v1/common/settings/policy
     */
    async getPolicy(): Promise<ApiResponse<string>> {
        const response = await this.get<ApiResponse<string>>("/common/settings/policy");
        if (!response) throw new Error("Failed to fetch policy");
        return response;
    }

    /**
     * Get Terms
     * GET /v1/common/settings/terms
     */
    async getTerms(): Promise<ApiResponse<string>> {
        const response = await this.get<ApiResponse<string>>("/common/settings/terms");
        if (!response) throw new Error("Failed to fetch terms");
        return response;
    }

    /**
     * Get Reviews
     * GET /v1/common/reviews/:uid
     */
    async getReviews(uid: string, pageNo: number = 1, limit: number = 10): Promise<ApiResponse<Review[]>> {
        const response = await this.get<ApiResponse<Review[]>>(`/common/reviews/${uid}`, {
            pageNo: pageNo.toString(),
            limit: limit.toString()
        });
        if (!response) throw new Error("Failed to fetch reviews");
        return response;
    }

    /**
     * Get Verification Status
     * GET /v1/common/users/verification
     */
    async getVerificationStatus(): Promise<ApiResponse<string>> {
        // ApiResponse<string> matches the structure { status, message, data: string }
        const response = await this.get<ApiResponse<string>>("/common/users/verification");
        if (!response) throw new Error("Failed to fetch verification status");
        return response;
    }

    /**
     * Submit Verification Data
     * POST /v1/common/users/verification
     */
    async submitVerification(data: VerificationRequest): Promise<ApiResponse<void>> {
        const response = await this.post<ApiResponse<void>>("/common/users/verification", data);
        if (!response) throw new Error("Failed to submit verification");
        return response;
    }

    /**
     * Add Address
     * POST /v1/common/users/locations
     */
    async addAddress(data: Omit<Address, 'id'>): Promise<ApiResponse<Address>> {
        const response = await this.post<ApiResponse<Address>>("/common/users/locations", data);
        if (!response) throw new Error("Failed to add address");
        return response;
    }

    /**
     * Update Address
     * PUT /v1/common/users/locations/:id
     */
    async updateAddress(id: string, data: Partial<Omit<Address, 'id'>>): Promise<ApiResponse<Address>> {
        const response = await this.put<ApiResponse<Address>>(`/common/users/locations/${id}`, data);
        if (!response) throw new Error("Failed to update address");
        return response;
    }

    /**
     * Delete Address
     * DELETE /v1/common/users/locations/:id
     */
    async deleteAddress(id: string): Promise<ApiResponse<void>> {
        const response = await this.delete<ApiResponse<void>>(`/common/users/locations/${id}`);
        if (!response) throw new Error("Failed to delete address");
        return response;
    }

    /**
     * Get Notifications
     * GET /v1/common/notifications
     */
    async getNotifications(pageNo: number = 1, limit: number = 10): Promise<ApiResponse<NotificationsResponse>> {
        const response = await this.get<ApiResponse<NotificationsResponse>>("/common/notifications", {
            pageNo: pageNo.toString(),
            limit: limit.toString()
        });
        if (!response) throw new Error("Failed to fetch notifications");
        return response;
    }

    /**
     * Mark Notification Read
     * POST /v1/common/notifications/read
     */
    async markNotificationRead(id: string): Promise<ApiResponse<void>> {
        const response = await this.post<ApiResponse<void>>("/common/notifications/read", { id });
        if (!response) throw new Error("Failed to mark notification as read");
        return response;
    }

    /**
     * Mark All Notifications as Read
     * POST /v1/common/notifications/read-all
     */
    async markAllNotificationsRead(): Promise<ApiResponse<void>> {
        const response = await this.post<ApiResponse<void>>("/common/notifications/read", {});
        if (!response) throw new Error("Failed to mark all notifications as read");
        return response;
    }

    /**
     * Get Transactions
     * GET /v1/common/payments/transactions
     */
    async getTransactions(pageNo: number = 1, limit: number = 10): Promise<ApiResponse<TransactionsResponse>> {
        const response = await this.get<ApiResponse<TransactionsResponse>>("/common/payments/transactions", {
            pageNo: pageNo.toString(),
            limit: limit.toString()
        });
        if (!response) throw new Error("Failed to fetch transactions");
        return response;
    }

    /**
     * Get Transaction Detail
     * GET /v1/common/payments/transactions/:id
     */
    async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
        const response = await this.get<ApiResponse<Transaction>>(`/common/payments/transactions/${id}`);
        if (!response) throw new Error("Failed to fetch transaction details");
        return response;
    }

    /**
     * Get Balance
     * GET /v1/common/payments/balance
     */
    async getBalance(): Promise<ApiResponse<BalanceResponse>> {
        const response = await this.get<ApiResponse<BalanceResponse>>("/common/payments/balance");
        if (!response) throw new Error("Failed to fetch balance");
        return response;
    }

    /**
     * Deposit
     * POST /v1/common/payments/pay
     */
    async deposit(data: DepositRequest): Promise<ApiResponse<DepositResponse>> {
        const response = await this.post<ApiResponse<DepositResponse>>("/common/payments/pay", data);
        if (!response) throw new Error("Failed to initiate deposit");
        return response;
    }

    /**
     * Request Payout (Withdraw)
     * POST /v1/common/payments/payout
     */
    async requestPayout(data: PayoutRequest): Promise<ApiResponse<PayoutResponse>> {
        const response = await this.post<ApiResponse<PayoutResponse>>("/common/payments/payout", data);
        if (!response) throw new Error("Failed to request payout");
        return response;
    }

    /**
     * Get Payouts History
     * GET /v1/common/payments/payouts
     */
    async getPayouts(pageNo: number = 1, limit: number = 10): Promise<ApiResponse<unknown[]>> {
        const response = await this.get<ApiResponse<unknown[]>>("/common/payments/payouts", {
            pageNo: pageNo.toString(),
            limit: limit.toString()
        });
        if (!response) throw new Error("Failed to fetch payouts");
        return response;
    }

    /**
     * Change Password
     * PUT /v1/common/users/password
     * @param oldPassword - Only required if user has password provider (not Google/Apple)
     * @param newPassword - Must be at least 8 characters
     */
    async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
        const body: { oldPassword?: string; newPassword: string } = { newPassword };
        if (oldPassword) {
            body.oldPassword = oldPassword;
        }
        const response = await this.put<ApiResponse<void>>("/common/users/password", body);
        if (!response) throw new Error("Failed to change password");
        return response;
    }

}

export const commonService = new CommonService();
