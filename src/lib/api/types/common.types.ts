export interface Faq {
    id: string;
    type: string;
    question: string;
    answer: string;
}

export interface Address {
    id: string;
    location: string;
    phone: string;
    governorateId: string;
    cityId: string;
    detailedAddress: string;
}

export interface UserProfile {
    id: string;
    email: string;
    firstName?: string;
    fistName?: string; // API Typo
    lastName: string;
    fullName: string;
    avatar: string;
    locations: Address[];
    balance: number;
    type: string;
    storeName: string;
    phoneNumber: string;
    verified: boolean;
    reviews: {
        count: number;
        average: number;
    };
    authProviders: {
        emailProvider: boolean;
        googleProvider: boolean;
        appleProvider: boolean;
    };
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    storeName?: string;
    avatar?: string;
}

export interface HtmlContentResponse {
    data: string;
}

export interface Review {
    id: string;
    reviewerName: string;
    reviewerAvatar: string;
    rating: number;
    date: string;
    comment: string;
    // Add other fields if necessary based on API response
    createdAt?: string;
    updatedAt?: string;
    user?: {
        firstName: string;
        lastName: string;
        avatar: string;
    }
}

export interface VerificationRequest {
    firstName: string;
    lastName: string;
    birthDate: string; // ISO Date
    nationalNumber: string; // Number as string
    nationalCard: string; // Base64
    personWithCard: string; // Base64
}

export interface VerificationStatusResponse {
    status: number;
    message: string;
    data: string; // e.g., "PENDING"
}

export interface Notification {
    id: string;
    title: string;
    description: string;
    date: string;
    isRead: boolean;
    type: string; // "new_offer", "credit_added", etc.
    createdAt: string;
}

export interface TransactionDetail {
    ar: string;
    en: string;
}

export interface Transaction {
    id: string;
    amount: number;
    type: "deposit" | "withdraw" | "payout" | "order_payment" | "subscription_payment" | "refund" | "WITHDRAWAL"; // Added WITHDRAWAL based on API response
    status?: string; // made optional as it wasn't in the example item
    description?: string | TransactionDetail; // made optional
    date: string | { _seconds: number; _nanoseconds: number };
    currency?: string;
    method?: string;
    createdAt?: string;
}

export interface TransactionsResponse {
    items: Transaction[];
    pageItems: number;
    totalItems: number;
    isLastPage: boolean;
    nextPageNumber: number | null;
    currentPage: number;
    totalPages: number;
}

export interface BalanceResponse {
    balance: number;
    heldAmount: number;
    acceptedAmount: number;
}

export interface DepositRequest {
    amount: number;
    method: "card" | "wallet";
}

export interface DepositResponse {
    link: string;
}

export interface PayoutRequest {
    amount: number;
    method: string;
    accountNumber?: string;
}

export interface PayoutResponse {
    message: string;
}
