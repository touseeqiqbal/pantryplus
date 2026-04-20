import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { HouseholdProvider } from "@/lib/hooks/useHousehold";
import { BusinessProvider } from "@/lib/hooks/useBusiness";
import { AppModeProvider } from "@/lib/hooks/useAppMode";
import { ThemeProvider } from "./components/ThemeProvider";
import BottomNav from "./components/BottomNav";
import AIChatWidget from "./components/AIChatWidget";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Pantry+ - Smart Kitchen Intelligence",
  description: "A comprehensive kitchen management app for inventory, meal planning, and operation tracking",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pantry+",
  },
  // themeColor and viewport moved to explicit <meta> tags in the head
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: 'var(--font-sans, Inter, sans-serif)' }}
      >
        <AuthProvider>
          <AppModeProvider>
            <BusinessProvider>
              <HouseholdProvider>
                <ThemeProvider>
                  {children}
                  <BottomNav />
                  <AIChatWidget />
                </ThemeProvider>
              </HouseholdProvider>
            </BusinessProvider>
          </AppModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
