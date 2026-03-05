"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRightLeft, Hash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StopAutocomplete } from "@/components/search/StopAutocomplete";
import type { StopOut } from "@/types/api";

export function SearchCard() {
    const router = useRouter();

    // Stop-to-Stop state
    const [fromStop, setFromStop] = useState("");
    const [toStop, setToStop] = useState("");
    const [selectedFrom, setSelectedFrom] = useState<StopOut | null>(null);
    const [selectedTo, setSelectedTo] = useState<StopOut | null>(null);

    // Bus number state
    const [busNumber, setBusNumber] = useState("");

    const handleSwap = () => {
        setFromStop(toStop);
        setToStop(fromStop);
        setSelectedFrom(selectedTo);
        setSelectedTo(selectedFrom);
    };

    const handleStopSearch = () => {
        if (!fromStop.trim() || !toStop.trim()) return;
        router.push(`/search?from=${encodeURIComponent(fromStop)}&to=${encodeURIComponent(toStop)}`);
    };

    const handleBusSearch = () => {
        if (!busNumber.trim()) return;
        // Navigate to route detail — default to DOWN direction
        router.push(`/route/${encodeURIComponent(busNumber.trim())}/DOWN`);
    };

    return (
        <Card className="w-full max-w-lg mx-auto bg-card/60 backdrop-blur-xl border-border/30 shadow-2xl shadow-black/20">
            <CardContent className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Find Your <span className="text-primary">Bus Route</span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Search routes across Chandigarh Tricity
                    </p>
                </div>

                <Tabs defaultValue="stops" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="stops" className="text-xs sm:text-sm">
                            <Search className="h-3.5 w-3.5 mr-1.5" />
                            Stop to Stop
                        </TabsTrigger>
                        <TabsTrigger value="bus" className="text-xs sm:text-sm">
                            <Hash className="h-3.5 w-3.5 mr-1.5" />
                            Bus Number
                        </TabsTrigger>
                    </TabsList>

                    {/* Stop-to-Stop Tab */}
                    <TabsContent value="stops" className="space-y-3 mt-0">
                        <StopAutocomplete
                            label="From"
                            placeholder="Departure stop..."
                            value={fromStop}
                            onValueChange={setFromStop}
                            onStopSelect={setSelectedFrom}
                        />

                        <div className="flex justify-center">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-primary/10"
                                onClick={handleSwap}
                            >
                                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>

                        <StopAutocomplete
                            label="To"
                            placeholder="Destination stop..."
                            value={toStop}
                            onValueChange={setToStop}
                            onStopSelect={setSelectedTo}
                        />

                        <Button
                            onClick={handleStopSearch}
                            className="w-full mt-2 font-semibold"
                            size="lg"
                            disabled={!fromStop.trim() || !toStop.trim()}
                        >
                            <Search className="h-4 w-4 mr-2" />
                            Find Routes
                        </Button>
                    </TabsContent>

                    {/* Bus Number Tab */}
                    <TabsContent value="bus" className="space-y-3 mt-0">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                                Route / Bus Number
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={busNumber}
                                    onChange={(e) => setBusNumber(e.target.value)}
                                    placeholder="e.g. 20, 35A, 12..."
                                    className="pl-9 bg-background/50 backdrop-blur-sm border-border/50"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleBusSearch}
                            className="w-full font-semibold"
                            size="lg"
                            disabled={!busNumber.trim()}
                        >
                            <Search className="h-4 w-4 mr-2" />
                            View Route
                        </Button>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
