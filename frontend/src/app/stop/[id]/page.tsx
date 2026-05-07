"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bus, MapPin, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStopRoutes } from "@/hooks/useStopRoutes";
import { PageBackground } from "@/components/layout/PageBackground";

export default function StopRoutesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const stopId = parseInt(id, 10);
    const { data, isLoading, isError } = useStopRoutes(isNaN(stopId) ? null : stopId);

    return (
        <PageBackground>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 -ml-2">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-14 w-14 rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="border-border/40">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <Skeleton className="h-12 w-12 rounded-xl" />
                                    <Skeleton className="h-5 w-32" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <Card className="border-destructive/30">
                        <CardContent className="p-6 text-center">
                            <p className="text-destructive font-medium">Stop not found or backend is offline.</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Make sure FastAPI is running at localhost:8000
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Data */}
                {data && (
                    <>
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <div
                                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                                style={{
                                    background: "oklch(0.72 0.12 290 / 15%)",
                                }}
                            >
                                <MapPin className="h-7 w-7 text-primary" />
                            </div>
                            <div>
                                <h1
                                    className="text-2xl font-bold"
                                    style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                >
                                    {data.stop_name}
                                </h1>
                                <p className="text-base text-muted-foreground">
                                    {data.routes.length} route{data.routes.length !== 1 ? "s" : ""} through this stop
                                </p>
                            </div>
                        </div>

                        {data.routes.length === 0 ? (
                            <Card className="border-border/40">
                                <CardContent className="p-8 text-center">
                                    <Bus className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                                    <p className="font-medium">No routes through this stop</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {Array.from(
                                    data.routes.reduce((acc, route) => {
                                        if (!acc.has(route.route_number)) acc.set(route.route_number, []);
                                        acc.get(route.route_number)!.push(route);
                                        return acc;
                                    }, new Map<string, typeof data.routes>())
                                ).map(([route_number, routes], i) => (
                                    <Card
                                        key={`${route_number}-${i}`}
                                        className="group overflow-hidden transition-all duration-200 cursor-pointer hover:scale-[1.01]"
                                        style={{
                                            background: "oklch(0.195 0.02 285 / 90%)",
                                            border: "1px solid oklch(1 0.02 285 / 8%)",
                                        }}
                                        onClick={() => router.push(`/bus/${encodeURIComponent(route_number)}?highlightStopName=${encodeURIComponent(data.stop_name)}`)}
                                    >
                                        <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                                            <div className="flex items-center gap-3.5">
                                                <div
                                                    className="flex h-12 w-12 items-center justify-center rounded-xl shadow-md"
                                                    style={{
                                                        background: "linear-gradient(135deg, oklch(0.68 0.15 280), oklch(0.72 0.12 295))",
                                                        boxShadow: "0 2px 8px oklch(0.72 0.12 290 / 20%)",
                                                    }}
                                                >
                                                    <Bus className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="text-lg font-bold"
                                                            style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                                        >
                                                            Route {route_number}
                                                        </span>
                                                        {routes.map((route) => (
                                                            <Badge
                                                                key={route.direction}
                                                                variant={route.direction === "UP" ? "default" : "secondary"}
                                                                className="text-[11px] px-2 py-0"
                                                            >
                                                                {route.direction === "UP" ? "↑ UP" : "↓ DOWN"}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                        {routes.length === 1 
                                                            ? `Stop #${routes[0].sequence_no} in sequence` 
                                                            : routes.map(r => `Stop #${r.sequence_no} (${r.direction})`).join(" • ")}
                                                    </p>
                                                </div>
                                            </div>
                                            <ArrowUpDown className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </PageBackground>
    );
}
