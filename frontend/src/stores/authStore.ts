import { create } from "zustand";
import type { UserResponse } from "@/types/api";

interface AuthState {
    user: UserResponse | null;
    token: string | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    login: (token: string, user: UserResponse) => void;
    logout: () => void;
    hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isHydrated: false,

    login: (token, user) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("buslens_token", token);
            localStorage.setItem("buslens_user", JSON.stringify(user));
        }
        set({ token, user, isAuthenticated: true, isHydrated: true });
    },

    logout: () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("buslens_token");
            localStorage.removeItem("buslens_user");
        }
        set({ token: null, user: null, isAuthenticated: false });
    },

    hydrate: () => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("buslens_token");
            const userStr = localStorage.getItem("buslens_user");
            if (token && userStr) {
                try {
                    const user = JSON.parse(userStr) as UserResponse;
                    set({ token, user, isAuthenticated: true, isHydrated: true });
                    return;
                } catch {
                    // fall through
                }
            }
            set({ isHydrated: true });
        }
    },
}));
