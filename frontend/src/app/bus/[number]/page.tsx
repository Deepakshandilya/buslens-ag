"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bus, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouteDetail } from "@/hooks/useRouteDetail";
import { useAuthStore } from "@/stores/authStore";
import { useAddFavorite, useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";

export default function BusNumberPage({
    params,
}: {
    params: Promise<{ number: string }>;
}) {
    const { number } = use(params);
    const router = useRouter();
    const decoded = decodeURIComponent(number);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const upQuery = useRouteDetail(decoded, "UP");
    const downQuery = useRouteDetail(decoded, "DOWN");

    const { data: favorites } = useFavorites();
    const addFavorite = useAddFavorite();

    const isLoading = upQuery.isLoading || downQuery.isLoading;
    const hasUp = !!upQuery.data;
    const hasDown = !!downQuery.data;
    const defaultTab = hasUp ? "up" : "down";

    const isFavorited = (routeId: number) =>
        favorites?.some((f) => f.route_id === routeId) ?? false;

    const handleFavorite = (routeId: number) => {
        if (!isAuthenticated) {
            toast.error("Please login to save favorites");
            router.push("/login");
            return;
        }
        addFavorite.mutate(
            { route_id: routeId },
            {
                onSuccess: () => toast.success("Added to favorites!"),
                onError: () => toast.error("Failed to add favorite"),
            }
        );
    };

    const renderTimeline = (data: { route_id: number; route_number: string; direction: string; stops: { sequence_no: number; name: string }[] }) => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-base text-muted-foreground">{data.stops.length} stops</p>
                <Button
                    variant="outline"
                    size="sm"
                    className={`gap-2 rounded-xl ${isFavorited(data.route_id) ? "text-red-500 border-red-500/30" : ""}`}
                    onClick={() => handleFavorite(data.route_id)}
                >
                    <Heart className="h-4 w-4" fill={isFavorited(data.route_id) ? "currentColor" : "none"} />
                    {isFavorited(data.route_id) ? "Favourited" : "Favourite"}
                </Button>
            </div>

            <Card
                className="backdrop-blur-sm"
                style={{
                    background: "oklch(0.195 0.02 285 / 90%)",
                    border: "1px solid oklch(1 0.02 285 / 8%)",
                }}
            >
                <CardContent className="p-6">
                    <div className="relative">
                        {data.stops.map((stop, i) => {
                            const isFirst = i === 0;
                            const isLast = i === data.stops.length - 1;

                            const circleClass = (isFirst || isLast)
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background";

                            return (
                                <div key={stop.sequence_no} className="flex gap-4 relative">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 z-10 transition-all ${circleClass}`}
                                        >
                                            {isFirst || isLast ? (
                                                <MapPin className="h-4 w-4" />
                                            ) : (
                                                <span className="text-sm font-semibold text-muted-foreground">
                                                    {stop.sequence_no}
                                                </span>
                                            )}
                                        </div>
                                        {!isLast && (
                                            <div className="w-0.5 flex-1 bg-border min-h-[2.25rem] transition-colors" />
                                        )}
                                    </div>
                                    <div className={`pb-7 pt-1.5 ${isLast ? "pb-0" : ""}`}>
                                        <p className={`font-medium transition-colors ${isFirst || isLast ? "text-base text-foreground font-semibold" : "text-[15px] text-muted-foreground"}`}>
                                            {stop.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground/60 mt-0.5">Stop #{stop.sequence_no}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div
            className="min-h-screen pt-24 pb-12 relative overflow-hidden"
            style={{
                background: "linear-gradient(180deg, oklch(0.14 0.03 285) 0%, oklch(0.11 0.02 280) 40%, oklch(0.13 0.025 290) 100%)",
            }}
        >
            {/* Ambient glow orbs */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ background: "oklch(0.55 0.15 290 / 12%)" }} />
                <div className="absolute top-[30%] -left-[15%] w-[35%] h-[35%] rounded-full blur-[100px]" style={{ background: "oklch(0.50 0.12 260 / 8%)" }} />
                <div className="absolute -bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full blur-[100px]" style={{ background: "oklch(0.50 0.10 310 / 8%)" }} />
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 -ml-2">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div
                        className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
                        style={{
                            background: "linear-gradient(135deg, oklch(0.68 0.15 280), oklch(0.72 0.12 295))",
                            boxShadow: "0 4px 16px oklch(0.72 0.12 290 / 25%)",
                        }}
                    >
                        <span
                            className="text-xl font-extrabold text-white"
                            style={{ fontFamily: "var(--font-heading), sans-serif" }}
                        >
                            {decoded}
                        </span>
                    </div>
                    <div>
                        <h1
                            className="text-2xl font-bold"
                            style={{ fontFamily: "var(--font-heading), sans-serif" }}
                        >
                            Route {decoded}
                        </h1>
                        <p className="text-base text-muted-foreground">
                            {hasUp && hasDown ? "Both directions available" : hasUp ? "UP direction only" : hasDown ? "DOWN direction only" : "Loading..."}
                        </p>
                    </div>
                </div>

                {isLoading && (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Card className="border-border/40">
                            <CardContent className="p-6 space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <Skeleton className="h-5 w-32" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {!isLoading && !hasUp && !hasDown && (
                    <Card className="border-destructive/30">
                        <CardContent className="p-6 text-center">
                            <p className="text-destructive font-medium">Route {decoded} not found.</p>
                            <p className="text-sm text-muted-foreground mt-1">Check the bus number and try again.</p>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && (hasUp || hasDown) && (
                    <Tabs defaultValue={defaultTab} className="w-full">
                        <TabsList className={`grid w-full mb-6 h-11 ${hasUp && hasDown ? "grid-cols-2" : "grid-cols-1"}`}>
                            {hasUp && (
                                <TabsTrigger value="up" className="gap-2 text-sm">
                                    ↑ UP Direction
                                </TabsTrigger>
                            )}
                            {hasDown && (
                                <TabsTrigger value="down" className="gap-2 text-sm">
                                    ↓ DOWN Direction
                                </TabsTrigger>
                            )}
                        </TabsList>
                        {hasUp && upQuery.data && (
                            <TabsContent value="up">{renderTimeline(upQuery.data)}</TabsContent>
                        )}
                        {hasDown && downQuery.data && (
                            <TabsContent value="down">{renderTimeline(downQuery.data)}</TabsContent>
                        )}
                    </Tabs>
                )}
            </div>
        </div>
    );
}
