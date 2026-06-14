import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Business Financing Lead Intelligence Engine",
  description:
    "AI-powered lead generation system for business financing opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b">
          <nav className="container mx-auto flex items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold text-lg">
              SBAC Funding
            </Link>
            <ul className="flex gap-4 text-sm">
              <li>
                <Link href="/" className="hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/financing" className="hover:underline font-medium text-blue-600">
                  Lead Engine
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:underline">
                  Browse Leads
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:underline">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:underline">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:underline">
                  Login
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        <main className="container mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
