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
    active?: boolean;
}

export function StopAutocomplete({
    label,
    placeholder = "Search stop...",
    value,
    onValueChange,
    onStopSelect,
    active = true,
}: StopAutocompleteProps) {
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

    const { data, isLoading } = useStopSearch(debouncedQuery);
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
                className="text-base font-semibold mb-2.5 block"
                style={{ color: "var(--search-label)" }}
            >
                {label}
            </label>
            <div className="relative">
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
                    className="pl-11 h-13 text-lg bg-input/50 backdrop-blur-sm border-border/50 focus:border-primary/50 rounded-xl"
                />
                <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none"
                    style={{ color: "var(--search-icon)" }}
                />
            </div>

            {isOpen && (
                <div
                    className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl overflow-hidden shadow-xl"
                    style={{
                        background: "var(--dropdown-bg)",
                        border: "1px solid var(--dropdown-border)",
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
                            {results.map((stop) => (
                                <button
                                    key={stop.id}
                                    onClick={() => handleSelect(stop)}
                                    className={cn(
                                        "w-full px-4 py-3.5 text-left flex items-center gap-2.5",
                                    "hover:bg-[var(--dropdown-hover)] transition-colors cursor-pointer"
                                    )}
                                >
                                    <MapPin className="h-4 w-4 text-primary/60 flex-shrink-0" />
                                    <span className="text-base font-medium">{stop.name}</span>
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
