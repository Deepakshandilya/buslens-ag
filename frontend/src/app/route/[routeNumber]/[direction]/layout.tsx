import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ routeNumber: string, direction: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedNumber = decodeURIComponent(resolvedParams.routeNumber);
  const decodedDir = decodeURIComponent(resolvedParams.direction);
  return {
    title: `Route ${decodedNumber} (${decodedDir})`,
    description: `View the sequence of stops for Route ${decodedNumber} in the ${decodedDir} direction.`,
  };
}

export default function RouteDetailsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
