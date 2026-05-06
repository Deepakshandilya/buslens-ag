"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import api from "@/lib/api";
import type { UserResponse } from "@/types/api";
import { Suspense } from "react";

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const login = useAuthStore((s) => s.login);
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const token = searchParams.get("token");
        const error = searchParams.get("error");

        if (error) {
            toast.error("Google sign-in failed. Please try again.");
            router.replace("/login");
            return;
        }

        if (!token) {
            router.replace("/login");
            return;
        }

        // Store token temporarily so the api interceptor can use it
        localStorage.setItem("buslens_token", token);

        // Fetch user profile with the new token
        api.get<UserResponse>("/users/me", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(({ data: userData }) => {
                login(token, userData);
                toast.success("Welcome to BusLens!");
                router.replace("/");
            })
            .catch(() => {
                localStorage.removeItem("buslens_token");
                toast.error("Authentication failed. Please try again.");
                router.replace("/login");
            });
    }, [searchParams, login, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground text-sm">Signing you in...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <CallbackContent />
        </Suspense>
    );
}
