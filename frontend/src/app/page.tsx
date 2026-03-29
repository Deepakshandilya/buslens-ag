import { InfiniteGridHero } from "@/components/ui/the-infinite-grid";
import { SearchCard } from "@/components/search/SearchCard";

export default function HomePage() {
  return (
    <InfiniteGridHero>
      <div className="flex flex-col items-center w-full px-4 relative z-10 max-w-7xl mx-auto">
        <SearchCard />

        {/* Subtle tagline below */}
        <p className="mt-8 text-base text-muted-foreground/50 text-center max-w-md">
          Move your cursor to reveal the grid. Search any bus route across
          Chandigarh, Mohali, Panchkula &amp; Zirakpur.
        </p>
      </div>
    </InfiniteGridHero>
  );
}
