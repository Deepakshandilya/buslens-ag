"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Bus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/authStore";
import { useRouteDetail } from "@/hooks/useRouteDetail";
import { toast } from "sonner";

export default function RouteDetailPage({
    params,
}: {
    params: Promise<{ routeNumber: string; direction: string }>;
}) {
    const { routeNumber, direction } = use(params);
    const router = useRouter();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const decodedRoute = decodeURIComponent(routeNumber);
    const decodedDir = decodeURIComponent(direction);

    const { data, isLoading, isError } = useRouteDetail(decodedRoute, decodedDir);

    const handleFavorite = () => {
        if (!isAuthenticated) {
            toast.error("Please login to save favorites");
            router.push("/login");
            return;
        }
        toast.success(`Route ${decodedRoute} added to favorites!`);
    };

    return (
        <div className="min-h-screen bg-background pt-20 pb-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
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
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <Skeleton className="h-5 w-32" />
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
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Bus className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold">Route {data.route_number}</h1>
                                        <Badge variant={data.direction === "UP" ? "default" : "secondary"}>
                                            {data.direction === "UP" ? "↑ UP" : "↓ DOWN"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {data.stops.length} stops
                                    </p>
                                </div>
                            </div>

                            <Button variant="outline" size="sm" onClick={handleFavorite} className="gap-2">
                                <Heart className="h-4 w-4" />
                                Favorite
                            </Button>
                        </div>

                        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="relative">
                                    {data.stops.map((stop, i) => {
                                        const isFirst = i === 0;
                                        const isLast = i === data.stops.length - 1;

                                        return (
                                            <div key={stop.sequence_no} className="flex gap-4 relative">
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 z-10 ${isFirst || isLast
                                                                ? "border-primary bg-primary text-primary-foreground"
                                                                : "border-border bg-background"
                                                            }`}
                                                    >
                                                        {isFirst || isLast ? (
                                                            <MapPin className="h-4 w-4" />
                                                        ) : (
                                                            <span className="text-xs font-medium text-muted-foreground">
                                                                {stop.sequence_no}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {!isLast && (
                                                        <div className="w-0.5 flex-1 bg-border min-h-[2rem]" />
                                                    )}
                                                </div>
                                                <div className={`pb-6 pt-1 ${isLast ? "pb-0" : ""}`}>
                                                    <p
                                                        className={`text-sm font-medium ${isFirst || isLast ? "text-foreground" : "text-muted-foreground"
                                                            }`}
                                                    >
                                                        {stop.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground/60">
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
        </div>
    );
}
