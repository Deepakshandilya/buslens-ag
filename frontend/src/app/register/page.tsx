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
import { toast } from "sonner";
import api from "@/lib/api";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !confirmPassword) return;

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/register", { email, password });
            toast.success("Account created! Please sign in.");
            router.push("/login");
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
        toast.info("Google signup coming soon!");
    };

    return (
        <div className="min-h-screen flex">
            {/* Left brand panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500/10 via-background to-primary/10 items-center justify-center p-12">
                <div className="max-w-md text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mx-auto mb-6">
                        <Bus className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight mb-3">
                        Join Bus<span className="text-primary">Lens</span>
                    </h2>
                    <p className="text-muted-foreground">
                        Create an account to save your favorite routes, track search history,
                        and get personalized transit suggestions.
                    </p>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
                <Card className="w-full max-w-md border-border/30 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight">
                                Create your account
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Sign up to get started with BusLens
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full mb-4"
                            onClick={handleGoogleSignup}
                        >
                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </Button>

                        <div className="relative my-6">
                            <Separator />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                                or
                            </span>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <Label htmlFor="email" className="text-sm">Email</Label>
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
                                <Label htmlFor="password" className="text-sm">Password</Label>
                                <div className="relative mt-1.5">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        className="pl-9 pr-10"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="confirm" className="text-sm">Confirm Password</Label>
                                <div className="relative mt-1.5">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirm"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat password"
                                        className="pl-9"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full font-semibold" size="lg" disabled={loading}>
                                {loading ? "Creating account..." : "Create account"}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="font-medium text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
