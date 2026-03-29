"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const IMAGES = [
    {
        url: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=1000&fit=crop&q=80",
        alt: "City transit bus on urban road",
    },
    {
        url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=1000&fit=crop&q=80",
        alt: "Modern public bus in city",
    },
    {
        url: "https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=800&h=1000&fit=crop&q=80",
        alt: "Bus stop in urban landscape",
    },
];

interface AuthImageCarouselProps {
    tagline?: string;
    subtitle?: string;
}

export function AuthImageCarousel({
    tagline = "Navigate Your City,\nOne Bus at a Time",
    subtitle = "Smart transit companion for Chandigarh Tricity",
}: AuthImageCarouselProps) {
    const [current, setCurrent] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrent((prev) => (prev + 1) % IMAGES.length);
    }, []);

    useEffect(() => {
        const timer = setInterval(nextSlide, 4500);
        return () => clearInterval(timer);
    }, [nextSlide]);

    return (
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
            {/* Images */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute inset-0"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={IMAGES[current].url}
                        alt={IMAGES[current].alt}
                        className="h-full w-full object-cover"
                    />
                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.72_0.12_290_/_0.15)] to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Logo watermark top-left */}
            <div className="absolute top-6 left-6 z-10">
                <span className="text-xl font-bold text-white/90 tracking-tight">
                    Bus<span style={{ color: "oklch(0.78 0.12 290)" }}>Lens</span>
                </span>
            </div>

            {/* Tagline at bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight whitespace-pre-line mb-2">
                    {tagline}
                </h2>
                <p className="text-sm text-white/60">{subtitle}</p>

                {/* Dot indicators */}
                <div className="flex items-center gap-2 mt-6">
                    {IMAGES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`carousel-dot ${i === current ? "active" : ""}`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
