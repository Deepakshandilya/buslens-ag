"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Clock,
    Heart,
    Trash2,
    Search,
    ArrowRight,
    Bus,
    MapPin,
    RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/stores/authStore";
import { useHistory } from "@/hooks/useHistory";
import { useFavorites, useDeleteFavorite } from "@/hooks/useFavorites";
import { toast } from "sonner";
import api from "@/lib/api";

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, isHydrated, user } = useAuthStore();

    useEffect(() => {
        // Wait for hydration to complete before checking auth
        if (isHydrated && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isHydrated, router]);

    const {
        data: history,
        isLoading: historyLoading,
        refetch: refetchHistory,
    } = useHistory();

    const {
        data: favorites,
        isLoading: favoritesLoading,
        refetch: refetchFavorites,
    } = useFavorites();

    const deleteFavorite = useDeleteFavorite();

    // Show loading while hydrating
    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-background pt-20 pb-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const handleClearHistory = async () => {
        try {
            await api.delete("/users/me/history");
            refetchHistory();
            toast.success("Search history cleared");
        } catch {
            toast.error("Failed to clear history");
        }
    };

    const handleClearFavorites = async () => {
        try {
            await api.delete("/users/me/favorites");
            refetchFavorites();
            toast.success("All favorites cleared");
        } catch {
            toast.error("Failed to clear favorites");
        }
    };

    const handleRemoveFavorite = (id: number) => {
        deleteFavorite.mutate(id, {
            onSuccess: () => toast.success("Favorite removed"),
            onError: () => toast.error("Failed to remove favorite"),
        });
    };

    const handleSearchAgain = (fromId: number, toId: number) => {
        // NOTE: history returns stop IDs, not names. For now, navigate with IDs
        // Backend enrichment needed to return stop names alongside IDs
        router.push(`/search?from=${fromId}&to=${toId}`);
    };

    return (
        <div className="min-h-screen bg-background pt-20 pb-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Welcome, <span className="text-foreground">{user?.email}</span>
                    </p>
                </div>

                <Tabs defaultValue="history" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="history" className="gap-2">
                            <Clock className="h-4 w-4" />
                            Search History
                        </TabsTrigger>
                        <TabsTrigger value="favorites" className="gap-2">
                            <Heart className="h-4 w-4" />
                            Favorites
                        </TabsTrigger>
                    </TabsList>

                    {/* History Tab */}
                    <TabsContent value="history" className="space-y-3">
                        <div className="flex justify-end mb-2">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1.5">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Clear all
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Clear search history?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete all your search history.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Clear all
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        {historyLoading && (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Card key={i} className="border-border/40">
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <Skeleton className="h-9 w-9 rounded-lg" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-48" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {history && history.length === 0 && (
                            <Card className="border-border/40">
                                <CardContent className="p-8 text-center">
                                    <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                                    <p className="font-medium">No search history yet</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Your route searches will appear here
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {history && history.map((item) => (
                            <Card key={item.id} className="border-border/40 bg-card/80 backdrop-blur-sm">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                            <Search className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 text-sm font-medium">
                                                <span>Stop #{item.from_stop_id}</span>
                                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Stop #{item.to_stop_id}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(item.searched_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSearchAgain(item.from_stop_id, item.to_stop_id)}
                                        className="gap-1.5"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        Again
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* Favorites Tab */}
                    <TabsContent value="favorites" className="space-y-3">
                        <div className="flex justify-end mb-2">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1.5">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Clear all
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Clear all favorites?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will remove all saved favorites.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleClearFavorites} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            Clear all
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        {favoritesLoading && (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Card key={i} className="border-border/40">
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <Skeleton className="h-9 w-9 rounded-lg" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-36" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {favorites && favorites.length === 0 && (
                            <Card className="border-border/40">
                                <CardContent className="p-8 text-center">
                                    <Heart className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                                    <p className="font-medium">No favorites saved</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Heart a route to save it here
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {favorites && favorites.map((fav) => (
                            <Card key={fav.id} className="border-border/40 bg-card/80 backdrop-blur-sm">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            {fav.route_id ? (
                                                <Bus className="h-4 w-4" />
                                            ) : (
                                                <MapPin className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {fav.route_id ? `Route #${fav.route_id}` : `Stop #${fav.stop_id}`}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {fav.route_id ? "Route" : "Stop"} · Added {new Date(fav.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemoveFavorite(fav.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
