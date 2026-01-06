export interface User {
    id: string;
    email: string;
    name?: string;
    role?: "merchant" | "admin";
}

export interface AuthResponse {
    user: User;
    token: string;
}
