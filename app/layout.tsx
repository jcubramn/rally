import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rally | Your coaching workspace",
  description: "Tennis schedules, personalized lesson plans, coaching notes, and invoices.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Rally", statusBarStyle: "default" },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {width:"device-width", initialScale:1, viewportFit:"cover", themeColor:"#174c3c"};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
