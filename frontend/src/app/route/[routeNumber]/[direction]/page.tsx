"use client";

import { use, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Heart, Bus, MapPin, ArrowRight, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/authStore";
import { useRouteDetail } from "@/hooks/useRouteDetail";
import { useFavorites, useAddFavorite } from "@/hooks/useFavorites";
import { toast } from "sonner";
import { Suspense } from "react";
import { PageBackground } from "@/components/layout/PageBackground";

function RouteDetailContent({
    routeNumber,
    direction,
}: {
    routeNumber: string;
    direction: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const decodedRoute = decodeURIComponent(routeNumber);
    const decodedDir = decodeURIComponent(direction);

    // Read from/to from query params (passed from search results)
    const fromStop = searchParams.get("from") || "";
    const toStop = searchParams.get("to") || "";
    const hasJourneyContext = fromStop.length > 0 && toStop.length > 0;

    const { data, isLoading, isError } = useRouteDetail(decodedRoute, decodedDir);
    const { data: favorites } = useFavorites();
    const addFavorite = useAddFavorite();
    const fromStopRef = useRef<HTMLDivElement>(null);

    const isFavorited = data
        ? (favorites?.some((f) => f.route_id === data.route_id) ?? false)
        : false;

    const handleFavorite = () => {
        if (!isAuthenticated) {
            toast.error("Please login to save favorites");
            router.push("/login");
            return;
        }
        if (!data) return;

        if (isFavorited) {
            toast.info("Already in favorites!");
            return;
        }

        addFavorite.mutate(
            { route_id: data.route_id },
            {
                onSuccess: () => toast.success(`Route ${decodedRoute} added to favorites!`),
                onError: () => toast.error("Failed to add favorite"),
            }
        );
    };

    // Find the indices of from/to stops in the route
    const getStopHighlightInfo = () => {
        if (!data || !hasJourneyContext) return null;

        const fromIndex = data.stops.findIndex(
            (s) => s.name.toLowerCase() === fromStop.toLowerCase()
        );
        const toIndex = data.stops.findIndex(
            (s) => s.name.toLowerCase() === toStop.toLowerCase()
        );

        if (fromIndex === -1 || toIndex === -1) return null;
        return { fromIndex, toIndex };
    };

    const highlightInfo = data ? getStopHighlightInfo() : null;

    // Auto-scroll to the from stop on load
    useEffect(() => {
        if (highlightInfo && fromStopRef.current) {
            const timeout = setTimeout(() => {
                fromStopRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 400);
            return () => clearTimeout(timeout);
        }
    }, [highlightInfo]);

    const getStopRole = (index: number) => {
        if (!highlightInfo) return "normal";
        if (index === highlightInfo.fromIndex) return "from";
        if (index === highlightInfo.toIndex) return "to";
        if (index > highlightInfo.fromIndex && index < highlightInfo.toIndex) return "between";
        return "outside";
    };

    // Count stops between from and to
    const journeyStopCount = highlightInfo
        ? Math.abs(highlightInfo.toIndex - highlightInfo.fromIndex)
        : 0;

    return (
        <PageBackground>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="mb-4 -ml-2"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                        <Card className="border-border/40">
                            <CardContent className="p-6 space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <Skeleton className="h-5 w-40" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <Card className="border-destructive/30">
                        <CardContent className="p-6 text-center">
                            <p className="text-destructive font-medium">
                                Route not found or backend is offline.
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Make sure FastAPI is running at localhost:8000
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Data loaded */}
                {data && (
                    <>
                        {/* Route header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                                    <span className="text-lg font-extrabold tracking-tight">
                                        {data.route_number}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading), sans-serif" }}>Route {data.route_number}</h1>
                                        <Badge variant={data.direction === "UP" ? "default" : "secondary"}>
                                            {data.direction === "UP" ? "↑ UP" : "↓ DOWN"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {data.stops.length} total stops
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleFavorite}
                                className={`gap-2 ${isFavorited ? "text-red-500 border-red-500/30" : ""}`}
                            >
                                <Heart className="h-4 w-4" fill={isFavorited ? "currentColor" : "none"} />
                                {isFavorited ? "Favorited" : "Favorite"}
                            </Button>
                        </div>

                        {/* Journey context banner */}
                        {highlightInfo && (
                            <Card className="mb-6 border-[var(--route-active-line)] bg-gradient-to-r from-[var(--route-start-bg)] via-transparent to-[var(--route-end-bg)]">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-center gap-1.5 mb-2">
                                        <Navigation className="h-3.5 w-3.5 text-[var(--route-active)]" />
                                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--route-active)]">
                                            Your Journey
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2.5 w-2.5 rounded-full bg-[var(--route-start)] shrink-0" />
                                            <span className="text-sm font-semibold leading-none pt-[1px]">{fromStop}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground/50">
                                            <span className="h-px w-3 sm:w-4 bg-border" />
                                            <Badge variant="outline" className="text-[10px] sm:text-xs font-bold px-2 py-0 h-5 border-primary/30 text-primary shrink-0 leading-none flex items-center justify-center">
                                                {journeyStopCount} {journeyStopCount === 1 ? "stop" : "stops"}
                                            </Badge>
                                            <span className="h-px w-3 sm:w-4 bg-border" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2.5 w-2.5 rounded-full bg-[var(--route-end)] shrink-0" />
                                            <span className="text-sm font-semibold leading-none pt-[1px]">{toStop}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Timeline */}
                        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="relative">
                                    {data.stops.map((stop, i) => {
                                        const isFirst = i === 0;
                                        const isLast = i === data.stops.length - 1;
                                        const role = getStopRole(i);
                                        const isFromStop = role === "from";
                                        const isToStop = role === "to";
                                        const isHighlighted = role === "from" || role === "to" || role === "between";
                                        const isDimmed = highlightInfo && role === "outside";

                                        const isMajorStop = isFirst || isLast || isFromStop || isToStop;

                                        // Determine circle styling
                                        let circleClass = "border-border bg-background";
                                        if (isFromStop) {
                                            circleClass = "border-[var(--route-start)] bg-[var(--route-start)] text-white h-10 w-10 ring-4 ring-[var(--route-start-bg)]";
                                        } else if (isToStop) {
                                            circleClass = "border-[var(--route-end)] bg-[var(--route-end)] text-white h-10 w-10 ring-4 ring-[var(--route-end-bg)]";
                                        } else if (isFirst || isLast) {
                                            circleClass = "border-primary bg-primary text-primary-foreground h-9 w-9";
                                        } else {
                                            circleClass = "bg-muted border-foreground/20 h-3 w-3 mt-1.5 opacity-60";
                                        }

                                        // Determine line color
                                        const nextRole = i < data.stops.length - 1 ? getStopRole(i + 1) : "normal";
                                        const isActiveLine =
                                            (role === "from" || role === "between") &&
                                            (nextRole === "between" || nextRole === "to");

                                        return (
                                            <div
                                                key={stop.sequence_no}
                                                ref={isFromStop ? fromStopRef : undefined}
                                                className={`flex gap-4 relative transition-opacity duration-300 ${isDimmed ? "opacity-30" : "opacity-100"
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center w-10 shrink-0">
                                                    <div
                                                        className={`flex items-center justify-center rounded-full border-[1.5px] z-10 transition-all ${circleClass} ${isFromStop || isToStop ? "scale-[1.15]" : ""}`}
                                                    >
                                                        {isMajorStop && (
                                                            <MapPin className={isFromStop || isToStop ? "h-4.5 w-4.5" : "h-4 w-4"} />
                                                        )}
                                                    </div>
                                                    {!isLast && (
                                                        <div
                                                            className={`w-0.5 flex-1 min-h-[2.25rem] transition-colors ${isActiveLine
                                                                ? "bg-[var(--route-active-line)]"
                                                                : "bg-border"
                                                                }`}
                                                            style={
                                                                isActiveLine
                                                                    ? { width: "3px", marginLeft: "-0.5px" }
                                                                    : undefined
                                                            }
                                                        />
                                                    )}
                                                </div>
                                                <div className={`pb-7 pt-1.5 ${isLast ? "pb-0" : ""}`}>
                                                    {/* Journey label */}
                                                    {isFromStop && (
                                                        <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-[var(--route-start)] bg-[var(--route-start-bg)] rounded px-2 py-0.5 mb-1">
                                                            Your Start
                                                        </span>
                                                    )}
                                                    {isToStop && (
                                                        <span className="inline-block text-[10px] uppercase tracking-widest font-bold text-[var(--route-end)] bg-[var(--route-end-bg)] rounded px-2 py-0.5 mb-1">
                                                            Your Stop
                                                        </span>
                                                    )}

                                                    <p
                                                        className={`font-medium transition-colors ${isFromStop || isToStop
                                                            ? "text-base text-foreground font-bold"
                                                            : isHighlighted
                                                                ? "text-base text-foreground"
                                                                : isFirst || isLast
                                                                    ? "text-base text-foreground font-semibold"
                                                                    : "text-[15px] text-muted-foreground"
                                                            }`}
                                                    >
                                                        {stop.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                                                        Stop #{stop.sequence_no}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </PageBackground>
    );
}

export default function RouteDetailPage({
    params,
}: {
    params: Promise<{ routeNumber: string; direction: string }>;
}) {
    const { routeNumber, direction } = use(params);

    return (
        <Suspense
            fallback={
                <PageBackground>
                    <div className="max-w-2xl mx-auto px-4 space-y-4 relative z-10">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                </PageBackground>
            }
        >
            <RouteDetailContent routeNumber={routeNumber} direction={direction} />
        </Suspense>
    );
}
