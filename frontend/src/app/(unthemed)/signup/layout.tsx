import type { Metadata } from 'next';
import '../../globals.css';

export const metadata: Metadata = {
  title: 'Ecommerce Platform',
  description: 'buy products easily and quickly',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
