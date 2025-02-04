import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: "JSON Manager | Iqbal DP",
  description: "Store, format and visualize your JSON",
  applicationName: "JSON Manager",
  authors: [{ name: "Iqbal DP" }],
  keywords: ["JSON", "formatter", "visualizer", "manager"],
} as const satisfies Metadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://pfau-software.de/json-viewer/dist/iife/index.js"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
