"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Clock,
    Heart,
    Trash2,
    Search,
    ArrowRight,
    Bus,
    MapPin,
    RotateCcw,
    ChevronRight,
    ShieldCheck,
    Mail,
    RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/stores/authStore";
import { useHistory } from "@/hooks/useHistory";
import { useFavorites, useDeleteFavorite } from "@/hooks/useFavorites";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageBackground } from "@/components/layout/PageBackground";
import type { UserResponse } from "@/types/api";

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(tabParam === "favorites" ? "favorites" : "history");
    const { isAuthenticated, isHydrated, user, setUser } = useAuthStore();

    // Verification state
    const [otpValue, setOtpValue] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resending, setResending] = useState(false);

    // Sync tab with URL
    useEffect(() => {
        if (tabParam === "favorites") {
            setActiveTab("favorites");
        } else if (tabParam === "history") {
            setActiveTab("history");
        }
    }, [tabParam]);

    useEffect(() => {
        if (isHydrated && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isHydrated, router]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleVerifyOTP = useCallback(async () => {
        if (otpValue.length !== 6) {
            toast.error("Please enter a 6-digit code");
            return;
        }
        setVerifying(true);
        try {
            await api.post("/auth/verify-email", { otp: otpValue });
            // Refresh user data in store
            const { data: updatedUser } = await api.get<UserResponse>("/users/me");
            setUser(updatedUser);
            toast.success("Email verified successfully!");
            setOtpValue("");
        } catch {
            toast.error("Invalid or expired code. Try again.");
        } finally {
            setVerifying(false);
        }
    }, [otpValue, setUser]);

    const handleResendOTP = useCallback(async () => {
        setResending(true);
        try {
            await api.post("/auth/resend-otp");
            toast.success("Verification code sent to your email");
            setResendCooldown(60);
        } catch (err: unknown) {
            const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            toast.error(detail || "Failed to resend code");
        } finally {
            setResending(false);
        }
    }, []);

    const {
        data: history,
        isLoading: historyLoading,
        refetch: refetchHistory,
    } = useHistory();

    const {
        data: favorites,
        isLoading: favoritesLoading,
        refetch: refetchFavorites,
    } = useFavorites();

    const deleteFavorite = useDeleteFavorite();

    if (!isHydrated) {
        return (
            <PageBackground>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4 relative z-10">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
            </PageBackground>
        );
    }

    if (!isAuthenticated) return null;

    const handleClearHistory = async () => {
        try {
            await api.delete("/users/me/history");
            refetchHistory();
            toast.success("Search history cleared");
        } catch {
            toast.error("Failed to clear history");
        }
    };

    const handleClearFavorites = async () => {
        try {
            await api.delete("/users/me/favorites");
            refetchFavorites();
            toast.success("All favorites cleared");
        } catch {
            toast.error("Failed to clear favorites");
        }
    };

    const handleRemoveFavorite = (id: number) => {
        deleteFavorite.mutate(id, {
            onSuccess: () => toast.success("Favorite removed"),
            onError: () => toast.error("Failed to remove favorite"),
        });
    };

    const handleSearchAgain = (item: { from_stop_id: number; to_stop_id: number; from_stop_name?: string | null; to_stop_name?: string | null }) => {
        const fromParam = item.from_stop_name || String(item.from_stop_id);
        const toParam = item.to_stop_name || String(item.to_stop_id);
        router.push(`/search?from=${encodeURIComponent(fromParam)}&to=${encodeURIComponent(toParam)}`);
    };

    return (
        <PageBackground>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <h1
                        className="text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                    >
                        Dashboard
                    </h1>
                    <p className="text-base text-muted-foreground mt-1">
                        Welcome back, <span className="text-primary font-medium">{user?.email}</span>
                    </p>
                </div>

                {/* Email Verification Banner */}
                {user && !user.is_verified && (
                    <Card
                        className="mb-6 overflow-hidden"
                        style={{
                            background: "linear-gradient(135deg, oklch(0.22 0.04 280 / 90%), oklch(0.18 0.03 290 / 90%))",
                            border: "1px solid oklch(0.72 0.12 290 / 20%)",
                        }}
                    >
                        <CardContent className="p-5 sm:p-6">
                            <div className="flex items-start gap-4">
                                <div
                                    className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0"
                                    style={{ background: "oklch(0.72 0.12 290 / 15%)" }}
                                >
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold mb-1">Verify your email</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Enter the 6-digit code sent to <span className="text-primary font-medium">{user.email}</span> to
                                        unlock favorites and search history.
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                        <div className="relative flex-1 max-w-[200px]">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                placeholder="000000"
                                                value={otpValue}
                                                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                onKeyDown={(e) => { if (e.key === "Enter") handleVerifyOTP(); }}
                                                className="w-full h-10 pl-9 pr-3 rounded-lg text-sm font-mono tracking-[4px] text-center bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleVerifyOTP}
                                            disabled={verifying || otpValue.length !== 6}
                                            size="sm"
                                            className="h-10 px-5 rounded-lg font-semibold"
                                            style={{
                                                background: "linear-gradient(135deg, oklch(0.68 0.15 280), oklch(0.72 0.12 295))",
                                            }}
                                        >
                                            {verifying ? "Verifying..." : "Verify"}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleResendOTP}
                                            disabled={resending || resendCooldown > 0}
                                            className="h-10 gap-1.5 text-muted-foreground hover:text-foreground"
                                        >
                                            <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
                                            {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                        <TabsTrigger value="history" className="gap-2 text-[15px] font-semibold">
                            <Clock className="h-4.5 w-4.5" />
                            Search History
                        </TabsTrigger>
                        <TabsTrigger value="favorites" className="gap-2 text-[15px] font-semibold">
                            <Heart className="h-4.5 w-4.5" />
                            Favourites
                        </TabsTrigger>
                    </TabsList>

                    {/* History Tab */}
                    <TabsContent value="history" className="space-y-3">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-muted-foreground">
                                {history ? `${history.length} search${history.length !== 1 ? "es" : ""}` : ""}
                            </p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1.5">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Clear all
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Clear search history?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete all your search history.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Clear all
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        {historyLoading && (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Card key={i} className="border-border/40">
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <Skeleton className="h-11 w-11 rounded-xl" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-48" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {history && history.length === 0 && (
                            <Card
                                style={{
                                    background: "oklch(0.17 0.02 285 / 80%)",
                                    border: "1px solid oklch(1 0.02 285 / 6%)",
                                }}
                            >
                                <CardContent className="p-10 text-center">
                                    <Search className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-heading), sans-serif" }}>
                                        No search history
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your route searches will appear here
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {history && history.map((item) => (
                            <Card
                                key={item.id}
                                className="group cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                                style={{
                                    background: "oklch(0.195 0.02 285 / 90%)",
                                    border: "1px solid oklch(1 0.02 285 / 8%)",
                                }}
                                onClick={() => handleSearchAgain(item)}
                            >
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0"
                                            style={{ background: "oklch(0.72 0.12 290 / 12%)" }}
                                        >
                                            <Search className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-base font-semibold">
                                                <span>{item.from_stop_name || `Stop #${item.from_stop_id}`}</span>
                                                <ArrowRight className="h-4 w-4 text-primary" />
                                                <span>{item.to_stop_name || `Stop #${item.to_stop_id}`}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                {new Date(item.searched_at).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSearchAgain(item);
                                        }}
                                        className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10 rounded-xl"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Again
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* Favorites Tab */}
                    <TabsContent value="favorites" className="space-y-3">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-muted-foreground">
                                {favorites ? `${favorites.length} favourite${favorites.length !== 1 ? "s" : ""}` : ""}
                            </p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1.5">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Clear all
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Clear all favourites?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will remove all saved favourites.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleClearFavorites} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Clear all
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        {favoritesLoading && (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Card key={i} className="border-border/40">
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <Skeleton className="h-11 w-11 rounded-xl" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-36" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {favorites && favorites.length === 0 && (
                            <Card
                                style={{
                                    background: "oklch(0.17 0.02 285 / 80%)",
                                    border: "1px solid oklch(1 0.02 285 / 6%)",
                                }}
                            >
                                <CardContent className="p-10 text-center">
                                    <Heart className="h-14 w-14 mx-auto text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-heading), sans-serif" }}>
                                        No favourites saved
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Heart a route to save it here
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {favorites && favorites.map((fav) => (
                            <Card
                                key={fav.id}
                                className="group cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                                style={{
                                    background: "oklch(0.195 0.02 285 / 90%)",
                                    border: "1px solid oklch(1 0.02 285 / 8%)",
                                }}
                                onClick={() => {
                                    if (fav.route_number) {
                                        router.push(`/bus/${encodeURIComponent(fav.route_number)}`);
                                    } else if (fav.stop_id) {
                                        router.push(`/stop/${fav.stop_id}`);
                                    }
                                }}
                            >
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0 shadow-md"
                                            style={{
                                                background: fav.route_id
                                                    ? "linear-gradient(135deg, oklch(0.68 0.15 280), oklch(0.72 0.12 295))"
                                                    : "oklch(0.72 0.12 290 / 15%)",
                                            }}
                                        >
                                            {fav.route_id ? (
                                                <Bus className="h-5 w-5 text-white" />
                                            ) : (
                                                <MapPin className="h-5 w-5 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold">
                                                {fav.route_number
                                                    ? `Route ${fav.route_number}`
                                                    : fav.stop_name
                                                        ? fav.stop_name
                                                        : `Stop #${fav.stop_id}`}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {fav.route_number
                                                    ? `${fav.direction || "Bus Route"} · ${new Date(fav.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                                                    : `Bus Stop · ${new Date(fav.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-muted-foreground hover:text-destructive rounded-full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFavorite(fav.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
        </PageBackground>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <PageBackground>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4 relative z-10">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
            </PageBackground>
        }>
            <DashboardContent />
        </Suspense>
    );
}
