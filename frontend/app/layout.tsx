import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import GlobalAlertBanner from "@/components/GlobalAlertBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hospital OS",
  description: "AI-Powered Hospital Command Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add suppressHydrationWarning here to handle extension-injected attributes
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <GlobalAlertBanner />
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}