import { MapPin, Bus, Building2, TreePine, Users, Sparkles, Search, Heart, Globe, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
    return (
        <div
            className="min-h-screen pt-24 pb-16 relative overflow-hidden"
            style={{
                background: "linear-gradient(180deg, oklch(0.14 0.03 285) 0%, oklch(0.11 0.02 280) 40%, oklch(0.13 0.025 290) 100%)",
            }}
        >
            {/* Ambient glow orbs */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ background: "oklch(0.55 0.15 290 / 12%)" }} />
                <div className="absolute top-[30%] -left-[15%] w-[35%] h-[35%] rounded-full blur-[100px]" style={{ background: "oklch(0.50 0.12 260 / 8%)" }} />
                <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] rounded-full blur-[100px]" style={{ background: "oklch(0.50 0.10 310 / 8%)" }} />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="flex justify-center mb-6">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo.png"
                            alt="BusLens"
                            className="h-24 w-24 rounded-3xl object-cover"
                            style={{
                                boxShadow: "0 12px 40px oklch(0.72 0.12 290 / 30%)",
                                border: "2px solid oklch(0.72 0.12 290 / 20%)",
                            }}
                        />
                    </div>
                    <h1
                        className="text-5xl sm:text-6xl font-bold tracking-tight mb-5"
                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                    >
                        Bus<span className="text-primary">Lens</span>
                    </h1>
                    <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Bus at One Glance — Your smart companion for navigating
                        Chandigarh Tricity&apos;s public transport network.
                    </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
                    {[
                        { icon: Bus, label: "Bus Routes", value: "100+" },
                        { icon: MapPin, label: "Stops Covered", value: "1,500+" },
                        { icon: Building2, label: "Cities", value: "4" },
                        { icon: Users, label: "Daily Commuters", value: "50K+" },
                    ].map((stat, i) => (
                        <Card
                            key={i}
                            className="backdrop-blur-sm transition-all duration-300 hover:scale-[1.03]"
                            style={{
                                background: "oklch(0.17 0.025 285 / 70%)",
                                border: "1px solid oklch(0.72 0.12 290 / 12%)",
                            }}
                        >
                            <CardContent className="p-6 text-center">
                                <stat.icon
                                    className="h-7 w-7 mx-auto mb-3"
                                    style={{ color: "oklch(0.78 0.12 290)" }}
                                />
                                <p
                                    className="text-3xl font-bold"
                                    style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                >
                                    {stat.value}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* About Tricity */}
                <section className="mb-16">
                    <h2
                        className="text-3xl sm:text-4xl font-bold tracking-tight mb-8"
                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                    >
                        <TreePine className="inline h-7 w-7 text-primary mr-2 -mt-1.5" />
                        About Chandigarh Tricity
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Image */}
                        <div className="rounded-2xl overflow-hidden aspect-[4/3] relative shadow-xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=800&auto=format&fit=crop"
                                alt="Chandigarh cityscape"
                                className="w-full h-full object-cover"
                            />
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: "linear-gradient(to top, oklch(0.14 0.02 285 / 80%) 0%, transparent 50%)",
                                }}
                            />
                            <p className="absolute bottom-4 left-4 text-white font-semibold text-lg">
                                The City Beautiful
                            </p>
                        </div>

                        {/* Text content */}
                        <div className="space-y-5 flex flex-col justify-center">
                            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                                <strong className="text-foreground">Chandigarh Tricity</strong> is a
                                vibrant metropolitan area comprising <strong className="text-foreground">Chandigarh</strong>,{" "}
                                <strong className="text-foreground">Mohali (SAS Nagar)</strong>,{" "}
                                <strong className="text-foreground">Panchkula</strong>, and{" "}
                                <strong className="text-foreground">Zirakpur</strong>.
                            </p>
                            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                                Designed by the legendary architect Le Corbusier, Chandigarh is India&apos;s
                                first planned city and serves as the shared capital of Punjab and Haryana.
                                The tricity area is home to over <strong className="text-foreground">1.5 million people</strong>.
                            </p>
                            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                                The <strong className="text-foreground">CTU (Chandigarh Transport Undertaking)</strong>{" "}
                                operates an extensive bus network connecting all four cities, making public
                                transport accessible across the entire metropolitan region.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Gallery */}
                <section className="mb-16">
                    <h2
                        className="text-3xl sm:text-4xl font-bold tracking-tight mb-8"
                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                    >
                        <Sparkles className="inline h-7 w-7 text-primary mr-2 -mt-1.5" />
                        Tricity Highlights
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { src: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop", label: "Sukhna Lake" },
                            { src: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop", label: "Rock Garden" },
                            { src: "https://images.unsplash.com/photo-1590766940554-634b197d4cef?w=600&auto=format&fit=crop", label: "Rose Garden" },
                            { src: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop", label: "Sector 17 Plaza" },
                            { src: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&auto=format&fit=crop", label: "Modern Transit" },
                            { src: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&auto=format&fit=crop", label: "Open Hand Monument" },
                        ].map((img, i) => (
                            <div
                                key={i}
                                className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img.src}
                                    alt={img.label}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                />
                                <p className="absolute bottom-3 left-3 text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {img.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* What BusLens Does */}
                <section className="mb-16">
                    <h2
                        className="text-3xl sm:text-4xl font-bold tracking-tight mb-8"
                        style={{ fontFamily: "var(--font-heading), sans-serif" }}
                    >
                        <Globe className="inline h-7 w-7 text-primary mr-2 -mt-1.5" />
                        What BusLens Does
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-5">
                        {[
                            {
                                icon: Search,
                                title: "Stop to Stop Search",
                                desc: "Find all bus routes between any two stops across the entire Tricity network.",
                            },
                            {
                                icon: Bus,
                                title: "Bus Route Lookup",
                                desc: "Enter a bus number and instantly see its complete route with all stops in both directions.",
                            },
                            {
                                icon: MapPin,
                                title: "Stop Explorer",
                                desc: "Search for any stop and discover every bus that passes through it.",
                            },
                            {
                                icon: Heart,
                                title: "Favourites & History",
                                desc: "Save your frequent routes and quickly re-search past queries with one click.",
                            },
                        ].map((feature, i) => (
                            <Card
                                key={i}
                                className="backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] group"
                                style={{
                                    background: "oklch(0.17 0.025 285 / 70%)",
                                    border: "1px solid oklch(0.72 0.12 290 / 10%)",
                                }}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0 transition-transform group-hover:scale-110"
                                            style={{
                                                background: "linear-gradient(135deg, oklch(0.68 0.15 280 / 20%), oklch(0.72 0.12 295 / 15%))",
                                                border: "1px solid oklch(0.72 0.12 290 / 15%)",
                                            }}
                                        >
                                            <feature.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3
                                                className="text-lg font-bold mb-1.5 flex items-center gap-2"
                                                style={{ fontFamily: "var(--font-heading), sans-serif" }}
                                            >
                                                {feature.title}
                                                <ArrowRight className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
                                            </h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <div className="pt-8 text-center" style={{ borderTop: "1px solid oklch(1 0.02 285 / 8%)" }}>
                    <p className="text-sm text-muted-foreground">
                        Built with ❤️ for Chandigarh commuters
                    </p>
                    <p className="text-xs text-muted-foreground/50 mt-1">
                        © {new Date().getFullYear()} BusLens. Bus at One Glance.
                    </p>
                </div>
            </div>
        </div>
    );
}
