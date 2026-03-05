"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Heart, Eye, Bus, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/authStore";
import { useRouteSearch } from "@/hooks/useRouteSearch";
import { toast } from "sonner";

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    const { data: results, isLoading, isError } = useRouteSearch(from, to);

    // Track favorited routes locally (filled heart)
    const [favoritedRoutes, setFavoritedRoutes] = useState<Set<string>>(new Set());

    const handleFavorite = (routeKey: string, routeNumber: string) => {
        if (!isAuthenticated) {
            toast.error("Please login to save favorites");
            router.push("/login");
            return;
        }

        if (favoritedRoutes.has(routeKey)) {
            // Remove from local set
            setFavoritedRoutes((prev) => {
                const next = new Set(prev);
                next.delete(routeKey);
                return next;
            });
            toast.success(`Route ${routeNumber} removed from favorites`);
        } else {
            // Add to local set
            setFavoritedRoutes((prev) => new Set(prev).add(routeKey));
            toast.success(`Route ${routeNumber} added to favorites!`);
        }
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
                    <p className="text-muted-foreground mt-1">
                        <span className="font-medium text-foreground">{from}</span>
                        <ArrowRight className="inline h-4 w-4 mx-2" />
                        <span className="font-medium text-foreground">{to}</span>
                    </p>
                    {results && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {results.length} route{results.length !== 1 ? "s" : ""} found
                        </p>
                    )}
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="border-border/40">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-3">
                                        <Skeleton className="h-10 w-10 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-3 w-full" />
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
                            const routeKey = `${route.route_number}-${route.direction}`;
                            const isFavorited = favoritedRoutes.has(routeKey);

                            return (
                                <Card
                                    key={`${routeKey}-${i}`}
                                    className="group border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <Bus className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold">
                                                                Route {route.route_number}
                                                            </span>
                                                            <Badge
                                                                variant={route.direction === "UP" ? "default" : "secondary"}
                                                                className="text-xs"
                                                            >
                                                                {route.direction === "UP" ? "↑ UP" : "↓ DOWN"}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Stop {route.from_sequence} → Stop {route.to_sequence}
                                                            {" · "}
                                                            {route.to_sequence - route.from_sequence} stops
                                                        </p>
                                                    </div>
                                                </div>

                                                {route.stops_between && (
                                                    <div className="mt-3 flex items-center gap-1 flex-wrap">
                                                        {route.stops_between.slice(0, 5).map((stop, j) => (
                                                            <span key={j} className="text-xs text-muted-foreground">
                                                                {stop}
                                                                {j < Math.min(4, route.stops_between!.length - 1) && (
                                                                    <span className="mx-1 text-border">→</span>
                                                                )}
                                                            </span>
                                                        ))}
                                                        {route.stops_between.length > 5 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                … +{route.stops_between.length - 5} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2 ml-4">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`h-8 w-8 transition-colors ${isFavorited
                                                            ? "text-red-500 hover:text-red-400"
                                                            : "text-muted-foreground hover:text-red-400"
                                                        }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFavorite(routeKey, route.route_number);
                                                    }}
                                                >
                                                    <Heart
                                                        className="h-4 w-4"
                                                        fill={isFavorited ? "currentColor" : "none"}
                                                    />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        router.push(`/route/${route.route_number}/${route.direction}`)
                                                    }
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
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
                        <Skeleton className="h-32 w-full rounded-lg" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                </div>
            }
        >
            <SearchResultsContent />
        </Suspense>
    );
}
