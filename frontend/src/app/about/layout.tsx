import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about the BusLens project and its open-source goals.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
