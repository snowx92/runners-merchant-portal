import { useState, useEffect, useCallback } from "react";
import { commonService } from "../api/services/commonService";
import { UserProfile } from "../api/types/common.types";

export function useUserProfile() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async () => {
        try {
            setLoading(true);
            const response = await commonService.getUserProfile();
            if (response && response.data) {
                // Handle both wrapped and unwrapped responses if necessary, 
                // but based on service implementation it returns ApiResponse<UserProfile>
                // and we want user data.
                // Helper to extract data if it's nested
                const userData = response.data;
                setUser(userData);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch user profile");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return { user, loading, error, refetch: fetchUser };
}
