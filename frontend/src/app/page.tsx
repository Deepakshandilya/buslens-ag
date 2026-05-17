"use client";

import { motion, Variants } from "framer-motion";
import {
    MapPin,
    Bus,
    Users,
    Network,
    Search,
    Heart,
    Clock,
    Zap,
    ChevronDown,
    ArrowRightLeft,
    Github,
    Linkedin,
    Map,
} from "lucide-react";
import Link from "next/link";
import { InfiniteGridHero } from "@/components/ui/the-infinite-grid";
import { SearchCard } from "@/components/search/SearchCard";

// Animation Variants
const fadeUpVariant: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 50, damping: 15 },
    },
};

const staggerContainer: Variants = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.12 },
    },
};

export default function HomePage() {
    return (
        <>
            {/* ═══════════════════════════════════════════
                HERO — Identity + Search Card + Scroll Hint
               ═══════════════════════════════════════════ */}
            <InfiniteGridHero>
                <div className="flex flex-col items-center w-full px-4 relative z-10 max-w-7xl mx-auto">
                    {/* Brand identity */}
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-3 mb-5"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo.png"
                            alt="BusLens"
                            className="h-10 w-10 rounded-xl object-cover"
                            style={{
                                boxShadow: "0 4px 16px var(--brand-glow)",
                                border: "1px solid var(--border)",
                            }}
                        />
                        <h2
                            className="text-2xl font-bold tracking-tight"
                            style={{ fontFamily: "var(--font-heading), sans-serif" }}
                        >
                            Bus<span className="text-primary">Lens</span>
                        </h2>
                    </motion.div>

                    {/* Value prop — prominent, styled */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.6 }}
                        className="text-lg sm:text-xl md:text-2xl mb-9 text-center max-w-2xl leading-relaxed font-medium"
                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                    >
                        <span className="text-foreground/80">The fastest way to find your bus across </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400 font-bold">
                            Chandigarh, Mohali, Panchkula &amp; Zirakpur
                        </span>
                    </motion.p>

                    <SearchCard />

                    {/* Scroll hint */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="mt-10 flex flex-col items-center gap-1 text-muted-foreground/40"
                    >
                        <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
                        <motion.div
                            animate={{ y: [0, 6, 0] }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                        >
                            <ChevronDown className="h-5 w-5" />
                        </motion.div>
                    </motion.div>
                </div>
            </InfiniteGridHero>

            {/* ═══════════════════════════════════════════
                BELOW-THE-FOLD CONTENT
                — Uses the same background gradient + ambient orbs
                  to blend seamlessly with the hero above.
               ═══════════════════════════════════════════ */}
            <div className="relative z-10 w-full overflow-hidden" style={{ background: "var(--background)" }}>
                {/* Ambient glow orbs — mirrors the hero style */}
                <div className="pointer-events-none absolute inset-0">
                    <div
                        className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[160px] opacity-40"
                        style={{ background: "var(--brand-glow)" }}
                    />
                    <div
                        className="absolute top-[30%] -left-[15%] w-[40%] h-[40%] rounded-full blur-[140px] opacity-25"
                        style={{ background: "var(--brand-glow)" }}
                    />
                    <div
                        className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] rounded-full blur-[120px] opacity-20"
                        style={{ background: "var(--brand-glow)" }}
                    />
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-0 relative z-10">

                    {/* ── How It Works ── */}
                    <motion.section
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={staggerContainer}
                        className="py-24"
                    >
                        <motion.h2
                            variants={fadeUpVariant}
                            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-center"
                            style={{ fontFamily: "var(--font-heading), sans-serif" }}
                        >
                            How It Works
                        </motion.h2>
                        <motion.p
                            variants={fadeUpVariant}
                            className="text-muted-foreground text-center mb-16 max-w-lg mx-auto"
                        >
                            Three simple steps to get where you need to go.
                        </motion.p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {[
                                {
                                    step: "1",
                                    icon: Search,
                                    title: "Search",
                                    desc: "Enter your starting stop, destination, or bus number. Our smart autocomplete helps you find it instantly.",
                                    color: "text-blue-400",
                                    borderColor: "hover:border-blue-500/40",
                                    glowColor: "bg-blue-500/15",
                                },
                                {
                                    step: "2",
                                    icon: ArrowRightLeft,
                                    title: "Pick a Route",
                                    desc: "Browse matching buses with full route details — every stop from start to finish, direction, and alternatives.",
                                    color: "text-emerald-400",
                                    borderColor: "hover:border-emerald-500/40",
                                    glowColor: "bg-emerald-500/15",
                                },
                                {
                                    step: "3",
                                    icon: Bus,
                                    title: "Go!",
                                    desc: "Save your favorites, check history later, and never miss your bus again. Works on any device.",
                                    color: "text-amber-400",
                                    borderColor: "hover:border-amber-500/40",
                                    glowColor: "bg-amber-500/15",
                                },
                            ].map((item) => (
                                <motion.div
                                    key={item.step}
                                    variants={fadeUpVariant}
                                    className={`relative bg-card border border-border ${item.borderColor} rounded-2xl p-8 text-center transition-all duration-500 group hover:-translate-y-1 shadow-lg overflow-hidden`}
                                >
                                    <div className={`absolute -top-10 -right-10 w-32 h-32 ${item.glowColor} blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                    <div className="relative z-10">
                                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${item.glowColor} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                            <item.icon className={`h-7 w-7 ${item.color}`} />
                                        </div>
                                        <div className="flex items-center justify-center gap-2 mb-3">
                                            <span className={`text-xs font-bold uppercase tracking-widest ${item.color} opacity-70`}>Step {item.step}</span>
                                        </div>
                                        <h3
                                            className="text-xl font-bold mb-3"
                                            style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                        >
                                            {item.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* ── Features Strip ── */}
                    <motion.section
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={staggerContainer}
                        className="mb-28"
                    >
                        <motion.h2
                            variants={fadeUpVariant}
                            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-center"
                            style={{ fontFamily: "var(--font-heading), sans-serif" }}
                        >
                            Built for Daily Commuters
                        </motion.h2>
                        <motion.p
                            variants={fadeUpVariant}
                            className="text-muted-foreground text-center mb-14 max-w-lg mx-auto"
                        >
                            Everything you need, nothing you don&apos;t.
                        </motion.p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
                            {[
                                {
                                    icon: Search,
                                    title: "Multi-Mode Search",
                                    desc: "Stop-to-stop, bus number, or stop lookup",
                                    color: "text-primary",
                                },
                                {
                                    icon: Heart,
                                    title: "Save Favorites",
                                    desc: "Bookmark routes you use every day",
                                    color: "text-pink-400",
                                },
                                {
                                    icon: Clock,
                                    title: "Search History",
                                    desc: "Quickly re-search your recent trips",
                                    color: "text-teal-400",
                                },
                                {
                                    icon: Zap,
                                    title: "Lightning Fast",
                                    desc: "Instant autocomplete & results",
                                    color: "text-amber-400",
                                },
                            ].map((feat) => (
                                <motion.div
                                    key={feat.title}
                                    variants={fadeUpVariant}
                                    className="bg-card/60 border border-border/50 rounded-2xl p-5 sm:p-6 text-center hover:border-primary/30 transition-all duration-300 group"
                                >
                                    <feat.icon className={`h-6 w-6 ${feat.color} mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`} />
                                    <h4 className="font-semibold text-sm sm:text-base mb-1">{feat.title}</h4>
                                    <p className="text-muted-foreground text-xs sm:text-sm leading-snug">{feat.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* ── Coverage Stats (Bento Grid) ── */}
                    <motion.section
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={staggerContainer}
                        className="mb-28"
                    >
                        <motion.h2
                            variants={fadeUpVariant}
                            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-center"
                            style={{ fontFamily: "var(--font-heading), sans-serif" }}
                        >
                            Covering the Entire Tricity
                        </motion.h2>
                        <motion.p
                            variants={fadeUpVariant}
                            className="text-muted-foreground text-center mb-14 max-w-lg mx-auto"
                        >
                            Chandigarh · Mohali · Panchkula · Zirakpur
                        </motion.p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min max-w-5xl mx-auto">

                            {/* Active Routes — large */}
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
                                    <p className="text-muted-foreground mt-4 text-lg">Distinct bus routes across interconnected city corridors.</p>
                                </div>
                            </motion.div>

                            {/* Stops */}
                            <motion.div variants={fadeUpVariant} className="bg-card border border-border hover:border-teal-500/50 rounded-[2rem] p-8 flex flex-col justify-center transition-all duration-500 shadow-xl group hover:-translate-y-1 relative overflow-hidden">
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-500/20 blur-[80px] rounded-full translate-x-1/3 translate-y-1/3 group-hover:bg-teal-500/40 transition-colors duration-500" />
                                <MapPin className="h-8 w-8 text-teal-400 mb-6 group-hover:scale-125 group-hover:-translate-y-2 transition-all duration-500 relative z-10" />
                                <p className="text-5xl font-black mb-2 text-foreground relative z-10">700<span className="text-teal-400">+</span></p>
                                <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold group-hover:text-teal-200 transition-colors relative z-10">Stops Indexed</p>
                            </motion.div>

                            {/* Buses */}
                            <motion.div variants={fadeUpVariant} className="bg-card border border-border hover:border-pink-500/50 rounded-[2rem] p-8 flex flex-col justify-center transition-all duration-500 shadow-xl group hover:-translate-y-1 relative overflow-hidden">
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3 group-hover:bg-pink-500/40 transition-colors duration-500" />
                                <Bus className="h-8 w-8 text-pink-400 mb-6 group-hover:scale-125 group-hover:translate-x-2 transition-all duration-500 relative z-10" />
                                <p className="text-5xl font-black mb-2 text-foreground relative z-10">~500</p>
                                <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold group-hover:text-pink-200 transition-colors relative z-10">CTU Buses</p>
                            </motion.div>

                            {/* Daily Commutes — wide */}
                            <motion.div variants={fadeUpVariant} className="md:col-span-2 bg-card border border-border hover:border-orange-500/50 rounded-[2rem] p-8 md:p-10 flex items-center justify-between shadow-xl transition-all duration-500 group hover:-translate-y-1 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="relative z-10">
                                    <h4 className="text-lg text-muted-foreground uppercase tracking-widest font-bold mb-2 group-hover:text-orange-200 transition-colors">Daily Commutes</h4>
                                    <p className="text-4xl md:text-5xl font-black text-foreground">50,000<span className="text-orange-500">+</span></p>
                                </div>
                                <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center relative z-10 group-hover:bg-orange-500/30 group-hover:scale-110 transition-all duration-500">
                                    <Users className="h-10 w-10 text-orange-500" />
                                </div>
                            </motion.div>
                        </div>
                    </motion.section>

                    {/* ── Service Area Map ── */}
                    <motion.section
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.15 }}
                        variants={staggerContainer}
                        className="mb-28"
                    >
                        <motion.div variants={fadeUpVariant} className="flex items-center justify-center gap-3 mb-4">
                            <Map className="h-7 w-7 text-primary" />
                            <h2
                                className="text-3xl sm:text-4xl font-bold tracking-tight text-center"
                                style={{ fontFamily: "var(--font-heading), sans-serif" }}
                            >
                                Our Service Area
                            </h2>
                        </motion.div>
                        <motion.p
                            variants={fadeUpVariant}
                            className="text-muted-foreground text-center mb-10 max-w-md mx-auto"
                        >
                            Routes span across all four cities of the Chandigarh Tricity region.
                        </motion.p>
                        <motion.div variants={fadeUpVariant}>
                            <div className="w-full rounded-[2rem] overflow-hidden relative group h-[450px] sm:h-[500px] shadow-2xl border border-border/50">
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

                </div>

                {/* ═══════════════════════════════════════════
                    PRODUCT FOOTER
                   ═══════════════════════════════════════════ */}
                <motion.footer
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={fadeUpVariant}
                    className="border-t border-border/40 relative"
                    style={{ background: "var(--card)" }}
                >
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

                            {/* Brand column */}
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-3 mb-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/logo.png" alt="BusLens" className="h-10 w-10 rounded-xl object-cover" />
                                    <span
                                        className="text-xl font-bold"
                                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                    >
                                        Bus<span className="text-primary">Lens</span>
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-6">
                                    Bringing analytical clarity to the public transit chaos of the Chandigarh Tricity.
                                    Search any bus route across Chandigarh, Mohali, Panchkula &amp; Zirakpur.
                                </p>
                                <div className="flex items-center gap-3">
                                    <a
                                        href="https://github.com/deepakshandilya"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-all duration-200"
                                        aria-label="GitHub"
                                    >
                                        <Github className="h-5 w-5" />
                                    </a>
                                    <a
                                        href="https://www.linkedin.com/in/deepakshandilyaa/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-all duration-200"
                                        aria-label="LinkedIn"
                                    >
                                        <Linkedin className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>

                            {/* Quick links */}
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/70 mb-5">Quick Links</h4>
                                <ul className="space-y-3">
                                    <li>
                                        <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                            Home
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                            Log In
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                            Sign Up
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                            Dashboard
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Search modes */}
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-widest text-foreground/70 mb-5">Search</h4>
                                <ul className="space-y-3">
                                    <li className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Search className="h-3.5 w-3.5 text-primary/60" /> Stop to Stop
                                    </li>
                                    <li className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Bus className="h-3.5 w-3.5 text-primary/60" /> By Bus Number
                                    </li>
                                    <li className="text-sm text-muted-foreground flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-primary/60" /> Search a Stop
                                    </li>
                                    <li className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Heart className="h-3.5 w-3.5 text-primary/60" /> Save Favorites
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom bar */}
                        <div className="mt-14 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs text-muted-foreground/60">
                                © {new Date().getFullYear()} BusLens. Bus at One Glance.
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                                Engineered by{" "}
                                <a
                                    href="https://www.linkedin.com/in/deepakshandilyaa/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-semibold text-foreground/60 hover:text-primary transition-colors"
                                >
                                    Deepak Shandilya
                                </a>
                            </p>
                        </div>
                    </div>
                </motion.footer>
            </div>
        </>
    );
}
