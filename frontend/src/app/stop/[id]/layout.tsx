import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Stop Details`,
    description: `View buses and routes that pass through this stop in Chandigarh.`,
  };
}

export default function StopDetailsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
