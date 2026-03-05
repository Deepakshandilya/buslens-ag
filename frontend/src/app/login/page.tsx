"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Bus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Token, UserResponse } from "@/types/api";

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((s) => s.login);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        try {
            // Backend uses OAuth2PasswordRequestForm (form-urlencoded)
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            const { data: tokenData } = await api.post<Token>("/auth/login", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            // Store token first so the next request has it
            localStorage.setItem("buslens_token", tokenData.access_token);

            // Fetch user profile
            const { data: userData } = await api.get<UserResponse>("/users/me", {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });

            login(tokenData.access_token, userData);
            toast.success("Welcome back!");
            router.push("/");
        } catch {
            toast.error("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        toast.info("Google login coming soon!");
    };

    return (
        <div className="min-h-screen flex">
            {/* Left brand panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-background to-blue-500/10 items-center justify-center p-12">
                <div className="max-w-md text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mx-auto mb-6">
                        <Bus className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight mb-3">
                        Bus<span className="text-primary">Lens</span>
                    </h2>
                    <p className="text-muted-foreground">
                        Your smart companion for navigating bus routes across Chandigarh
                        Tricity. Search, save, and track your favorite routes.
                    </p>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
                <Card className="w-full max-w-md border-border/30 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Sign in to your account to continue
                            </p>
                        </div>

                        {/* Google auth button */}
                        <Button
                            variant="outline"
                            className="w-full mb-4"
                            onClick={handleGoogleLogin}
                        >
                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </Button>

                        <div className="relative my-6">
                            <Separator />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                                or
                            </span>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label htmlFor="email" className="text-sm">
                                    Email
                                </Label>
                                <div className="relative mt-1.5">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="pl-9"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-sm">
                                    Password
                                </Label>
                                <div className="relative mt-1.5">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="pl-9 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full font-semibold" size="lg" disabled={loading}>
                                {loading ? "Signing in..." : "Sign in"}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="font-medium text-primary hover:underline"
                            >
                                Sign up
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
