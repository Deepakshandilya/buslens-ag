"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, Mail } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { BeamsBackground } from "@/components/ui/beams-background";
import { AuthFloatingNav } from "@/components/layout/AuthFloatingNav";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromParams = searchParams.get("email") || "";

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!emailFromParams) {
            toast.error("Missing email. Please go back and try again.");
            return;
        }
        setLoading(true);
        try {
            await api.post("/auth/reset-password", {
                email: emailFromParams,
                otp: data.otp,
                new_password: data.newPassword,
            });
            setSuccess(true);
            toast.success("Password reset successfully!");
        } catch (err: unknown) {
            const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            toast.error(detail || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <BeamsBackground intensity="medium" className="min-h-screen">
            <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
                <div
                    className="relative w-full max-w-md rounded-3xl overflow-visible shadow-2xl shadow-black/50"
                    style={{
                        background: "var(--auth-card-bg)",
                        border: "1px solid var(--auth-card-border)",
                        backdropFilter: "blur(20px)",
                    }}
                >
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                        <AuthFloatingNav />
                    </div>

                    <div className="flex flex-col justify-center pt-20 pb-8 px-6 sm:px-12">
                        <div className="w-full max-w-sm mx-auto">
                            {/* Back link */}
                            <Link
                                href="/forgot-password"
                                className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors hover:opacity-80"
                                style={{ color: "var(--auth-text-muted)" }}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Link>

                            {!success ? (
                                <>
                                    {/* Header */}
                                    <div className="mb-8">
                                        <div
                                            className="flex h-14 w-14 items-center justify-center rounded-2xl mb-5 bg-[var(--auth-icon-bg)]"
                                        >
                                            <Lock className="h-7 w-7 text-primary" />
                                        </div>
                                        <h1
                                            className="text-2xl font-bold text-foreground"
                                            style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                        >
                                            Set new password
                                        </h1>
                                        <p className="text-sm mt-2" style={{ color: "var(--auth-text-muted)" }}>
                                            Enter the 6-digit code sent to{" "}
                                            <span className="font-medium text-primary">
                                                {emailFromParams || "your email"}
                                            </span>{" "}
                                            and choose a new password.
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                        {/* OTP field */}
                                        <div>
                                            <label
                                                htmlFor="reset-otp"
                                                className="block text-sm font-medium mb-2"
                                                style={{ color: "var(--auth-label)" }}
                                            >
                                                Reset code
                                            </label>
                                            <div className="relative">
                                                <Mail
                                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                                                    style={{ color: "var(--auth-icon)" }}
                                                />
                                                <input
                                                    id="reset-otp"
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    {...register("otp")}
                                                    placeholder="000000"
                                                    className={`w-full h-12 pl-10 pr-4 rounded-xl text-sm text-[var(--auth-input-text)] font-mono tracking-[4px] text-center placeholder-[var(--auth-input-placeholder)] auth-input outline-none transition-all duration-200 ${errors.otp ? "border border-destructive" : ""}`}
                                                />
                                            </div>
                                            {errors.otp && (
                                                <p className="text-red-500 text-xs mt-1">{errors.otp.message}</p>
                                            )}
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label
                                                htmlFor="reset-password"
                                                className="block text-sm font-medium mb-2"
                                                style={{ color: "var(--auth-label)" }}
                                            >
                                                New password
                                            </label>
                                            <div className="relative">
                                                <Lock
                                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                                                    style={{ color: "var(--auth-icon)" }}
                                                />
                                                <input
                                                    id="reset-password"
                                                    type={showPassword ? "text" : "password"}
                                                    {...register("newPassword")}
                                                    placeholder="••••••••"
                                                    className={`w-full h-12 pl-10 pr-12 rounded-xl text-sm text-[var(--auth-input-text)] placeholder-[var(--auth-input-placeholder)] auth-input outline-none transition-all duration-200 ${errors.newPassword ? "border border-destructive" : ""}`}
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
                                            {errors.newPassword && (
                                                <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label
                                                htmlFor="reset-confirm-password"
                                                className="block text-sm font-medium mb-2"
                                                style={{ color: "var(--auth-label)" }}
                                            >
                                                Confirm new password
                                            </label>
                                            <div className="relative">
                                                <Lock
                                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                                                    style={{ color: "var(--auth-icon)" }}
                                                />
                                                <input
                                                    id="reset-confirm-password"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    {...register("confirmPassword")}
                                                    placeholder="••••••••"
                                                    className={`w-full h-12 pl-10 pr-12 rounded-xl text-sm text-[var(--auth-input-text)] placeholder-[var(--auth-input-placeholder)] auth-input outline-none transition-all duration-200 ${errors.confirmPassword ? "border border-destructive" : ""}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                                                    style={{ color: "var(--auth-icon)" }}
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
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
                                            {loading ? "Resetting..." : "Reset password"}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <>
                                    {/* Success state */}
                                    <div className="text-center">
                                        <div
                                            className="flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-5 bg-green-500/15"
                                        >
                                            <ShieldCheck className="h-8 w-8 text-emerald-500" />
                                        </div>
                                        <h2
                                            className="text-xl font-bold text-foreground mb-2"
                                            style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                        >
                                            Password reset!
                                        </h2>
                                        <p className="text-sm mb-6" style={{ color: "var(--auth-text-muted)" }}>
                                            Your password has been updated successfully. You can now log in with your new password.
                                        </p>

                                        <button
                                            onClick={() => router.push("/login")}
                                            className="w-full h-12 rounded-xl text-[15px] font-semibold text-primary-foreground transition-all duration-200 cursor-pointer hover:brightness-110 active:scale-[0.98] shadow-lg"
                                            style={{
                                                background: "var(--brand-gradient)",
                                                boxShadow: "0 4px 20px var(--brand-glow)",
                                            }}
                                        >
                                            Go to login
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </BeamsBackground>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={null}>
            <ResetPasswordContent />
        </Suspense>
    );
}
