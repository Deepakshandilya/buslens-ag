import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new BusLens account to save routes and view your search history.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
