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
            router.push("/login");
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
        <div className="min-h-screen bg-background pt-20 pb-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
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

                    <h1 className="text-2xl font-bold tracking-tight">Routes found</h1>

                    {/* Journey summary */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-[var(--route-start-bg)] text-[var(--route-start)] rounded-lg px-3 py-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="text-sm font-semibold">{from}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex items-center gap-1.5 bg-[var(--route-end-bg)] text-[var(--route-end)] rounded-lg px-3 py-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="text-sm font-semibold">{to}</span>
                        </div>
                    </div>

                    {results && (
                        <p className="text-sm text-muted-foreground mt-2">
                            {results.length} route{results.length !== 1 ? "s" : ""} available
                        </p>
                    )}
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="border-border/40">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <Skeleton className="h-14 w-14 rounded-xl" />
                                        <div className="flex-1 space-y-3">
                                            <Skeleton className="h-5 w-40" />
                                            <Skeleton className="h-4 w-64" />
                                            <Skeleton className="h-8 w-full rounded-lg" />
                                        </div>
                                    </div>
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
                                Failed to fetch routes. Is the backend running?
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
                        <CardContent className="p-8 text-center">
                            <Bus className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                            <p className="font-medium">No routes found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Try searching with different stop names
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
                                        className="group border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all duration-200 cursor-pointer overflow-hidden"
                                    >
                                        <CardContent className="p-0">
                                            {/* Accent top bar */}
                                            <div className="h-1 bg-gradient-to-r from-[var(--route-start)] to-[var(--route-end)] opacity-60 group-hover:opacity-100 transition-opacity" />

                                            <div className="p-5 sm:p-6">
                                                {/* Top row: Bus badge + direction + actions */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                                                            <span className="text-base font-extrabold tracking-tight">
                                                                {route.route_number}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-lg font-bold tracking-tight">
                                                                Route {route.route_number}
                                                            </span>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <Badge
                                                                    variant={route.direction === "UP" ? "default" : "secondary"}
                                                                    className="text-[11px] font-semibold px-2 py-0"
                                                                >
                                                                    {route.direction === "UP" ? "↑ UP" : "↓ DOWN"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={adding}
                                                            className={`h-9 w-9 rounded-full transition-colors ${fav
                                                                ? "text-red-500 hover:text-red-400"
                                                                : "text-muted-foreground hover:text-red-400"
                                                                }`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleFavorite(route.route_id, route.route_number);
                                                            }}
                                                        >
                                                            <Heart
                                                                className="h-4 w-4"
                                                                fill={fav ? "currentColor" : "none"}
                                                            />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-full"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/route/${route.route_number}/${route.direction}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
                                                                )
                                                            }
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Journey visualization */}
                                                <div className="bg-muted/30 rounded-xl p-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* From stop */}
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            <div className="h-3 w-3 rounded-full bg-[var(--route-start)] shrink-0 ring-2 ring-[var(--route-start-bg)]" />
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">From</p>
                                                                <p className="text-sm font-semibold truncate">{from}</p>
                                                            </div>
                                                        </div>

                                                        {/* Stop count pill */}
                                                        <div className="flex flex-col items-center shrink-0 px-2">
                                                            <div className="flex items-center gap-1">
                                                                <div className="h-px w-4 bg-border" />
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs font-bold px-2.5 py-0.5 whitespace-nowrap border-primary/30 text-primary"
                                                                >
                                                                    {stopCount} {stopCount === 1 ? "stop" : "stops"}
                                                                </Badge>
                                                                <div className="h-px w-4 bg-border" />
                                                            </div>
                                                        </div>

                                                        {/* To stop */}
                                                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">To</p>
                                                                <p className="text-sm font-semibold truncate">{to}</p>
                                                            </div>
                                                            <div className="h-3 w-3 rounded-full bg-[var(--route-end)] shrink-0 ring-2 ring-[var(--route-end-bg)]" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Intermediate stops */}
                                                {route.stops_between && route.stops_between.length > 0 && (
                                                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                                                        <Circle className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                                        {route.stops_between.slice(0, 6).map((stop, j) => (
                                                            <span key={j}>
                                                                <span className="text-xs text-muted-foreground bg-muted/50 rounded-full px-2.5 py-0.5 inline-block">
                                                                    {stop}
                                                                </span>
                                                                {j < Math.min(5, route.stops_between!.length - 1) && (
                                                                    <span className="text-muted-foreground/30 mx-0.5">›</span>
                                                                )}
                                                            </span>
                                                        ))}
                                                        {route.stops_between.length > 6 && (
                                                            <span className="text-xs text-muted-foreground/60 font-medium">
                                                                +{route.stops_between.length - 6} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* View full route button */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full mt-4 text-primary hover:text-primary hover:bg-primary/5 font-medium gap-2"
                                                    onClick={() =>
                                                        router.push(
                                                            `/route/${route.route_number}/${route.direction}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
                                                        )
                                                    }
                                                >
                                                    View full route
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background pt-20 pb-12">
                    <div className="max-w-3xl mx-auto px-4 space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-40 w-full rounded-lg" />
                        <Skeleton className="h-40 w-full rounded-lg" />
                    </div>
                </div>
            }
        >
            <SearchResultsContent />
        </Suspense>
    );
}
