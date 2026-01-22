import { useState, useEffect } from "react";
import { SessionManager } from "@/lib/utils/session";

export function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const sessionManager = SessionManager.getInstance();
            const token = await sessionManager.getCurrentToken();
            setIsLoggedIn(!!token);
            setLoading(false);
        };

        checkAuth();
    }, []);

    return { isLoggedIn, loading };
}
