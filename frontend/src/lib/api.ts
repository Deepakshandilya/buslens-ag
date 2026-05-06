import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
    },
});

// Attach Bearer token from localStorage on every request
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("buslens_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle 401 responses — auto-logout on expired/invalid tokens
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401 &&
            typeof window !== "undefined" &&
            !error.config?.url?.includes("/auth/login")
        ) {
            localStorage.removeItem("buslens_token");
            localStorage.removeItem("buslens_user");

            // Dynamically import to avoid circular deps
            import("@/stores/authStore").then(({ useAuthStore }) => {
                useAuthStore.getState().logout();
            });

            toast.error("Session expired. Please sign in again.");

            // Redirect to homepage
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default api;
