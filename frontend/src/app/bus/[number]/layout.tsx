import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedNumber = decodeURIComponent(resolvedParams.number);
  return {
    title: `Bus ${decodedNumber}`,
    description: `View UP and DOWN direction details for Bus Route ${decodedNumber} in Chandigarh.`,
  };
}

export default function BusDetailsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
