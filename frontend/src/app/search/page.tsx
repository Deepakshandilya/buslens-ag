"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import {
    ArrowRight,
    Heart,
    Eye,
    Bus,
    ArrowLeft,
    MapPin,
    Circle,
    Route,
    Clock,
    ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/authStore";
import { useRouteSearch } from "@/hooks/useRouteSearch";
import { useFavorites, useAddFavorite } from "@/hooks/useFavorites";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/layout/PageBackground";

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    const { data: results, isLoading, isError } = useRouteSearch(from, to);
    const { data: favorites } = useFavorites();
    const addFavorite = useAddFavorite();

    const [addingRoutes, setAddingRoutes] = useState<Set<number>>(new Set());

    const isFavorited = (routeId: number) =>
        favorites?.some((f) => f.route_id === routeId) ?? false;

    const handleFavorite = (routeId: number, routeNumber: string) => {
        if (!isAuthenticated) {
            toast.error("Please login to save favorites");
            router.push("/");
            return;
        }

        if (isFavorited(routeId)) {
            toast.info(`Route ${routeNumber} is already in favorites`);
            return;
        }

        setAddingRoutes((prev) => new Set(prev).add(routeId));
        addFavorite.mutate(
            { route_id: routeId },
            {
                onSuccess: () => {
                    toast.success(`Route ${routeNumber} added to favorites!`);
                    setAddingRoutes((prev) => {
                        const next = new Set(prev);
                        next.delete(routeId);
                        return next;
                    });
                },
                onError: () => {
                    toast.error("Failed to add favorite");
                    setAddingRoutes((prev) => {
                        const next = new Set(prev);
                        next.delete(routeId);
                        return next;
                    });
                },
            }
        );
    };

    return (
        <PageBackground>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-8 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/")}
                        className="mb-4 -ml-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to search
                    </Button>

                    <h1
                        className="text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                    >
                        Routes found
                    </h1>

                    {/* Journey summary — premium card, mobile stacked */}
                    <Card
                        className="mt-4 overflow-hidden"
                        style={{
                            background: "var(--surface-elevated)",
                            border: "1px solid var(--surface-border)",
                        }}
                    >
                        <CardContent className="p-4 sm:p-5">
                            {/* Mobile: vertical stack; desktop: horizontal row */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                {/* From */}
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--route-start-bg)" }}>
                                        <MapPin className="h-4 w-4" style={{ color: "var(--route-start)" }} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">From</p>
                                        <p className="text-sm font-bold truncate">{from}</p>
                                    </div>
                                </div>

                                {/* Arrow connector — horizontal on desktop, small text on mobile */}
                                <div className="flex items-center gap-2 shrink-0 sm:px-2">
                                    <div className="hidden sm:block w-5 h-[2px]" style={{ background: "var(--result-connector)" }} />
                                    <Route className="h-4 w-4 text-primary" />
                                    <div className="hidden sm:block w-5 h-[2px]" style={{ background: "var(--result-connector)" }} />
                                </div>

                                {/* To */}
                                <div className="flex items-center gap-2.5 flex-1 min-w-0 sm:justify-end sm:text-right">
                                    <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--route-end-bg)" }}>
                                        <MapPin className="h-4 w-4" style={{ color: "var(--route-end)" }} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">To</p>
                                        <p className="text-sm font-bold truncate">{to}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {results && (
                        <p className="text-base text-muted-foreground mt-3">
                            {results.length} route{results.length !== 1 ? "s" : ""} available
                        </p>
                    )}
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="border-border/40">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-14 w-14 rounded-2xl" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-6 w-32" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-20 w-full rounded-xl" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <Card className="border-destructive/30">
                        <CardContent className="p-6 text-center">
                            <p className="text-destructive font-medium">
                                Could not fetch routes. Is the backend online?
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Make sure FastAPI is running at localhost:8000
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* No results */}
                {results && results.length === 0 && (
                    <Card className="border-border/40">
                        <CardContent className="p-12 text-center">
                            <Bus className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-heading), sans-serif" }}>
                                No direct routes found
                            </h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                There are no direct bus routes between these two stops.
                                Try searching for nearby stops.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Results */}
                {results && results.length > 0 && (
                    <div className="space-y-4">
                        {results.map((route, i) => {
                            const fav = isFavorited(route.route_id);
                            const adding = addingRoutes.has(route.route_id);
                            const stopCount = Math.abs(route.to_sequence - route.from_sequence);

                            return (
                                <motion.div
                                    key={`${route.route_id}-${i}`}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.35,
                                        delay: i * 0.08,
                                        ease: [0.25, 0.46, 0.45, 0.94],
                                    }}
                                >
                                    <Card
                                        className="group overflow-hidden transition-all duration-300 cursor-pointer hover:scale-[1.01]"
                                        style={{
                                            background: "var(--result-card-bg)",
                                            border: "1px solid var(--result-card-border)",
                                        }}
                                        onClick={() =>
                                            router.push(
                                                `/route/${route.route_number}/${route.direction}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
                                            )
                                        }
                                    >
                                        <CardContent className="p-0">
                                            {/* Top section — Bus number + actions */}
                                            <div className="p-5 sm:p-6 pb-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3.5">
                                                        {/* Bus badge — large and prominent */}
                                                        <div
                                                            className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg"
                                                            style={{
                                                                background: "var(--brand-gradient)",
                                                                boxShadow: "0 4px 16px var(--brand-glow)",
                                                            }}
                                                        >
                                                            <span
                                                                className="text-lg font-extrabold tracking-tight text-primary-foreground"
                                                                style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                                            >
                                                                {route.route_number}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h3
                                                                className="text-xl font-bold tracking-tight"
                                                                style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                                            >
                                                                Route {route.route_number}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge
                                                                    variant={route.direction === "UP" ? "default" : "secondary"}
                                                                    className="text-xs font-bold px-2.5 py-0.5"
                                                                >
                                                                    {route.direction === "UP" ? "↑ UP" : "↓ DOWN"}
                                                                </Badge>
                                                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    {stopCount} stops
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={adding}
                                                            className={`h-10 w-10 rounded-full transition-colors ${fav
                                                                ? "text-red-500 hover:text-red-400"
                                                                : "text-muted-foreground hover:text-red-400"
                                                                }`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleFavorite(route.route_id, route.route_number);
                                                            }}
                                                        >
                                                            <Heart
                                                                className="h-5 w-5"
                                                                fill={fav ? "currentColor" : "none"}
                                                            />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Journey visualization — mobile stack, desktop horizontal */}
                                            <div
                                                className="mx-4 sm:mx-6 mb-4 p-3 sm:p-4 rounded-xl"
                                                style={{
                                                    background: "var(--result-inner-bg)",
                                                    border: "1px solid var(--result-inner-border)",
                                                }}
                                            >
                                                {/* Mobile: column layout to prevent text truncation */}
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                                                    {/* From */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="h-3.5 w-3.5 rounded-full shrink-0"
                                                                style={{
                                                                    background: "var(--route-start)",
                                                                    boxShadow: "0 0 0 3px var(--route-start-bg)",
                                                                }}
                                                            />
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold">Board at</p>
                                                                <p className="text-sm font-bold truncate">{from}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Connecting line with stop count — centered on both layouts */}
                                                    <div className="flex items-center gap-1 sm:mx-3 shrink-0 pl-5 sm:pl-0">
                                                        <div className="hidden sm:block w-4 h-[2px]" style={{ background: "var(--result-connector)" }} />
                                                        <div
                                                            className="px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap"
                                                            style={{
                                                                background: "var(--result-stops-badge-bg)",
                                                                color: "var(--result-stops-badge-text)",
                                                                border: "1px solid var(--result-stops-badge-border)",
                                                            }}
                                                        >
                                                            {stopCount} {stopCount === 1 ? "stop" : "stops"}
                                                        </div>
                                                        <div className="hidden sm:block w-4 h-[2px]" style={{ background: "var(--result-connector)" }} />
                                                    </div>

                                                    {/* To */}
                                                    <div className="flex-1 min-w-0 sm:text-right">
                                                        <div className="flex items-center gap-2 sm:justify-end">
                                                            <div
                                                                className="h-3.5 w-3.5 rounded-full shrink-0"
                                                                style={{
                                                                    background: "var(--route-end)",
                                                                    boxShadow: "0 0 0 3px var(--route-end-bg)",
                                                                }}
                                                            />
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold">Alight at</p>
                                                                <p className="text-sm font-bold truncate">{to}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Intermediate stops — collapsible preview */}
                                            {route.stops_between && route.stops_between.length > 0 && (
                                                <div className="px-4 sm:px-6 mb-4">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <Circle className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                                        {route.stops_between.slice(0, 4).map((stop, j) => (
                                                            <span key={j} className="flex items-center">
                                                                <span
                                                                    className="text-xs font-medium px-2 py-0.5 rounded-lg inline-block"
                                                                    style={{
                                                                        background: "var(--result-stop-tag-bg)",
                                                                        color: "var(--result-stop-tag-text)",
                                                                    }}
                                                                >
                                                                    {stop}
                                                                </span>
                                                                {j < Math.min(3, route.stops_between!.length - 1) && (
                                                                    <ChevronRight className="h-3 w-3 text-muted-foreground/30 mx-0.5" />
                                                                )}
                                                            </span>
                                                        ))}
                                                        {route.stops_between.length > 4 && (
                                                            <span
                                                                className="text-xs font-bold px-2 py-0.5 rounded-lg"
                                                                style={{
                                                                    color: "var(--brand-accent)",
                                                                }}
                                                            >
                                                                +{route.stops_between.length - 4} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer — View full route */}
                                            <div
                                                className="px-5 sm:px-6 py-3.5 flex items-center justify-between transition-colors group-hover:bg-white/[0.02]"
                                                style={{ borderTop: "1px solid var(--result-footer-border)" }}
                                            >
                                                <span className="text-sm font-semibold text-primary flex items-center gap-1.5">
                                                    <Eye className="h-4 w-4" />
                                                    View full route
                                                </span>
                                                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </PageBackground>
    );
}

export default function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    return (
        <Suspense
            fallback={
                <PageBackground>
                    <div className="max-w-3xl mx-auto px-4 space-y-4 relative z-10">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                </PageBackground>
            }
        >
            <SearchResultsContent />
        </Suspense>
    );
}
