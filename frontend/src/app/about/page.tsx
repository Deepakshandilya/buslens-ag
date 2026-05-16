"use client";

import { motion, Variants } from "framer-motion";
import { 
    MapPin, 
    Bus,
    Users,
    ArrowRight, 
    Network,
    CodeXml,
    Github,
    Linkedin,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { PageBackground } from "@/components/layout/PageBackground";

// Animation Variants - simplified to trigger reliably
const fadeUpVariant: Variants = {
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
                                boxShadow: "0 12px 40px var(--brand-glow)",
                                border: "2px solid var(--border)",
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

                    <div className="relative max-w-3xl mx-auto">
                        {/* The Road (Vertical Line) */}
                        <div className="absolute left-[39px] top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-500/50 via-primary/50 to-primary/10 rounded-full z-0" />
                        
                        {/* Stop 1: The Problem */}
                        <motion.div variants={fadeUpVariant} className="relative flex w-full mb-16 group z-10">
                            
                            {/* Node */}
                            <div className="absolute left-[27px] top-6 w-8 h-8 rounded-full bg-background border-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] flex flex-col items-center justify-center z-20 group-hover:scale-125 transition-transform duration-300">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                            </div>

                            <div className="w-full pl-24 pt-0">
                                <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 hover:bg-red-500/10 transition-colors duration-300 shadow-xl shadow-red-500/5 w-full">
                                    <h3 
                                        className="text-2xl font-bold flex items-center gap-3 text-red-400 mb-6"
                                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                    >
                                        <AlertCircle className="h-6 w-6" /> Departure: The Problem
                                    </h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base"><strong>Messy Routes:</strong> Too many confusing bus routes that overlap with each other.</p>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base"><strong>Outdated Info:</strong> Paper schedules and old PDFs make finding the right buses hard.</p>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base"><strong>Daily Stress:</strong> People struggle every day to figure out how to reach their destination.</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stop 2: The Solution */}
                        <motion.div variants={fadeUpVariant} className="relative flex w-full mb-12 group z-10">
                            
                            {/* Node */}
                            <div className="absolute left-[27px] top-6 w-8 h-8 rounded-full bg-background border-4 border-primary shadow-lg shadow-primary/40 flex flex-col items-center justify-center z-20 group-hover:scale-125 transition-transform duration-300">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>

                            <div className="w-full pl-24 pt-0">
                                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden hover:bg-primary/10 transition-colors duration-300 shadow-xl shadow-primary/5 w-full">
                                    <h3 
                                        className="text-2xl font-bold flex items-center gap-3 text-primary mb-6 relative z-10"
                                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                    >
                                        <CheckCircle2 className="h-6 w-6" /> Destination: Solution
                                    </h3>
                                    <ul className="space-y-4 relative z-10">
                                        <li className="flex items-start gap-3">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base"><strong>Organized Data:</strong> We collected all the messy data and built a clean, fast system.</p>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base"><strong>Fast Search:</strong> Instantly find buses and stops with a smart search engine.</p>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                            <p className="text-muted-foreground leading-relaxed text-sm lg:text-base"><strong>Easy Saving:</strong> Save your favorite routes and see your history anywhere.</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
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

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min max-w-5xl mx-auto">
                        
                        {/* Box 1: Large Routes Metric */}
                        <motion.div variants={fadeUpVariant} className="md:col-span-2 bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-white/10 hover:border-primary/50 rounded-[2rem] p-10 flex flex-col justify-between group overflow-hidden relative shadow-2xl transition-all duration-500 hover:-translate-y-1">
                            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 group-hover:bg-primary/40 transition-colors duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-[1500ms] ease-in-out" />
                            <div className="mb-4 relative z-10">
                                <Network className="h-10 w-10 text-primary mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                                <h4 className="text-xl text-primary/80 uppercase tracking-widest font-bold">Active Routes</h4>
                            </div>
                            <div className="relative z-10">
                                <p className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-foreground to-primary/80 tracking-tighter" style={{ fontFamily: "var(--font-heading), sans-serif" }}>
                                    72
                                </p>
                                <p className="text-muted-foreground mt-4 text-lg">Distinct bus routes traversing interconnected city corridors.</p>
                            </div>
                        </motion.div>

                        {/* Box 2: Stops Metric */}
                        <motion.div variants={fadeUpVariant} className="bg-card border border-border hover:border-teal-500/50 rounded-[2rem] p-8 flex flex-col justify-center transition-all duration-500 shadow-xl group hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-500/20 blur-[80px] rounded-full translate-x-1/3 translate-y-1/3 group-hover:bg-teal-500/40 transition-colors duration-500" />
                            <MapPin className="h-8 w-8 text-teal-400 mb-6 group-hover:scale-125 group-hover:-translate-y-2 transition-all duration-500 relative z-10" />
                            <p className="text-5xl font-black mb-2 text-foreground relative z-10">700<span className="text-teal-400">+</span></p>
                            <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold group-hover:text-teal-200 transition-colors relative z-10">Stops Indexed</p>
                        </motion.div>

                        {/* Box 3: Buses Metric */}
                        <motion.div variants={fadeUpVariant} className="bg-card border border-border hover:border-pink-500/50 rounded-[2rem] p-8 flex flex-col justify-center transition-all duration-500 shadow-xl group hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3 group-hover:bg-pink-500/40 transition-colors duration-500" />
                            <Bus className="h-8 w-8 text-pink-400 mb-6 group-hover:scale-125 group-hover:translate-x-2 transition-all duration-500 relative z-10" />
                            <p className="text-5xl font-black mb-2 text-foreground relative z-10">~500</p>
                            <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold group-hover:text-pink-200 transition-colors relative z-10">CTU Buses</p>
                        </motion.div>

                        {/* Box 4: Wide Commutes Metric */}
                        <motion.div variants={fadeUpVariant} className="md:col-span-2 bg-card border border-border hover:border-orange-500/50 rounded-[2rem] p-8 md:p-10 flex items-center justify-between shadow-xl transition-all duration-500 group hover:-translate-y-1 relative overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                           <div className="relative z-10">
                                <h4 className="text-lg text-gray-400 uppercase tracking-widest font-bold mb-2 group-hover:text-orange-200 transition-colors">Daily Commutes</h4>
                                <p className="text-4xl md:text-5xl font-black text-foreground">50,000<span className="text-orange-500">+</span></p>
                           </div>
                           <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center relative z-10 group-hover:bg-orange-500/30 group-hover:scale-110 transition-all duration-500">
                               <Users className="h-10 w-10 text-orange-500" />
                           </div>
                        </motion.div>

                    </div>
                </motion.section>

                {/* 4. Tricity Map Context */}
                <motion.section 
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    className="mb-24"
                >
                    <motion.div variants={fadeUpVariant} className="flex flex-col gap-6">
                        <div className="w-full rounded-[2rem] overflow-hidden relative group h-[500px] shadow-2xl border border-white/10">
                            <iframe 
                                src="https://maps.google.com/maps?q=Chandigarh&t=m&z=12&output=embed&iwloc=near" 
                                title="Chandigarh Tricity Map"
                                className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                                style={{ border: 0 }} 
                                allowFullScreen 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
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
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-card/50 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-sm border border-border shadow-2xl">
                        {/* Developer Info */}
                        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-purple-800 flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                                <CodeXml className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-primary font-bold tracking-widest uppercase mb-2">Architected & Engineered By</p>
                                <h4 className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-heading), sans-serif" }}>
                                    Deepak Shandilya
                                </h4>
                                <div className="flex items-center justify-center md:justify-start gap-6">
                                    <a href="https://github.com/deepakshandilya" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors text-sm font-semibold p-2 -ml-2 rounded-lg hover:bg-foreground/5">
                                        <Github className="h-5 w-5" /> GitHub
                                    </a>
                                    <a href="https://www.linkedin.com/in/deepakshandilyaa/" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors text-sm font-semibold p-2 -ml-2 rounded-lg hover:bg-foreground/5">
                                        <Linkedin className="h-5 w-5" /> LinkedIn
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* CTA Flow */}
                        <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                            <a href="/search" className="group flex items-center gap-4 bg-foreground text-background px-8 py-5 rounded-2xl font-bold text-lg hover:shadow-[0_0_40px_var(--brand-glow)] transition-all duration-300 hover:-translate-y-1">
                                Start Exploring Routes
                                <div className="bg-background/10 rounded-full p-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
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
