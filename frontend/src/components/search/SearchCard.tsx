"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRightLeft, Hash, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StopAutocomplete } from "@/components/search/StopAutocomplete";
import { BusAutocomplete } from "@/components/search/BusAutocomplete";
import { useAuthStore } from "@/stores/authStore";
import { useAddHistory } from "@/hooks/useHistory";
import type { StopOut } from "@/types/api";

export function SearchCard() {
    const router = useRouter();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const addHistory = useAddHistory();

    const [fromStop, setFromStop] = useState("");
    const [toStop, setToStop] = useState("");
    const [selectedFrom, setSelectedFrom] = useState<StopOut | null>(null);
    const [selectedTo, setSelectedTo] = useState<StopOut | null>(null);
    const [busNumber, setBusNumber] = useState("");
    const [searchStop, setSearchStop] = useState("");
    const [selectedSearchStop, setSelectedSearchStop] = useState<StopOut | null>(null);
    const [activeTab, setActiveTab] = useState("stops");

    const handleSwap = () => {
        setFromStop(toStop);
        setToStop(fromStop);
        setSelectedFrom(selectedTo);
        setSelectedTo(selectedFrom);
    };

    const handleStopSearch = () => {
        if (!fromStop.trim() || !toStop.trim()) return;
        if (isAuthenticated && selectedFrom && selectedTo) {
            addHistory.mutate({
                from_stop_id: selectedFrom.id,
                to_stop_id: selectedTo.id,
            });
        }
        router.push(`/search?from=${encodeURIComponent(fromStop)}&to=${encodeURIComponent(toStop)}`);
    };

    const handleBusSearch = () => {
        if (!busNumber.trim()) return;
        router.push(`/bus/${encodeURIComponent(busNumber.trim())}`);
    };

    const handleStopLookup = () => {
        if (!selectedSearchStop) return;
        router.push(`/stop/${selectedSearchStop.id}`);
    };

    return (
        <Card
            className="w-full max-w-2xl mx-auto backdrop-blur-xl shadow-2xl ring-1 ring-white/[0.03]"
            style={{
                background: "var(--search-card-bg)",
                border: "1px solid var(--search-card-border)",
                boxShadow: `0 20px 60px var(--brand-glow), 0 4px 20px var(--search-card-shadow)`,
            }}
        >
            <CardContent className="p-6 sm:p-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1
                        className="text-4xl sm:text-5xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                    >
                        Find Your <span className="text-primary">Bus Route</span>
                    </h1>
                    <p className="text-lg text-muted-foreground mt-3 tracking-wide">
                        Search routes across Chandigarh Tricity
                    </p>
                </div>

                <Tabs defaultValue="stops" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 mb-6 h-14 rounded-xl p-1.5">
                        <TabsTrigger value="stops" className="text-[15px] gap-2 font-semibold">
                            <Search className="h-4.5 w-4.5" />
                            <span className="hidden sm:inline">Stop to Stop</span>
                            <span className="sm:hidden">Stops</span>
                        </TabsTrigger>
                        <TabsTrigger value="bus" className="text-[15px] gap-2 font-semibold">
                            <Hash className="h-4.5 w-4.5" />
                            <span className="hidden sm:inline">Bus Number</span>
                            <span className="sm:hidden">Bus #</span>
                        </TabsTrigger>
                        <TabsTrigger value="stop" className="text-[15px] gap-2 font-semibold">
                            <MapPin className="h-4.5 w-4.5" />
                            <span className="hidden sm:inline">Search Stop</span>
                            <span className="sm:hidden">Stop</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Stop-to-Stop Tab */}
                    <TabsContent value="stops" className="space-y-4 mt-0">
                        <StopAutocomplete
                            label="From"
                            placeholder="Where are you boarding?"
                            value={fromStop}
                            onValueChange={setFromStop}
                            onStopSelect={setSelectedFrom}
                            active={activeTab === "stops"}
                        />

                        <div className="flex justify-center -my-2.5 relative z-10">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full hover:bg-primary/10 border border-border/30"
                                onClick={handleSwap}
                            >
                                <ArrowRightLeft className="h-4.5 w-4.5 text-muted-foreground" />
                            </Button>
                        </div>

                        <StopAutocomplete
                            label="To"
                            placeholder="Where do you want to go?"
                            value={toStop}
                            onValueChange={setToStop}
                            onStopSelect={setSelectedTo}
                            active={activeTab === "stops"}
                        />

                        <Button
                            onClick={handleStopSearch}
                            className="w-full mt-4 font-bold text-base h-13 rounded-xl cursor-pointer"
                            size="lg"
                            disabled={!fromStop.trim() || !toStop.trim()}
                            style={{
                                background: "var(--brand-gradient)",
                                boxShadow: "0 4px 20px var(--brand-glow)",
                            }}
                        >
                            <Search className="h-5 w-5 mr-2" />
                            Find Routes
                        </Button>
                    </TabsContent>

                    {/* Bus Number Tab */}
                    <TabsContent value="bus" className="space-y-5 mt-0">
                        <BusAutocomplete
                            label="Route / Bus Number"
                            placeholder="e.g. 20, 35A, 12..."
                            value={busNumber}
                            onValueChange={setBusNumber}
                            onBusSelect={(routeNumber) => setBusNumber(routeNumber)}
                            active={activeTab === "bus"}
                        />

                        <Button
                            onClick={handleBusSearch}
                            className="w-full font-bold text-base h-13 rounded-xl cursor-pointer"
                            size="lg"
                            disabled={!busNumber.trim()}
                            style={{
                                background: "var(--brand-gradient)",
                                boxShadow: "0 4px 20px var(--brand-glow)",
                            }}
                        >
                            <Search className="h-5 w-5 mr-2" />
                            View Route
                        </Button>
                    </TabsContent>

                    {/* Search Stop Tab */}
                    <TabsContent value="stop" className="space-y-5 mt-0">
                        <StopAutocomplete
                            label="Stop name"
                            placeholder="Search for a stop..."
                            value={searchStop}
                            onValueChange={setSearchStop}
                            onStopSelect={setSelectedSearchStop}
                            active={activeTab === "stop"}
                        />

                        <Button
                            onClick={handleStopLookup}
                            className="w-full font-bold text-base h-13 rounded-xl cursor-pointer"
                            size="lg"
                            disabled={!selectedSearchStop}
                            style={{
                                background: "var(--brand-gradient)",
                                boxShadow: "0 4px 20px var(--brand-glow)",
                            }}
                        >
                            <MapPin className="h-5 w-5 mr-2" />
                            View All Buses
                        </Button>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
