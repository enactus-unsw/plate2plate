import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { Fraunces } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plate2Plate — UNSW Campus Food Rescue",
  description:
    "Claim free surplus food from UNSW campus events before it goes to waste.",
  openGraph: {
    title: "Plate2Plate — UNSW Campus Food Rescue",
    description:
      "Claim free surplus food from UNSW campus events before it goes to waste.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://plate2plate.vercel.app",
    siteName: "Plate2Plate",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${fraunces.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
