"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusSearch } from "@/hooks/useBusSearch";

interface BusAutocompleteProps {
    label: string;
    placeholder?: string;
    value: string;
    onValueChange: (value: string) => void;
    onBusSelect: (routeNumber: string) => void;
    active?: boolean;
}

export function BusAutocomplete({
    label,
    placeholder = "Search bus number...",
    value,
    onValueChange,
    onBusSelect,
    active = true,
}: BusAutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const justSelectedRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (justSelectedRef.current) {
            justSelectedRef.current = false;
            return;
        }
        const timer = setTimeout(() => setDebouncedQuery(value), 200);
        return () => clearTimeout(timer);
    }, [value]);

    const { data, isLoading } = useBusSearch(debouncedQuery);
    const results = data?.results || [];

    useEffect(() => {
        if (justSelectedRef.current) return;
        if (isFocused && debouncedQuery.length >= 1 && results.length > 0) {
            setIsOpen(true);
        } else if (debouncedQuery.length < 1) {
            setIsOpen(false);
        }
    }, [debouncedQuery, results.length, isFocused]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Force-close dropdown when this tab becomes inactive
    useEffect(() => {
        if (!active) {
            setIsOpen(false);
            setDebouncedQuery("");
        }
    }, [active]);

    const handleSelect = (routeNumber: string) => {
        justSelectedRef.current = true;
        onBusSelect(routeNumber);
        onValueChange(routeNumber);
        setIsOpen(false);
        setDebouncedQuery("");
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <label
                className="text-base font-semibold mb-2.5 block"
                style={{ color: "oklch(0.75 0.03 285)" }}
            >
                {label}
            </label>
            <div className="relative">
                <Hash
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5"
                    style={{ color: "oklch(0.50 0.05 285)" }}
                />
                <Input
                    value={value}
                    onChange={(e) => {
                        justSelectedRef.current = false;
                        onValueChange(e.target.value);
                    }}
                    onFocus={() => {
                        setIsFocused(true);
                        if (!justSelectedRef.current && debouncedQuery.length >= 1 && results.length > 0) {
                            setIsOpen(true);
                        }
                    }}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="pl-11 h-13 text-lg bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 rounded-xl"
                    style={{ fontFamily: "var(--font-heading), sans-serif" }}
                />
            </div>

            {isOpen && (
                <div
                    className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl overflow-hidden shadow-xl"
                    style={{
                        background: "oklch(0.195 0.02 285 / 98%)",
                        border: "1px solid oklch(1 0.02 285 / 10%)",
                        backdropFilter: "blur(20px)",
                    }}
                >
                    {isLoading ? (
                        <div className="p-3 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-5 w-2/3" />
                        </div>
                    ) : results.length > 0 ? (
                        <div className="max-h-56 overflow-y-auto">
                            {results.map((item) => (
                                <button
                                    key={item.route_number}
                                    onClick={() => handleSelect(item.route_number)}
                                    className={cn(
                                        "w-full px-4 py-3.5 text-left flex items-center gap-2.5",
                                        "hover:bg-white/5 transition-colors cursor-pointer"
                                    )}
                                >
                                    <div
                                        className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                                        style={{
                                            background: "linear-gradient(135deg, oklch(0.68 0.15 280 / 20%), oklch(0.72 0.12 295 / 20%))",
                                        }}
                                    >
                                        <span
                                            className="text-sm font-bold text-primary"
                                            style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                        >
                                            {item.route_number}
                                        </span>
                                    </div>
                                    <span className="text-base font-medium">Route {item.route_number}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                            No routes found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
