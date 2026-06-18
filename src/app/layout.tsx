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
                <Link href="/qualify" className="text-gray-600 hover:text-blue-600 font-medium">
                  Do I Qualify?
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="text-gray-600 hover:text-blue-600 font-medium">
                  Calculator
                </Link>
              </li>
              <li className="relative group">
                <span className="text-gray-600 hover:text-blue-600 font-medium cursor-pointer">
                  Financing Options ▾
                </span>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/calculator?type=equipment_financing" className="block px-4 py-2 hover:bg-gray-50 text-sm">Equipment Financing</Link>
                  <Link href="/calculator?type=working_capital" className="block px-4 py-2 hover:bg-gray-50 text-sm">Working Capital</Link>
                  <Link href="/calculator?type=sba_loan" className="block px-4 py-2 hover:bg-gray-50 text-sm">SBA Loans</Link>
                  <Link href="/calculator?type=business_loc" className="block px-4 py-2 hover:bg-gray-50 text-sm">Line of Credit</Link>
                  <Link href="/calculator?type=invoice_factoring" className="block px-4 py-2 hover:bg-gray-50 text-sm">Invoice Factoring</Link>
                </div>
              </li>
              <li>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium">
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  href="/qualify" 
                  className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
                >
                  Get Funded →
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
