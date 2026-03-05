"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Toaster } from "@/components/ui/sonner";

function AuthHydration() {
    const hydrate = useAuthStore((s) => s.hydrate);
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

    return (
        <QueryClientProvider client={queryClient}>
            <AuthHydration />
            {children}
            <Toaster position="top-right" richColors />
        </QueryClientProvider>
    );
}
