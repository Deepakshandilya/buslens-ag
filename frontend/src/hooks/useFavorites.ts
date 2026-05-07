"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { FavoriteResponse } from "@/types/api";
import { useAuthStore } from "@/stores/authStore";

export function useFavorites(isActive: boolean = true) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const user = useAuthStore((s) => s.user);
    
    return useQuery<FavoriteResponse[]>({
        queryKey: ["favorites"],
        queryFn: async () => {
            const { data } = await api.get<FavoriteResponse[]>("/users/me/favorites");
            return data;
        },
        enabled: isAuthenticated && !!user?.is_verified && isActive,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useAddFavorite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { route_id?: number; stop_id?: number }) => {
            const { data } = await api.post("/users/me/favorites", payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
        },
    });
}

export function useDeleteFavorite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (favoriteId: number) => {
            const { data } = await api.delete(`/users/me/favorites/${favoriteId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["favorites"] });
        },
    });
}
