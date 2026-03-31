import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your saved routes and past search history on BusLens.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
