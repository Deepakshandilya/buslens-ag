import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeState {
    theme: Theme;
    isHydrated: boolean;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    hydrate: () => void;
}

const STORAGE_KEY = "buslens_theme";

export const useThemeStore = create<ThemeState>((set, get) => ({
    theme: "dark",
    isHydrated: false,

    setTheme: (theme) => {
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, theme);
            document.documentElement.classList.remove("dark", "light");
            document.documentElement.classList.add(theme);
        }
        set({ theme });
    },

    toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        get().setTheme(newTheme);
    },

    hydrate: () => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
            const theme = stored || "dark";
            document.documentElement.classList.remove("dark", "light");
            document.documentElement.classList.add(theme);
            set({ theme, isHydrated: true });
        }
    },
}));
