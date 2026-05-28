"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { analytics } from "@/lib/analytics";
import { useAuthStore } from "@/stores/authStore";
import type { Token, UserResponse } from "@/types/api";
import { AuthImageCarousel } from "@/components/layout/AuthImageCarousel";
import { AuthFloatingNav } from "@/components/layout/AuthFloatingNav";
import { BeamsBackground } from "@/components/ui/beams-background";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations";

export default function RegisterPage() {
    const router = useRouter();
    const login = useAuthStore((s) => s.login);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        try {
            // Register now returns a token (instant login)
            const { data: tokenData } = await api.post<Token>("/auth/register", {
                email: data.email,
                password: data.password,
            });

            // Fetch user profile with the new token
            localStorage.setItem("buslens_token", tokenData.access_token);
            const { data: userData } = await api.get<UserResponse>("/users/me", {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });

            login(tokenData.access_token, userData);
            analytics.signup();
            toast.success("Account created! Check your email for a verification code.");
            router.push("/");
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
                "Registration failed. Try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = () => {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";
        window.location.href = `${apiBase}/auth/google/login`;
    };

    return (
        <BeamsBackground intensity="medium" className="min-h-screen">
            <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
                {/* Main split card */}
                <div
                    className="relative w-full max-w-[960px] min-h-[620px] rounded-3xl overflow-visible shadow-2xl shadow-black/50 flex flex-col lg:flex-row"
                    style={{
                        background: "var(--auth-card-bg)",
                        border: "1px solid var(--auth-card-border)",
                        backdropFilter: "blur(20px)",
                    }}
                >
                    {/* Logo circle — at the edge of image section */}
                    <div className="hidden lg:block absolute top-6 left-[45%] -translate-x-1/2 z-20">
                        <AuthFloatingNav />
                    </div>
                    <div className="lg:hidden absolute top-4 left-1/2 -translate-x-1/2 z-20">
                        <AuthFloatingNav />
                    </div>

                    {/* Left — Image carousel */}
                    <div className="hidden lg:block lg:w-[45%] relative rounded-l-3xl overflow-hidden">
                        <AuthImageCarousel
                            tagline={"Join the Journey,\nRide Smarter"}
                            subtitle="Create an account and explore Chandigarh Tricity transit"
                        />
                    </div>

                    {/* Right — Form */}
                    <div className="flex-1 flex flex-col justify-center pt-20 pb-8 px-6 sm:pt-12 sm:px-12 lg:p-14">
                        <div className="w-full max-w-sm mx-auto">
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-foreground text-2xl font-bold" style={{ fontFamily: "var(--font-heading), sans-serif" }}>
                                    Create account
                                </h1>
                                <p className="text-base mt-2" style={{ color: "var(--auth-text-muted)" }}>
                                    Sign up to get started with BusLens
                                </p>
                            </div>

                            {/* Google auth */}
                            <button
                                type="button"
                                onClick={handleGoogleSignup}
                                className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-[var(--dropdown-hover)] cursor-pointer text-foreground"
                                style={{
                                    background: "var(--auth-google-bg)",
                                    border: "1px solid var(--auth-google-border)",
                                }}
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full" style={{ borderTop: "1px solid var(--auth-divider)" }} />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span
                                        className="px-3 rounded"
                                        style={{
                                            background: "var(--auth-divider-text-bg)",
                                            color: "var(--auth-divider-text)",
                                        }}
                                    >
                                        or continue with email
                                    </span>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <label htmlFor="reg-email" className="block text-sm font-medium mb-2" style={{ color: "var(--auth-label)" }}>
                                        Email address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--auth-icon)" }} />
                                        <input
                                            id="reg-email"
                                            type="email"
                                            {...register("email")}
                                            placeholder="you@example.com"
                                            className={`w-full h-12 pl-10 pr-4 rounded-xl text-sm text-[var(--auth-input-text)] placeholder-[var(--auth-input-placeholder)] auth-input outline-none transition-all duration-200 ${errors.email ? 'border border-destructive' : ''}`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="reg-password" className="block text-sm font-medium mb-2" style={{ color: "var(--auth-label)" }}>
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--auth-icon)" }} />
                                        <input
                                            id="reg-password"
                                            type={showPassword ? "text" : "password"}
                                            {...register("password")}
                                            placeholder="Min. 6 characters"
                                            className={`w-full h-12 pl-10 pr-12 rounded-xl text-sm text-[var(--auth-input-text)] placeholder-[var(--auth-input-placeholder)] auth-input outline-none transition-all duration-200 ${errors.password ? 'border border-destructive' : ''}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                                            style={{ color: "var(--auth-icon)" }}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="reg-confirm" className="block text-sm font-medium mb-2" style={{ color: "var(--auth-label)" }}>
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--auth-icon)" }} />
                                        <input
                                            id="reg-confirm"
                                            type={showPassword ? "text" : "password"}
                                            {...register("confirmPassword")}
                                            placeholder="Repeat password"
                                            className={`w-full h-12 pl-10 pr-4 rounded-xl text-sm text-[var(--auth-input-text)] placeholder-[var(--auth-input-placeholder)] auth-input outline-none transition-all duration-200 ${errors.confirmPassword ? 'border border-destructive' : ''}`}
                                        />
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 rounded-xl text-[15px] font-semibold text-primary-foreground transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98] shadow-lg"
                                    style={{
                                        background: "var(--brand-gradient)",
                                        boxShadow: "0 4px 20px var(--brand-glow)",
                                    }}
                                >
                                    {loading ? "Creating account..." : "Create account"}
                                </button>
                            </form>

                            <p className="mt-8 text-center text-sm" style={{ color: "var(--auth-footer)" }}>
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="font-semibold hover:underline transition-colors"
                                    style={{ color: "var(--auth-link)" }}
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </BeamsBackground>
    );
}
