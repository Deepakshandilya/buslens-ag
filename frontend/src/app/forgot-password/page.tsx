"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { BeamsBackground } from "@/components/ui/beams-background";
import { AuthFloatingNav } from "@/components/layout/AuthFloatingNav";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setLoading(true);
        try {
            await api.post("/auth/forgot-password", { email: data.email });
            setSent(true);
            toast.success("Reset code sent! Check your email.");
        } catch (err: unknown) {
            const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            if (detail?.includes("wait")) {
                toast.error(detail);
            } else {
                // Always show success to prevent email enumeration
                setSent(true);
                toast.success("If an account exists, a reset code has been sent.");
            }
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
                                href="/login"
                                className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors hover:opacity-80"
                                style={{ color: "var(--auth-text-muted)" }}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to login
                            </Link>

                            {!sent ? (
                                <>
                                    {/* Header */}
                                    <div className="mb-8">
                                        <div
                                            className="flex h-14 w-14 items-center justify-center rounded-2xl mb-5 bg-[var(--auth-icon-bg)]"
                                        >
                                            <KeyRound className="h-7 w-7 text-primary" />
                                        </div>
                                        <h1
                                            className="text-2xl font-bold text-foreground"
                                            style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                        >
                                            Forgot password?
                                        </h1>
                                        <p className="text-sm mt-2" style={{ color: "var(--auth-text-muted)" }}>
                                            No worries! Enter your email and we&apos;ll send you a reset code.
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                        <div>
                                            <label
                                                htmlFor="forgot-email"
                                                className="block text-sm font-medium mb-2"
                                                style={{ color: "var(--auth-label)" }}
                                            >
                                                Email address
                                            </label>
                                            <div className="relative">
                                                <Mail
                                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                                                    style={{ color: "var(--auth-icon)" }}
                                                />
                                                <input
                                                    id="forgot-email"
                                                    type="email"
                                                    {...register("email")}
                                                    placeholder="you@example.com"
                                                    className={`w-full h-12 pl-10 pr-4 rounded-xl text-sm text-[var(--auth-input-text)] placeholder-[var(--auth-input-placeholder)] auth-input outline-none transition-all duration-200 ${errors.email ? "border border-destructive" : ""}`}
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
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
                                            {loading ? "Sending..." : "Send reset code"}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <>
                                    {/* Success state */}
                                    <div className="text-center">
                                        <div
                                            className="flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-5 bg-emerald-500/15"
                                        >
                                            <Mail className="h-8 w-8 text-emerald-500" />
                                        </div>
                                        <h2
                                            className="text-xl font-bold text-foreground mb-2"
                                            style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                        >
                                            Check your email
                                        </h2>
                                        <p className="text-sm mb-6" style={{ color: "var(--auth-text-muted)" }}>
                                            We sent a reset code to{" "}
                                            <span className="font-medium text-primary">
                                                {getValues("email")}
                                            </span>
                                        </p>

                                        <button
                                            onClick={() =>
                                                router.push(`/reset-password?email=${encodeURIComponent(getValues("email"))}`)
                                            }
                                            className="w-full h-12 rounded-xl text-[15px] font-semibold text-primary-foreground transition-all duration-200 cursor-pointer hover:brightness-110 active:scale-[0.98] shadow-lg"
                                            style={{
                                                background: "var(--brand-gradient)",
                                                boxShadow: "0 4px 20px var(--brand-glow)",
                                            }}
                                        >
                                            Enter reset code
                                        </button>

                                        <button
                                            onClick={() => setSent(false)}
                                            className="mt-3 text-sm font-medium transition-colors hover:opacity-80"
                                            style={{ color: "var(--auth-text-muted)" }}
                                        >
                                            Didn&apos;t receive it? Try again
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
