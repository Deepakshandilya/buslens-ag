"use client";

import { motion } from "framer-motion";
import { 
    MapPin, 
    Bus,
    Users,
    Building,
    Sparkles, 
    ArrowRight, 
    Network,
    Zap,
    MapIcon,
    CodeXml,
    Github,
    Linkedin,
    CheckCircle2,
    AlertCircle,
    ActivitySquare
} from "lucide-react";
import { PageBackground } from "@/components/layout/PageBackground";

// Animation Variants - simplified to trigger reliably
const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { type: "spring", stiffness: 50, damping: 15 } 
    }
};

export default function AboutPage() {
    return (
        <PageBackground className="pt-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 pb-20">
                
                {/* 1. Hero */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-24 mt-12"
                >
                    <div className="flex justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo.png"
                            alt="BusLens"
                            className="h-28 w-28 rounded-3xl object-cover relative z-10"
                            style={{
                                boxShadow: "0 12px 40px oklch(0.72 0.12 290 / 30%)",
                                border: "2px solid oklch(0.72 0.12 290 / 20%)",
                            }}
                        />
                    </div>
                    <h1
                        className="text-6xl sm:text-7xl font-bold tracking-tight mb-5 drop-shadow-lg"
                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                    >
                        Bus<span className="text-primary blur-[0.5px]">Lens</span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                        Bringing analytical clarity to the public transit chaos of the Chandigarh Tricity. 
                    </p>
                </motion.div>

                {/* 2. Story / Journey Road Map Segment (FIXED VISIBILITY) */}
                <motion.section 
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.1 }}
                    className="mb-32 w-full"
                >
                    <motion.h2 
                        variants={fadeUpVariant}
                        className="text-4xl font-bold tracking-tight mb-20 text-center"
                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                    >
                        The Path We Traveled
                    </motion.h2>

                    <div className="relative max-w-4xl mx-auto">
                        {/* The Road (Vertical Line) */}
                        <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-500/50 via-primary/50 to-primary/10 rounded-full md:-translate-x-1/2 z-0" />
                        
                        {/* Stop 1: The Problem */}
                        <motion.div variants={fadeUpVariant} className="relative flex flex-col md:flex-row items-stretch w-full mb-16 group z-10">
                            <div className="hidden md:flex flex-1 justify-end pr-14" />
                            
                            {/* Desktop Center Node */}
                            <div className="hidden md:flex absolute left-1/2 -top-2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] items-center justify-center z-20 group-hover:scale-125 transition-transform duration-300">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                            </div>

                            {/* Mobile Node (Absolute to align with line) */}
                            <div className="md:hidden absolute left-[27px] top-6 w-8 h-8 rounded-full bg-background border-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] flex flex-col items-center justify-center z-20">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                            </div>

                            <div className="w-full md:flex-1 pl-24 md:pl-14 pt-0">
                                <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 hover:bg-red-500/10 transition-colors duration-300 shadow-xl shadow-red-500/5 h-full">
                                    <h3 
                                        className="text-2xl font-bold flex items-center gap-3 text-red-400 mb-6"
                                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                    >
                                        <AlertCircle className="h-6 w-6" /> Departure: The Problem
                                    </h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base"><strong>Fragmented Network:</strong> Hundreds of overlapping CTU buses connecting residential hubs to universities.</p>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base"><strong>Obsolete Data:</strong> Reliance on analogue timetables and disconnected PDFs causes confusion.</p>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base"><strong>Travel Anxiety:</strong> Students and professionals experience severe pathfinding friction daily.</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stop 2: The Solution */}
                        <motion.div variants={fadeUpVariant} className="relative flex flex-col md:flex-row items-stretch w-full mb-12 group z-10">
                            
                            {/* Mobile Node */}
                            <div className="md:hidden absolute left-[27px] top-6 w-8 h-8 rounded-full bg-background border-4 border-primary shadow-[0_0_20px_oklch(0.72_0.12_290/0.4)] flex flex-col items-center justify-center z-20">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>

                            {/* Desktop Center Node */}
                            <div className="hidden md:flex absolute left-1/2 -top-2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-4 border-primary shadow-[0_0_20px_oklch(0.72_0.12_290/0.4)] items-center justify-center z-20 group-hover:scale-125 transition-transform duration-300">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>

                            <div className="w-full md:flex-1 pl-24 md:pl-0 md:pr-14 pt-0">
                                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden hover:bg-primary/10 transition-colors duration-300 shadow-xl shadow-primary/5 h-full">
                                    <h3 
                                        className="text-2xl font-bold flex items-center gap-3 text-primary mb-6 relative z-10"
                                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                    >
                                        <CheckCircle2 className="h-6 w-6" /> Destination: Solution
                                    </h3>
                                    <ul className="space-y-4 relative z-10">
                                        <li className="flex items-start gap-3">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base"><strong>Normalized Data:</strong> Centralized transit chaos into a highly indexed relational architecture.</p>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base"><strong>Instant Searching:</strong> Built an application executing O(1) stop-to-stop traversals with fuzzy-search.</p>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base"><strong>Save & Sync:</strong> Users can favorite permutations and view route history across devices seamlessly.</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="hidden md:flex flex-1 pl-14" />
                        </motion.div>
                    </div>
                </motion.section>

                {/* 3. Analytics (Bento UI) */}
                <motion.section 
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.1 }}
                    className="mb-32"
                >
                    <motion.h2 
                        variants={fadeUpVariant}
                        className="text-4xl font-bold tracking-tight mb-12 text-center"
                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                    >
                        Network Scope
                    </motion.h2>

                    {/* Bento Grid layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min max-w-5xl mx-auto">
                        
                        {/* Large Main Metric */}
                        <motion.div variants={fadeUpVariant} className="md:col-span-2 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 rounded-[2rem] p-10 flex flex-col justify-between group overflow-hidden relative shadow-2xl">
                            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
                            <div className="mb-4">
                                <Users className="h-10 w-10 text-primary mb-6" />
                                <h4 className="text-xl text-primary/80 uppercase tracking-widest font-bold">Daily Commutes</h4>
                            </div>
                            <div>
                                <p className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-primary/80 tracking-tighter" style={{ fontFamily: "var(--font-heading), sans-serif" }}>
                                    50,000<span className="text-primary">+</span>
                                </p>
                                <p className="text-muted-foreground mt-4 text-lg">Potential routes optimized instantly.</p>
                            </div>
                        </motion.div>

                        {/* Top Right Mini Metric */}
                        <motion.div variants={fadeUpVariant} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col justify-center hover:bg-white/10 transition-colors duration-300 shadow-xl group">
                            <Bus className="h-8 w-8 text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
                            <p className="text-4xl font-black mb-2 text-white">~500<span className="text-blue-400">+</span></p>
                            <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold">CTU Buses</p>
                        </motion.div>

                        {/* Bottom Right Mini Metric */}
                        <motion.div variants={fadeUpVariant} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col justify-center hover:bg-white/10 transition-colors duration-300 shadow-xl group">
                            <Building className="h-8 w-8 text-orange-400 mb-6 group-hover:scale-110 transition-transform" />
                            <p className="text-4xl font-black mb-2 text-white">10<span className="text-orange-400">+</span></p>
                            <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold">Tricity Hubs</p>
                        </motion.div>

                        {/* Bottom Full Row Metric */}
                        <motion.div variants={fadeUpVariant} className="md:col-span-2 bg-black/40 border border-white/5 rounded-[2rem] p-8 flex items-center justify-between shadow-xl">
                           <div>
                                <h4 className="text-lg text-gray-400 uppercase tracking-widest font-bold mb-2">Stops Indexed</h4>
                                <p className="text-3xl font-black text-white">1,500+</p>
                           </div>
                           <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                               <MapPin className="h-8 w-8 text-primary" />
                           </div>
                        </motion.div>

                    </div>
                </motion.section>

                {/* 4. Beautiful Photographic Context (Fixed locally generated images) */}
                <motion.section 
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    className="mb-24"
                >
                    <motion.div variants={fadeUpVariant} className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 rounded-[2rem] overflow-hidden relative group h-[400px] shadow-2xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/transit_node.png"
                                alt="Modern intelligent transit"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-8 left-8 right-8">
                                <h3 className="text-white text-2xl font-bold mb-3 flex items-center gap-2">
                                    <ActivitySquare className="h-6 w-6 text-primary" /> The Modern Engine
                                </h3>
                                <p className="text-gray-300 text-sm md:text-base">Intelligently indexing stop chronologies into a performant RESTful SQL engine.</p>
                            </div>
                        </div>
                        <div className="flex-1 rounded-[2rem] overflow-hidden relative group h-[400px] shadow-2xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/city_grid.png"
                                alt="Chandigarh City Layout"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-8 left-8 right-8">
                                <h3 className="text-white text-2xl font-bold mb-3 flex items-center gap-2">
                                    <Network className="h-6 w-6 text-primary" /> The City Beautiful
                                </h3>
                                <p className="text-gray-300 text-sm md:text-base">Providing an organic, user-friendly digital overlay on Le Corbusier's famous grid layout.</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.section>

                {/* 5. Developer & Stack Footer */}
                <motion.div 
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={fadeUpVariant}
                    className="mt-16 pt-16 border-t border-white/5 relative"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-black/20 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-sm border border-white/10 shadow-2xl">
                        {/* Developer Info */}
                        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-purple-800 flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                                <CodeXml className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-primary font-bold tracking-widest uppercase mb-2">Architected & Engineered By</p>
                                <h4 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-heading), sans-serif" }}>
                                    Deepak Shandilya
                                </h4>
                                <div className="flex items-center justify-center md:justify-start gap-6">
                                    <a href="https://github.com/deepakshandilya" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-white flex items-center gap-2 transition-colors text-sm font-semibold p-2 -ml-2 rounded-lg hover:bg-white/5">
                                        <Github className="h-5 w-5" /> GitHub
                                    </a>
                                    <a href="https://www.linkedin.com/in/deepakshandilyaa/" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-white flex items-center gap-2 transition-colors text-sm font-semibold p-2 -ml-2 rounded-lg hover:bg-white/5">
                                        <Linkedin className="h-5 w-5" /> LinkedIn
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* CTA Flow */}
                        <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                            <a href="/search" className="group flex items-center gap-4 bg-white text-black px-8 py-5 rounded-2xl font-bold text-lg hover:shadow-[0_0_40px_oklch(0.72_0.12_290/50%)] transition-all duration-300 hover:-translate-y-1">
                                Start Exploring Routes
                                <div className="bg-black/10 rounded-full p-2 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                    <ArrowRight className="h-5 w-5" />
                                </div>
                            </a>
                            <p className="text-sm text-muted-foreground mt-6 font-medium tracking-wide">
                                © {new Date().getFullYear()} BusLens. Bus at One Glance.
                            </p>
                        </div>
                    </div>
                </motion.div>

            </div>
        </PageBackground>
    );
}
