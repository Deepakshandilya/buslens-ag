"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStopSearch } from "@/hooks/useStopSearch";
import type { StopOut } from "@/types/api";

interface StopAutocompleteProps {
    label: string;
    placeholder?: string;
    value: string;
    onValueChange: (value: string) => void;
    onStopSelect: (stop: StopOut) => void;
}

export function StopAutocomplete({
    label,
    placeholder = "Search stop...",
    value,
    onValueChange,
    onStopSelect,
}: StopAutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const justSelectedRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (justSelectedRef.current) {
            justSelectedRef.current = false;
            return;
        }
        const timer = setTimeout(() => setDebouncedQuery(value), 300);
        return () => clearTimeout(timer);
    }, [value]);

    const { data, isLoading } = useStopSearch(debouncedQuery);
    const results = data?.results || [];

    useEffect(() => {
        if (justSelectedRef.current) return;
        if (debouncedQuery.length >= 2 && results.length > 0) {
            setIsOpen(true);
        } else if (debouncedQuery.length < 2) {
            setIsOpen(false);
        }
    }, [debouncedQuery, results.length]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (stop: StopOut) => {
        justSelectedRef.current = true;
        onStopSelect(stop);
        onValueChange(stop.name);
        setIsOpen(false);
        setDebouncedQuery("");
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <label
                className="text-sm font-medium mb-2 block"
                style={{ color: "oklch(0.70 0.03 285)" }}
            >
                {label}
            </label>
            <div className="relative">
                <MapPin
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5"
                    style={{ color: "oklch(0.45 0.03 285)" }}
                />
                <Input
                    value={value}
                    onChange={(e) => {
                        justSelectedRef.current = false;
                        onValueChange(e.target.value);
                    }}
                    onFocus={() => {
                        if (!justSelectedRef.current && debouncedQuery.length >= 2 && results.length > 0) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder={placeholder}
                    className="pl-10 h-12 text-base bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 rounded-xl"
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
                        <div className="max-h-52 overflow-y-auto">
                            {results.map((stop) => (
                                <button
                                    key={stop.id}
                                    onClick={() => handleSelect(stop)}
                                    className={cn(
                                        "w-full px-4 py-3 text-left text-sm flex items-center gap-2.5",
                                        "hover:bg-white/5 transition-colors cursor-pointer"
                                    )}
                                >
                                    <MapPin className="h-4 w-4 text-primary/60 flex-shrink-0" />
                                    <span className="text-[15px] font-medium">{stop.name}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                            No stops found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
