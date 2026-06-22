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
  title: "Business Financing Solutions | BizOps by PipelineAI",
  description:
    "Get the business financing you need. Equipment loans, working capital, SBA loans, and more. Check if you qualify in 2 minutes.",
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
        <header className="bg-white border-b sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
            <Link href="/" className="font-bold text-xl text-blue-900">
              BizOps
            </Link>
            <ul className="hidden md:flex items-center gap-6 text-sm">
              <li>
                <Link href="/marketplace" className="text-gray-600 hover:text-blue-600 font-medium">
                  Buy Leads
                </Link>
              </li>
              <li>
                <Link href="/dashboard/leads" className="text-gray-600 hover:text-blue-600 font-medium">
                  My Leads
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-600 hover:text-blue-600 font-medium">
                  Admin
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium">
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  href="/marketplace" 
                  className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
                >
                  Browse Leads →
                </Link>
              </li>
            </ul>
            {/* Mobile menu button */}
            <button className="md:hidden p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
