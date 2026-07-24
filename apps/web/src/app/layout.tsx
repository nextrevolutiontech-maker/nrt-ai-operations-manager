import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../components/shared/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'NRT AI Operations Manager',
  description: 'Enterprise resource planning and operations management powered by artificial intelligence.',
  keywords: ['ERP', 'NRT AI', 'Operations Manager', 'Business Intelligence', 'AI Assistant'],
  authors: [{ name: 'NRT AI Team' }],
  openGraph: {
    title: 'NRT AI Operations Manager',
    description: 'Next-generation AI-powered ERP system.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
