import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Open Job",
    default: "Open Job — Autonomous AI Job Search & Application Engine",
  },
  description: "Open Job: Autonomous personal AI job search & application assistant. Explainable matching, zero fabrication, Light-OCR document vision, and human-in-the-loop application preparation.",
  icons: {
    icon: "/Open-Code-logo.svg",
    shortcut: "/Open-Code-logo.svg",
    apple: "/Open-Code-logo.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
