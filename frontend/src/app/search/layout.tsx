import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Search Results",
  description: "Find direct and connecting bus routes across Chandigarh Tricity.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
