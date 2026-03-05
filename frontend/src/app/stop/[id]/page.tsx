"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bus, MapPin, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStopRoutes } from "@/hooks/useStopRoutes";

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
        <div className="min-h-screen bg-background pt-20 pb-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 -ml-2">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="border-border/40">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <Skeleton className="h-9 w-9 rounded-lg" />
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
                        <div className="flex items-center gap-3 mb-8">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{data.stop_name}</h1>
                                <p className="text-sm text-muted-foreground">
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
                                {data.routes.map((route, i) => (
                                    <Card
                                        key={`${route.route_number}-${route.direction}-${i}`}
                                        className="group border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer"
                                        onClick={() => router.push(`/route/${route.route_number}/${route.direction}`)}
                                    >
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Bus className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold">Route {route.route_number}</span>
                                                        <Badge
                                                            variant={route.direction === "UP" ? "default" : "secondary"}
                                                            className="text-xs"
                                                        >
                                                            {route.direction === "UP" ? "↑ UP" : "↓ DOWN"}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Stop #{route.sequence_no} in sequence
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
        </div>
    );
}
