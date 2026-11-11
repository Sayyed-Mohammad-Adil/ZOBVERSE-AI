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
    template: "%s | ZOBVERSE AI",
    default: "ZOBVERSE AI — Find. Apply. Get Hired.",
  },
  description: "ZOBVERSE AI — Find. Apply. Get Hired. AI-powered job discovery, explainable matching, and human-reviewed application preparation.",
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
