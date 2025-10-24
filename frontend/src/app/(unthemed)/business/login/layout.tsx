import type { Metadata } from "next";
import "../../../globals.css";

export const metadata: Metadata = {
  title: "Business Registration - Ecommerce Platform",
  description: "Register your business to start selling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
