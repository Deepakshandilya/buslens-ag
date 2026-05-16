"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { Toaster } from "@/components/ui/sonner";

function AuthHydration() {
    const hydrate = useAuthStore((s) => s.hydrate);
    const validateToken = useAuthStore((s) => s.validateToken);
    const isHydrated = useAuthStore((s) => s.isHydrated);
    useEffect(() => {
        hydrate();
    }, [hydrate]);
    // After hydration, validate the token against the backend
    useEffect(() => {
        if (isHydrated) {
            validateToken();
        }
    }, [isHydrated, validateToken]);
    return null;
}

function ThemeHydration() {
    const hydrate = useThemeStore((s) => s.hydrate);
    useEffect(() => {
        hydrate();
    }, [hydrate]);
    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        retry: 1,
                    },
                },
            })
    );

    const isHydrated = useAuthStore((s) => s.isHydrated);

    return (
        <QueryClientProvider client={queryClient}>
            <AuthHydration />
            <ThemeHydration />
            {children}
            {!isHydrated && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-[9999]">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                    <p className="text-foreground text-sm tracking-widest uppercase font-bold drop-shadow-lg drop-shadow-black">Loading</p>
                </div>
            )}
            <Toaster position="top-right" richColors />
        </QueryClientProvider>
    );
}
